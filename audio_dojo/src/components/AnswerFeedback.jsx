import EQCurveCanvas from "./EQCurveCanvas";

export default function AnswerFeedback({ question, userAnswer }) {
  const isCorrect = userAnswer?.isCorrect;

  const isEQ = question.process === "EQ";
  const shape = question.shape || "Bell";
  const gain = question.gain || 6;
  const frequency = question.frequency || 1000;
  const q = 1.0; // default

  return (
    <div className="feedback-box" style={{ padding: "1rem", border: "1px solid #333", borderRadius: "8px" }}>
      <h3 style={{ color: isCorrect ? "lightgreen" : "salmon" }}>
        {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
      </h3>
      <p>
        <strong>Correct Answer:</strong> {question.correctAnswer}
      </p>

      {isEQ && (
        <>
          <h4 style={{ marginTop: "1rem", color: "#ccc" }}>EQ Curve Visualization:</h4>
          <EQCurveCanvas
            shape={shape}
            frequency={parseFloat(frequency)}
            gain={parseFloat(gain)}
            q={q}
          />
        </>
      )}
    </div>
  );
}
