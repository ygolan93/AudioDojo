// audioCacheNode.js - IndexedDB Implementation for Node.js using fake-indexeddb

import { indexedDB } from 'fake-indexeddb';

const DB_NAME = 'AudioCacheDB';
const STORE_NAME = 'audioFiles';

// Initialize IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error initializing IndexedDB');
  });
}

// Save Audio File to IndexedDB
async function saveAudioFile(id, blob) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const fileEntry = { id, blob }; // Directly store the blob in Node.js
  store.put(fileEntry);

  return id;
}

// Retrieve Audio File by ID
async function getAudioFile(id) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result?.blob || null);
    request.onerror = () => reject('Error retrieving file');
  });
}

// Delete All Files After Session
async function clearCache() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.clear();
}

export { saveAudioFile, getAudioFile, clearCache };
