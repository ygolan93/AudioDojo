import { AudioContext } from 'node-web-audio-api';
global.AudioContext = AudioContext;
import fs from 'fs';
import path from 'path';
import { applyProcessing } from '../utils/processingManager.js';

function createAudioContext() {
  return new AudioContext();
}

// Load Test Audio
async function loadTestAudio() {
  const filePath = path.join('..', '..', 'public', 'sounds', 'original', 'drumset', 'kick', 'kick1.wav');
  console.log(`Loading audio from: ${filePath}`);

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const audioContext = createAudioContext();
    const audioBuffer = await audioContext.decodeAudioData(fileBuffer.buffer);
    console.log('Audio loaded successfully.');
    return audioBuffer;
  } catch (error) {
    console.error('Error loading audio file:', error);
    throw error;
  }
}

// Test EQ Processing with Different Parameters
async function testEQProcessing(params) {
  console.log(`Applying EQ with params: ${JSON.stringify(params)}`);

  try {
    const audioBuffer = await loadTestAudio();
    const processedBuffer = await applyProcessing(audioBuffer, 'EQ', params);

    const audioContext = createAudioContext();
    const source = audioContext.createBufferSource();
    source.buffer = processedBuffer;
    source.connect(audioContext.destination);
    source.start();

    console.log('EQ Processing Test Completed');
  } catch (error) {
    console.error('Error during EQ processing test:', error);
  }
}

// Parameter Sets
const parameterSets = [
  { frequency: 500, shape: 'peaking', gain: 3 },
  { frequency: 1000, shape: 'lowpass', gain: -6 },
  { frequency: 2000, shape: 'highshelf', gain: 5 },
  { frequency: 4000, shape: 'notch', gain: -12 },
  { frequency: 8000, shape: 'bandpass', gain: 0 },
];

// Execute Tests
(async () => {
  for (const params of parameterSets) {
    await testEQProcessing(params);
  }
})();
