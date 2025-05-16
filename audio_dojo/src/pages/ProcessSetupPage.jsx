import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AudioStyle.css";
import PageWrapper from "../components/PageWrapper";
import { useSetup } from "../context/setupContext.jsx";

export default function ProcessSetupPage() {
  const navigate = useNavigate();
  const { processSetup, setProcessSetup } = useSetup();
  const [selectedOptions, setSelectedOptions] = useState(() => {
    return {
      EQ_Frequency: processSetup?.EQ?.frequency || [],
      EQ_Shape: processSetup?.EQ?.shape || [],
      EQ_Gain: processSetup?.EQ?.gain || []
    };
  });

  const [processBanks, setProcessBanks] = useState(null);

  useEffect(() => {
    fetch("/data/banks/processbanks.json")
      .then((res) => res.json())
      .then((data) => setProcessBanks(data["process banks"]))
      .catch((err) => console.error("Failed to load processbanks.json", err));
  }, []);

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
        drive: selectedOptions["Saturation_Drive"] || [],
        curveType: selectedOptions["Saturation_CurveType"] || [],
        bias: selectedOptions["Saturation_Bias"] || [],
        mix: selectedOptions["Saturation_Mix"] || []
      }
    }));
  }, [selectedOptions]);

  const getOptions = (process, param) => {
    if (!processBanks || !processBanks[process] || !processBanks[process][param]) return [];
    return processBanks[process][param];
  };

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

  if (!processBanks) return <div>Loading...</div>;

  // Helper to determine if a value is a list of selectable options
  const isSelectableArray = (arr) => Array.isArray(arr) && arr.every(v => typeof v === 'string' || typeof v === 'number');

  return (
    <PageWrapper className="p-4">
      <div className="process-setup-outer">
        <div className="process-setup-container">
          <div className="page-wrapper">
            <div className="processing-container">
              <div className="processing-setup-header">
                <h1> SETUP </h1>
                <div className="process-setup-buttons">
                  <button className="page-button">Share Setup Code</button>
                  <button className="page-button">Use Setup Code</button>
                </div>
              </div>
              <div className="processing-grid">
                {Object.entries(processBanks).map(([processName, params]) => {
                  const { subtitle, ...selectableParams } = params;
                  return (
                    <div className="processing-option" id={processName} key={processName}>
                      <div className="processing-wrapper">
                        <div className="process-heading" style={{marginRight: 0, paddingRight: 0}}>
                          <div className="processing-header">{processName}</div>
                          <div className="processing-text">
                            {Array.isArray(subtitle) ? subtitle.join(" ") : `${processName} parameters`}
                          </div>
                        </div>
                        {Object.entries(selectableParams).map(([paramName, paramOptions]) => (
                          isSelectableArray(paramOptions) ? (
                            <div key={paramName} className="param-block">
                              {paramName.charAt(0).toUpperCase() + paramName.slice(1)}
                              <div className="processing-wrapper">
                                {renderOptions(
                                  `${processName}_${paramName.charAt(0).toUpperCase() + paramName.slice(1)}`,
                                  paramOptions
                                )}
                              </div>
                            </div>
                          ) : null
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}