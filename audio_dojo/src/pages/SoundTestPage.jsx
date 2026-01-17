import { useState } from "react";
import AudioPlayer from "../components/AudioPlayer";
import PageWrapper from "../components/PageWrapper";
export default function SoundTestPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    const togglePlay = () => {
        setIsPlaying((prev) => !prev);
    }
    return (
        <PageWrapper>
            <div className="sound-test-container">
                <h1>Sound Test Page</h1>
                <button
                    onClick={togglePlay}
                    className="page-button"
                >
                    {isPlaying ? "Pause" : "Play"} Sound
                </button>
                <AudioPlayer audioUrl="/sounds/Augh.mp3" isPlaying={isPlaying} />
            </div>
        </PageWrapper>
    );
}
