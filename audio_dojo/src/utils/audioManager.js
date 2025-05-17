// src/utils/audioManager.js

// create one context that lives for the life of the page:
export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
/**
 * Map your logical keys to the *exact* filenames in public/sounds/…
 * (case-sensitive to match what you actually have on disk)
 */
const FILE_MAP = {
  // originals
  Kick:  "Kick.wav",
  Snare: "Snare.wav",

  // reverbs (IRs)
  Room:   "Room.wav",
  Plate:  "Plate.wav",
  Hall:   "Hall.wav",
  Spring: "Spring.wav",
  Custom: "Custom.wav",
};

/**
 * Fetch + decode any .wav under public/sounds/{folder}/
 */
async function loadAudioBuffer(key, folder = "original") {
  const fileName = FILE_MAP[key] || `${key}.wav`;
  const url = `/sounds/${folder}/${fileName}`;
  console.log("⤵️ fetching audio:", url);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const ct = res.headers.get("Content-Type") || "";
  if (!ct.includes("audio")) {
    console.error("Wrong content-type for", url, ct);
    throw new Error(`Invalid content-type ${ct}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const ctx = audioCtx;
  return ctx.decodeAudioData(arrayBuffer);
}

/** 1) apply EQ only */
export async function applyEQ({ instrument, shape, frequency, gain }) {
  const buffer = await loadAudioBuffer(instrument, "original");
  const ctx    = audioCtx; 
  const src    = ctx.createBufferSource();
  src.buffer   = buffer;

  const EQ_TYPE_MAP = {
    Bell:        "peaking",
    "Low Shelf": "lowshelf",
    "High Shelf":"highshelf",
    "Low Cut":   "highpass",
    "High Cut":  "lowpass",
  };
  const eq = ctx.createBiquadFilter();
  eq.type            = EQ_TYPE_MAP[shape]    || "peaking";
  eq.frequency.value = frequency;
  eq.gain.value      = gain;

  src.connect(eq).connect(ctx.destination);
  src.start();
}

/** 2) apply Compression only */
export async function applyCompression({ instrument, attack, release, threshold }) {
  const buffer = await loadAudioBuffer(instrument, "original");
  const ctx    = audioCtx;
  const src    = ctx.createBufferSource();
  src.buffer   = buffer;

  const comp = ctx.createDynamicsCompressor();
  // ✅ use .value on each AudioParam
  comp.attack.value    = parseFloat(attack)  / 1000;  // ms→s
  comp.release.value   = parseFloat(release) / 1000;
  comp.threshold.value = parseFloat(threshold);      // dB

  src.connect(comp).connect(ctx.destination);
  src.start();
}

/** 3) apply Reverb only (dry/wet mix) */
export async function applyReverb({ instrument, type, decayTime, mix }) {
  const buffer = await loadAudioBuffer(instrument, "original");
  const ctx    = audioCtx;
  const src    = ctx.createBufferSource();
  src.buffer   = buffer;

  // dry & wet gains
  const dryGain = ctx.createGain();
  dryGain.gain.value = 1 - parseFloat(mix);
  const wetGain = ctx.createGain();
  wetGain.gain.value = parseFloat(mix);

  // convolver – load IR by 'type', not by 'instrument'
  const conv  = ctx.createConvolver();
  conv.buffer = await loadAudioBuffer(type, "reverb");

  // graph
  src.connect(dryGain).connect(ctx.destination);
  src.connect(conv).connect(wetGain).connect(ctx.destination);

  src.start();
}

/** 4) apply Saturation only (waveshaper + dry/wet mix) */
export async function applySaturation({ instrument, drive, curveType, bias, mix }) {
  const buffer = await loadAudioBuffer(instrument, "original");
  const ctx    = audioCtx;
  const src    = ctx.createBufferSource();
  src.buffer = buffer;

  // build curve
  const samples = 44100;
  const curve   = new Float32Array(samples);
  const d = parseFloat(drive), b = parseFloat(bias);
  for (let i = 0; i < samples; i++) {
    let x = (i/(samples-1)) * 2 - 1 + b;
    if (curveType === "hard")       curve[i] = Math.tanh(x * d);
    else if (curveType === "medium") curve[i] = (Math.atan(x * d)/Math.PI)*2;
    else                             curve[i] = x/(1 + Math.abs(x)*d);
  }
  const shaper = ctx.createWaveShaper();
  shaper.curve = curve;

  // dry & wet
  const dryGain = ctx.createGain();
  dryGain.gain.value = 1 - parseFloat(mix);
  const wetGain = ctx.createGain();
  wetGain.gain.value = parseFloat(mix);

  // graph
  src.connect(dryGain).connect(ctx.destination);
  src.connect(shaper).connect(wetGain).connect(ctx.destination);

  src.start();
}

/**
 * Inspect a convolution IR by key (e.g. "Room", "Plate", etc.).
 * Fetches /sounds/{folder}/{key}.wav, decodes it, logs sampleRate,
 * channels and duration, and returns the AudioBuffer.
 */
export async function inspectIR(key, folder = "reverb") {
  // build the URL exactly as your loadAudioBuffer does
  const url = `/sounds/${folder}/${key}.wav`;
  console.log(`🔍 Inspecting IR at ${url}…`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const ct = res.headers.get("Content-Type") || "";
  if (!ct.includes("audio")) {
    throw new Error(`Invalid content-type ${ct} for ${url}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const ctx         = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

  console.table({
    key,
    folder,
    sampleRate: audioBuffer.sampleRate,
    channels:   audioBuffer.numberOfChannels,
    length:     audioBuffer.length,
    duration:   audioBuffer.duration.toFixed(3) + " s"
  });

  return audioBuffer;
}
