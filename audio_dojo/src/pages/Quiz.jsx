import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { useSetup } from "../context/setupContext";
import "../styles/AudioStyle.css";
import { generateQuestionsFromTemplates } from "../utils/questionGenerator";

export default function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [questions, setQuestions] = useState([]);

  const { quizSetup, processSetup } = useSetup();

  useEffect(() => {
    fetch("/data/questions/eq_questions.json")
      .then((res) => res.json())
      .then((data) => {
        const expandedQuestions = generateQuestionsFromTemplates(data.questions);

        const filtered = expandedQuestions.filter((q) => {
          const instruments = q.instruments || [];
          const selectedInstruments = quizSetup.sampleBanks;

          const hasInstrumentMatch =
            instruments.includes("all") ||
            instruments.some((inst) => selectedInstruments.includes(inst));

          const selectedEQ = processSetup.EQ;
          const normalize = (val) => (val ? val.toLowerCase() : "");
          const selectedFreqs = selectedEQ.frequency || [];
          const freqMatch =
            (q.frequency && (q.frequency.includes("all") || q.frequency.some((f) => selectedFreqs.includes(f)))) ||
            !q.frequency;

          const selectedShapes = selectedEQ.shape || [];
          const shapeMatch =
            (q.shape && (q.shape.includes("all") || q.shape.some((s) => selectedShapes.includes(s)))) ||
            !q.shape;

          const selectedGains = selectedEQ.gain || [];
          const gainMatch =
            (q.gain && (q.gain.includes("all") || q.gain.some((g) => selectedGains.map(normalize).includes(normalize(g))))) ||
            !q.gain;

          return hasInstrumentMatch && freqMatch && shapeMatch && gainMatch;
        });
        const limitedQuestions = filtered.slice(0, quizSetup.numOfQuestions);
        console.log("Filtered questions:", limitedQuestions);
        setQuestions(limitedQuestions);
      });
  }, [quizSetup, processSetup]);

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

  const correct = questions[currentQuestionIndex].correctAnswer;
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
              {questions[currentQuestionIndex].question}
            </div>
            <audio controls className="quiz-audio-player">
              <source src={questions[currentQuestionIndex].audio} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
            <div className="quiz-options">
              {options.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerOptionClick(answer === correct)}
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
 