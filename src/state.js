const initialState = {
  view: "home",
  mode: null,
  practiceDifficultyId: null,
  challengeDifficultyId: null,
  reverseChallengeDifficultyId: null,
  selectedDans: [],
  activeDifficultyId: null,
  questions: [],
  currentIndex: 0,
  wrongQuestions: [],
  lastMissedQuestion: null,
  isRetry: false,
  tableAnswersVisible: true,
};

const state = structuredClone(initialState);

export function getState() {
  return state;
}

export function resetToHome() {
  Object.assign(state, structuredClone(initialState));
}

export function setView(view) {
  state.view = view;
}

export function setTableAnswersVisible(visible) {
  state.tableAnswersVisible = visible;
}

export function setMode(mode) {
  state.mode = mode;
}

export function setPracticeDifficulty(id) {
  state.practiceDifficultyId = id;
}

export function setChallengeDifficulty(id) {
  state.challengeDifficultyId = id;
}

export function setReverseChallengeDifficulty(id) {
  state.reverseChallengeDifficultyId = id;
}

export function toggleDan(dan) {
  const exists = state.selectedDans.includes(dan);
  state.selectedDans = exists
    ? state.selectedDans.filter((value) => value !== dan)
    : [...state.selectedDans, dan].sort((a, b) => a - b);
}

export function startRun({ mode, difficultyId, questions, isRetry = false }) {
  state.mode = mode;
  state.activeDifficultyId = difficultyId;
  state.questions = [...questions];
  state.currentIndex = 0;
  state.wrongQuestions = [];
  state.lastMissedQuestion = null;
  state.isRetry = isRetry;
  state.view = "play";
}

export function startRetry(questions) {
  startRun({
    mode: "practice",
    difficultyId: state.activeDifficultyId,
    questions,
    isRetry: true,
  });
}

export function getCurrentQuestion() {
  return state.questions[state.currentIndex] ?? null;
}

export function recordWrong(question) {
  state.lastMissedQuestion = question;
  state.wrongQuestions.push(question);
}

export function advanceQuestion() {
  state.currentIndex += 1;
}

export function finishPractice() {
  state.view = "practice-result";
}

export function failChallenge(question) {
  state.lastMissedQuestion = question;
  state.view = "challenge-fail";
}

export function succeedChallenge() {
  state.view = "challenge-success";
}

export function resetPracticeRun() {
  state.questions = [];
  state.currentIndex = 0;
  state.wrongQuestions = [];
  state.lastMissedQuestion = null;
  state.activeDifficultyId = null;
  state.isRetry = false;
  state.view = "practice-setup";
}
