import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";

export default function ModulesPage() {
  const navigate = useNavigate();

  return (
    <PageWrapper className="p-4">
      <div className="modules-container">
        <div className="page-wrapper">
          <div className="page-left">
            <h1 style={{ fontSize: "6rem" }}>Modules</h1>
            <div className="module-selection">
              <button
                className="module-button"
                id="module-quiz"
                onClick={() => navigate("/quiz-module")}
              >
                <span className="module-text">QUIZ</span>
              </button>
              <button className="module-button" id="module-match">
                <span className="module-text">MATCH</span>
              </button>
              <button className="module-button" id="module-flatten">
                <span className="module-text">FLATTEN </span>
              </button>
              <button className="module-button" id="module-free-for-all">
                <span className="module-text">FREE FOR ALL</span>
              </button>
            </div>
          </div>

          <div className="page-right">
            <div className="module-description">
              <h2>SELECT A MODULE</h2>
              <p>
                Modules are different "game modes" through which you'll be
                practicing. Combining different methodologies is crucial for
                increasing your proficiency!
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}