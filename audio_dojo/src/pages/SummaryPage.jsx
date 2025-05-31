import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useSetup } from '../context/setupContext.jsx';
import '../styles/AudioStyle.css';

export default function SummaryPage() {
  const navigate = useNavigate();
  const { quizSetup, processSetup } = useSetup();
  const { processes = [], sampleBanks = [], numOfQuestions } = quizSetup;

  return (
    <PageWrapper>
      <div className="summary-layout">
        <h1 className="summary-header">REVIEW SETTINGS</h1>

        <div className="summary-grid">
          <div className="summary-card">
            <center><h2>Quiz Setup</h2></center>
            <div className="quiz-summary">
            <p><strong >Processes: </strong> {processes.length ? processes.join(', ') : 'None'}</p>
            <p><strong>Sample Banks:</strong> {sampleBanks.length ? sampleBanks.join(', ') : 'None'}</p>
            <p><strong>Number of Questions:</strong> {numOfQuestions || 0}</p>
            </div>
          </div>

          <div className="summary-card">
            <center><h2>Process Setup</h2></center> 
            {processes.length > 0 ? (
              processes.map((proc) => {
                const params = processSetup[proc] || {};
                return (
                  <div key={proc} className="process-summary">
                    <h3>{proc}</h3>
                    <ul>
                      {Object.entries(params).map(([param, value]) => (
                        <li key={param}>
                          <strong>{param}:</strong> {Array.isArray(value) && value.length > 0 ? value.join(', ') : 'None'}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            ) : (
              <p>No processes selected</p>
            )}
          </div>
        </div>

        <div className="summary-buttons">
          <button
            className="page-button"
            onClick={() => navigate('/quiz')}
          >
            START QUIZ
          </button>
          <button
            className="page-button"
            onClick={() => navigate('/quiz-setup')}
          >
            BACK TO  QUIZ SETUP
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
