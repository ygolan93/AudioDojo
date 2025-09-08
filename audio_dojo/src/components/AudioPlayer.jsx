import React, { useEffect, useRef } from "react";
import { Howl, Howler } from "howler";

export default function AudioPlayer({ src, play, onEnd }) {
  const howlRef = useRef(null);

  Howler.html5PoolSize = 20;

  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.stop();
      howlRef.current.unload();
    }

    const sound = new Howl({
      src: [src],
      volume: 1.0,
      html5: true,
      onend: () => {
        if (typeof onEnd === "function") {
          onEnd();
        }
      },
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
      sound.stop(); // ← תמיד עצור לפני שמנגן מחדש
      sound.play();
    } else {
      sound.stop();
    }
  }, [play]);

  return null;
}

