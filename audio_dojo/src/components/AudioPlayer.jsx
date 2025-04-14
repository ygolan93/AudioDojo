import { useEffect, useRef } from "react";
import { Howl } from "howler";

export default function AudioPlayer({ audioUrl, isPlaying }) {
  const soundRef = useRef(null);
  const soundIdRef = useRef(null);

  // Initialize the Howl instance when the component mounts and when the audioUrl changes
  useEffect(() => {
    soundRef.current = new Howl({
      src: [audioUrl],
      html5: true,
    });

    return () => {
      soundRef.current.stop(); // Stop the sound when the component unmounts
    };
  }, [audioUrl]);

  // Play or pause the sound when isPlaying changes
  // This effect runs whenever the isPlaying prop changes
  useEffect(() => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundIdRef.current = soundRef.current.play();
    } else {
      if (soundIdRef.current !== null) {
        soundRef.current.pause(soundIdRef.current);
      }
    }
  }, [isPlaying]);

  return null;
}
