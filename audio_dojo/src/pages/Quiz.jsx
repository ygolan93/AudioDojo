import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

import PageWrapper from "../components/PageWrapper";
import { useSetup } from "../context/setupContext.jsx";
import { generateQuestionsFromTemplates } from "../utils/questionGenerator";

import EQCurveCanvas from "../components/EQCurveCanvas";
import { IoMdPlay, IoMdPause } from "react-icons/io";
import {
  applyEQ,
  applyCompression,
  applyReverb,
  applySaturation,
  playOriginal,
  stopCurrent,
  playSfx,
} from "../utils/audioManager.js";

// --- helpers ---
function toNum(x) {
  if (x == null) return NaN;
  const s = String(x).toLowerCase().replace(/[^0-9.+\-:]/g, "");
  if (s.includes(":")) return parseFloat(s.split(":")[0]);
  return parseFloat(s);
}
function normStr(x) {
  return String(x).trim().toLowerCase();
}
function filterByProcessSetup(questions, setup) {
  return questions.filter((q) => {
    const proc = q.process;
    const cfg = setup?.[proc] || {};

    if (proc === "EQ") {
      if (q.shape !== undefined) {
        const sel = (cfg.shape || []).map(normStr);
        if (sel.length === 0 || !sel.includes(normStr(q.shape))) return false;
      }
      if (q.frequency !== undefined) {
        const sel = (cfg.frequency || []).map(toNum);
        if (sel.length === 0 || !sel.includes(toNum(q.frequency))) return false;
      }
      if (q.gain !== undefined && q.gain !== null && !Number.isNaN(q.gain)) {
        const sel = (cfg.gain || []).map(toNum);
        if (sel.length === 0 || !sel.includes(toNum(q.gain))) return false;
      }
      return true;
    }

    const key = q.paramKey;
    const val = q.paramValue;
    if (!key) return false;
    const selected = cfg?.[key] || [];
    if (selected.length === 0) return false;

    const qNum = toNum(val);
    if (!Number.isNaN(qNum)) {
      const selNums = selected.map(toNum).filter((n) => !Number.isNaN(n));
      return selNums.includes(qNum);
    } else {
      const selStrs = selected.map(normStr);
      return selStrs.includes(normStr(val));
    }
  });
}

export default function Quiz() {
  const navigate = useNavigate();
  const { quizSetup, processSetup } = useSetup();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingProcessed, setIsPlayingProcessed] = useState(false);
  const [showPostLabel, setShowPostLabel] = useState(false); // ← NEW

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // load templates → expand → filter
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { processes = [], sampleBanks = [], numOfQuestions = 0 } = quizSetup;

        let allTemplates = [];
        for (const proc of processes) {
          const ref = doc(db, "questionBanks", proc);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const { questions = [] } = snap.data();
            allTemplates.push(...questions.map((q) => ({ ...q, process: proc })));
          }
        }

        const filteredByBank = allTemplates.filter((t) =>
          sampleBanks.includes(t.parts?.[0])
        );
        const expanded = generateQuestionsFromTemplates(filteredByBank);
        const expandedFiltered = filterByProcessSetup(expanded, processSetup);

        // balance between banks
        const banks = sampleBanks;
        const groups = banks.reduce((acc, inst) => {
          acc[inst] = expandedFiltered.filter((q) => q.parts[0] === inst);
          return acc;
        }, {});
        const shuffle = (arr) => {
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          return arr;
        };
        let order = [];
        const full = Math.floor(numOfQuestions / banks.length);
        const rem = numOfQuestions % banks.length;
        for (let i = 0; i < full; i++) order.push(...shuffle([...banks]));
        order.push(...shuffle([...banks]).slice(0, rem));

        const ptr = {};
        const totalAvail = Object.values(groups).reduce((s, a) => s + a.length, 0);
        const finalQs = [];
        for (const inst of order) {
          if (finalQs.length >= totalAvail) break;
          const bucket = groups[inst] || [];
          const i = ptr[inst] || 0;
          if (i < bucket.length) {
            finalQs.push(bucket[i]);
            ptr[inst] = i + 1;
          } else {
            const fb = banks.find((b) => (ptr[b] || 0) < (groups[b]?.length || 0));
            if (fb) {
              const j = ptr[fb] || 0;
              finalQs.push(groups[fb][j]);
              ptr[fb] = j + 1;
            }
          }
          if (finalQs.length >= numOfQuestions) break;
        }

        if (!cancelled) {
          setQuestions(finalQs);
          setIsLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      stopCurrent();
    };
  }, [quizSetup, processSetup]);

  // בחירת תשובה + SFX + מעבר שאלה
  const handleAnswer = (option) => {
    const q = questions[currentQuestionIndex];
    if (!q) return;

    setSelectedAnswer(option.text);
    setAnswerRevealed(true);

    // SFX (תמיד יש fallback ביפ)
    playSfx(option.isCorrect ? "correct" : "wrong");

    const updated = [
      ...userAnswers,
      {
        question: q.question,
        correctAnswer: q.correctAnswer,
        userAnswer: option.text,
        isCorrect: !!option.isCorrect,
      },
    ];

    setTimeout(() => {
      const next = currentQuestionIndex + 1;

      stopCurrent();
      setIsPlayingOriginal(false);
      setIsPlayingProcessed(false);
      setShowPostLabel(false); // ← reset label every question

      if (next >= questions.length) {
        const score = updated.filter((x) => x.isCorrect).length;
        localStorage.setItem("quizResults", JSON.stringify(updated));
        localStorage.setItem("quizScore", JSON.stringify({ score, total: questions.length }));
        navigate("/results");
      } else {
        setUserAnswers(updated);
        setCurrentQuestionIndex(next);
        setSelectedAnswer(null);
        setAnswerRevealed(false);
      }
    }, 1200);
  };

  if (isLoading) {
    return (
      <PageWrapper className="p-4">
        <div className="loading">LOADING...</div>
      </PageWrapper>
    );
  }
  if (hasError) {
    return (
      <PageWrapper className="p-4">
        <div className="error">Failed to load quiz. Please try again.</div>
      </PageWrapper>
    );
  }

  const q = questions[currentQuestionIndex];
  if (!q) {
    return (
      <PageWrapper className="p-4">
        <div>No questions available.</div>
      </PageWrapper>
    );
  }

  const instrument = q.parts?.[0];

  return (
    <PageWrapper className="p-4">
      <div className="quiz-question-container">
        <div className="quiz-question-count">
          Question {currentQuestionIndex + 1}/{questions.length}
        </div>

        <div className="quiz-question-text">{q.question}</div>

        <div className="audio-container">
          {/* PRE */}
          <div className="audio-player">
            <div className="audio-label">PRE</div>
            <button
              className="audio-button"
              onClick={async () => {
                try {
                  if (isPlayingOriginal) {
                    stopCurrent();
                    setIsPlayingOriginal(false);
                  } else {
                    if (isPlayingProcessed) setIsPlayingProcessed(false);
                    setShowPostLabel(false); // ← hide label when switching to PRE
                    await playOriginal({
                      instrument,
                      onEnd: () => setIsPlayingOriginal(false),
                    });
                    setIsPlayingOriginal(true);
                  }
                } catch (e) {
                  console.error(e);
                  setIsPlayingOriginal(false);
                }
              }}
              disabled={!instrument}
              title={!instrument ? "Missing instrument key" : ""}
            >
              {isPlayingOriginal ? <IoMdPause /> : <IoMdPlay />}
            </button>
          </div>

          {/* POST */}
          <div className="audio-player" style={{ position: "relative" }}>
            <div className="audio-label">POST</div>

            {/* תגית נכונה: מופיעה כאשר נלחץ POST */}
            {showPostLabel && (
              <div className="popup-balloon">{q.correctAnswer}</div>
            )}

            <button
              className="audio-button"
              onClick={async () => {
                try {
                  if (isPlayingProcessed) {
                    stopCurrent();
                    setIsPlayingProcessed(false);
                    setShowPostLabel(false); // ← hide when stopping
                    return;
                  }
                  if (isPlayingOriginal) setIsPlayingOriginal(false);

                  // הצג תגית מיד עם תחילת ניגון POST
                  setShowPostLabel(true);

                  if (q.process === "EQ") {
                    await applyEQ({
                      instrument,
                      shape: q.shape,
                      frequency: toNum(q.frequency),
                      gain: toNum(q.gain),
                      onEnd: () => {
                        setIsPlayingProcessed(false);
                        setShowPostLabel(false); // ← גם בסיום אוטומטי
                      },
                    });
                  } else if (q.process === "Compression") {
                    await applyCompression({
                      instrument,
                      attack: toNum(q.attack),
                      release: toNum(q.release),
                      threshold: toNum(q.threshold),
                      onEnd: () => {
                        setIsPlayingProcessed(false);
                        setShowPostLabel(false);
                      },
                    });
                  } else if (q.process === "Reverb") {
                    await applyReverb({
                      instrument,
                      type: q.type,
                      decayTime: toNum(q.decayTime),
                      mix: toNum(q.mix),
                      onEnd: () => {
                        setIsPlayingProcessed(false);
                        setShowPostLabel(false);
                      },
                    });
                  } else if (q.process === "Saturation") {
                    await applySaturation({
                      instrument,
                      drive: toNum(q.drive),
                      curveType: q.curveType,
                      bias: toNum(q.bias),
                      mix: toNum(q.mix),
                      onEnd: () => {
                        setIsPlayingProcessed(false);
                        setShowPostLabel(false);
                      },
                    });
                  }
                  setIsPlayingProcessed(true);
                } catch (e) {
                  console.error(e);
                  setIsPlayingProcessed(false);
                  setShowPostLabel(false);
                }
              }}
              disabled={!instrument}
              title={!instrument ? "Missing instrument key" : ""}
            >
              {isPlayingProcessed ? <IoMdPause /> : <IoMdPlay />}
            </button>
          </div>
        </div>

        {/* גרף EQ רק אחרי בחירת תשובה */}
        {q.process === "EQ" && answerRevealed && (
          <div className="eq-curve-wrapper">
            <EQCurveCanvas
              shape={q.shape}
              frequency={q.frequency}
              gain={q.gain}
              q={1}
            />
          </div>
        )}

        <div className="quiz-options">
          {q.answers.map((option, i) => (
            <button
              key={i}
              onClick={() => !answerRevealed && handleAnswer(option)}
              disabled={answerRevealed}
              className={`quiz-option-button
                ${selectedAnswer === option.text ? "selected" : ""}
                ${answerRevealed && option.isCorrect ? "correct" : ""}
                ${answerRevealed && selectedAnswer === option.text && !option.isCorrect ? "wrong" : ""}
              `}
            >
              <span className="quiz-option-label">{String.fromCharCode(65 + i)}</span>
              {option.text}
            </button>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
