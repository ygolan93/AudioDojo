import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link, useLocation } from 'react-router-dom';
import PageWrapper from "../components/PageWrapper";
import "../styles/AudioStyle.css";
import { useSetup } from "../context/setupContext";


export default function QuizSetupPage() {
  const navigate = useNavigate();

  const SampleBanks = [
    "Male Vocal",
    "Female Vocal",
    "Piano",
    "Drumset",
    "Kick",
    "Snare",
    "Acousitc Guitar",
    "Electric Guitar",
    "Bass Guitar",
    "Synth",
    "Woodwinds",
    "Strings",
    "Brass",
  ];
  const { quizSetup, setQuizSetup } = useSetup();
  const [selectedOptions, setSelectedOptions] = useState(() => {
    return { "Sample Banks": quizSetup.sampleBanks || [] };

  });
  const [selectedQuestions, setSelectedQuestions] = useState(() => quizSetup.numOfQuestions || null);
  const [customValue, setCustomValue] = useState(() => 
    quizSetup.numOfQuestions !== null && ![20, 40, 60, 120].includes(quizSetup.numOfQuestions)
      ? quizSetup.numOfQuestions.toString()
      : ""
  );  
  const [selectedProcesses, setSelectedProcesses] = useState(() => quizSetup.processes || []);
  const [customSaved, setCustomSaved] = useState(false);
  const customInputRef = useRef(null);



  useEffect(() => {
    setQuizSetup({
      processes: selectedProcesses,
      sampleBanks: selectedOptions["Sample Banks"] || [],
      numOfQuestions: selectedQuestions === "Custom" ? parseInt(customValue, 10) : selectedQuestions
    });    
  }, [selectedProcesses, selectedOptions, selectedQuestions, customValue],  
  console.log("Updating quizSetup context", {
    processes: selectedProcesses,
    sampleBanks: Object.keys(selectedOptions).filter((key) => selectedOptions[key]),
    numOfQuestions: selectedQuestions === "Custom" ? parseInt(customValue, 10) : selectedQuestions
  }));

  useEffect(() => {
    
    if (selectedQuestions === "Custom" && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [selectedQuestions]);

  const toggleOption = (category, option) => {
    setSelectedOptions((prev) => {
      const categoryOptions = prev[category] || [];
      const updatedOptions = categoryOptions.includes(option)
        ? categoryOptions.filter((i) => i !== option)
        : [...categoryOptions, option];
      return { ...prev, [category]: updatedOptions };
    });
  };

  const handleCheckboxClick = (id) => {
    const checkbox = document.querySelector(`#${id} .checkbox`);
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
    }

    setSelectedProcesses((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const renderOptions = (category, options) => {
    return options
      .reduce((acc, option, index) => {
        const columnIndex = Math.floor(index / Math.ceil(options.length / 2));
        acc[columnIndex] = acc[columnIndex] || [];
        acc[columnIndex].push(option);
        return acc;
      }, [])
      .map((column, colIndex) => (
        <div key={colIndex} className="effect-list">
          {column.map((option) => (
            <label key={option} className="effect-item">
              <input
                type="checkbox"
                checked={(selectedOptions[category] || []).includes(option)}
                onChange={() => toggleOption(category, option)}
                className="checkbox"
              />
              {option}
            </label>
          ))}
        </div>
      ));
  };
  return (
    <PageWrapper>
      <div className="quiz-setup-container">
          <div className="quiz-setup-header">
            <h1>QUIZ SETUP</h1>
          </div>

          <div className="quiz-setup-grid">
            {/* Processing Grid */}
            <div className="quiz-grid-item">
              <div className="processing-grid">
                {["EQ", "Compression", "Reverb", "Saturation"].map((process) => (
                  <div
                    key={process}
                    className={`quiz-setup-option ${
                      selectedProcesses.includes(process) ? "selected" : ""
                    }`}
                    id={process}
                    onClick={() => handleCheckboxClick(process)}
                  >
                    <div className="quiz-setup-wrapper">
                      <div>
                        <div className="processing-header">
                          <input 
                          type="checkbox" 
                          className="checkbox" 
                          checked={selectedProcesses.includes(process)}
                          readOnly/>
                          {process}
                        </div>
                        {process === "EQ" && "Spectral listening"}
                        {process === "Compression" && "Dynamic Listening"}
                        {process === "Reverb" && "Spatial Listening"}
                        {process === "Saturation" && "Harmonic Listening"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Banks */}
            <div className="quiz-grid-item">
              <h2>Sample Banks</h2>
              <div className="sample-banks">
                {renderOptions("Sample Banks", SampleBanks)}
              </div>
            </div>

            {/* Number of Questions */}
            <div className="quiz-grid-item">
              <h2>No. of Questions</h2>
              <div className="question-options-horizontal">
                {[20, 40, 60, 120].map((q) => (
                  <div
                    key={q}
                    className={`question-button ${
                      selectedQuestions === q ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedQuestions(q);
                      setCustomValue("");
                    }}
                  >
                    {q}
                  </div>
                ))}

                <div
                  className={`question-button ${selectedQuestions === "Custom" ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedQuestions("Custom");
                    setCustomSaved(false); // Reset save state
                  }}
                >
                  {selectedQuestions === "Custom" ? (
                    <>
                      <span className="custom-label">CUSTOM:</span>
                      <input
                        type="number"
                        ref={customInputRef}
                        value={customValue}
                        placeholder="0"
                        className="custom-inline-input"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setCustomValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const parsed = parseInt(customValue, 10);
                            if (!isNaN(parsed)) {
                              setSelectedQuestions("Custom");
                              setCustomSaved(true); 
                            }
                          }
                        }}
                        
                      />
                      {!customSaved &&(
                        <button
                          className="custom-save-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const parsed = parseInt(customValue, 10);
                            if (!isNaN(parsed)) {
                              setSelectedQuestions("Custom");
                              setCustomSaved(true); 
                            }
                          }}
                        >
                          Save
                        </button>
                      )}
                      </>
                    ) : (
                      customValue ? `CUSTOM: ${customValue}` : "CUSTOM"
                    )}
                  </div>
              </div>
            </div>
          </div>
          <div>
            <Link to="/quiz">
              <button
                className="page-button"
                style={{ marginTop: "2em", marginLeft: "18em" }}
                onClick={() => {
                  if (selectedQuestions) {
                    navigate("/quiz", {
                      state: { selectedQuestions, selectedProcesses },
                    });
                  }
                }}
              >
                START QUIZ
              </button>
            </Link>
          </div>
      </div>
    </PageWrapper>
  );
}
