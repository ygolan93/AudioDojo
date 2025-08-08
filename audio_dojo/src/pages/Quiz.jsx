import { useEffect, useState, useRef } from "react";
import PageWrapper from "../components/PageWrapper";
import { useSetup } from "../context/setupContext.jsx";
import AudioPlayer from "../components/AudioPlayer";
import "../styles/AudioStyle.css";
import { generateQuestionsFromTemplates } from "../utils/questionGenerator";
import { IoMdPlay, IoMdPause } from "react-icons/io";
import {
  applyEQ,
  applyCompression,
  applyReverb,
  applySaturation,
  stopCurrent,
} from "../utils/audioManager.js";

export default function Quiz() {
  // Track current question index, loaded questions, etc.
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sampleFiles, setSampleFiles] = useState([]);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingProcessed, setIsPlayingProcessed] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");

  // NEW: Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const popupTimer = useRef(null);
  const { quizSetup, processSetup } = useSetup();

  // Track when loading started, to enforce at least 1 second delay
  const startTimeRef = useRef(Date.now());
  // We also keep a flag so that if loading finishes, we don't run finishLoading twice
  const finishedRef = useRef(false);

  // Helper to end loading (either success or error), but wait so loader shows ≥1 s
  function finishLoading(errored = false) {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, 2000 - elapsed);

    setTimeout(() => {
      setIsLoading(false);
      if (errored) setHasError(true);
    }, remaining);
  }

  // 1) Fetch sample files once, as before
  useEffect(() => {
    fetch("/data/banks/sample_files.json")
      .then((res) => res.json())
      .then((d) => setSampleFiles(d.samples))
      .catch((err) => console.error("Could not load sample_files.json", err));
  }, []);

  // 2) Main effect: load questions and set a 10 s timeout for errors
  useEffect(() => {
    let didCancel = false;

    // If questions never load within 10 s, show error
    const timeoutId = setTimeout(() => {
      if (!didCancel && !questions.length) {
        // Timeout ⇒ error
        finishLoading(true);
      }
    }, 10000);

    async function loadQuestions() {
      try {
        let allTemplates = [];

        // Load & tag templates per effect
        for (let proc of quizSetup.processes) {
          const res = await fetch(
            `/data/questions/${proc.toLowerCase()}_questions.json`
          );
          if (!res.ok) throw new Error(`Failed to fetch ${proc} questions`);
          const { questions: tmpl } = await res.json();
          allTemplates.push(...tmpl.map((t) => ({ ...t, process: proc })));
        }

        // Filter by chosen sample banks
        const filtered = allTemplates.filter((t) =>
          quizSetup.sampleBanks.includes(t.parts[0])
        );

        // Expand into concrete questions
        const expanded = generateQuestionsFromTemplates(filtered);

        // Interleave logic so each instrument appears before repeats
        const banks = quizSetup.sampleBanks;
        const numQ = quizSetup.numOfQuestions;
        const groups = banks.reduce((acc, inst) => {
          acc[inst] = expanded.filter((q) => q.parts[0] === inst);
          return acc;
        }, {});
        const shuffle = (arr) => {
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          return arr;
        };
        let instrumentOrder = [];
        const fullCycles = Math.floor(numQ / banks.length);
        const remainder = numQ % banks.length;
        for (let i = 0; i < fullCycles; i++) {
          instrumentOrder.push(...shuffle([...banks]));
        }
        instrumentOrder.push(
          ...shuffle([...banks]).slice(0, remainder)
        );
        const pointers = {};
        const finalQs = instrumentOrder
          .map((inst) => {
            const bucket = groups[inst] || [];
            if (!bucket.length) return null;
            pointers[inst] = (pointers[inst] || 0) + 1;
            return bucket[(pointers[inst] - 1) % bucket.length];
          })
          .filter(Boolean);

        if (!didCancel) {
          setQuestions(finalQs.slice(0, numQ));
          finishLoading(false);
        }
      } catch (err) {
        console.error("Error loading questions:", err);
        if (!didCancel) {
          finishLoading(true);
        }
      }
    }

    loadQuestions();
    return () => {
      didCancel = true;
      clearTimeout(timeoutId);
    };
  }, [quizSetup, questions.length]);

  // 3) Once questions exist, shuffle options for the current question
  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      const correct = currentQuestion.correctAnswer;
      const dummyAnswers = ["Dummy A", "Dummy B", "Dummy C"];
      const options = [];
      const correctIndex = Math.floor(Math.random() * 4);
      for (let i = 0; i < 4; i++) {
        if (i === correctIndex) {
          options.push(correct);
        } else {
          options.push(dummyAnswers.shift());
        }
      }
      setShuffledOptions(options);
    }
  }, [currentQuestionIndex, questions]);

  // 4) Answer click handler
  const handleAnswerOptionClick = (isCorrect) => {
    if (isCorrect) {
      setScore((s) => s + 1);
    }
    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  // 5) Show loading spinner/animation if still loading
  if (isLoading) {
    return (
      <PageWrapper className="p-4">
        <div
          className="loading"
          style={{ animation: "fadeInOut 2s ease-in-out infinite" }}
        >
          LOADING...
        </div>
      </PageWrapper>
    );
  }

  // 6) If loading done but errored, show error message
  if (hasError) {
    return (
      <PageWrapper className="p-4">
        <div className="quiz-error">
          Error with setting up the quiz. Check the setup menu again!
        </div>
      </PageWrapper>
    );
  }

  // 7) At this point loading succeeded—render the actual quiz
  const currentQuestion = questions[currentQuestionIndex];
  const { parts = [], ...rest } = currentQuestion || {};
  if (!currentQuestion || !Array.isArray(currentQuestion.parts)) {
    return (
      <PageWrapper className="p-4">
        <div className="quiz-error">
          Error: No valid question loaded. Check setup or question templates.
        </div>
      </PageWrapper>
    );
  }
  
  // Map “parts[0]” (instrument) to what sampleFiles expects
  const partNameMap = {
    "Male Vocal": "Male",
    "Female Vocal": "Female",
    Piano: "Piano",
    Kick: "Kick",
    Snare: "Snare",
    "Acoustic Guitar": "Acoustic Guitar",
    "Electric Guitar": "Electric Guitar",
    "Bass Guitar": "Bass Guitar",
    Synth: "Synth",
    Woodwinds: "Woodwind",
    Strings: "Strings",
    Brass: "Brass",
  };
  const lookupPart = partNameMap[parts[0]] || parts[0];
  const originalFile = sampleFiles.find((f) => f.part === lookupPart);

  const rawOriginalUrl = `/sounds/original/${encodeURIComponent(
    parts[0]
  )}.wav`;

  // Popup helper for showing process details
  const showProcessPopup = (text) => {
    clearTimeout(popupTimer.current);
    setPopupText(text);
    setShowPopup(true);
    popupTimer.current = setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  // Play “post-processed” audio based on current question’s process
  const handlePlayProcessed = async () => {
    stopCurrent();
    setIsPlayingProcessed(true);

    const instrument = Array.isArray(parts) ? parts[0] : "Unknown";
    const proc = currentQuestion.process;

    let details = "";
    switch (proc) {
      case "EQ":
        details = [
          `shape=${processSetup.EQ.shape[0]}`,
          `freq=${processSetup.EQ.frequency[0]}`,
          `gain=${processSetup.EQ.gain[0]}`,
        ].join(", ");
        break;
      case "Compression":
        details = [
          `attack=${processSetup.Compression.attack[0]}`,
          `release=${processSetup.Compression.release[0]}`,
          `threshold=${processSetup.Compression.gr[0]}`,
        ].join(", ");
        break;
      case "Reverb":
        details = [
          `type=${processSetup.Reverb.type?.[0]}`,
          `decay=${processSetup.Reverb.decayTime?.[0]}`,
          `mix=${processSetup.Reverb.mix?.[0]}`,
        ].join(", ");
        break;
      case "Saturation":
        details = [
          `drive=${processSetup.Saturation.drive[0]}`,
          `curve=${processSetup.Saturation.curveType[0]}`,
          `bias=${processSetup.Saturation.bias[0]}`,
          `mix=${processSetup.Saturation.mix[0]}`,
        ].join(", ");
        break;
      default:
        details = "no parameters";
    }
    showProcessPopup(`${proc}: ${details}`);

    try {
      switch (proc) {
        case "EQ":
          await applyEQ({
            instrument,
            shape: processSetup.EQ.shape[0],
            frequency: parseFloat(processSetup.EQ.frequency[0]),
            gain: parseFloat(processSetup.EQ.gain[0]),
          });
          break;
        case "Compression":
          await applyCompression({
            instrument,
            attack: processSetup.Compression.attack[0],
            release: processSetup.Compression.release[0],
            threshold: processSetup.Compression.gr[0],
          });
          break;
        case "Reverb":
          await applyReverb({
            instrument,
            type:
              processSetup.Reverb.type?.[0] ??
              processSetup.Reverb.impulseResponse?.[0],
            decayTime: processSetup.Reverb.decayTime?.[0],
            mix: processSetup.Reverb.mix?.[0],
          });
          break;
        case "Saturation":
          await applySaturation({
            instrument,
            drive: parseFloat(processSetup.Saturation.drive[0]),
            curveType: processSetup.Saturation.curveType[0],
            bias: parseFloat(processSetup.Saturation.bias[0]),
            mix: parseFloat(processSetup.Saturation.mix[0]),
          });
          break;
        default:
          console.warn("Unknown process type:", proc);
      }
    } catch (err) {
      console.error("Error during processed playback:", proc, err);
    }
  };

  return (
    <PageWrapper className="p-4">
      <div className="quiz-setup-container">
        {showScore ? (
          <div className="score-section">
            You scored {score} out of {questions.length} points correctly
          </div>
        ) : (
          <div className="quiz-question-container">
            <div className="quiz-question-count">
              Question {currentQuestionIndex + 1}/{questions.length}
            </div>
            <div className="quiz-question-text">
              {currentQuestion.question}
            </div>
            <div className="audio-container">
              {/* Pre (original) player */}
              <div className="audio-player">
                <div className="audio-label">Pre</div>
                <button
                  className="audio-button"
                  onClick={() => {
                    if (isPlayingProcessed) {
                      stopCurrent();
                      setIsPlayingProcessed(false);
                    }
                    setIsPlayingOriginal((p) => !p);
                  }}
                >
                  {isPlayingOriginal ? <IoMdPause /> : <IoMdPlay />}
                </button>
                <AudioPlayer src={rawOriginalUrl} play={isPlayingOriginal} />
              </div>

              {/* Post (processed) player */}
              <div className="audio-player" style={{ position: "relative" }}>
                {originalFile ? (
                  <>
                    <div className="audio-label">Post</div>
                    <button
                      className="audio-button"
                      onClick={async () => {
                        if (isPlayingProcessed) {
                          stopCurrent();
                          setIsPlayingProcessed(false);
                        } else {
                          await handlePlayProcessed();
                        }
                      }}
                    >
                      {isPlayingProcessed ? <IoMdPause /> : <IoMdPlay />}
                    </button>
                    {showPopup && (
                      <div className="popup-balloon">{popupText}</div>
                    )}
                  </>
                ) : (
                  <p>Processed file not available for {parts[0]}</p>
                )}
              </div>
            </div>
            <div className="quiz-options">
              {shuffledOptions.map((answer, index) => (
                <button
                  key={index}
                  onClick={() =>
                    handleAnswerOptionClick(
                      answer === currentQuestion.correctAnswer
                    )
                  }
                  className="quiz-option-button"
                >
                  <span className="quiz-option-label">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {answer}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

