import { useEffect, useState, useRef } from "react";
import PageWrapper from "../components/PageWrapper";
import { useSetup } from "../context/setupContext.jsx";
import AudioPlayer from "../components/AudioPlayer";
import "../styles/AudioStyle.css";
import { generateQuestionsFromTemplates } from "../utils/questionGenerator";
import { IoMdPlay, IoMdPause } from "react-icons/io";
// import your processing functions
import {
  applyEQ,
  applyCompression,
  applyReverb,
  applySaturation,
  stopCurrent,
} from "../utils/audioManager.js";

export default function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // 1) new state for your sample_files.json
  const [sampleFiles, setSampleFiles] = useState([]);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingProcessed, setIsPlayingProcessed] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");
  const popupTimer = useRef(null);

  const { quizSetup, processSetup } = useSetup();

  // 2) fetch the flat list of samples on mount
  useEffect(() => {
    fetch("/data/banks/sample_files.json")
      .then((res) => res.json())
      .then((d) => setSampleFiles(d.samples))
      .catch((err) =>
        console.error("Could not load sample_files.json", err)
      );
  }, []);

  useEffect(() => {
    async function loadQuestions() {
      let allTemplates = [];

      // 1) Load & tag templates per effect
      for (let proc of quizSetup.processes) {
        try {
          console.log(`Loading templates for effect: ${proc}`);
          const res = await fetch(`/data/questions/${proc.toLowerCase()}_questions.json`);
          const { questions: tmpl } = await res.json();
          console.log(` → got ${tmpl.length} raw templates for ${proc}`);
          allTemplates.push(...tmpl.map((t) => ({ ...t, process: proc })));
        } catch (e) {
          console.error(`couldn't load ${proc} questions`, e);
        }
      }

      // 2) filter by chosen sampleBanks
      console.log(
        `Filtering ${allTemplates.length} templates down to only these instruments:`,
        quizSetup.sampleBanks
      );
      const filtered = allTemplates.filter(t =>
        quizSetup.sampleBanks.includes(t.parts[0])
      );
      console.log(` → ${filtered.length} templates after instrument-filter`);

      // 3) expand into concrete questions
      const expanded = generateQuestionsFromTemplates(filtered);
      console.log(` → expanded into ${expanded.length} total questions`);

      // 4) Interleave questions so each instrument appears before any repeats
      const banks     = quizSetup.sampleBanks;
      const numQ      = quizSetup.numOfQuestions;

      // 4a) group expanded questions by instrument
      const groups = banks.reduce((acc, inst) => {
        acc[inst] = expanded.filter((q) => q.parts[0] === inst);
        return acc;
      }, {});

      // 4b) a simple Fisher–Yates shuffle
      const shuffle = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      };

      // 4c) build a random “instrument playlist” of length numQ
      let instrumentOrder = [];
      const fullCycles = Math.floor(numQ / banks.length);
      const remainder  = numQ % banks.length;

      for (let i = 0; i < fullCycles; i++) {
        instrumentOrder.push(...shuffle([...banks]));
      }
      instrumentOrder.push(
        ...shuffle([...banks]).slice(0, remainder)
      );

      // 4d) pick one question per entry in that order, cycling within each group
      const pointers = {};
      const finalQs  = instrumentOrder.map((inst) => {
        const bucket = groups[inst] || [];
        if (!bucket.length) return null; // no question for this instrument
        pointers[inst] = (pointers[inst] || 0) + 1;
        return bucket[(pointers[inst] - 1) % bucket.length];
      }).filter(Boolean);

      setQuestions(finalQs.slice(0, quizSetup.numOfQuestions));
    }

    loadQuestions();
  }, [quizSetup]);

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

  const handleAnswerOptionClick = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  if (questions.length === 0) {
    return (
      <PageWrapper className="p-4">
        <div className="quiz-error"> Error with setting up the quiz. Check the setup menu again!</div>
      </PageWrapper>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const { parts } = currentQuestion;

  // 1) translate your QuizSetupPage labels into the exact "part" strings in sample_files.json
const partNameMap = {
  "Male Vocal":       "Male",
  "Female Vocal":     "Female",
  "Piano":            "Piano",
  "Kick":             "Kick",
  "Snare":            "Snare",
  "Acousitc Guitar":  "Acoustic Guitar",
  "Electric Guitar":  "Electric Guitar",
  "Bass Guitar":      "Bass Guitar",
  "Synth":            "Synth",
  "Woodwinds":        "Woodwind",
  "Strings":          "Strings",
  "Brass":            "Brass",
};

  const lookupPart = partNameMap[parts[0]] || parts[0];
  const originalFile = sampleFiles.find((f) => f.part === lookupPart);
  // if sampleFiles.json didn’t know about "Male Vocal" / "Female Vocal",
// fall back to the literal parts[0] .wav file in public/sounds/original:
const rawOriginalUrl = `/sounds/original/${encodeURIComponent(
  parts[0]
)}.wav`;

  console.log("Looking for part:", parts[0]);
  console.log("sampleFiles state:", sampleFiles);

  // helper to show & auto-hide
  const showProcessPopup = (text) => {
    clearTimeout(popupTimer.current);
    setPopupText(text);
    setShowPopup(true);
    popupTimer.current = setTimeout(() => {
      setShowPopup(false);
    }, 3000); // hide after 3s
  };

  // Play only the current question's process
  const handlePlayProcessed = async () => {
    stopCurrent();
    setIsPlayingProcessed(true);

    // 1) grab your question’s instrument & process type
    const instrument = questions[currentQuestionIndex].parts[0];
    const proc       = questions[currentQuestionIndex].process;

    // 2) show popup
    let details = "";
    switch (proc) {
      case "EQ":
        details = [
          `shape=${processSetup.EQ.shape[0]}`,
          `freq=${processSetup.EQ.frequency[0]}`,
          `gain=${processSetup.EQ.gain[0]}`
        ].join(", ");
        break;
      case "Compression":
        details = [
          `attack=${processSetup.Compression.attack[0]}`,
          `release=${processSetup.Compression.release[0]}`,
          `threshold=${processSetup.Compression.gr[0]}`
        ].join(", ");
        break;
      case "Reverb":
        details = [
          `type=${processSetup.Reverb.type?.[0]}`,
          `decay=${processSetup.Reverb.decayTime?.[0]}`,
          `mix=${processSetup.Reverb.mix?.[0]}`
        ].join(", ");
        break;
      case "Saturation":
        details = [
          `drive=${processSetup.Saturation.drive[0]}`,
          `curve=${processSetup.Saturation.curveType[0]}`,
          `bias=${processSetup.Saturation.bias[0]}`,
          `mix=${processSetup.Saturation.mix[0]}`
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
            shape:     processSetup.EQ.shape[0],
            frequency: parseFloat(processSetup.EQ.frequency[0]),
            gain:      parseFloat(processSetup.EQ.gain[0]),
          });
          break;

        case "Compression":
          await applyCompression({
            instrument,
            attack:    processSetup.Compression.attack[0],
            release:   processSetup.Compression.release[0],
            threshold: processSetup.Compression.gr[0],
          });
          break;

        case "Reverb":
          await applyReverb({
            instrument,
            // first try your .type array, then fall back to .impulseResponse
            type:      processSetup.Reverb.type?.[0]
                      ?? processSetup.Reverb.impulseResponse?.[0],
            decayTime: processSetup.Reverb.decayTime?.[0],
            mix:       processSetup.Reverb.mix?.[0],
          });
          break;

        case "Saturation":
          await applySaturation({
            instrument,
            drive:     parseFloat(processSetup.Saturation.drive[0]),
            curveType: processSetup.Saturation.curveType[0],
            bias:      parseFloat(processSetup.Saturation.bias[0]),
            mix:       parseFloat(processSetup.Saturation.mix[0]),
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
              {/* Pre player */}
              <div className="audio-player">
                <>
                  <div className="audio-label">Pre</div>
                  <button
                    className="audio-button"
                    onClick={() => {
                      if (isPlayingProcessed) {
                        stopCurrent();
                        setIsPlayingProcessed(false);
                      }
                      setIsPlayingOriginal(p => !p);
                    }}
                  >
                    {isPlayingOriginal ? <IoMdPause /> : <IoMdPlay />}
                  </button>
                  <AudioPlayer
                    src={rawOriginalUrl}
                    play={isPlayingOriginal}
                  />
                </>

              </div>

              {/* Post player */}
              <div className="audio-player" style={{ position: "relative" }}>
                {originalFile ? (
                  <>
                    <div className="audio-label">Post</div>
                    <button
                      className="audio-button"
                      onClick={async () => {
                        // 1) unlock Web Audio if needed
                        if (Howler.ctx && Howler.ctx.state === "suspended") {
                          await Howler.ctx.resume();
                        }

                        // 2) now do your normal play logic:
                        if (isPlayingProcessed) {
                          stopCurrent();
                          setIsPlayingProcessed(false);
                        } else {
                          handlePlayProcessed();
                        }
                      }}
                    >
                      {isPlayingProcessed ? <IoMdPause /> : <IoMdPlay />}
                    </button>

                    {/* popup balloon */}
                    {showPopup && (
                      <div className="popup-balloon">
                        {popupText}
                      </div>
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
                  onClick={() => handleAnswerOptionClick(answer === currentQuestion.correctAnswer)}
                  className="quiz-option-button"
                >
                  <span className="quiz-option-label">{String.fromCharCode(65 + index)}</span>
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
