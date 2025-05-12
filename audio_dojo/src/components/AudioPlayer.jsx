import { useEffect, useRef } from "react";
import { Howl } from "howler";

export default function AudioPlayer({ audioFiles = [], isPlaying, selectedIndex = 0 }) {
  const soundRef = useRef(null);
  const soundIdRef = useRef(null);

  useEffect(() => {
    if (!audioFiles.length) return;

    soundRef.current = new Howl({
      src: [audioFiles[selectedIndex].file],
      html5: true,
    });

    return () => {
      soundRef.current.stop();
    };
  }, [audioFiles, selectedIndex]);

  useEffect(() => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundIdRef.current = soundRef.current.play();
    } else {
      soundRef.current.pause();
    }
  }, [isPlaying]);

  return null;
}
