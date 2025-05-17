import { createContext, useContext, useState, useEffect } from "react";

const SetupContext = createContext();
export function useSetup() {
  return useContext(SetupContext);
}

export function SetupProvider({ children }) {
  // 1️⃣ initialize from localStorage if present
  const [processSetup, setProcessSetup] = useState(() => {
    const saved = localStorage.getItem("processSetup");
    return saved
      ? JSON.parse(saved)
      : { EQ: {}, Compression: {}, Reverb: {}, Saturation: {} };
  });

  // 2️⃣ on every change, write back to localStorage
  useEffect(() => {
    localStorage.setItem("processSetup", JSON.stringify(processSetup));
  }, [processSetup]);

  const [quizSetup, setQuizSetup] = useState(() => {
    const saved = localStorage.getItem("quizSetup");
    return saved
      ? JSON.parse(saved)
      : { processes: [], sampleBanks: [], numOfQuestions: null };
  });

  useEffect(() => {
    localStorage.setItem("quizSetup", JSON.stringify(quizSetup));
  }, [quizSetup]);

  return (
    <SetupContext.Provider
      value={{ processSetup, setProcessSetup, quizSetup, setQuizSetup }}
    >
      {children}
    </SetupContext.Provider>
  );
}
