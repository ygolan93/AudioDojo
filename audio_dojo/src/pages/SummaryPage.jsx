import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { useSetup } from "../context/setupContext.jsx";
import { generateQuestionsFromTemplates } from "../utils/questionGenerator";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function SummaryPage() {
  const navigate = useNavigate();
  const { quizSetup, processSetup } = useSetup();
  const { processes = [], sampleBanks = [], numOfQuestions } = quizSetup;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [availableTotal, setAvailableTotal] = useState(0); // כמה שאלות זמינות בפועל אחרי סינון
  const [availablePerBank, setAvailablePerBank] = useState({}); // פירוט לפי בנק
  const [finalCount, setFinalCount] = useState(0); // כמה יכנסו בפועל לQuiz (min)
  const [details, setDetails] = useState({}); // טקסטים למסך

  // === helpers for filtering like Quiz ===
  function toNum(x) {
    if (x == null) return NaN;
    const s = String(x).toLowerCase().replace(/[^0-9.+\-:]/g, "");
    if (s.includes(":")) return parseFloat(s.split(":")[0]); // ratio "4:1" -> 4
    return parseFloat(s);
  }
  function normStr(x) {
    return String(x).trim().toLowerCase();
  }
  function filterByProcessSetup(questions, setup) {
    return questions.filter((q) => {
      const proc = q.process;
      const cfg = setup?.[proc] || {};

      if (proc === "EQ") {
        if (q.shape !== undefined) {
          const sel = (cfg.shape || []).map(normStr);
          if (sel.length === 0 || !sel.includes(normStr(q.shape))) return false;
        }
        if (q.frequency !== undefined) {
          const sel = (cfg.frequency || []).map(toNum);
          if (sel.length === 0 || !sel.includes(toNum(q.frequency))) return false;
        }
        if (q.gain !== undefined && q.gain !== null && !Number.isNaN(q.gain)) {
          const sel = (cfg.gain || []).map(toNum);
          if (sel.length === 0 || !sel.includes(toNum(q.gain))) return false;
        }
        return true;
      }

      // other processes — rely on paramKey/paramValue tags from questionGenerator
      const key = q.paramKey;
      const val = q.paramValue;
      if (!key) return false;

      const selected = cfg?.[key] || [];
      if (selected.length === 0) return false;

      const qNum = toNum(val);
      if (!Number.isNaN(qNum)) {
        const selNums = selected.map(toNum).filter((n) => !Number.isNaN(n));
        return selNums.includes(qNum);
      } else {
        const selStrs = selected.map(normStr);
        return selStrs.includes(normStr(val));
      }
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function loadAndCountQuestions() {
      try {
        // 1) משיכת כל התבניות מה־Firebase עבור ה־processes שנבחרו
        let allTemplates = [];
        for (let proc of processes) {
          const ref = doc(db, "questionBanks", proc);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const { questions = [] } = snap.data();
            allTemplates.push(...questions.map((q) => ({ ...q, process: proc })));
          }
        }

        // 2) סינון לפי sampleBanks
        const filteredByBank = allTemplates.filter((t) =>
          sampleBanks.includes(t.parts?.[0])
        );

        // 3) הרחבה לשאלות
        const expanded = generateQuestionsFromTemplates(filteredByBank);

        // 4) סינון לפי ProcessSetup (בדיוק כמו ב־Quiz)
        const expandedFiltered = filterByProcessSetup(expanded, processSetup);

        // 5) חישוב זמינות כללית ולפי בנק
        const perBank = sampleBanks.reduce((acc, inst) => {
          acc[inst] = expandedFiltered.filter((q) => q.parts[0] === inst).length;
          return acc;
        }, {});
        const totalAvailable = Object.values(perBank).reduce((s, n) => s + n, 0);

        // 6) כמה באמת יכנסו (האלגוריתם ב־Quiz מאפשר fallback, לכן זה פשוט min)
        const finalNum = Math.min(numOfQuestions || 0, totalAvailable);

        if (cancelled) return;

        setAvailablePerBank(perBank);
        setAvailableTotal(totalAvailable);
        setFinalCount(finalNum);

        setDetails({
          processes: processes.join(", ") || "None",
          banks: sampleBanks.join(", ") || "None",
          picked: numOfQuestions || 0,
        });

        setIsLoading(false);
      } catch (e) {
        console.error("Summary load failed:", e);
        if (!cancelled) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    }

    loadAndCountQuestions();
    return () => {
      cancelled = true;
    };
  }, [processes, sampleBanks, numOfQuestions, processSetup]);

  if (isLoading) {
    return (
      <PageWrapper className="p-4">
        <div className="loading">LOADING...</div>
      </PageWrapper>
    );
  }

  if (hasError) {
    return (
      <PageWrapper className="p-4">
        <div className="error">Failed to load summary. Please try again.</div>
      </PageWrapper>
    );
  }

  const warnZero = availableTotal === 0;
  const warnLess = !warnZero && finalCount < (numOfQuestions || 0);

  return (
    <PageWrapper className="p-4">
      <div className="summary-wrapper">
        <h1 className="page-title">REVIEW SETTINGS</h1>

        <div className="summary-panels">
          <div className="summary-panel">
            <h2>Quiz Setup</h2>
            <ul>
              <li>
                <strong>Processes:</strong> {details.processes}
              </li>
              <li>
                <strong>Sample Banks:</strong> {details.banks}
              </li>
              <li>
                <strong>Number of Questions picked:</strong> {details.picked}
              </li>
            </ul>
          </div>

          <div className="summary-panel">
            <h2>Process Setup</h2>
            {/* מציגים בקצרה שהסינון פעיל – אין פירוט של כל ערך כדי להשאיר מסך נקי */}
            <p>
              Selected parameters will filter questions for the chosen processes.
            </p>
            <ul>
              {Object.entries(availablePerBank).map(([bank, count]) => (
                <li key={bank}>
                  <strong>{bank}:</strong> {count} available
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* אזהרות */}
        {warnZero && (
          <div className="warning" style={{ color: "#ff6b6b", marginTop: 16 }}>
            No valid questions match your current settings. Please adjust your
            Process Setup and/or Sample Banks.
          </div>
        )}
        {warnLess && (
          <div className="warning" style={{ color: "#ffcc66", marginTop: 16 }}>
            Only {availableTotal} questions are available for the current
            settings. The quiz will include {finalCount}.
          </div>
        )}

        {!warnZero && !warnLess && (
          <div className="ok" style={{ color: "#a0ff99", marginTop: 16 }}>
            Great! {finalCount} questions will be generated.
          </div>
        )}

        <div className="summary-buttons" style={{ marginTop: 24 }}>
          <button
            className="page-button"
            onClick={() => navigate("/quiz")}
            disabled={warnZero}
          >
            START QUIZ
          </button>
          <button
            className="page-button"
            onClick={() => navigate("/quiz-setup")}
            style={{ marginLeft: 12 }}
          >
            BACK TO QUIZ SETUP
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
