import { useState } from "react";
import PageWrapper from "../components/PageWrapper";

export default function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const questions = [
    {
      questionText: "What is the capital of France?",
      answerOptions: [
        { answerText: "Berlin", isCorrect: false },
        { answerText: "Madrid", isCorrect: false },
        { answerText: "Paris", isCorrect: true },
        { answerText: "Rome", isCorrect: false },
      ],
    },
    {
      questionText: "Who is the CEO of Tesla?",
      answerOptions: [
        { answerText: "Jeff Bezos", isCorrect: false },
        { answerText: "Elon Musk", isCorrect: true },
        { answerText: "Bill Gates", isCorrect: false },
        { answerText: "Tony Stark", isCorrect: false },
      ],
    },
    {
      questionText: "The iPhone was created by which company?",
      answerOptions: [
        { answerText: "Apple", isCorrect: true },
        { answerText: "Intel", isCorrect: false },
        { answerText: "Amazon", isCorrect: false },
        { answerText: "Microsoft", isCorrect: false },
      ],
    },
    {
      questionText: "How many Harry Potter books are there?",
      answerOptions: [
        { answerText: "5", isCorrect: false },
        { answerText: "6", isCorrect: false },
        { answerText: "7", isCorrect: true },
        { answerText: "8", isCorrect: false },
      ],
    },
  ];

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

  return (
    <PageWrapper className="p-4">
      <div className="quiz-container">
        {showScore ? (
          <div className="score-section">
            You scored {score} out of {questions.length}
          </div>
        ) : (
          <>
            <div className="question-section">
              <div className="question-count">
                <span>Question {currentQuestionIndex + 1}</span>/{questions.length}
              </div>
              <div className="question-text">
                {questions[currentQuestionIndex].questionText}
              </div>
            </div>
            <div className="answer-section">
              {questions[currentQuestionIndex].answerOptions.map((answerOption, index) => (
                <button key={index} onClick={() => handleAnswerOptionClick(answerOption.isCorrect)}>
                  {answerOption.answerText}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}