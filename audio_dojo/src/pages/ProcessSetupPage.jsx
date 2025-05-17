// src/pages/ProcessSetupPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AudioStyle.css";

import PageWrapper            from "../components/PageWrapper";
import { useSetup }           from "../context/setupContext.jsx";
import {
  applyEQ,
  applyCompression,
  applyReverb,
  applySaturation,
  inspectIR
} from "../utils/audioManager.js";

export default function ProcessSetupPage() {
  const navigate                             = useNavigate();
  const { processSetup, setProcessSetup }    = useSetup();

  /* === state keeps *all* process-param categories === */
  const [selectedOptions, setSelectedOptions] = useState(() => ({
    EQ_Frequency:          processSetup?.EQ?.frequency          || [],
    EQ_Shape:              processSetup?.EQ?.shape              || [],
    EQ_Gain:               processSetup?.EQ?.gain               || [],

    Compression_Attack:    processSetup?.Compression?.attack    || [],
    Compression_Release:   processSetup?.Compression?.release   || [],
    Compression_Gr:        processSetup?.Compression?.gr        || [],

    Reverb_Attack:         processSetup?.Reverb?.attack         || [],
    Reverb_Release:        processSetup?.Reverb?.release        || [],
    Reverb_Type:           processSetup?.Reverb?.type           || [],

    Saturation_Drive:      processSetup?.Saturation?.drive      || [],
    Saturation_CurveType:  processSetup?.Saturation?.curveType  || [],
    Saturation_Bias:       processSetup?.Saturation?.bias       || [],
    Saturation_Mix:        processSetup?.Saturation?.mix        || [],
  }));

  const [processBanks, setProcessBanks] = useState(null);

  useEffect(() => {
    fetch("/data/banks/processbanks.json")
      .then(r => r.json())
      .then(d => setProcessBanks(d["process banks"]))
      .catch(err => console.error("Failed to load processbanks.json", err));
  }, []);

  /*  save chosen params back to context  */
  useEffect(() => {
    setProcessSetup(prev => ({
      ...prev,
      EQ: {
        frequency : selectedOptions.EQ_Frequency,
        shape     : selectedOptions.EQ_Shape,
        gain      : selectedOptions.EQ_Gain,
      },
      Compression: {
        attack    : selectedOptions.Compression_Attack,
        release   : selectedOptions.Compression_Release,
        gr        : selectedOptions.Compression_Gr,
      },
      Reverb: {
        attack    : selectedOptions.Reverb_Attack,
        release   : selectedOptions.Reverb_Release,
        type      : selectedOptions.Reverb_Type,
      },
      Saturation: {
        drive     : selectedOptions.Saturation_Drive,
        curveType : selectedOptions.Saturation_CurveType,
        bias      : selectedOptions.Saturation_Bias,
        mix       : selectedOptions.Saturation_Mix,
      },
    }));
  }, [selectedOptions, setProcessSetup]);

  /* ----------------- helpers ----------------- */

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

  /*  render the check-boxes in **two columns** like before  */
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

  useEffect(() => {
    // Example: inspect the Room reverb IR on mount
    inspectIR("Room").then(buf => {
      // buf is the decoded AudioBuffer,
      // and you’ve already seen its channels/rate in the console table.
    }).catch(console.error);
  }, []);

  if (!processBanks) return <PageWrapper><div>Loading…</div></PageWrapper>;

  /* quick test button – keeps the new API logic */
  const handleApplyEQ = async () => {
    const shape = selectedOptions.EQ_Shape[0];
    const freq = selectedOptions.EQ_Frequency[0];
    const gain = selectedOptions.EQ_Gain[0];
    await applyEQ({
      instrument: "Kick",
      shape,
      frequency: parseFloat(freq),
      gain: parseFloat(gain)
    });
  };

  const handleApplyCompression = async () => {
    const attack = selectedOptions.Compression_Attack[0];
    const release = selectedOptions.Compression_Release[0];
    const threshold = selectedOptions.Compression_Gr[0];
    await applyCompression({
      instrument: "Kick",
      attack,
      release,
      threshold
    });
  };

  const handleApplyReverb = async () => {
    const type = selectedOptions.Reverb_Type[0];
    const decayTime = selectedOptions.Reverb_Attack[0];
    const mix = selectedOptions.Reverb_Release[0];
    await applyReverb({
      instrument: "Kick",
      type,
      decayTime,
      mix
    });
  };

  const handleApplySaturation = async () => {
    const drive = selectedOptions.Saturation_Drive[0];
    const curveType = selectedOptions.Saturation_CurveType[0];
    const bias = selectedOptions.Saturation_Bias[0];
    const mix = selectedOptions.Saturation_Mix[0];
    await applySaturation({
      instrument: "Kick",
      drive: parseFloat(drive),
      curveType,
      bias: parseFloat(bias),
      mix: parseFloat(mix)
    });
  };

  /* ----------------- UI ----------------- */

  return (
    <PageWrapper className="p-4">
      <div className="process-setup-outer">
        <div className="process-setup-container">
          <div className="processing-setup-header">
            <h1>SETUP</h1>
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
                    {/* heading */}
                    <div className="process-heading">
                      <div className="processing-header">{procName}</div>
                      <div className="processing-text">{subtitle}</div>
                    </div>

                    {/* parameters */}
                    {Object.entries(selectable).map(([paramName, opts]) => {
                      // rename impulseResponse → Type, leave everything else capitalized
                      let cap = paramName === "impulseResponse"
                        ? "Type"
                        : paramName.charAt(0).toUpperCase() + paramName.slice(1);
                      const cat   = `${procName}_${cap}`;
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
            <button onClick={handleApplyEQ} className="page-button">Play with EQ</button>
            <button onClick={handleApplyCompression} className="page-button">Play with Compression</button>
            <button onClick={handleApplyReverb} className="page-button">Play with Reverb</button>
            <button onClick={handleApplySaturation} className="page-button">Play with Saturation</button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
