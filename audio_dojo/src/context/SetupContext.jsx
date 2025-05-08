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

  // Sync quizSetup to localStorage
  useEffect(() => {
    localStorage.setItem("quizSetup", JSON.stringify(quizSetup));
  }, [quizSetup]);

  // Sync processSetup to localStorage
  useEffect(() => {
    localStorage.setItem("processSetup", JSON.stringify(processSetup));
  }, [processSetup]);

  // Debugging: log current state
  console.log("Quiz Setup:", quizSetup);
  console.log("Process Setup:", processSetup);

  return (
    <SetupContext.Provider value={{ quizSetup, setQuizSetup, processSetup, setProcessSetup }}>
      {children}
    </SetupContext.Provider>
  );
}

export function useSetup() {
  return useContext(SetupContext);
}
