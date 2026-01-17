import { useEffect, useRef } from "react";

function toHz(v) {
  if (v == null) return NaN;
  if (typeof v === "number") return v;
  const s = String(v).toLowerCase().trim();
  const n = parseFloat(s.replace(/[^0-9.+-]/g, ""));
  if (!Number.isFinite(n)) return NaN;
  if (s.includes("khz") || /\b\d+(\.\d+)?k\b/.test(s)) return n * 1000;
  return n;
}
function toDb(v, def = 0) {
  if (v == null) return def;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace(/[^0-9.+-]/g, ""));
  return Number.isFinite(n) ? n : def;
}
function toQ(v, def = 1) {
  if (v == null) return def;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace(/[^0-9.+-]/g, ""));
  return Number.isFinite(n) ? n : def;
}

export default function EQCurveCanvas({
  shape = "Bell",
  frequency = 1000,
  gain = 6,
  q = 1,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.offsetWidth;
    const height = 200;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    const fHz = toHz(frequency);
    const gDb = toDb(gain, 0);
    const qVal = Math.max(toQ(q, 1), 0.0001);

    if (!Number.isFinite(fHz) || !Number.isFinite(gDb) || !Number.isFinite(qVal)) {
      // ציור רק רקע/צירים כדי לא לקרוס
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, width, height);
      return;
    }

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const filter = audioCtx.createBiquadFilter();

    const shapeMap = {
      Bell: "peaking",
      "Low Shelf": "lowshelf",
      "High Shelf": "highshelf",
      "Low Cut": "highpass",
      "High Cut": "lowpass",
    };

    filter.type = shapeMap[shape] || "peaking";
    filter.frequency.value = Math.min(Math.max(fHz, 20), 20000);
    filter.gain.value = gDb;
    filter.Q.value = qVal;

    const N = Math.max(64, width);
    const freqHz = new Float32Array(N);
    const mag = new Float32Array(N);
    const phase = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      const norm = i / (N - 1);
      freqHz[i] = 20 * Math.pow(10, norm * 3); // 20..20k
    }

    filter.getFrequencyResponse(freqHz, mag, phase);

    // Background
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, width, height);

    // Axes
    const drawLine = (x1, y1, x2, y2, style = "#444", lw = 1) => {
      ctx.strokeStyle = style;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };
    const drawText = (text, x, y, align = "center", baseline = "middle", color = "#999") => {
      ctx.fillStyle = color;
      ctx.font = "10px sans-serif";
      ctx.textAlign = align;
      ctx.textBaseline = baseline;
      ctx.fillText(text, x, y);
    };

    for (let dB = -24; dB <= 24; dB += 6) {
      const y = height / 2 - (dB / 24) * (height / 2);
      drawLine(0, y, width, y, dB === 0 ? "#666" : "#333");
      drawText(`${dB} dB`, 5, y, "left");
    }
    [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].forEach((hz) => {
      const norm = Math.log10(hz / 20) / 3;
      const x = norm * width;
      drawLine(x, 0, x, height, "#222");
      drawText(hz >= 1000 ? `${hz / 1000}k` : `${hz}`, x, height - 10);
    });

    // Curve
    ctx.strokeStyle = "#a3e635";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const dB = 20 * Math.log10(mag[i] || 1);
      const x = i;
      const y = height / 2 - (dB / 24) * (height / 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // cleanup
    return () => {
      try { audioCtx.close(); } catch {}
    };
  }, [shape, frequency, gain, q]);

  return (
    <div ref={containerRef} style={{ width: "100%", maxWidth: "100%" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "auto", borderRadius: "12px" }} />
    </div>
  );
}
