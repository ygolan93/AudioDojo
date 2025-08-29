import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import "../styles/AudioStyle.css";

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedResults = localStorage.getItem("quizResults");
    const storedScore = localStorage.getItem("quizScore");

    if (storedResults) setResults(JSON.parse(storedResults));
    if (storedScore) setScore(JSON.parse(storedScore));
  }, []);

  if (!results.length || score === null) {
    return (
      <PageWrapper className="p-4">
        <div className="quiz-error">
          No quiz results found. Please complete a quiz first.
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="p-4">
      <div className="results-container">
        <h1 className="results-title"> RESULTS </h1>

        <div className="score-box">
          {/* FINAL GRADE: 
          <br /> */}
          {score.score} / {score.total} Answered Correctly
          <br/>
          ({Math.round((score.score / score.total) * 100)}%)
        </div>

        <table className="results-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Correct Answer</th>
              <th>Picked Answer</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{r.question}</td>
                <td>{r.correctAnswer}</td>
                <td>{r.userAnswer || "—"}</td>
                <td style={{ color: r.isCorrect ? "green" : "red", fontWeight: "bold" }}>
                  {r.isCorrect ? "✔️" : "❌"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button className="page-button" onClick={() => navigate("/quiz-setup")}>
        Start Again
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
