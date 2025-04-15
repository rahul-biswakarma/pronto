import logger from "@/libs/utils/logger";

// Version interface to represent a saved state
export interface Version {
    id: number;
    timestamp: number;
    html: string;
    label: string; // Auto-generated or user-provided label
}

// Constants
const DB_NAME = "feno-editor-db";
const STORE_NAME = "version-history";
const MAX_VERSIONS = 20;

export class VersionHistoryService {
    protected db: IDBDatabase | null = null;

    // Initialize the database
    async init(): Promise<void> {
        if (typeof window === "undefined") {
            // No-op for server-side rendering
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open(DB_NAME, 1);

                request.onerror = (event) => {
                    logger.error("Failed to open IndexedDB", event);
                    reject(new Error("Failed to open IndexedDB"));
                };

                request.onsuccess = (event) => {
                    this.db = (event.target as IDBOpenDBRequest).result;
                    logger.info("IndexedDB opened successfully");
                    resolve();
                };

                request.onupgradeneeded = (event) => {
                    const db = (event.target as IDBOpenDBRequest).result;

                    // Create the object store with a timestamp index
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        const store = db.createObjectStore(STORE_NAME, {
                            keyPath: "id",
                            autoIncrement: true,
                        });
                        store.createIndex("timestamp", "timestamp", {
                            unique: false,
                        });
                        logger.info("Version history store created");
                    }
                };
            } catch (error) {
                logger.error("Error opening IndexedDB", error);
                resolve(); // Resolve anyway to prevent app crashes
            }
        });
    }

    // Save a new version
    async saveVersion(html: string, label = ""): Promise<Version | null> {
        if (typeof window === "undefined") {
            // No-op for server-side rendering
            return Promise.resolve(null);
        }

        if (!this.db) {
            await this.init();
        }

        if (!this.db) {
            logger.error("Database not initialized");
            return null;
        }

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction(
                    STORE_NAME,
                    "readwrite",
                );
                const store = transaction.objectStore(STORE_NAME);

                // Create a new version entry
                const newVersion: Omit<Version, "id"> = {
                    timestamp: Date.now(),
                    html,
                    label: label || `Version ${new Date().toLocaleString()}`,
                };

                // Add the new version
                const addRequest = store.add(newVersion);

                addRequest.onsuccess = async (event) => {
                    const id = (event.target as IDBRequest).result as number;
                    const version = { ...newVersion, id } as Version;

                    // Check if we need to clean up old versions
                    await this.pruneOldVersions();

                    resolve(version);
                };

                addRequest.onerror = () => {
                    logger.error("Error saving version");
                    resolve(null);
                };
            } catch (error) {
                logger.error("Error in saveVersion", error);
                resolve(null);
            }
        });
    }

    // Get all versions
    async getVersions(): Promise<Version[]> {
        if (typeof window === "undefined") {
            // No-op for server-side rendering
            return Promise.resolve([]);
        }

        if (!this.db) {
            await this.init();
        }

        if (!this.db) {
            logger.error("Database not initialized");
            return [];
        }

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction(
                    STORE_NAME,
                    "readonly",
                );
                const store = transaction.objectStore(STORE_NAME);
                const index = store.index("timestamp");

                // Get all versions sorted by timestamp (newest first)
                const request = index.openCursor(null, "prev");
                const versions: Version[] = [];

                request.onsuccess = (event) => {
                    const cursor = (event.target as IDBRequest)
                        .result as IDBCursorWithValue;

                    if (cursor) {
                        versions.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(versions);
                    }
                };

                request.onerror = () => {
                    logger.error("Error getting versions");
                    resolve([]);
                };
            } catch (error) {
                logger.error("Error in getVersions", error);
                resolve([]);
            }
        });
    }

    // Get a specific version by ID
    async getVersion(id: number): Promise<Version | null> {
        if (typeof window === "undefined") {
            // No-op for server-side rendering
            return Promise.resolve(null);
        }

        if (!this.db) {
            await this.init();
        }

        if (!this.db) {
            logger.error("Database not initialized");
            return null;
        }

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction(
                    STORE_NAME,
                    "readonly",
                );
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(id);

                request.onsuccess = () => {
                    resolve(request.result || null);
                };

                request.onerror = () => {
                    logger.error("Error getting version");
                    resolve(null);
                };
            } catch (error) {
                logger.error("Error in getVersion", error);
                resolve(null);
            }
        });
    }

    // Remove old versions, keeping only the most recent MAX_VERSIONS
    protected async pruneOldVersions(): Promise<void> {
        if (typeof window === "undefined") {
            // No-op for server-side rendering
            return Promise.resolve();
        }

        if (!this.db) {
            return;
        }

        const versions = await this.getVersions();

        // If we have more than MAX_VERSIONS, delete the oldest ones
        if (versions.length > MAX_VERSIONS) {
            const versionsToDelete = versions.slice(MAX_VERSIONS);

            for (const version of versionsToDelete) {
                await this.deleteVersion(version.id);
            }
        }
    }

    // Delete a specific version
    protected async deleteVersion(id: number): Promise<void> {
        if (typeof window === "undefined") {
            // No-op for server-side rendering
            return Promise.resolve();
        }

        if (!this.db) {
            return;
        }

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction(
                    STORE_NAME,
                    "readwrite",
                );
                const store = transaction.objectStore(STORE_NAME);
                store.delete(id);

                transaction.oncomplete = () => {
                    resolve();
                };
            } catch (error) {
                logger.error("Error deleting version", error);
                resolve();
            }
        });
    }
}

// Create a dummy implementation for server-side rendering by extending the base class
class DummyVersionHistoryService extends VersionHistoryService {
    // Override methods with no-op implementations
    async init(): Promise<void> {
        return Promise.resolve();
    }

    async saveVersion(): Promise<Version | null> {
        return Promise.resolve(null);
    }

    async getVersions(): Promise<Version[]> {
        return Promise.resolve([]);
    }

    async getVersion(): Promise<Version | null> {
        return Promise.resolve(null);
    }
}

// Create and export service based on environment - ensure it's always defined
export const versionHistoryService =
    typeof window !== "undefined"
        ? new VersionHistoryService()
        : new DummyVersionHistoryService();
