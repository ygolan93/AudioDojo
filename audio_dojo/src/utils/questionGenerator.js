// utils/questionGenerator.js

// -------- helpers --------
const FREQUENCY_POOL = [
  "60Hz", "120Hz", "250Hz", "500Hz",
  "1KHz", "2KHz", "4KHz", "8KHz", "10KHz", "12KHz"
];

function shuffleArray(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function toNum(x) {
  if (x == null) return NaN;
  const s = String(x).toLowerCase().trim();
  if (s.includes(":")) return parseFloat(s.split(":")[0]); // e.g. "4:1"
  const n = parseFloat(s.replace(/[^0-9.+-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function addUnitIfNeeded(val, unit) {
  if (!unit) return String(val);
  const s = String(val);
  if (s.toLowerCase().includes(unit.toLowerCase())) return s;
  return `${s}${unit}`;
}

function ensureArray(x) {
  if (Array.isArray(x)) return x;
  if (x == null) return [];
  return [x];
}

// Build four answers (1 correct + 3 distractors) from a pool
function buildMCAnswers(correct, pool, unit) {
  const all = pool.filter((v) => String(v) !== String(correct));
  const wrong = shuffleArray(all).slice(0, 3).map((v) => ({
    text: addUnitIfNeeded(v, unit),
    isCorrect: false,
  }));
  const ans = shuffleArray([
    { text: addUnitIfNeeded(correct, unit), isCorrect: true },
    ...wrong,
  ]);
  return ans;
}

// -------- main --------
/**
 * @param {Array<Object>} templates - firebase templates already filtered by sample bank if needed
 * Each template is expected to look like:
 * {
 *   question: "Which frequency was boosted?",
 *   process: "EQ" | "Compression" | "Reverb" | "Saturation" | ...,
 *   parts: ["Kick"],                       // instrument at index 0
 *   options: { frequency:[...], gain:[...], shape:[...] }, // per process
 *   answerFormat: { frequency:"Hz", gain:"dB", attack:"ms", release:"ms", ... } // optional
 * }
 */
export function generateQuestionsFromTemplates(templates = []) {
  const allQuestions = [];

  templates.forEach((template) => {
    const countBefore = allQuestions.length;

    const process = template.process || "EQ";
    const parts = ensureArray(template.parts && template.parts.length ? template.parts : [template.instrument || template.instruments || "Unknown"]);
    const instrument = parts[0];

    // unify options source
    const optsObj =
      template.options ||
      template.params ||
      template.variations ||
      {};

    const fmt = template.answerFormat || {};

    // ---------- EQ: handle frequency / gain / shape ----------
    if (process === "EQ") {
      const freqArr = ensureArray(optsObj.frequency && optsObj.frequency.length ? optsObj.frequency : FREQUENCY_POOL);
      const gainArr = ensureArray(optsObj.gain);
      const shapeArr = ensureArray(optsObj.shape);

      const questionText = String(template.question || "Which frequency was boosted?");

      // If both frequency & gain exist, create combo questions like "80Hz +12dB"
      if (freqArr.length && gainArr.length && /boost|cut/i.test(questionText)) {
        for (const f of freqArr) {
          for (const g of gainArr) {
            const correct = `${addUnitIfNeeded(f, fmt.frequency || (/[kK]?Hz$/.test(f) ? "" : "Hz"))} ${addUnitIfNeeded(g, fmt.gain || (/[dD]B$/.test(g) ? "" : "dB"))}`;

            // Build pool of combos for distractors (same space-separated format)
            const comboPool = [];
            for (const f2 of freqArr) comboPool.push(`${addUnitIfNeeded(f2, fmt.frequency || "Hz")} ${addUnitIfNeeded(g, fmt.gain || "dB")}`);
            for (const g2 of gainArr) comboPool.push(`${addUnitIfNeeded(f, fmt.frequency || "Hz")} ${addUnitIfNeeded(g2, fmt.gain || "dB")}`);

            const answers = shuffleArray([
              { text: correct, isCorrect: true },
              ...shuffleArray(
                comboPool.filter((x) => x !== correct)
              )
                .slice(0, 3)
                .map((t) => ({ text: t, isCorrect: false })),
            ]);

            allQuestions.push({
              question: questionText,
              process,
              parts,
              instrument,
              frequency: f,
              gain: g,
              answers,
              correctAnswer: correct,
              id: `${questionText}-${instrument}-${f}-${g}`,
            });
          }
        }
      } else if (freqArr.length && /frequency/i.test(questionText)) {
        // frequency-only question
        for (const f of freqArr) {
          const answers = buildMCAnswers(f, freqArr, fmt.frequency || "Hz");
          allQuestions.push({
            question: questionText,
            process,
            parts,
            instrument,
            frequency: f,
            answers,
            correctAnswer: addUnitIfNeeded(f, fmt.frequency || "Hz"),
            id: `${questionText}-${instrument}-freq-${f}`,
          });
        }
      }

      // shape questions (if the template is about shelf/bell etc.)
      if (shapeArr.length && /shelf|shape|bell|cut/i.test(questionText)) {
        for (const s of shapeArr) {
          const answers = buildMCAnswers(s, shapeArr, "");
          allQuestions.push({
            question: questionText,
            process,
            parts,
            instrument,
            shape: s,
            answers,
            correctAnswer: String(s),
            id: `${questionText}-${instrument}-shape-${s}`,
          });
        }
      }
    }

    // ---------- Other processes (Compression / Reverb / Saturation / ...) ----------
    else {
      // Take every option array in optsObj and turn it into a question-family.
      // For each key K with array V[], create MC questions where correctAnswer is a single value from V[].
      // Add paramKey/paramValue to each pushed question so the app can filter by ProcessSetup.
      Object.entries(optsObj).forEach(([key, values]) => {
        const arr = ensureArray(values);
        if (!arr.length) return;

        const unit = (fmt && fmt[key]) || ""; // e.g. ms/dB/s/ratio/…
        const qText =
          String(template.question || `Pick ${key}`);

        for (const val of arr) {
          const answers = buildMCAnswers(val, arr, unit);

          allQuestions.push({
            question: qText,
            process,
            parts,
            instrument,

            // tagging for filtering later (THIS IS THE NEW ADDITION)
            paramKey: key,
            paramValue: val,

            answers,
            correctAnswer: addUnitIfNeeded(val, unit),
            id: `${qText}-${instrument}-${key}-${val}`,
          });
        }
      });
    }

    // console summary per template
    const created = allQuestions.length - countBefore;
    if (created > 0) {
      // eslint-disable-next-line no-console
      console.log("✅ Created", created, "questions for:", template.question || template.process || "template");
    }
  });

  return allQuestions;
}
