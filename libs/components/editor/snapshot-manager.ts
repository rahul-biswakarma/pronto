import { IndexedDBWrapper } from "@/libs/utils/indexeddb-wrapper";
import type { SnapshotRecord } from "./types/snapshot.types";

/**
 * Manages HTML snapshots for an iframe, supporting diff-based and full storage, undo/redo, and IndexedDB persistence.
 */
export interface SnapshotManagerOptions {
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
    debounceMs?: number;
    cacheSize?: number;
}

interface SnapshotCacheEntry {
    record: SnapshotRecord;
}

const DB_NAME = "editor-snapshots";
const STORE_NAME = "snapshots";
const SNAPSHOT_INTERVAL = 10; // Every 10th snapshot is full
const DEFAULT_DEBOUNCE = 750;
const DEFAULT_CACHE_SIZE = 100;

let diffMatchPatch: unknown = null; // Lazy-load diff-match-patch if needed

/**
 * SnapshotManager: Handles debounced snapshotting, undo/redo, and diff-based storage for iframe HTML.
 */
export class SnapshotManager {
    private iframeRef: React.RefObject<HTMLIFrameElement | null>;
    private db: IndexedDBWrapper<SnapshotRecord>;
    private debounceMs: number;
    private cacheSize: number;
    private cache: Map<string, SnapshotCacheEntry> = new Map();
    private currentKey: string | null = null;
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;
    private snapshotCount = 0;

    constructor(options: SnapshotManagerOptions) {
        this.iframeRef = options.iframeRef;
        this.debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE;
        this.cacheSize = options.cacheSize ?? DEFAULT_CACHE_SIZE;
        this.db = new IndexedDBWrapper<SnapshotRecord>({
            dbName: DB_NAME,
            storeName: STORE_NAME,
        });
    }

    /**
     * Takes a debounced snapshot of the current iframe HTML. Optionally tags the snapshot.
     */
    takeSnapshot(tag?: string): void {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.saveSnapshot(tag).catch(console.error);
        }, this.debounceMs);
    }

    /**
     * Undo: Loads the previous snapshot, if available.
     */
    async undo(): Promise<void> {
        if (!this.currentKey) return;
        const current = await this.getSnapshot(this.currentKey);
        if (!current?.prevKey) return;
        await this.loadSnapshot(current.prevKey);
    }

    /**
     * Redo: Loads the next snapshot, if available.
     */
    async redo(): Promise<void> {
        if (!this.currentKey) return;
        const current = await this.getSnapshot(this.currentKey);
        if (!current?.nextKey) return;
        await this.loadSnapshot(current.nextKey);
    }

    /**
     * Jump to a specific snapshot by key.
     */
    async jumpToSnapshot(key: string): Promise<void> {
        await this.loadSnapshot(key);
    }

    // --- Private helpers ---

    private async saveSnapshot(tag?: string): Promise<void> {
        const iframe = this.iframeRef.current;
        if (!iframe?.contentDocument) return;
        const html = iframe.contentDocument.documentElement.outerHTML;
        const now = Date.now();
        const prev = this.currentKey
            ? await this.getSnapshot(this.currentKey)
            : undefined;
        const isFull = this.snapshotCount % SNAPSHOT_INTERVAL === 0 || !prev;
        let htmlData = html;
        let baseKey: string | undefined = undefined;
        if (!isFull && prev) {
            await this.ensureDiffLib();
            htmlData = this.createDiff(prev.html, html);
            baseKey = prev.key;
        }
        const key = now.toString();
        const record: SnapshotRecord = {
            key,
            prevKey: prev?.key ?? null,
            nextKey: null,
            html: htmlData,
            isFull,
            tag,
            createdAt: now,
            baseKey,
        };
        // Update previous snapshot's nextKey
        if (prev) {
            await this.db.put({ ...prev, nextKey: key });
        }
        await this.db.put(record);
        this.currentKey = key;
        this.snapshotCount++;
        this.addToCache(record);
    }

    private async loadSnapshot(key: string): Promise<void> {
        const record = await this.getSnapshot(key);
        if (!record) return;
        let html = record.html;
        if (!record.isFull && record.baseKey) {
            // Reconstruct from base + diff
            const base = await this.getSnapshot(record.baseKey);
            if (!base) return;
            await this.ensureDiffLib();
            html = this.applyDiff(base.html, record.html);
        }
        this.applyHtmlToIframe(html);
        this.currentKey = key;
        this.addToCache(record);
    }

    private async getSnapshot(
        key: string,
    ): Promise<SnapshotRecord | undefined> {
        if (this.cache.has(key)) return this.cache.get(key)!.record;
        const record = await this.db.get(key);
        if (record) this.addToCache(record);
        return record;
    }

    private addToCache(record: SnapshotRecord): void {
        this.cache.set(record.key, { record });
        if (this.cache.size > this.cacheSize) {
            // Remove oldest
            const oldest = this.cache.keys().next().value;
            this.cache.delete(oldest);
        }
    }

    private applyHtmlToIframe(html: string): void {
        const iframe = this.iframeRef.current;
        if (!iframe?.contentDocument) return;
        // Try to only update <body> if <head> is unchanged
        const doc = iframe.contentDocument;
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, "text/html");
        if (doc.head.outerHTML === newDoc.head.outerHTML) {
            doc.body.innerHTML = newDoc.body.innerHTML;
        } else {
            iframe.srcdoc = html;
        }
    }

    private isDiffMatchPatchInstance(obj: unknown): obj is {
        diff_main: (a: string, b: string) => Array<[number, string]>;
        diff_cleanupEfficiency: (diffs: Array<[number, string]>) => void;
        patch_toText: (patches: object[]) => string;
        patch_make: (
            a: string,
            b: string | Array<[number, string]>,
        ) => object[];
        patch_fromText: (text: string) => object[];
        patch_apply: (patches: object[], text: string) => [string, boolean[]];
    } {
        return (
            typeof obj === "object" &&
            obj !== null &&
            typeof (obj as { diff_main?: unknown }).diff_main === "function" &&
            typeof (obj as { diff_cleanupEfficiency?: unknown })
                .diff_cleanupEfficiency === "function" &&
            typeof (obj as { patch_toText?: unknown }).patch_toText ===
                "function" &&
            typeof (obj as { patch_make?: unknown }).patch_make ===
                "function" &&
            typeof (obj as { patch_fromText?: unknown }).patch_fromText ===
                "function" &&
            typeof (obj as { patch_apply?: unknown }).patch_apply === "function"
        );
    }

    private async ensureDiffLib(): Promise<void> {
        if (!diffMatchPatch) {
            // @ts-expect-error: dynamic import
            const mod = await import("diff-match-patch");
            diffMatchPatch = new mod.diff_match_patch();
        }
        if (!this.isDiffMatchPatchInstance(diffMatchPatch)) {
            throw new Error("Diff library not loaded or invalid");
        }
    }

    private createDiff(base: string, updated: string): string {
        if (!this.isDiffMatchPatchInstance(diffMatchPatch))
            throw new Error("Diff library not loaded");
        const diffs = diffMatchPatch.diff_main(base, updated);
        diffMatchPatch.diff_cleanupEfficiency(diffs);
        return diffMatchPatch.patch_toText(
            diffMatchPatch.patch_make(base, diffs),
        );
    }

    private applyDiff(base: string, diff: string): string {
        if (!this.isDiffMatchPatchInstance(diffMatchPatch))
            throw new Error("Diff library not loaded");
        const patches = diffMatchPatch.patch_fromText(diff);
        const [result] = diffMatchPatch.patch_apply(patches, base);
        return result;
    }
}
