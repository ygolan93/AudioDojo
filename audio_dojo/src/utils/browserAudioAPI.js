// browserAudioAPI.js  
// — a small shim for your client build — 

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * (Optional) Check if an existing file is on Cloudinary.
 * Here we stub it out (always miss) — you’d implement
 * a real check via your own backend if you need it.
 */
export async function checkFileInServer(hashId) {
  console.warn(`checkFileInServer('${hashId}') → not implemented in browser.`);
  return null;
}

/**
 * Upload a Blob to Cloudinary via an unsigned upload preset.
 */
export async function uploadFileToServer(hashId, blob) {
  const url  = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
  const form = new FormData();
  form.append('file', blob);
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('public_id', hashId);

  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Cloudinary upload failed: ' + res.statusText);
  const data = await res.json();
  return data.secure_url;
}

/**
 * Stub out the Node-only “generate” step.
 * You can’t synthesize new audio in the browser
 * the same way you did on Node, so here we just warn.
 */
export async function generateAudioFile(params) {
  console.warn('generateAudioFile() is not available in the browser.', params);
  return null;
}

/**
 * Decode a Blob into an AudioBuffer.
 */
export async function loadAudioBuffer(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const ctx         = new (window.AudioContext || window.webkitAudioContext)();
  return ctx.decodeAudioData(arrayBuffer);
}
