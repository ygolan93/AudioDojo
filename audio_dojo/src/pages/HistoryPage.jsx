// HistoryPage.jsx
import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("quizHistory")) || [];
    const sortedData = storedData
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
    setHistoryData(sortedData);
  }, []);

  const toggleExpand = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const handleDelete = (indexToDelete) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this attempt?\nThis action cannot be undone."
    );
    if (!confirmDelete) return;

    const updated = [...historyData];
    updated.splice(indexToDelete, 1);
    setHistoryData(updated);
    localStorage.setItem("quizHistory", JSON.stringify(updated));
  };

  const handleExportPDF = (entry) => {
    const doc = new jsPDF();
    const date = new Date(entry.timestamp);

    doc.text(
      `Quiz Summary - ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
      10,
      10
    );

    doc.autoTable({
      head: [["Question", "Picked", "Correct", "Result"]],
      body: entry.results.map((r) => [
        r.questionText,
        r.pickedAnswer,
        r.correctAnswer,
        r.isCorrect ? "✅" : "❌",
      ]),
      startY: 20,
    });

    doc.save(`quiz_${date.toISOString()}.pdf`);
  };

  const handleExportExcel = (entry) => {
    const wsData = [
      ["Question", "Picked", "Correct", "Result"],
      ...entry.results.map((r) => [
        r.questionText,
        r.pickedAnswer,
        r.correctAnswer,
        r.isCorrect ? "Correct" : "Wrong",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");

    const date = new Date(entry.timestamp);
    XLSX.writeFile(wb, `quiz_${date.toISOString()}.xlsx`);
  };

  const calculatePercentage = (entry) => {
    if (!entry?.results?.length) return "0%";
    const correct = entry.results.filter((r) => r.isCorrect).length;
    return `${Math.round((correct / entry.results.length) * 100)}%`;
  };

  return (
    <PageWrapper className="p-4">
      <div className="history-container">
        <div className="page-wrapper">
          <div className="page-left">
            <h1>HISTORY</h1>
          </div>
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr className="border-b">
                  <th>Date</th>
                  <th>Time</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((entry, idx) => {
                  const date = new Date(entry.timestamp);
                  const isExpanded = expandedRow === idx;

                  return (
                    <React.Fragment key={entry.id || idx}>
                      <tr key={entry.id || idx} className="border-b">
                        <td>{date.toLocaleDateString()}</td>
                        <td>{date.toLocaleTimeString()}</td>
                        <td>{calculatePercentage(entry)}</td>
                        <td>
                          <div className="history-action-buttons">
                            <button
                              className="page-button"
                              onClick={() => toggleExpand(idx)}
                            >
                              {isExpanded ? "Hide" : "View"}
                            </button>
                            <button
                              className="page-button"
                              onClick={() => handleExportPDF(entry)}
                            >
                              PDF
                            </button>
                            <button
                              className="page-button"
                              onClick={() => handleExportExcel(entry)}
                            >
                              Excel
                            </button>
                            <button
                              className="page-button stop-button"
                              onClick={() => handleDelete(idx)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                      <tr className="history-expand-row">
                        <td colSpan={4}>
                          <div className={`expand-wrapper ${isExpanded ? "open" : ""}`}>
                            <table className="results-subtable">
                              <thead>
                                <tr>
                                  <th>Question</th>
                                  <th>Picked Answer</th>
                                  <th>Correct Answer</th>
                                  <th>Result</th>
                                </tr>
                              </thead>
                              <tbody>
                                {entry.results?.map((res, i) => (
                                  <tr key={i} className={res.isCorrect ? "bg-green-950" : "bg-red-950"}>
                                    <td>{res.questionText}</td>
                                    <td>{res.pickedAnswer}</td>
                                    <td>{res.correctAnswer}</td>
                                    <td className="text-center">{res.isCorrect ? "✅" : "❌"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>

                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
