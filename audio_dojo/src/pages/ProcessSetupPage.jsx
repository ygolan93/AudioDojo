import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AudioStyle.css";
import PageWrapper from "../components/PageWrapper";
import { useSetup } from "../context/tempContext.jsx";


export default function ProcessSetupPage() {

  const navigate = useNavigate();
  const { processSetup, setProcessSetup } = useSetup();
  const [selectedOptions, setSelectedOptions] = useState(() => {
    return {
      EQ_Frequency: processSetup.EQ.frequency || [],
      EQ_Shape: processSetup.EQ.shape || [],
      EQ_Gain: processSetup.EQ.gain || []
    };
  });

  useEffect(() => {
    setProcessSetup((prev) => ({
      ...prev,
      EQ: {
        frequency: selectedOptions["EQ_Frequency"] || [],
        shape: selectedOptions["EQ_Shape"] || [],
        gain: selectedOptions["EQ_Gain"] || []
      },
      Compression: {
        attack: selectedOptions["Compression_Attack"] || [],
        release: selectedOptions["Compression_Release"] || [],
        gr: selectedOptions["Compression_GR"] || []
      },
      Reverb: {
        attack: selectedOptions["Reverb_Attack"] || [],
        release: selectedOptions["Reverb_Release"] || [],
        type: selectedOptions["Reverb_Type"] || []
      },
      Saturation: {
        attack: selectedOptions["Saturation_Attack"] || [],
        release: selectedOptions["Saturation_Release"] || []
      }
    }));
  }, [selectedOptions], console.log("Updating processSetup context", selectedOptions));
  
  const EQ_Frequency = [
    "60Hz",
    "120Hz",
    "250Hz",
    "500Hz",
    "1kHz",
    "2kHz",
    "4kHz",
    "8kHz",
    "10kHz",
    "12kHz",
    "ALL",
  ];

  const EQ_Shape = [
    "Bell",
    "Low Shelf",
    "High Shelf",
    "High Cut",
    "Low Cut",
    "ALL",
  ];

  const EQ_Gain = [
    "+12dB",
    "-12dB",
    "+6dB",
    "-6dB",
    "+3dB",
    "-3dB",
    "ALL",
  ];

  const Compression_Attack = [
    "0.1ms",
    "1ms",
    "5ms",
    "10ms",
    "20ms",
    "30ms",
    "100ms",
    "ALL",
  ];

  const Compression_Release = [
    "1ms",
    "20ms",
    "50ms",
    "80ms",
    "100ms",
    "200ms",
    "ALL",
  ];

  const Compression_GR = [
    "+12dB",
    "-12dB",
    "+6dB",
    "-6dB",
    "+3dB",
    "-3dB",
    "ALL",
  ];

  const Reverb_Attack = [
    "0.1ms",
    "1ms",
    "5ms",
    "10ms",
    "15ms",
    "30ms",
    "100ms",
    "ALL",
  ];

  const Reverb_Release = [
    "1ms",
    "20ms",
    "50ms",
    "80ms",
    "100ms",
    "200ms",
    "ALL",
  ];

  const Reverb_Type = [
    "+12dB",
    "-12dB",
    "+6dB",
    "-6dB",
    "+3dB",
    "-3dB",
    "ALL",
  ];

  const Saturation_Attack = [
    "0.1ms",
    "1ms",
    "5ms",
    "10ms",
    "15ms",
    "30ms",
    "100ms",
    "ALL",
  ];

  const Saturation_Release = [
    "1ms",
    "20ms",
    "50ms",
    "80ms",
    "100ms",
    "200ms",
    "ALL",
  ];


  const toggleOption = (category, option) => {
    setSelectedOptions((prev) => {
      const categoryOptions = prev[category] || [];
      const updatedOptions = categoryOptions.includes(option)
        ? categoryOptions.filter((i) => i !== option)
        : [...categoryOptions, option];
      return { ...prev, [category]: updatedOptions };
    });
  };

  const renderOptions = (category, options) => {
    return options
      .reduce((acc, option, index) => {
        const columnIndex = Math.floor(index / Math.ceil(options.length / 2));
        acc[columnIndex] = acc[columnIndex] || [];
        acc[columnIndex].push(option);
        return acc;
      }, [])
      .map((column, colIndex) => (
        <div key={colIndex} className="effect-list">
          {column.map((option) => (
            <label key={option} className="effect-item">
              <input
                type="checkbox"
                checked={(selectedOptions[category] || []).includes(option)}
                onChange={() => toggleOption(category, option)}
                className="checkbox"
              />
              {option}
            </label>
          ))}
        </div>
      ));


  };

  return (
    <PageWrapper className="p-4">
      <div className="process-setup-container">
        <div className="page-wrapper">
          <div className="processing-container">
            <div className="processing-setup-header">
              <h1> SETUP </h1>
              <div className="setup-buttons">
                <button className="page-button">Share Setup Code</button>
                <button className="page-button">Use Setup Code</button>
              </div>
            </div>
            <div className="processing-grid">
              <div className="processing-option" id="EQ">
                <div className="processing-wrapper">
                  <div>
                    <div className="processing-header">EQ</div>
                    <div className="processing-text">
                      Spectral listening training parameters
                    </div>
                  </div>
                  <div>
                    Frequency
                    <div className="processing-wrapper">
                      {renderOptions("EQ_Frequency", EQ_Frequency)}
                    </div>
                  </div>
                  <div>
                    Shape
                    {renderOptions("EQ_Shape", EQ_Shape)}
                  </div>
                  <div>
                    Gain
                    {renderOptions("EQ_Gain", EQ_Gain)}
                  </div>
                </div>
              </div>
              <div className="processing-option" id="Compression">
                <div className="processing-wrapper">
                  <div>
                    <div className="processing-header">Compression</div>
                    <div className="processing-text">Dynamic Listening</div>
                  </div>
                  <div>
                    Attack
                    {renderOptions("Compression_Attack", Compression_Attack)}
                  </div>
                  <div>
                    Release
                    {renderOptions("Compression_Release", Compression_Release)}
                  </div>
                  <div>
                    GR
                    {renderOptions("Compression_GR", Compression_GR)}
                  </div>
                </div>
              </div>
              <div className="processing-option" id="Reverb">
                <div className="processing-wrapper">
                  <div>
                    <div className="processing-header">Reverb</div>
                    <div className="processing-text">Spatial Listening</div>
                  </div>
                  <div>
                    Attack
                    {renderOptions("Reverb_Attack", Reverb_Attack)}
                  </div>
                  <div>
                    Release
                    {renderOptions("Reverb_Release", Reverb_Release)}
                  </div>
                  <div>
                    Type
                    {renderOptions("Reverb_Type", Reverb_Type)}
                  </div>
                </div>
              </div>
              <div className="processing-option" id="Saturation">
                <div className="processing-wrapper">
                  <div>
                    <div className="processing-header">Saturation</div>
                    <div className="processing-text">Harmonic Listening</div>
                  </div>
                  <div>
                    Attack
                    {renderOptions("Saturation_Attack", Saturation_Attack)}
                  </div>
                  <div>
                    Release
                    {renderOptions("Saturation_Release", Saturation_Release)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}