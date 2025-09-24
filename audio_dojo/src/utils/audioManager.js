// src/utils/audioManager.js

// === One shared AudioContext for the whole app ===
export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// iOS/מובייל – לפתוח את ההקשר בנגיעה ראשונה
document.addEventListener(
  "touchstart",
  () => {
    if (audioCtx.state === "suspended") audioCtx.resume();
  },
  { once: true }
);

// === Master gain (global volume) ===
export const masterGain = audioCtx.createGain();
masterGain.gain.value = 1; // 100% by default
masterGain.connect(audioCtx.destination);

// Allow external code (VolumeContext) to update global volume
export function setGlobalVolume(vol) {
  const v = Number.isFinite(vol) ? Math.max(0, Math.min(1, vol)) : 1;
  masterGain.gain.value = v;
}

// === Preload all /public/sounds/*/*.wav eagerly ===
const modules = import.meta.glob("/public/sounds/*/*.wav", {
  as: "url",
  eager: true,
});

// Map: { folder: { filename: url } }
const FILE_MAP = Object.entries(modules).reduce((map, [path, url]) => {
  const parts = path.split("/");
  if (parts.length < 5) return map;
  const folder = parts[3]; // e.g., 'original', 'reverb', ...
  const filename = parts[4].replace(".wav", ""); // e.g., 'Kick', 'Room'
  map[folder] ||= {};
  map[folder][filename] = url;
  return map;
}, {});

// Fetch+decode by key from FILE_MAP
export async function loadAudioBuffer(key, folder = "original") {
  const folderMap = FILE_MAP[folder];
  if (!folderMap || !folderMap[key]) {
    throw new Error(`Unknown key "${key}" in folder "${folder}"`);
  }
  const url = folderMap[key];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const ab = await res.arrayBuffer();
  return audioCtx.decodeAudioData(ab);
}

let currentSrc = null;

export function stopCurrent() {
  if (currentSrc) {
    try {
      currentSrc.stop();
    } catch {}
    try {
      currentSrc.disconnect();
    } catch {}
    currentSrc = null;
  }
}

/** 1) EQ */
// BiquadFilterNode default Q is 1.0 — not explicitly set here
// Ref: https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode/Q
export async function applyEQ({ instrument, shape, frequency, gain, onEnd }) {
  stopCurrent();
  const buffer = await loadAudioBuffer(instrument, "original");

  const src = audioCtx.createBufferSource();
  currentSrc = src;
  src.buffer = buffer;

  const EQ_TYPE_MAP = {
    Bell: "peaking",
    "Low Shelf": "lowshelf",
    "High Shelf": "highshelf",
    "Low Cut": "highpass",
    "High Cut": "lowpass",
  };

  const eq = audioCtx.createBiquadFilter();
  eq.type = EQ_TYPE_MAP[shape] || "peaking";
  eq.frequency.value = Number(frequency) || 1000;
  eq.gain.value = Number(gain) || 0;

  src.connect(eq).connect(masterGain);
  src.start();
  src.onended = () => {
    if (typeof onEnd === "function") onEnd();
  };
}

/** 2) Compression */
export async function applyCompression({
  instrument,
  attack,
  release,
  threshold,
  onEnd,
}) {
  stopCurrent();
  const buffer = await loadAudioBuffer(instrument, "original");

  const src = audioCtx.createBufferSource();
  currentSrc = src;
  src.buffer = buffer;

  const comp = audioCtx.createDynamicsCompressor();
  const a = parseFloat(attack);
  const r = parseFloat(release);
  const t = parseFloat(threshold);

  if (Number.isFinite(a)) comp.attack.value = a / 1000; // ms → sec
  if (Number.isFinite(r)) comp.release.value = r / 1000; // ms → sec
  if (Number.isFinite(t)) comp.threshold.value = t;

  src.connect(comp).connect(masterGain);
  src.start();
  src.onended = () => {
    if (typeof onEnd === "function") onEnd();
  };
}

/** 3) Reverb (dry/wet) */
export async function applyReverb({
  instrument,
  type,
  decayTime, // currently unused here; IR carries the space
  mix,
  onEnd,
}) {
  stopCurrent();
  const buffer = await loadAudioBuffer(instrument, "original");

  const src = audioCtx.createBufferSource();
  currentSrc = src;
  src.buffer = buffer;

  const irType = type || "Room";
  if (!FILE_MAP["reverb"]?.[irType]) {
    console.warn("Invalid/missing IR type:", irType);
    return;
  }

  const m = parseFloat(mix);
  const wetAmount = Number.isFinite(m) ? Math.max(0, Math.min(1, m)) : 0.5;

  const dryGain = audioCtx.createGain();
  dryGain.gain.value = 1 - wetAmount;

  const wetGain = audioCtx.createGain();
  wetGain.gain.value = wetAmount;

  const conv = audioCtx.createConvolver();
  conv.buffer = await loadAudioBuffer(irType, "reverb");

  // Routing
  src.connect(dryGain).connect(masterGain);
  src.connect(conv).connect(wetGain).connect(masterGain);

  src.start();
  src.onended = () => {
    if (typeof onEnd === "function") onEnd();
  };
}

/** 4) Saturation (waveshaper + dry/wet) */
export async function applySaturation({
  instrument,
  drive,
  curveType,
  bias,
  mix,
  onEnd,
}) {
  stopCurrent();
  const buffer = await loadAudioBuffer(instrument, "original");

  const src = audioCtx.createBufferSource();
  currentSrc = src;
  src.buffer = buffer;

  const d = parseFloat(drive);
  const b = parseFloat(bias);
  const m = parseFloat(mix);

  const validDrive = Number.isFinite(d) ? d : 1;
  const validBias = Number.isFinite(b) ? b : 0;
  const wetAmount = Number.isFinite(m) ? Math.max(0, Math.min(1, m)) : 0.5;

  // Build curve
  const samples = 44100;
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    let x = (i / (samples - 1)) * 2 - 1 + validBias;
    if (curveType === "hard") curve[i] = Math.tanh(x * validDrive);
    else if (curveType === "medium")
      curve[i] = (Math.atan(x * validDrive) / Math.PI) * 2;
    else curve[i] = x / (1 + Math.abs(x) * validDrive);
  }

  const shaper = audioCtx.createWaveShaper();
  shaper.curve = curve;

  const dryGain = audioCtx.createGain();
  dryGain.gain.value = 1 - wetAmount;

  const wetGain = audioCtx.createGain();
  wetGain.gain.value = wetAmount;

  // Routing
  src.connect(dryGain).connect(masterGain);
  src.connect(shaper).connect(wetGain).connect(masterGain);

  src.start();
  src.onended = () => {
    if (typeof onEnd === "function") onEnd();
  };
}

/** 5) Play original (raw) */
export async function playOriginal({ instrument, onEnd }) {
  stopCurrent();
  const buffer = await loadAudioBuffer(instrument, "original");

  const src = audioCtx.createBufferSource();
  currentSrc = src;
  src.buffer = buffer;
  src.connect(masterGain);
  src.start();
  src.onended = () => {
    if (typeof onEnd === "function") onEnd();
  };
}
