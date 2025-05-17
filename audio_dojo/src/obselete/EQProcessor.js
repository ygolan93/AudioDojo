/**
 * Applies EQ processing to the given audio buffer using BiquadFilterNode.
 * @param {AudioBuffer} audioBuffer - The input audio buffer.
 * @param {Object} params - EQ parameters including frequency, shape, and gain.
 * @returns {Promise<AudioBuffer>} - The processed audio buffer.
 */
export async function applyEQ(audioBuffer, params) {
  const { frequency, shape, gain } = params;
  const audioContext = new AudioContext();
    if (!audioBuffer) {
        throw new Error('Invalid audio buffer provided');
    }
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;

  const biquadFilter = audioContext.createBiquadFilter();
  biquadFilter.type = shape || 'peaking';
  biquadFilter.frequency.value = frequency || 1000;
  biquadFilter.gain.value = gain || 0;

  source.connect(biquadFilter);
  biquadFilter.connect(audioContext.destination);

  return new Promise((resolve) => {
    source.start();
    source.onended = () => {
      resolve(audioBuffer);
    };
  });
}
