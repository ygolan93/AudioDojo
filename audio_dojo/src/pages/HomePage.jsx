import { useNavigate } from "react-router-dom";
import "../styles/AudioStyle.css";
import AudioLogo from "../assets/AudioLogo.png";
import { motion } from 'framer-motion';
import PageWrapper from "../components/PageWrapper";
export default function HomePage() {
  const navigate = useNavigate();

return (

    <PageWrapper className="p-4">
    <div className="page-wrapper">
            <div className="page-left">
                <h1 id="homePage_header"> WELCOME TO</h1>
                <img
                    src={AudioLogo}
                    alt="Audio Dojo Logo"
                    className="home-page-logo"
                />
                <p style={{ fontSize: "1.7rem"}}>
                    | Your one stop shop for technical ear training.
                    <button
                        className="page-button"
                        onClick={() => navigate("/quiz-setup")}
                    >
                    LET'S GO!
                    </button>
                </p>

            </div>
            <div className="page-right">
                <div className="home-page-sessions">
                    <b>Pe-made sessions:</b> <br/>
                </div>
            </div>

    </div>
    </PageWrapper>);
}
