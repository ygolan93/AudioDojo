// src/utils/audioManager.js

// create one context that lives for the life of the page:
export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// eagerly grab every .wav under public/sounds/**:
const modules = import.meta.glob('/public/sounds/*/*.wav', { as: 'url', eager: true });

// build a map of maps: { folder: { fileKey: url } }
const FILE_MAP = Object.entries(modules).reduce((map, [path, url]) => {
  const parts = path.split('/');

  if (parts.length < 5) {
    console.warn("⚠️ Skipping invalid path:", path);
    return map;
  }

  const folder = parts[3];                   // e.g. 'original' or 'reverb'
  const filename = parts[4].replace('.wav',''); // e.g. 'Room' or 'Kick'

  map[folder] = map[folder] || {};
  map[folder][filename] = url;

  return map;
}, {});

console.log('Loaded sounds:', FILE_MAP);

/**
 * Fetch + decode any .wav under /public/sounds/{folder}/
 */
export async function loadAudioBuffer(key, folder = 'original') {
  const folderMap = FILE_MAP[folder];
  if (!folderMap || !folderMap[key]) {
    throw new Error(`Unknown instrument/IR: "${key}" in folder "${folder}"`);
  }
  const url = folderMap[key];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return audioCtx.decodeAudioData(arrayBuffer);
}

let currentCtx = null;
let currentSrc = null;

export function stopCurrent() {
  if (currentSrc) {
    try { currentSrc.stop(); }
    catch {}
    currentSrc.disconnect?.();
    currentSrc = null;
  }
  // don’t close the context; reuse it
}

/** 1) apply EQ only */
export async function applyEQ({ instrument, shape, frequency, gain }) {
  stopCurrent();
  const buffer = await loadAudioBuffer(instrument, "original");
  const ctx = currentCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  const src = ctx.createBufferSource();
  currentSrc = src;
  src.buffer = buffer;

  const EQ_TYPE_MAP = {
    Bell:        "peaking",
    "Low Shelf": "lowshelf",
    "High Shelf":"highshelf",
    "Low Cut":   "highpass",
    "High Cut":  "lowpass",
  };
  const eq = ctx.createBiquadFilter();
  eq.type = EQ_TYPE_MAP[shape] || "peaking";
  eq.frequency.value = frequency;
  eq.gain.value = gain;

  src.connect(eq).connect(ctx.destination);
  src.start();
}

/** 2) apply Compression only */
export async function applyCompression({ instrument, attack, release, threshold }) {
  stopCurrent();
  const buffer = await loadAudioBuffer(instrument, "original");
  const ctx = currentCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  const src = ctx.createBufferSource();
  currentSrc = src;
  src.buffer = buffer;

  const comp = ctx.createDynamicsCompressor();

  const a = parseFloat(attack);
  const r = parseFloat(release);
  const t = parseFloat(threshold);

  if (isFinite(a)) comp.attack.value = a / 1000;
  if (isFinite(r)) comp.release.value = r / 1000;
  if (isFinite(t)) comp.threshold.value = t;

  src.connect(comp).connect(ctx.destination);
  src.start();
}

/** 3) apply Reverb only (dry/wet mix) */
export async function applyReverb({ instrument, type, decayTime, mix }) {
  stopCurrent();
  const buffer = await loadAudioBuffer(instrument, "original");
  const ctx = currentCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  const src = ctx.createBufferSource();
  currentSrc = src;
  src.buffer = buffer;

  const irType = type || "Room";
  if (!FILE_MAP["reverb"]?.[irType]) {
    console.warn("Invalid or missing reverb type:", irType);
    return;
  }

  const parsedMix = parseFloat(mix);
  const validMix = isFinite(parsedMix) ? parsedMix : 0.5;

  const dryGain = ctx.createGain();
  dryGain.gain.value = 1 - validMix;

  const wetGain = ctx.createGain();
  wetGain.gain.value = validMix;

  const conv = ctx.createConvolver();
  conv.buffer = await loadAudioBuffer(irType, "reverb");

  src.connect(dryGain).connect(ctx.destination);
  src.connect(conv).connect(wetGain).connect(ctx.destination);

  src.start();
}



/** 4) apply Saturation only (waveshaper + dry/wet mix) */
export async function applySaturation({ instrument, drive, curveType, bias, mix }) {
  stopCurrent();
  const buffer = await loadAudioBuffer(instrument, "original");
  const ctx = currentCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  const src = ctx.createBufferSource();
  currentSrc = src;
  src.buffer = buffer;

  const d = parseFloat(drive);
  const b = parseFloat(bias);
  const m = parseFloat(mix);

  const validDrive = isFinite(d) ? d : 1;
  const validBias = isFinite(b) ? b : 0;
  const validMix = isFinite(m) ? m : 0.5;

  const samples = 44100;
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    let x = (i / (samples - 1)) * 2 - 1 + validBias;
    if (curveType === "hard")       curve[i] = Math.tanh(x * validDrive);
    else if (curveType === "medium") curve[i] = (Math.atan(x * validDrive) / Math.PI) * 2;
    else                             curve[i] = x / (1 + Math.abs(x) * validDrive);
  }

  const shaper = ctx.createWaveShaper();
  shaper.curve = curve;

  const dryGain = ctx.createGain();
  dryGain.gain.value = 1 - validMix;

  const wetGain = ctx.createGain();
  wetGain.gain.value = validMix;

  src.connect(dryGain).connect(ctx.destination);
  src.connect(shaper).connect(wetGain).connect(ctx.destination);

  src.start();
}

/**
 * Inspect a convolution IR by key (e.g. "Room", "Plate", etc.).
 */
export async function inspectIR(key, folder = "reverb") {
  const url = `/sounds/${folder}/${key}.wav`;
  console.log(`🔍 Inspecting IR at ${url}…`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const ct = res.headers.get("Content-Type") || "";
  if (!ct.includes("audio")) {
    throw new Error(`Invalid content-type ${ct} for ${url}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

  console.table({
    key,
    folder,
    sampleRate: audioBuffer.sampleRate,
    channels: audioBuffer.numberOfChannels,
    length: audioBuffer.length,
    duration: audioBuffer.duration.toFixed(3) + " s"
  });

  return audioBuffer;
}

/**
 * Loads and plays the raw sample for the given instrument.
 */
export async function playOriginal({ instrument }) {
  try {
    const filePath = `/sounds/original/${instrument.toLowerCase()}/${instrument.toLowerCase()}1.wav`;
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = await loadAudioBuffer(ac, filePath);
    const src = ac.createBufferSource();
    src.buffer = buffer;
    src.connect(ac.destination);
    src.start();
  } catch (err) {
    console.error("playOriginal error:", err);
  }
}
