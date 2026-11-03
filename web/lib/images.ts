// Uploaded model files live in IndexedDB (localStorage is too small), keyed by a short random file name.
const DB = "my-gallery", STORE = "images";

function db() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>) {
  const d = await db();
  return new Promise<T>((resolve, reject) => {
    const req = run(d.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// A friend's room keeps its images in memory only, under "visit:" names; they never touch IndexedDB.
export const VISIT = "visit:";
export const visitImages = new Map<string, Blob>();

export const getImage = (name: string) =>
  name.startsWith(VISIT) ? Promise.resolve(visitImages.get(name)) : tx<Blob | undefined>("readonly", (s) => s.get(name));
export const putImage = (name: string, blob: Blob) => tx("readwrite", (s) => s.put(blob, name));

