import {
  DIFFICULTIES,
  DAN_VALUES,
  createChallengeQuestions,
  createPracticeQuestions,
  createAnswerChoices,
  formatAnswer,
  formatQuestion,
  getDifficulty,
} from "./game.js";
import {
  advanceQuestion,
  failChallenge,
  finishPractice,
  getCurrentQuestion,
  getState,
  recordWrong,
  resetPracticeRun,
  resetToHome,
  setChallengeDifficulty,
  setMode,
  setPracticeDifficulty,
  setView,
  startRetry,
  startRun,
  succeedChallenge,
  toggleDan,
} from "./state.js";
import { startQuestionTimer, stopQuestionTimer } from "./timer.js";

const VIEW_IDS = {
  home: "#view-home",
  "practice-setup": "#view-practice-setup",
  "challenge-setup": "#view-challenge-setup",
  play: "#view-play",
  reveal: "#view-reveal",
  "practice-result": "#view-practice-result",
  "challenge-fail": "#view-challenge-fail",
  "challenge-success": "#view-challenge-success",
};

const els = {
  views: {},
  btnPractice: document.querySelector("#btn-practice"),
  btnChallenge: document.querySelector("#btn-challenge"),
  practiceDifficulty: document.querySelector("#practice-difficulty"),
  challengeDifficulty: document.querySelector("#challenge-difficulty"),
  danOptions: document.querySelector("#dan-options"),
  btnStartPractice: document.querySelector("#btn-start-practice"),
  btnStartChallenge: document.querySelector("#btn-start-challenge"),
  playTitle: document.querySelector("#play-title"),
  questionCount: document.querySelector("#question-count"),
  difficultyLabel: document.querySelector("#difficulty-label"),
  timerBar: document.querySelector("#timer-bar"),
  questionExpression: document.querySelector("#question-expression"),
  answerOptions: document.querySelector("#answer-options"),
  answerReveal: document.querySelector("#answer-reveal"),
  revealDots: document.querySelector("#reveal-dots"),
  practiceResultPanel: document.querySelector("#practice-result-panel"),
  challengeFailAnswer: document.querySelector("#challenge-fail-answer"),
  challengeSuccessCopy: document.querySelector("#challenge-success-copy"),
  btnFailOk: document.querySelector("#btn-fail-ok"),
  btnSuccessOk: document.querySelector("#btn-success-ok"),
};

let acceptingAnswer = false;
let revealTimeout = 0;
let revealInterval = 0;
let activeQuestionKey = "";

export function bootstrapUI() {
  Object.entries(VIEW_IDS).forEach(([key, selector]) => {
    els.views[key] = document.querySelector(selector);
  });

  renderStaticOptions();
  bindEvents();
  render();
}

function bindEvents() {
  document.querySelectorAll("[data-home]").forEach((button) => {
    button.addEventListener("click", goHome);
  });

  els.btnPractice.addEventListener("click", () => {
    setMode("practice");
    setView("practice-setup");
    render();
  });

  els.btnChallenge.addEventListener("click", () => {
    setMode("challenge");
    setView("challenge-setup");
    render();
  });

  els.practiceDifficulty.addEventListener("click", (event) => {
    const button = event.target.closest("[data-difficulty]");
    if (!button) return;
    setPracticeDifficulty(button.dataset.difficulty);
    render();
  });

  els.challengeDifficulty.addEventListener("click", (event) => {
    const button = event.target.closest("[data-difficulty]");
    if (!button) return;
    setChallengeDifficulty(button.dataset.difficulty);
    render();
  });

  els.danOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-dan]");
    if (!button) return;
    toggleDan(Number(button.dataset.dan));
    render();
  });

  els.btnStartPractice.addEventListener("click", () => {
    const state = getState();
    if (!state.practiceDifficultyId || state.selectedDans.length === 0) return;
    startRun({
      mode: "practice",
      difficultyId: state.practiceDifficultyId,
      questions: createPracticeQuestions(state.selectedDans),
    });
    render();
  });

  els.btnStartChallenge.addEventListener("click", () => {
    const state = getState();
    if (!state.challengeDifficultyId) return;
    startRun({
      mode: "challenge",
      difficultyId: state.challengeDifficultyId,
      questions: createChallengeQuestions(),
    });
    render();
  });

  els.answerOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-answer]");
    if (!button) return;
    submitAnswer(Number(button.dataset.answer), button);
  });

  els.btnFailOk.addEventListener("click", goHome);
  els.btnSuccessOk.addEventListener("click", goHome);
}

function renderStaticOptions() {
  els.practiceDifficulty.replaceChildren(...DIFFICULTIES.map(createDifficultyButton));
  els.challengeDifficulty.replaceChildren(...DIFFICULTIES.map(createDifficultyButton));
  els.danOptions.replaceChildren(...DAN_VALUES.map(createDanButton));
}

function createDifficultyButton(difficulty) {
  const button = document.createElement("button");
  button.className = `option-btn difficulty-btn is-${difficulty.id}`;
  button.type = "button";
  button.dataset.difficulty = difficulty.id;
  button.innerHTML = `
    <span class="difficulty-figure" aria-hidden="true">
      <img src="assets/lemoni-character-small.png" alt="" />
    </span>
    <span class="difficulty-name">${difficulty.name}</span>
  `;
  return button;
}

function createDanButton(dan) {
  const button = document.createElement("button");
  button.className = "dan-btn";
  button.type = "button";
  button.dataset.dan = String(dan);
  button.textContent = `${dan}단`;
  return button;
}

function render() {
  const state = getState();
  renderViews(state.view);
  renderSetupSelections();

  if (state.view === "play") {
    renderPlay();
    return;
  }

  if (state.view === "practice-result") renderPracticeResult();
  if (state.view === "challenge-fail") renderChallengeFail();
  if (state.view === "challenge-success") renderChallengeSuccess();
}

function renderViews(activeView) {
  Object.entries(els.views).forEach(([key, view]) => {
    view.classList.toggle("is-active", key === activeView);
  });
}

function renderSetupSelections() {
  const state = getState();
  markSelected(els.practiceDifficulty, "[data-difficulty]", state.practiceDifficultyId, "difficulty");
  markSelected(els.challengeDifficulty, "[data-difficulty]", state.challengeDifficultyId, "difficulty");

  els.danOptions.querySelectorAll("[data-dan]").forEach((button) => {
    const selected = state.selectedDans.includes(Number(button.dataset.dan));
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });

  els.btnStartPractice.disabled = !state.practiceDifficultyId || state.selectedDans.length === 0;
  els.btnStartChallenge.disabled = !state.challengeDifficultyId;
}

function markSelected(root, selector, selectedValue, dataKey) {
  root.querySelectorAll(selector).forEach((button) => {
    const selected = button.dataset[dataKey] === selectedValue;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });
}

function renderPlay() {
  const state = getState();
  const question = getCurrentQuestion();
  if (!question) return;

  const nextQuestionKey = `${state.mode}:${state.currentIndex}:${question.id}`;
  const difficulty = getDifficulty(state.activeDifficultyId);
  els.playTitle.textContent = state.mode === "challenge" ? "도전" : state.isRetry ? "다시 풀기" : "연습";
  els.questionCount.textContent = `${state.currentIndex + 1} / ${state.questions.length}`;
  els.difficultyLabel.textContent = difficulty.name;
  els.questionExpression.textContent = formatQuestion(question);
  els.views.play.dataset.difficulty = difficulty.id;
  renderAnswerChoices(question);
  activeQuestionKey = nextQuestionKey;
  acceptingAnswer = true;

  startQuestionTimer({
    seconds: difficulty.seconds,
    onTick: (ratio) => {
      els.timerBar.style.transform = `scaleX(${ratio})`;
    },
    onExpire: () => {
      handleWrong(question, nextQuestionKey);
    },
  });
}

function renderAnswerChoices(question) {
  const fragment = document.createDocumentFragment();
  createAnswerChoices(question).forEach((choice) => {
    const button = document.createElement("button");
    button.className = "answer-choice";
    button.type = "button";
    button.dataset.answer = String(choice);
    button.textContent = String(choice);
    fragment.append(button);
  });
  els.answerOptions.replaceChildren(fragment);
}

function submitAnswer(answer, selectedButton) {
  if (!acceptingAnswer) return;

  const question = getCurrentQuestion();
  if (!question) return;

  lockAnswerChoices();
  selectedButton?.blur();
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  stopQuestionTimer();

  if (answer === question.answer) {
    handleCorrect();
    return;
  }

  handleWrong(question, activeQuestionKey);
}

function lockAnswerChoices() {
  els.answerOptions.querySelectorAll(".answer-choice").forEach((button) => {
    button.disabled = true;
  });
}

function handleCorrect() {
  acceptingAnswer = false;
  const answeredQuestionKey = activeQuestionKey;
  window.setTimeout(() => {
    if (answeredQuestionKey !== activeQuestionKey) return;
    advanceQuestion();
    moveAfterQuestion();
  }, 120);
}

function handleWrong(question, questionKey) {
  if (!acceptingAnswer) return;
  if (questionKey !== activeQuestionKey) return;
  acceptingAnswer = false;
  stopQuestionTimer();

  const state = getState();
  recordWrong(question);

  if (state.mode === "challenge") {
    failChallenge(question);
    render();
    return;
  }

  showAnswerReveal(question);
}

function moveAfterQuestion() {
  const state = getState();
  if (state.currentIndex < state.questions.length) {
    setView("play");
    render();
    return;
  }

  if (state.mode === "challenge") {
    succeedChallenge();
  } else {
    finishPractice();
  }
  render();
}

function showAnswerReveal(question) {
  const revealQuestionKey = activeQuestionKey;
  clearRevealTimers();
  stopQuestionTimer();
  setView("reveal");
  els.answerReveal.textContent = formatAnswer(question);
  els.revealDots.textContent = "...";
  renderViews("reveal");

  let dots = 3;
  revealInterval = window.setInterval(() => {
    dots -= 1;
    els.revealDots.textContent = ".".repeat(Math.max(1, dots));
  }, 1000);

  revealTimeout = window.setTimeout(() => {
    if (revealQuestionKey !== activeQuestionKey) return;
    clearRevealTimers();
    advanceQuestion();
    moveAfterQuestion();
  }, 3000);
}

function renderPracticeResult() {
  const state = getState();
  const allCorrect = state.wrongQuestions.length === 0;

  if (allCorrect) {
    els.practiceResultPanel.classList.add("celebrate");
    els.practiceResultPanel.innerHTML = `
      <div class="confetti" aria-hidden="true"></div>
      <img src="assets/lemoni-character.png" alt="" class="result-lemon" />
      <p class="success-copy">모두 맞혔어!</p>
      <p class="result-copy">레몬이가 깜짝 놀랐어.</p>
      <div class="result-actions">
        <button id="btn-practice-again" class="secondary-btn" type="button">계속하기</button>
        <button id="btn-practice-home" class="primary-btn" type="button">확인</button>
      </div>
    `;
    els.practiceResultPanel.querySelector("#btn-practice-again").addEventListener("click", () => {
      resetPracticeRun();
      render();
    });
    els.practiceResultPanel.querySelector("#btn-practice-home").addEventListener("click", goHome);
    return;
  }

  els.practiceResultPanel.classList.remove("celebrate");
  els.practiceResultPanel.innerHTML = `
    <img src="assets/lemoni-character-small.png" alt="" class="result-lemon small" />
    <p class="result-copy">${state.wrongQuestions.length}문제를 다시 풀어보자.</p>
    <div class="result-actions">
      <button id="btn-retry-wrong" class="primary-btn" type="button">틀린 문제 다시 풀기</button>
      <button id="btn-stop-practice" class="secondary-btn" type="button">그만하기</button>
    </div>
  `;
  els.practiceResultPanel.querySelector("#btn-retry-wrong").addEventListener("click", () => {
    startRetry(state.wrongQuestions);
    render();
  });
  els.practiceResultPanel.querySelector("#btn-stop-practice").addEventListener("click", () => {
    resetPracticeRun();
    render();
  });
}

function renderChallengeFail() {
  const missed = getState().lastMissedQuestion;
  els.challengeFailAnswer.textContent = missed ? formatAnswer(missed) : "";
}

function renderChallengeSuccess() {
  const difficulty = getDifficulty(getState().activeDifficultyId);
  els.challengeSuccessCopy.textContent = `${difficulty.name}를 이겼다!`;
}

function goHome() {
  clearRevealTimers();
  stopQuestionTimer();
  acceptingAnswer = false;
  activeQuestionKey = "";
  resetToHome();
  render();
}

function clearRevealTimers() {
  if (revealTimeout) {
    clearTimeout(revealTimeout);
    revealTimeout = 0;
  }
  if (revealInterval) {
    clearInterval(revealInterval);
    revealInterval = 0;
  }
}
