import { createContext, useContext, useState, useEffect } from "react";

const SetupContext = createContext();

export function SetupProvider({ children }) {
  const [quizSetup, setQuizSetup] = useState(() => {
    const stored = localStorage.getItem("quizSetup");
    return stored
      ? JSON.parse(stored)
      : { processes: [], sampleBanks: [], numOfQuestions: 0 };
  });

  const [processSetup, setProcessSetup] = useState(() => {
    const stored = localStorage.getItem("processSetup");
    return stored
      ? JSON.parse(stored)
      : {
          EQ: { frequency: [], shape: [], gain: [] },
          Compression: { attack: [], release: [], threshold: [] },
          Reverb: { type: [], decayTime: [], mix: [] },
          Saturation: { drive: [], curveType: [], bias: [], mix: [] }
        };
  });

  const [audioBanks, setAudioBanks] = useState({ samples: [] });

  useEffect(() => {
    localStorage.setItem("quizSetup", JSON.stringify(quizSetup));
  }, [quizSetup]);

  useEffect(() => {
    localStorage.setItem("processSetup", JSON.stringify(processSetup));
  }, [processSetup]);

  /**
   * Fetch and load a JSON bank file.
   * Place 'sample_files.json' in public/data so it's served at '/data/sample_files.json'
   */
  const loadAudioBank = async (bankName, filePath) => {
    try {
      const res = await fetch(filePath);
      if (!res.ok) throw new Error(`Failed to fetch ${filePath}: ${res.status}`);
      const data = await res.json();
      setAudioBanks(prev => ({ ...prev, [bankName]: data.samples || [] }));
    } catch (err) {
      console.error(`Failed to load ${bankName} files:`, err);
    }
  };

  useEffect(() => {
    // Load the entire sample collection from public/data folder
    loadAudioBank("samples", "/data/banks/sample_files.json");
  }, []);

  return (
    <SetupContext.Provider
      value={{
        quizSetup,
        setQuizSetup,
        processSetup,
        setProcessSetup,
        audioBanks
      }}
    >
      {children}
    </SetupContext.Provider>
  );
}

export function useSetup() {
  return useContext(SetupContext);
}

export function useAudioBanks() {
  const { audioBanks } = useSetup();
  return audioBanks;
}
