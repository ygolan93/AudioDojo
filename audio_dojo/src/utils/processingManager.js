import { applyEQ } from '../obselete/EQProcessor.js';

/**
 * Applies audio processing based on the selected effect.
 * @param {AudioBuffer} audioBuffer - The input audio buffer.
 * @param {string} effect - The effect type ('EQ', 'Compression', 'Reverb', 'Saturation').
 * @param {Object} params - The parameters for the effect.
 * @returns {Promise<AudioBuffer>} - The processed audio buffer.
 */
export async function applyProcessing(audioBuffer, effect, params) {
  switch (effect) {
    case 'EQ':
    console.log('Applying EQ with params:', params);
      return applyEQ(audioBuffer, params);
    // TODO: Add Compression, Reverb, and Saturation processing
    default:
      console.warn(`Effect ${effect} not implemented`);
      return audioBuffer;
  }
}
