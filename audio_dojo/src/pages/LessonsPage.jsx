import { useNavigate } from "react-router-dom";
import "../styles/AudioStyle.css";
import PageWrapper from "../components/PageWrapper";

export default function LessonsPage() {
  const navigate = useNavigate();

  return (
    <PageWrapper className="p-4">
      <div className="lessons-container">
        <div className="page-wrapper">
          <div className="page-left">
            <h1>LESSONS</h1>
          </div>
          <div className="page-right">
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}