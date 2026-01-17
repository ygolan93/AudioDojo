import React, { useEffect, useRef } from "react";
import { Howl, Howler } from "howler";

function detectFormat(url) {
  if (!url) return [];
  const m = String(url).toLowerCase().match(/\.(mp3|wav|ogg|m4a|webm|aac)(?:\?|#|$)/);
  return m ? [m[1]] : ["mp3", "wav", "ogg"]; // fallback
}

export default function AudioPlayer({ src, play, onEnd }) {
  const howlRef = useRef(null);
  Howler.html5PoolSize = 20;

  useEffect(() => {
    if (!src) return () => {};
    if (howlRef.current) {
      howlRef.current.stop();
      howlRef.current.unload();
    }

    const sound = new Howl({
      src: [src],
      format: detectFormat(src), // ← מונע את האזהרה
      volume: 1.0,
      html5: true,
      onend: () => typeof onEnd === "function" && onEnd(),
    });

    howlRef.current = sound;
    return () => {
      sound.stop();
      sound.unload();
      howlRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    const sound = howlRef.current;
    if (!sound) return;
    if (play) {
      sound.stop();
      sound.play();
    } else {
      sound.stop();
    }
  }, [play]);

  return null;
}
