import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AudioStyle.css";
import PageWrapper from "../components/PageWrapper";
import { Link } from "react-router-dom";
export default function QuizModulePage() {
    const navigate = useNavigate();

    return (
        <PageWrapper className="p-4">
            <div className="quiz-module-container">
                <div className="page-wrapper">
                    <div className="page-left">
                        <h1 style={{fontSize:"6rem", width:"70%"}}>A PRACTICE WITH A QUIZ!</h1>
                        <p className="quiz-module-description">
                            In this game mode you will be listening to an audio source before and after processing. It will be up to you to choose of 4 possible answers - which processing was applied to the source. You can input your own samples or use our built-in samples for the quiz!
                        </p>
                        <div className="quiz-module-selection">
                            <button className="page-button" onClick={()=>navigate("/quiz-setup")}> Set it up! </button>
                            <button className="page-button">Use Practice Code </button>
                            {/* <Link to="/quiz">
                            <button className="page-button">START </button>
                            </Link> */}
                        </div>
                    </div>

                    <div className="page-right">
                        <div className="quiz-module-square"> <span className="module-text" style={{fontSize: "2.2rem"}}>QUIZ </span></div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}