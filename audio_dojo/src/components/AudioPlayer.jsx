import React, { useEffect, useRef } from "react";
import { Howl, Howler } from "howler";

export default function AudioPlayer({ src, play }) {
  const howlRef = useRef(null);
  // double the default pool
  Howler.html5PoolSize = 20;
  // (Re)create Howl only on src change
  useEffect(() => {
    // unload previous
    if (howlRef.current) {
      howlRef.current.stop();
      howlRef.current.unload();
    }

    const sound = new Howl({
      src: [src],
      volume: 1.0,
    });

    howlRef.current = sound;
    if (play) sound.play();

    return () => {
      sound.stop();
      sound.unload();
      howlRef.current = null;
    };
  }, [src]);

  // toggle play/pause
  useEffect(() => {
    const sound = howlRef.current;
    if (!sound) return;
    play ? sound.play() : sound.stop();
  }, [play]);

  return null;
}
