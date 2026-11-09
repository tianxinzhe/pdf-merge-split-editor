export interface HandoffFile {
  name: string
  binary: ArrayBuffer
}

const DB_NAME = 'lemon-pdf-handoff'
const STORE_NAME = 'files'
const RECORD_KEY = 'pending'
const MAX_AGE_MS = 10 * 60 * 1000

interface StoredHandoff extends HandoffFile {
  createdAt: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveHandoff(file: HandoffFile): Promise<void> {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put({ ...file, createdAt: Date.now() }, RECORD_KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

export async function loadHandoff(): Promise<HandoffFile | null> {
  const db = await openDb()
  try {
    const record = await new Promise<StoredHandoff | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const request = tx.objectStore(STORE_NAME).get(RECORD_KEY)
      request.onsuccess = () => resolve(request.result as StoredHandoff | undefined)
      request.onerror = () => reject(request.error)
    })
    if (!record || !(record.binary instanceof ArrayBuffer)) return null
    if (Date.now() - record.createdAt > MAX_AGE_MS) {
      await clearHandoff()
      return null
    }
    return { name: record.name, binary: record.binary }
  } finally {
    db.close()
  }
}

export async function clearHandoff(): Promise<void> {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(RECORD_KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}