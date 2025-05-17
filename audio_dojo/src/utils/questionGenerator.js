// Static frequency pool
const FREQUENCY_POOL = [
    "60Hz", "120Hz", "250Hz", "500Hz",
    "1KHz", "2KHz", "4KHz", "8KHz", "10KHz", "12KHz"
  ];
  
  // Generate full question list from templates
  export function generateQuestionsFromTemplates(templates) {
    const allQuestions = [];
  
    templates.forEach((template) => {
      const base = { ...template, process: template.process };
  
      // EQ‐style questions still use frequency + gain
      if (Array.isArray(template.frequency) && Array.isArray(template.gain)) {
        const freqs = template.frequency.includes("all")
          ? FREQUENCY_POOL
          : template.frequency;
  
        const gains = template.gain.includes(null) ? [null] : template.gain;
        freqs.forEach((f) => {
          if (
            Array.isArray(template["answer format"]) &&
            template["answer format"].includes("dB")
          ) {
            gains.forEach((g) => {
              allQuestions.push({
                ...base,
                correctAnswer: `${f} @ ${g}`
              });
            });
          } else {
            allQuestions.push({ ...base, correctAnswer: f });
          }
        });
        return;
      }
  
      // Generic case: one parameter per template (Compression, Reverb, Saturation)
      // Find all keys that hold an array of options
      Object.entries(template).forEach(([key, opts]) => {
        if (
          !["question", "instruments", "parts", "answer format", "process"].includes(key) &&
          Array.isArray(opts)
        ) {
          opts.forEach((val) => {
            allQuestions.push({
              ...base,
              correctAnswer: val
            });
          });
        }
      });
    });
  
    return allQuestions;
  }
