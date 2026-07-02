export const DIFFICULTIES = [
  { id: "super", name: "슈퍼 레몬이", seconds: 3 },
  { id: "normal", name: "평범 레몬이", seconds: 5 },
  { id: "weak", name: "허약 레몬이", seconds: 7 },
];

export const DAN_VALUES = [2, 3, 4, 5, 6, 7, 8, 9];
export const MULTIPLIERS = [2, 3, 4, 5, 6, 7, 8, 9];

export function getDifficulty(id) {
  return DIFFICULTIES.find((difficulty) => difficulty.id === id) ?? DIFFICULTIES[1];
}

export function createPracticeQuestions(selectedDans) {
  const dans = [...selectedDans].sort((a, b) => a - b);
  if (dans.length === 1) {
    return shuffle(createQuestionsForDan(dans[0]));
  }

  const byDan = new Map(dans.map((dan) => [dan, shuffle(createQuestionsForDan(dan))]));
  const questions = [];
  let cursor = 0;

  while (questions.length < 18) {
    const dan = dans[cursor % dans.length];
    const pool = byDan.get(dan);
    if (pool.length === 0) {
      byDan.set(dan, shuffle(createQuestionsForDan(dan)));
    }
    questions.push(byDan.get(dan).pop());
    cursor += 1;
  }

  return shuffle(questions);
}

export function createChallengeQuestions() {
  const allQuestions = DAN_VALUES.flatMap((dan) => createQuestionsForDan(dan));
  return shuffle(allQuestions).slice(0, 20);
}

export function createReverseChallengeQuestions() {
  return createChallengeQuestions();
}

export function formatQuestion(question) {
  return `${question.dan} × ${question.multiplier}`;
}

export function formatReverseQuestion(question) {
  return String(question.answer);
}

export function formatAnswer(question) {
  return `${question.dan} × ${question.multiplier} = ${question.answer}`;
}

export function createAnswerChoices(question) {
  const choices = new Set([question.answer]);
  const nearby = [-18, -12, -9, -8, -6, -4, -3, 3, 4, 6, 8, 9, 12, 18];

  while (choices.size < 3) {
    const offset = nearby[Math.floor(Math.random() * nearby.length)];
    const candidate = question.answer + offset;
    if (candidate > 0 && candidate <= 99) {
      choices.add(candidate);
    }
  }

  return shuffle([...choices]);
}

export function createReverseAnswerChoices(question) {
  const allQuestions = DAN_VALUES.flatMap((dan) => createQuestionsForDan(dan));
  const wrongChoices = allQuestions.filter((candidate) => candidate.answer !== question.answer);
  return shuffle([question, shuffle(wrongChoices)[0]]);
}

function createQuestionsForDan(dan) {
  return MULTIPLIERS.map((multiplier) => ({
    id: `${dan}x${multiplier}`,
    dan,
    multiplier,
    answer: dan * multiplier,
  }));
}

function shuffle(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}
