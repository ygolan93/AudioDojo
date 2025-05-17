// src/utils/audioManager.js

// create one context that lives for the life of the page:
export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
/**
 * Map your logical keys to the *exact* filenames in public/sounds/…
 * (case-sensitive to match what you actually have on disk)
 */
const FILE_MAP = {
  // originals
  Kick:             "Kick.wav",
  Snare:            "Snare.wav",
  Brass:            "Brass.wav",
  "Electric Guitar": "Electric Guitar.wav",
  "Acoustic Guitar": "Acoustic Guitar.wav",
  "Bass Guitar":     "Bass Guitar.wav",
  Strings:          "Strings.wav",
  Male:             "Male.wav",
  Female:           "Female.wav",
  Synth:            "Synth.wav",
  Woodwind:         "Woodwind.wav",

  // reverbs (IRs)
  Room:             "Room.wav",
  Plate:            "Plate.wav",
  Hall:             "Hall.wav",
  Spring:           "Spring.wav",
  Custom:           "Custom.wav",
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
  // stop any existing
  stopCurrent();

  const buffer = await loadAudioBuffer(instrument, "original");
  // reuse or create one AudioContext
  const ctx = currentCtx ||= new (window.AudioContext||window.webkitAudioContext)();
  const src = ctx.createBufferSource();
  currentSrc = src;               // remember it!
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
  stopCurrent();
  const buffer = await loadAudioBuffer(instrument, "original");
  const ctx = currentCtx ||= new (window.AudioContext||window.webkitAudioContext)();
  const src = ctx.createBufferSource();
  currentSrc = src;
  src.buffer = buffer;

  const comp = ctx.createDynamicsCompressor();
  comp.attack.value    = parseFloat(attack)  / 1000;  // ms→s
  comp.release.value   = parseFloat(release) / 1000;
  comp.threshold.value = parseFloat(threshold);      // dB

  src.connect(comp).connect(ctx.destination);
  src.start();
}

/** 3) apply Reverb only (dry/wet mix) */
export async function applyReverb({ instrument, type, decayTime, mix }) {
  stopCurrent();
  const buffer = await loadAudioBuffer(instrument, "original");
  const ctx = currentCtx ||= new (window.AudioContext||window.webkitAudioContext)();
  const src = ctx.createBufferSource();
  currentSrc = src;
  src.buffer = buffer;

  const dryGain = ctx.createGain();
  dryGain.gain.value = 1 - parseFloat(mix);
  const wetGain = ctx.createGain();
  wetGain.gain.value = parseFloat(mix);

  const conv  = ctx.createConvolver();
  conv.buffer = await loadAudioBuffer(type, "reverb");

  src.connect(dryGain).connect(ctx.destination);
  src.connect(conv).connect(wetGain).connect(ctx.destination);

  src.start();
}

/** 4) apply Saturation only (waveshaper + dry/wet mix) */
export async function applySaturation({ instrument, drive, curveType, bias, mix }) {
  stopCurrent();
  const buffer = await loadAudioBuffer(instrument, "original");
  const ctx = currentCtx ||= new (window.AudioContext||window.webkitAudioContext)();
  const src = ctx.createBufferSource();
  currentSrc = src;
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

  const dryGain = ctx.createGain();
  dryGain.gain.value = 1 - parseFloat(mix);
  const wetGain = ctx.createGain();
  wetGain.gain.value = parseFloat(mix);

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

/**
 * Loads and plays the raw sample for the given instrument.
 * @param {{ instrument: string }} opts
 */
export async function playOriginal({ instrument }) {
  try {
    // build path from instrument name (must match your public folder)
    const filePath = `/sounds/original/${instrument.toLowerCase()}/${instrument.toLowerCase()}1.wav`;
    const ac = new (window.AudioContext||window.webkitAudioContext)();
    const buffer = await loadAudioBuffer(ac, filePath);
    const src = ac.createBufferSource();
    src.buffer = buffer;
    src.connect(ac.destination);
    src.start();
  } catch (err) {
    console.error("playOriginal error:", err);
  }
}
