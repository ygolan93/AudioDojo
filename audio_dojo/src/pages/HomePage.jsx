import { useNavigate } from "react-router-dom";
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
                <br/>
                <img
                    src={AudioLogo}
                    alt="Audio Dojo Logo"
                    className="home-page-logo"
                />
                <p style={{ fontSize: "1.7rem"}}>
                    <span style={{paddingRight:"1rem", filter:"brightness(1.1) drop-shadow(0 0 0.1em #00c921)",
  color:"yellowgreen", fontSize:"2rem", fontWeight:"700"}}>|</span>Your one stop shop for technical ear training.
                    <button
                        className="page-button"
                        onClick={() => navigate("/modules")}
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
