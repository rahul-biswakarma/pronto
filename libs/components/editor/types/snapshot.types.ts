export interface SnapshotRecord {
    key: string; // unique identifier (timestamp or increment)
    prevKey?: string | null;
    nextKey?: string | null;
    html: string; // full HTML or diff string
    isFull: boolean; // true if this is a full HTML snapshot, false if diff
    tag?: string; // optional user label
    createdAt: number; // unix timestamp (ms)
    // Optionally, you can add compression or minification flags
    compressed?: boolean;
    // Optionally, you can add a field for the diff base key (if diff-based)
    baseKey?: string;
}
