import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { useSetup } from "../context/setupContext";
import AudioPlayer from "../components/AudioPlayer";
import "../styles/AudioStyle.css";
import { generateQuestionsFromTemplates } from "../utils/questionGenerator";
import { IoMdPlay , IoMdPause  } from "react-icons/io";


export default function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);

  const { quizSetup, processSetup, audioBanks } = useSetup();

  useEffect(() => {
    fetch("/data/questions/eq_questions.json")
      .then((res) => res.json())
      .then((data) => {
        const expandedQuestions = generateQuestionsFromTemplates(data.questions);
        const limitedQuestions = expandedQuestions.slice(0, quizSetup.numOfQuestions);
        setQuestions(limitedQuestions);
      });
  }, [quizSetup, processSetup]);

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

  // מציאת הקובץ המקורי
  const drumsetFiles = audioBanks.drumset || [];
  const originalFile = drumsetFiles.find((f) => f.part === parts[0]);

  console.log("Looking for part:", parts[0]);
  console.log("Drumset Files:", drumsetFiles);

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
              <div className="audio-player">
                {originalFile ? (
                  <div>
                    Pre
                    <button className="audio-button" onClick={() => setIsPlayingOriginal(!isPlayingOriginal)}>
                      {isPlayingOriginal ?<IoMdPause />  : <IoMdPlay />}
                    </button>
                    
                    <AudioPlayer
                      audioFiles={[{ file: originalFile.file }]} 
                      isPlaying={isPlayingOriginal}
                      selectedIndex={0}
                    />
                  </div>
                ) : (
                  <p>Original file not found for {parts[0]}</p>
                )}
              </div>
              <div className="audio-player">
                {originalFile ? (
                  <div>

                    Post
                    <button className="audio-button" onClick={() => setIsPlayingOriginal(!isPlayingOriginal)}>
                      {isPlayingOriginal ?<IoMdPause />  : <IoMdPlay />}
                    </button>
                    
                    <AudioPlayer
                      audioFiles={[{ file: originalFile.file }]} 
                      isPlaying={isPlayingOriginal}
                      selectedIndex={0}
                    />
                  </div>
                ) : (
                  <p>Original file not found for {parts[0]}</p>
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
