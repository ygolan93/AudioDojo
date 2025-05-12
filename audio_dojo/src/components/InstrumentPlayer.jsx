import { useState } from "react";
import { useSetup } from "../context/setupContext";
import AudioPlayer from "./AudioPlayer";

export default function InstrumentPlayer({ instrument = "drumset" }) {
  const { drumsetFiles } = useSetup(); // כרגע יש רק Drumset, בעתיד יתווספו אינסטרומנטים נוספים
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const audioFiles = instrument === "drumset" ? drumsetFiles : []; // כאן נרחיב בהמשך

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div>
      <h2>{instrument} Player</h2>
      <select onChange={(e) => setSelectedIndex(Number(e.target.value))}>
        {audioFiles.map((file, index) => (
          <option key={index} value={index}>
            {file.file}
          </option>
        ))}
      </select>
      <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>

      <AudioPlayer audioFiles={audioFiles} isPlaying={isPlaying} selectedIndex={selectedIndex} />
    </div>
  );
}
