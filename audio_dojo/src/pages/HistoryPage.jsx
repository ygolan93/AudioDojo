import { useNavigate } from "react-router-dom";
import "../styles/AudioStyle.css";
import PageWrapper from "../components/PageWrapper";

export default function HistoryPage() {
  const navigate = useNavigate();

  return (
    <PageWrapper className="p-4">
      <div className="history-container">
        <div className="page-wrapper">
          <div className="page-left">
            <h1>HISTORY</h1>
          </div>
          <div className="page-right">
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}