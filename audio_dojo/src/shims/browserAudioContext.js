// browserAudioContext.js
// Expose the built-in AudioContext in place of the Node polyfill
export const AudioContext = window.AudioContext || window.webkitAudioContext;
