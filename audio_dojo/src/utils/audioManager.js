// audioManager.js - Central Audio Management Logic

import { getAudioFile, saveAudioFile, clearCache } from './audioCache.js';
import { checkFileInServer, uploadFileToServer, generateAudioFile } from './audioAPI.js';
import { AudioContext } from 'node-web-audio-api';

// Main function to manage audio flow
async function handleAudioPlayback(params) {
  const { instrument, shape, frequency, gain } = params;
  const hashId = `${instrument}_${shape}_${frequency}_${gain}`;

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

        // העלאה לשרת Cloudinary
    await uploadFileToServer(hashId, newBlob);
  }
}



// Play audio from Blob with GainNode control
function playAudioFromBlob(blob, gainValue = 1.0) {
  if (!(blob instanceof Blob)) {
    console.error('Expected a Blob, received:', typeof blob);
    return;
  }

  const audioContext = new AudioContext();
  const gainNode = audioContext.createGain();
  gainNode.gain.value = gainValue; // ערך ברירת מחדל: 1.0 (עוצמה רגילה)

  const blobURL = URL.createObjectURL(blob);

  fetch(blobURL)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;

      // חיבור ה-GainNode ל-AudioContext
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

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

// Test function with multiple sets of parameters
async function runTest() {
  const testParams1 = {
    instrument: 'Kick',
    shape: 'Sine',
    frequency: '400Hz',
    gain: '+3dB'
  };

  const testParams2 = {
    instrument: 'Snare',
    shape: 'Square',
    frequency: '600Hz',
    gain: '-3dB'
  };

  console.log('Running test with first parameter set:', testParams1);
  await handleAudioPlayback(testParams1);

  console.log('Running test with second parameter set:', testParams2);
  await handleAudioPlayback(testParams2);

  console.log('Running test with first parameter set again (should use cache):', testParams1);
  await handleAudioPlayback(testParams1);
}

// Run the test
runTest();

export { handleAudioPlayback, clearAudioCache };
