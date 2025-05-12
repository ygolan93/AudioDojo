import { createContext, useContext, useState, useEffect } from "react";

const SetupContext = createContext();

export function SetupProvider({ children }) {
  const [quizSetup, setQuizSetup] = useState(() => {
    const stored = localStorage.getItem("quizSetup");
    return stored ? JSON.parse(stored) : { processes: [], sampleBanks: [], numOfQuestions: 0 };
  });

  const [processSetup, setProcessSetup] = useState(() => {
    const stored = localStorage.getItem("processSetup");
    return stored
      ? JSON.parse(stored)
      : {
          EQ: { frequency: [], shape: [], gain: [] },
          Compression: {},
          Reverb: {},
          Saturation: {}
        };
  });

  const [audioBanks, setAudioBanks] = useState({
    drumset: [],
    piano: [],
    guitar: []
  });

  useEffect(() => {
    localStorage.setItem("quizSetup", JSON.stringify(quizSetup));
  }, [quizSetup]);

  useEffect(() => {
    localStorage.setItem("processSetup", JSON.stringify(processSetup));
  }, [processSetup]);

  const loadAudioBank = async (bankName, filePath) => {
    try {
      const res = await fetch(filePath);
      const data = await res.json();
      setAudioBanks((prev) => ({ ...prev, [bankName]: data[bankName] || [] }));
    } catch (err) {
      console.error(`Failed to load ${bankName} files:`, err);
    }
  };

  useEffect(() => {
    loadAudioBank("drumset", "/data/banks/drumset_files.json");
    // ניתן להוסיף כאן קריאות נוספות לכלים אחרים בהמשך
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
