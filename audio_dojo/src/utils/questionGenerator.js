// Static frequency pool
const FREQUENCY_POOL = [
    "60Hz", "120Hz", "250Hz", "500Hz",
    "1KHz", "2KHz", "4KHz", "8KHz", "10KHz", "12KHz"
  ];
  
  // Generate full question list from templates
  export function generateQuestionsFromTemplates(templates) {
    const allQuestions = [];
  
    templates.forEach((template) => {
      const frequencies = template.frequency.includes("all")
        ? FREQUENCY_POOL
        : template.frequency;
  
      const gains = template.gain.includes(null)
        ? [null] // No gain needed
        : template.gain;
  
      frequencies.forEach((freq) => {
        if (Array.isArray(template["answer format"]) && template["answer format"].includes("dB")) {
          // Format includes gain → create for each gain
          gains.forEach((gain) => {
            allQuestions.push({
              ...template,
              correctAnswer: `${freq} @ ${gain}`
            });
          });
        } else {
          // Only frequency matters
          allQuestions.push({
            ...template,
            correctAnswer: freq
          });
        }
      });
    });
  
    return allQuestions;
  }
  