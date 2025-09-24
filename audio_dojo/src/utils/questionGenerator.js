// Static frequency pool
const FREQUENCY_POOL = [
  "60Hz", "120Hz", "250Hz", "500Hz",
  "1KHz", "2KHz", "4KHz", "8KHz", "10KHz", "12KHz"
];

// Shuffle helper
function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

// Add unit to value if missing
function addUnitIfNeeded(val, format) {
  if (val == null) return val;
  const str = `${val}`.toLowerCase();
  if (format.includes("Hz") && !str.includes("hz")) return `${val}Hz`;
  if (format.includes("dB") && !str.includes("db")) return `${val}dB`;
  if (format.includes("ms") && !str.includes("ms")) return `${val}ms`;
  if (format.includes("s") && !str.includes("s")) return `${val}s`;
  if (format.includes("ratio") && !str.includes(":")) return `${val}:1`;
  return `${val}`;
}

// Generate wrong answers and mix with correct one
function generateAnswerOptions(correctAnswer, frequencies, gains, answerFormat = []) {
  const allCombos = [];

  for (const freq of frequencies) {
    for (const gain of gains) {
      const formattedFreq = addUnitIfNeeded(freq, answerFormat);
      const formattedGain = addUnitIfNeeded(gain, answerFormat);
      const combo = answerFormat.includes("dB")
        ? `${formattedFreq} ${formattedGain}`
        : formattedFreq;
      allCombos.push(combo);
    }
  }

  const wrongOptions = allCombos.filter(combo => combo !== correctAnswer);
  const selectedWrong = [];

  while (selectedWrong.length < 3 && wrongOptions.length > 0) {
    const random = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
    if (!selectedWrong.includes(random)) {
      selectedWrong.push(random);
    }
  }

  return shuffleArray([
    { text: correctAnswer, isCorrect: true },
    ...selectedWrong.map(text => ({ text, isCorrect: false }))
  ]);
}

// Main function
export function generateQuestionsFromTemplates(templates) {
  const allQuestions = [];

  templates.forEach((template) => {
    const base = { ...template, process: template.process };
    const answerFormat = template["answer format"] || [];
    let countBefore = allQuestions.length;

    // EQ – frequency + gain + shape
    if (Array.isArray(template.frequency) && Array.isArray(template.shape)) {
      const freqsRaw = template.frequency.includes("all")
        ? FREQUENCY_POOL
        : template.frequency;

      const gainsRaw = Array.isArray(template.gain)
        ? (template.gain.includes(null) ? [null] : template.gain)
        : [];

      const shapesRaw = template.shape;
      const freqs = freqsRaw.map((f) => addUnitIfNeeded(f, answerFormat));
      const gains = gainsRaw.map((g) => addUnitIfNeeded(g, answerFormat));

      shapesRaw.forEach((shape) => {
        if (gains.length > 0) {
          // שאלות שמשלבות frequency × gain × shape
          freqs.forEach((f) => {
            if (answerFormat.includes("dB")) {
              gains.forEach((g) => {
                const correct = `${f} ${g}`;
                const answers = generateAnswerOptions(correct, freqs, gains, answerFormat);

                allQuestions.push({
                  ...base,
                  correctAnswer: correct,
                  answers,
                  id: `${template.question}-${template.parts?.[0] || "unknown"}-${shape}-${f}-${g}`,
                  shape,
                  frequency: parseFloat(f),
                  gain: parseFloat(g),
                });
              });
            }
          });
        } else {
          // שאלות ללא gain (למשל Low Cut / High Cut)
          freqs.forEach((f) => {
            const correct = f;
            const incorrectFreqs = freqs
              .filter((item) => item !== f)
              .slice(0, 3)
              .map((item) => ({ text: item, isCorrect: false }));

            const answers = shuffleArray([
              { text: correct, isCorrect: true },
              ...incorrectFreqs,
            ]);

            allQuestions.push({
              ...base,
              correctAnswer: correct,
              answers,
              id: `${template.question}-${template.parts?.[0] || "unknown"}-${shape}-${f}`,
            });
          });
        }
      });
    }

    // Compression / Reverb / Saturation / others
    else {
      Object.entries(template).forEach(([key, opts]) => {
        if (
          !["question", "instruments", "parts", "answer format", "process"].includes(key) &&
          Array.isArray(opts)
        ) {
          opts.forEach((val) => {
            const formattedVal = addUnitIfNeeded(val, answerFormat);
            const incorrect = opts.filter((item) => item !== val).slice(0, 3);
            const answers = shuffleArray([
              { text: formattedVal, isCorrect: true },
              ...incorrect.map((item) => ({
                text: addUnitIfNeeded(item, answerFormat),
                isCorrect: false,
              })),
            ]);

            allQuestions.push({
              ...base,
              correctAnswer: formattedVal,
              answers,
              id: `${template.question}-${template.parts?.[0] || "unknown"}-${key}-${val}`,
            });
          });
        }
      });
    }

    console.log(
      "✅ Created",
      allQuestions.length - countBefore,
      "questions for:",
      template.question
    );
  });

  return allQuestions;
}
