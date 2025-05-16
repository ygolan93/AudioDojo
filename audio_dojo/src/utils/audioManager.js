// audioManager.js - Central Audio Management Logic

import { getAudioFile, saveAudioFile, clearCache } from './audioCache.js';
import { checkFileInServer, uploadFileToServer, generateAudioFile } from './audioAPI.js';
import { AudioContext } from 'node-web-audio-api';

// Main function to manage audio flow
async function handleAudioPlayback(params) {
  const { instrument, shape, frequency } = params;
  const hashId = `${instrument}_${shape}_${frequency}`;

  console.log(`Handling playback for: ${hashId}`);

  let blob = await getAudioFile(hashId);

  if (blob) {
    console.log('Playing from local cache:', hashId);
    console.log('Blob type from cache:', blob.type);
    playAudioFromBlob(blob);
    return;
  }

  const serverURL = await checkFileInServer(hashId);

  if (serverURL) {
    console.log('Found in server cache, downloading:', hashId);
    const response = await fetch(serverURL);
    blob = await response.blob();
    console.log('Blob type from server:', blob.type);
    playAudioFromBlob(blob);
    return;
  }

  console.log('Generating new audio file for:', hashId);
  const newBlob = await generateAudioFile(params);

  if (newBlob) {
    console.log('Blob type after generation:', newBlob.type);
    playAudioFromBlob(newBlob);

    await uploadFileToServer(hashId, newBlob);
  }
}

// Play audio from Blob
function playAudioFromBlob(blob) {
  if (!(blob instanceof Blob)) {
    console.error('Expected a Blob, received:', typeof blob);
    return;
  }

  const audioContext = new AudioContext();
  const blobURL = URL.createObjectURL(blob);

  fetch(blobURL)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      console.log('Playing audio from Blob:', blobURL);

      source.onended = () => {
        console.log('Audio playback finished. Releasing Blob URL:', blobURL);
        URL.revokeObjectURL(blobURL);
      };
    })
    .catch(err => {
      console.error('Error playing audio:', err);
      URL.revokeObjectURL(blobURL);
    });
}

// Clear local cache after session
function clearAudioCache() {
  console.log('Clearing local audio cache');
  clearCache();
}

export { handleAudioPlayback, clearAudioCache };
