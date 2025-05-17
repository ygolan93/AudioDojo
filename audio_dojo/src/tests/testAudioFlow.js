// testAudioFlow.js - Testing the Full Audio Flow

import { handleAudioPlayback, clearAudioCache } from './utils/audioManager.js';

async function testAudioFlow() {
  const testParams = {
    instrument: 'Kick',
    shape: 'Sine',
    frequency: '400Hz'
  };

  console.log('Starting audio flow test with parameters:', testParams);

  try {
    const blobURL = await handleAudioPlayback(testParams);
    console.log('Audio file ready to play at:', blobURL);

    // Simulate playback (e.g., create audio element)
    const audio = new Audio(blobURL);
    audio.play();

    // Cleanup after 5 seconds
    setTimeout(() => {
      console.log('Ending session and clearing cache.');
      clearAudioCache();
    }, 5000);

  } catch (error) {
    console.error('Error in audio flow test:', error);
  }
}

// Run the test
testAudioFlow();
