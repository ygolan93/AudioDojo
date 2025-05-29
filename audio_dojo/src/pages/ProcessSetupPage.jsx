import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AudioStyle.css";
import PageWrapper from "../components/PageWrapper";
import { useSetup } from "../context/setupContext.jsx";
import {
  applyEQ,
  applyCompression,
  applyReverb,
  applySaturation,
  playOriginal,
  stopCurrent
} from "../utils/audioManager.js";

export default function ProcessSetupPage() {
  const navigate = useNavigate();
  const { processSetup, setProcessSetup } = useSetup();

  // Load sample bank definitions from public folder
  const [sampleBanks, setSampleBanks] = useState({ instruments: [] });
  useEffect(() => {
    fetch("/data/banks/samplebanks.json")
      .then(r => r.json())
      .then(d => setSampleBanks(d))
      .catch(err => console.error("Failed to load samplebanks.json", err));
  }, []);

  // Selected sample from dropdown
  const [selectedSample, setSelectedSample] = useState("");
  useEffect(() => {
    if (sampleBanks.instruments.length > 0 && !selectedSample) {
      setSelectedSample(sampleBanks.instruments[0]);
    }
  }, [sampleBanks]);

  // State for process parameters, seeded once from context
  const [selectedOptions, setSelectedOptions] = useState(() => ({
    EQ_Frequency:        processSetup.EQ?.frequency   || [],
    EQ_Shape:            processSetup.EQ?.shape       || [],
    EQ_Gain:             processSetup.EQ?.gain        || [],

    Compression_Attack:  processSetup.Compression?.attack  || [],
    Compression_Release: processSetup.Compression?.release || [],
    Compression_Gr:      processSetup.Compression?.gr      || [],

    Reverb_Attack:       processSetup.Reverb?.attack     || [],
    Reverb_Release:      processSetup.Reverb?.release    || [],
    Reverb_Type:         processSetup.Reverb?.type       || [],
    Reverb_DecayTime:    processSetup.Reverb?.decayTime  || [],
    Reverb_Mix:          processSetup.Reverb?.mix        || [],

    Saturation_Drive:    processSetup.Saturation?.drive     || [],
    Saturation_CurveType:processSetup.Saturation?.curveType|| [],
    Saturation_Bias:     processSetup.Saturation?.bias      || [],
    Saturation_Mix:      processSetup.Saturation?.mix       || [],
  }));

  // Load process banks
  const [processBanks, setProcessBanks] = useState(null);
  useEffect(() => {
    fetch("/data/banks/processbanks.json")
      .then(r => r.json())
      .then(d => setProcessBanks(d["process banks"]))
      .catch(err => console.error("Failed to load processbanks.json", err));
  }, []);

  // Sync selectedOptions back to context
  useEffect(() => {
    setProcessSetup(prev => ({
      ...prev,
      EQ: {
        frequency: selectedOptions.EQ_Frequency,
        shape: selectedOptions.EQ_Shape,
        gain: selectedOptions.EQ_Gain,
      },
      Compression: {
        attack: selectedOptions.Compression_Attack,
        release: selectedOptions.Compression_Release,
        gr: selectedOptions.Compression_Gr,
      },
      Reverb: {
        attack:    selectedOptions.Reverb_Attack,
        release:   selectedOptions.Reverb_Release,
        type:      selectedOptions.Reverb_Type,
        decayTime: selectedOptions.Reverb_DecayTime,
        mix:       selectedOptions.Reverb_Mix,
      },
      Saturation: {
        drive: selectedOptions.Saturation_Drive,
        curveType: selectedOptions.Saturation_CurveType,
        bias: selectedOptions.Saturation_Bias,
        mix: selectedOptions.Saturation_Mix,
      },
    }))
  }, [selectedOptions, setProcessSetup])

  // Toggle a checkbox option
  const toggleOption = (category, option) => {
    setSelectedOptions(prev => {
      const opts = prev[category] || [];
      return {
        ...prev,
        [category]: opts.includes(option)
          ? opts.filter(o => o !== option)
          : [...opts, option],
      };
    });
  };

  // Render checkboxes in two columns
  const renderOptions = (category, options = []) => {
    const columns = options.reduce((acc, opt, i) => {
      const colIdx = Math.floor(i / Math.ceil(options.length / 2));
      (acc[colIdx] ||= []).push(opt);
      return acc;
    }, []);

    return columns.map((col, idx) => (
      <div key={idx} className="effect-list">
        {col.map(opt => (
          <label key={opt} className="effect-item">
            <input
              type="checkbox"
              className="checkbox"
              checked={selectedOptions[category]?.includes(opt) || false}
              onChange={() => toggleOption(category, opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    ));
  };

  if (!processBanks || sampleBanks.instruments.length === 0) {
    return (
      <PageWrapper>
        <div>Loading…</div>
      </PageWrapper>
    );
  }

  // Handlers using selectedSample
  const handleApplyEQ = async () => {
    const shape = selectedOptions.EQ_Shape[0];
    const freq = selectedOptions.EQ_Frequency[0];
    const gain = selectedOptions.EQ_Gain[0];
    await applyEQ({
      instrument: selectedSample,
      shape,
      frequency: parseFloat(freq),
      gain: parseFloat(gain),
    });
  };

  const handleApplyCompression = async () => {
    const attack = selectedOptions.Compression_Attack[0];
    const release = selectedOptions.Compression_Release[0];
    const threshold = selectedOptions.Compression_Gr[0];
    await applyCompression({ instrument: selectedSample, attack, release, threshold });
  };

  const handleApplyReverb = async () => {
    const instrument = selectedSample; 
    const type      = selectedOptions.Reverb_Type[0];
    const decayTime = selectedOptions.Reverb_DecayTime[0];
    const mix       = selectedOptions.Reverb_Mix[0];
    await applyReverb({ instrument: instrument, type, decayTime, mix });
  };

  const handleApplySaturation = async () => {
    const drive = selectedOptions.Saturation_Drive[0];
    const curveType = selectedOptions.Saturation_CurveType[0];
    const bias = selectedOptions.Saturation_Bias[0];
    const mix = selectedOptions.Saturation_Mix[0];
    await applySaturation({
      instrument: selectedSample,
      drive: parseFloat(drive),
      curveType,
      bias: parseFloat(bias),
      mix: parseFloat(mix),
    });
  };

  return (
    <PageWrapper className="p-4">
      <div className="process-setup-outer">
        <div className="process-setup-container">
          <div className="processing-setup-header">
            <h1>SETUP</h1>
            <select
              value={selectedSample}
              onChange={e => setSelectedSample(e.target.value)}
              className="sample-dropdown"
            >
              {sampleBanks.instruments.map(inst => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
            <div className="process-setup-buttons">
              <button className="page-button">Share Setup Code</button>
              <button className="page-button">Use Setup Code</button>
            </div>
          </div>

          <div className="processing-grid">
            {Object.entries(processBanks).map(([procName, params]) => {
              const { subtitle = "", ...selectable } = params;
              return (
                <div key={procName} className="processing-option" id={procName}>
                  <div className="processing-wrapper">
                    <div className="process-heading">
                      <div className="processing-header">{procName}</div>
                      <div className="processing-text">{subtitle}</div>
                    </div>
                    {Object.entries(selectable).map(([paramName, opts]) => {
                      const cap =
                        paramName === "impulseResponse"
                          ? "Type"
                          : paramName.charAt(0).toUpperCase() + paramName.slice(1);
                      const cat = `${procName}_${cap}`;
                      return (
                        <div key={paramName} className="param-block">
                          {cap}
                          <div className="processing-wrapper">
                            {renderOptions(cat, opts)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <br />
          <div className="process-setup-buttons">
            {/* <button onClick={() => playOriginal({ instrument: selectedSample })} className="page-button">
              Play Original
            </button> */}
            <button onClick={handleApplyEQ} className="page-button">
              Play with EQ
            </button>
            <button onClick={handleApplyCompression} className="page-button">
              Play with Compression
            </button>
            <button onClick={handleApplyReverb} className="page-button">
              Play with Reverb
            </button>
            <button onClick={handleApplySaturation} className="page-button">
              Play with Saturation
            </button>
            <button onClick={stopCurrent} className="page-button stop-button">
              Stop
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
