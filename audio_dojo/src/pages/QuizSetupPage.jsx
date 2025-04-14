import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/QuizSetupPageStyle.css";

export default function QuizSetupPage() {
  const navigate = useNavigate();

  const instrumentList = [
    "Piano",
    "Drums",
    "Vocals",
    "Brass",
    "Strings",
    "Woodwinds",
    "Guitars",
    "Bass",
  ];

  const [selectedInstruments, setSelectedInstruments] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState(40);
  const [customQuestions, setCustomQuestions] = useState(35);

  const toggleInstrument = (instrument) => {
    setSelectedInstruments((prev) =>
      prev.includes(instrument)
        ? prev.filter((i) => i !== instrument)
        : [...prev, instrument]
    );
  };

  const startQuiz = () => {
    const numQuestions = selectedQuestions === "custom" ? customQuestions : selectedQuestions;
    navigate("/quiz", {
      state: {
        numQuestions,
        selectedInstruments,
      },
    });
  };

  return (
    <div className="quiz-setup-container">
      <h1 className="quiz-setup-header">QUIZ SETUP</h1>

    <div className="audio-processing-grid">
        <div className="audio-processing-option eq-option">
            <div className="option-title">EQ</div>
            <div className="option-description">Spectral listening</div>
        </div>
        <div className="audio-processing-option processing-option">
            <div className="option-title">COMPRESSION</div>
            <div className="option-description">Dynamic Listening</div>
            <div className="coming-soon-badge">COMING SOON</div>
        </div>
        <div className="audio-processing-option processing-option">
            <div className="option-title">REVERB</div>
            <div className="option-description">Spatial Listening</div>
            <div className="coming-soon-badge">COMING SOON</div>
        </div>
        <div className="audio-processing-option processing-option">
            <div className="option-title">Saturation</div>
            <div className="option-description">Harmonic Listening</div>
            <div className="coming-soon-badge">COMING SOON</div>
        </div>
    </div>
    {/* Sample Banks */}
      <div className="sample-banks">
        <h2 className="section-title">Sample Banks</h2>
        <div className="sample-banks-column">
          {instrumentList.map((instrument) => (
            <label
              key={instrument}
              className="sample-bank-option"
            >
              <input
                type="checkbox"
                checked={selectedInstruments.includes(instrument)}
                onChange={() => toggleInstrument(instrument)}
                className="sample-bank-checkbox"
              />
              {instrument}
            </label>
          ))}
        </div>
      </div>

      {/* Number of Questions */}
      <div className="number-of-questions">
        <h2 className="section-title">No. of Questions</h2>
        <div className="questions-options">
          {[20, 40, 60, 120].map((num) => (
            <button
              key={num}
              onClick={() => setSelectedQuestions(num)}
              className={`question-option ${
                selectedQuestions === num ? "selected" : ""
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setSelectedQuestions("custom")}
            className={`question-option ${
              selectedQuestions === "custom" ? "selected" : ""
            }`}
          >
            CUSTOM: {customQuestions}
          </button>
        </div>
        {selectedQuestions === "custom" && (
          <input
            type="number"
            min={1}
            max={200}
            value={customQuestions}
            onChange={(e) => setCustomQuestions(Number(e.target.value))}
            className="custom-questions-input"
          />
        )}
      </div>

      {/* Start Quiz Button */}
      <button
        onClick={startQuiz}
        className="start-quiz-button"
      >
        START
      </button>
    </div>
  );
}