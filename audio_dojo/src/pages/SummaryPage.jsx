import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useSetup } from '../context/setupContext.jsx';
import { generateQuestionsFromTemplates } from '../utils/questionGenerator';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function SummaryPage() {
  const navigate = useNavigate();
  const { quizSetup, processSetup } = useSetup();
  const { processes = [], sampleBanks = [], numOfQuestions } = quizSetup;

  const [actualQuestions, setActualQuestions] = useState(null);
useEffect(() => {
  async function loadAndCountQuestions() {
    try {
      let allTemplates = [];

      for (let proc of processes) {
        const docRef = doc(db, 'questionBanks', proc);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const { questions = [] } = docSnap.data();
          allTemplates.push(...questions.map(q => ({ ...q, process: proc })));
        }
      }

      const filtered = allTemplates.filter((t) =>
        sampleBanks.includes(t.parts?.[0])
      );

      const expanded = generateQuestionsFromTemplates(filtered);

      // 🔁 לוגיקת חלוקה כמו ב-Quiz.jsx
      const banks = sampleBanks;
      const numQ = numOfQuestions;
      const groups = banks.reduce((acc, inst) => {
        acc[inst] = expanded.filter((q) => q.parts[0] === inst);
        return acc;
      }, {});

      const shuffle = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      };

      let instrumentOrder = [];
      const fullCycles = Math.floor(numQ / banks.length);
      const remainder = numQ % banks.length;

      for (let i = 0; i < fullCycles; i++) {
        instrumentOrder.push(...shuffle([...banks]));
      }
      instrumentOrder.push(...shuffle([...banks]).slice(0, remainder));

      const pointers = {};
      const totalAvailable = Object.values(groups).reduce((sum, arr) => sum + arr.length, 0);
      const finalQs = [];

      for (let inst of instrumentOrder) {
        if (finalQs.length >= totalAvailable) break;

        const bucket = groups[inst] || [];
        const index = pointers[inst] || 0;

        if (index < bucket.length) {
          finalQs.push(bucket[index]);
          pointers[inst] = index + 1;
        } else {
          const fallback = banks.find(
            b => (pointers[b] || 0) < (groups[b]?.length || 0)
          );
          if (fallback) {
            const fbIndex = pointers[fallback] || 0;
            finalQs.push(groups[fallback][fbIndex]);
            pointers[fallback] = fbIndex + 1;
          }
        }

        if (finalQs.length >= numQ) break;
      }

      setActualQuestions(finalQs.length);

    } catch (err) {
      console.error("Failed to calculate question count:", err);
    }
  }

  loadAndCountQuestions();
}, [processes, sampleBanks, numOfQuestions]);


  return (
    <PageWrapper>
      <div className="summary-layout">
        <h1 className="summary-header">REVIEW SETTINGS</h1>

        <div className="summary-grid">
          <div className="summary-card">
            <center><h2>Quiz Setup</h2></center>
            <div className="quiz-summary">
              <p><strong>Processes:</strong> {processes.length ? processes.join(', ') : 'None'}</p>
              <p><strong>Sample Banks:</strong> {sampleBanks.length ? sampleBanks.join(', ') : 'None'}</p>
              <p><strong>Number of Questions picked:</strong> {numOfQuestions || 0}</p>
                {actualQuestions !== null && actualQuestions < numOfQuestions && (
                  <p style={{ color: 'yellow', fontWeight: 'bold' }}>
                    NOTE: Only {actualQuestions} questions could be generated out of the requested {numOfQuestions}. Try adjusting processes or sample banks for more.
                  </p>
                )}


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
                      {Object.keys(params).length > 0 ? (
                        Object.entries(params).map(([param, value]) => (
                          <li key={param}>
                            <strong>{param}:</strong> {Array.isArray(value) && value.length > 0 ? value.join(', ') : 'None'}
                          </li>
                        ))
                      ) : (
                        <li>No settings defined</li>
                      )}

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
          <button className="page-button" onClick={() => navigate('/quiz')}>
            START QUIZ
          </button>
          <button className="page-button" onClick={() => navigate('/quiz-setup')}>
            BACK TO QUIZ SETUP
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
