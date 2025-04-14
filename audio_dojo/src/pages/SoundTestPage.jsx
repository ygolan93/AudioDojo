import { useState } from "react";
import AudioPlayer from "../components/AudioPlayer";
export default function SoundTestPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    const togglePlay = () => {
        setIsPlaying((prev) => !prev);
    }
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Sound Test Page</h1>
            <button
                onClick={togglePlay}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                {isPlaying ? "Pause" : "Play"} Sound
            </button>
            <AudioPlayer audioUrl="/sounds/Augh.mp3" isPlaying={isPlaying} />
        </div>
    );
}