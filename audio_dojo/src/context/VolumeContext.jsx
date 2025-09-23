import React, { createContext, useState, useContext, useEffect } from "react";
import { Howler } from "howler";
import { setGlobalVolume } from "../utils/audioManager";

const VolumeContext = createContext();

export function VolumeProvider({ children }) {
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("globalVolume");
    return saved !== null ? parseFloat(saved) : 1;
  });

  useEffect(() => {
    // שליטה על Howler (Correct/Wrong)
    Howler.volume(volume);
    // שליטה על Web Audio (EQ/Compression/Reverb/Saturation/Original)
    setGlobalVolume(volume);
    // שמירה
    localStorage.setItem("globalVolume", String(volume));
  }, [volume]);

  return (
    <VolumeContext.Provider value={{ volume, setVolume }}>
      {children}
    </VolumeContext.Provider>
  );
}

export function useVolume() {
  return useContext(VolumeContext);
}
