import {
  DIFFICULTIES,
  DAN_VALUES,
  createChallengeQuestions,
  createPracticeQuestions,
  createAnswerChoices,
  createReverseAnswerChoices,
  createReverseChallengeQuestions,
  formatAnswer,
  formatQuestion,
  formatReverseQuestion,
  getDifficulty,
} from "./game.js?v=20260702-3";
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
  setReverseChallengeDifficulty,
  setTableAnswersVisible,
  setView,
  startRetry,
  startRun,
  succeedChallenge,
  toggleDan,
} from "./state.js?v=20260702-3";
import { startQuestionTimer, stopQuestionTimer } from "./timer.js?v=20260702-3";

const DIFFICULTY_IMAGES = {
  super: "assets/difficulty-super-character.png",
  normal: "assets/lemoni-character-small.png",
  weak: "assets/difficulty-weak-character.png",
};

const PRIZE_STORAGE_KEY = "lemoni.challengePrizes";
const DEFAULT_CHALLENGE_PRIZES = {
  super: "인형",
  normal: "스퀴시",
  weak: "필통",
};
const REVERSE_PRIZE_STORAGE_KEY = "lemoni.reverseChallengePrizes";
const DEFAULT_REVERSE_CHALLENGE_PRIZES = {
  super: "외식",
  normal: "아이스크림",
  weak: "과자",
};

const homeWelcomeMessages = [
  "어서 와! 오늘도 구구단을 반짝반짝 익혀보자.",
  "기다리고 있었어. 레몬이랑 같이 시작해볼까?",
  "오늘의 구구단 모험은 여기서 시작이야!",
  "좋아, 몸풀기부터 도전까지 내가 함께할게.",
  "레몬이가 준비 완료! 너도 준비됐지?",
  "한 문제씩 차근차근 가면 금방 강해질 거야.",
  "오늘은 어떤 단이 제일 잘 맞을까?",
  "집중력 충전 완료! 구구단 세계로 출발.",
  "실수해도 괜찮아. 다시 해보면 돼!",
  "레몬이가 응원 중이야. 자신 있게 눌러봐.",
  "짧게 연습해도 좋아. 꾸준히 하면 멋져져!",
  "구구단 감각을 깨우는 시간!",
  "오늘도 숫자들이 우리를 기다리고 있어.",
  "천천히 봐도 돼. 정확하게 맞히면 최고야.",
  "레몬이와 함께라면 구구단도 재밌어져!",
  "준비 운동 끝! 머리를 말랑하게 풀어보자.",
  "작은 성공을 하나씩 모아보자.",
  "어떤 메뉴부터 해볼래? 내가 옆에 있을게.",
  "오늘의 레몬 파워를 보여줄 시간이야.",
  "구구단 실력이 쑥쑥 자라는 소리가 들려!",
];

const challengeIntroMessages = {
  super: [
    "나는 슈퍼 레몬이야! 3초 안에 맞힐 수 있겠어?",
    "너무 빠르다고 놀라지 마! 준비됐지?",
    "이번엔 진짜 빠르다! 나를 이겨봐!",
    "3초면 충분하지? 자신 있으면 시작해!",
    "눈 깜짝할 사이에 문제가 지나갈 거야!",
    "빠른 두뇌가 필요해! 도전해볼래?",
    "구구단 번개처럼 풀 수 있겠어?",
    "나는 엄청 강해! 그래도 한번 붙어보자!",
    "망설이면 늦어! 바로바로 맞혀봐!",
    "슈퍼 속도로 간다! 준비 완료?",
  ],
  normal: [
    "나는 평범 레몬이야! 침착하게 풀면 이길 수 있을걸?",
    "5초 안에 척척 맞혀봐!",
    "너의 구구단 실력을 보여줘!",
    "이번엔 내가 쉽게 지지 않을 거야!",
    "천천히 생각하고 빠르게 대답해봐!",
    "나랑 딱 좋은 승부를 해보자!",
    "구구단을 얼마나 잘 외웠는지 볼까?",
    "집중하면 충분히 이길 수 있어!",
    "너도 준비됐지? 나도 준비됐어!",
    "실수만 조심하면 이길 수 있을지도 몰라!",
  ],
  weak: [
    "나는 허약 레몬이야… 그래도 쉽게 이기진 않을 거야!",
    "7초나 줄게! 이번엔 맞힐 수 있지?",
    "천천히 풀어도 돼. 하지만 방심하면 안 돼!",
    "나 약해 보여도 구구단은 자신 있다구!",
    "조금 느려도 괜찮아! 끝까지 풀어봐!",
    "후우… 힘은 약하지만 문제는 낼 수 있어!",
    "쉽다고 생각하면 큰일 날걸?",
    "이번엔 내가 살살 해줄게!",
    "차분하게 풀면 분명 이길 수 있어!",
    "나를 이기고 자신감을 얻어봐!",
  ],
};

const challengeWelcomeMessages = [
  "구구단 도전장에 온 걸 환영해!",
  "오늘은 레몬이를 이길 준비가 됐니?",
  "멋진 구구단 실력을 보여줄 시간이야!",
  "두근두근! 어떤 레몬이에게 도전해볼까?",
  "자신감을 가지고 도전해봐!",
  "실수해도 괜찮아. 도전하는 게 멋진 거야!",
  "집중하면 분명 좋은 결과가 있을 거야!",
  "구구단 용사님, 도전을 시작해볼까요?",
  "레몬이가 너의 도전을 기다리고 있어!",
  "오늘의 구구단 챔피언은 누가 될까?",
];

let challengePrizes = loadChallengePrizes();
let reverseChallengePrizes = loadReverseChallengePrizes();

const VIEW_IDS = {
  home: "#view-home",
  settings: "#view-settings",
  table: "#view-table",
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
  btnSettings: document.querySelector("#btn-settings"),
  homeWelcomeMessage: document.querySelector("#home-welcome-message"),
  btnPractice: document.querySelector("#btn-practice"),
  btnChallenge: document.querySelector("#btn-challenge"),
  btnReverseChallenge: document.querySelector("#btn-reverse-challenge"),
  btnTable: document.querySelector("#btn-table"),
  settingsPrizeForm: document.querySelector("#settings-prize-form"),
  btnToggleTableAnswers: document.querySelector("#btn-toggle-table-answers"),
  tableScroll: document.querySelector("#table-scroll"),
  tableSections: document.querySelector("#table-sections"),
  tableDanNav: document.querySelector("#table-dan-nav"),
  practiceDifficulty: document.querySelector("#practice-difficulty"),
  challengeDifficulty: document.querySelector("#challenge-difficulty"),
  challengeSetupTitle: document.querySelector("#challenge-setup-title"),
  challengeIntroMessage: document.querySelector("#challenge-intro-message"),
  danOptions: document.querySelector("#dan-options"),
  btnStartPractice: document.querySelector("#btn-start-practice"),
  btnStartChallenge: document.querySelector("#btn-start-challenge"),
  playTitle: document.querySelector("#play-title"),
  questionCount: document.querySelector("#question-count"),
  difficultyLabel: document.querySelector("#difficulty-label"),
  difficultyImage: document.querySelector("#difficulty-image"),
  timerBar: document.querySelector("#timer-bar"),
  opponentLemon: document.querySelector("#opponent-lemon"),
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
let currentHomeWelcomeMessage = getRandomItem(homeWelcomeMessages);
let currentChallengeIntroMessage = "";
let isChallengeWelcomeMessage = true;
let activeTableDan = DAN_VALUES[0];
const THINKING_IMAGES = ["assets/thinking-character-1.png", "assets/thinking-character-2.png"];

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

  els.btnSettings.addEventListener("click", () => {
    setMode("settings");
    setView("settings");
    render();
  });

  els.btnChallenge.addEventListener("click", () => {
    setMode("challenge");
    setView("challenge-setup");
    setRandomChallengeWelcomeMessage();
    render();
  });

  els.btnReverseChallenge.addEventListener("click", () => {
    setMode("reverse-challenge");
    setView("challenge-setup");
    setRandomChallengeWelcomeMessage();
    render();
  });

  els.btnTable.addEventListener("click", () => {
    setMode("table");
    setView("table");
    setTableAnswersVisible(true);
    activeTableDan = DAN_VALUES[0];
    render();
    requestAnimationFrame(() => scrollToDan(DAN_VALUES[0], "auto"));
  });

  els.btnToggleTableAnswers.addEventListener("click", () => {
    setTableAnswersVisible(!getState().tableAnswersVisible);
    renderTable();
  });

  els.settingsPrizeForm.addEventListener("input", (event) => {
    const input = event.target.closest("[data-prize-difficulty]");
    if (!input) return;
    updatePrize(input.dataset.prizeKind, input.dataset.prizeDifficulty, input.value);
    if (getState().view === "challenge-setup" && isChallengeWelcomeMessage) {
      renderChallengeIntroMessage(getState());
    }
  });

  els.settingsPrizeForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  els.tableScroll.addEventListener("scroll", updateActiveTableDan, { passive: true });

  els.tableDanNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-table-dan]");
    if (!button) return;
    scrollToDan(Number(button.dataset.tableDan), "smooth");
  });

  els.tableSections.addEventListener("click", (event) => {
    const button = event.target.closest("[data-table-answer]");
    if (!button) return;
    button.classList.add("is-revealed");
    button.textContent = button.dataset.tableAnswer;
    button.setAttribute("aria-label", `${button.dataset.tableAnswer} 정답`);
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
    if (getState().mode === "reverse-challenge") {
      setReverseChallengeDifficulty(button.dataset.difficulty);
    } else {
      setChallengeDifficulty(button.dataset.difficulty);
    }
    currentChallengeIntroMessage = getRandomChallengeIntroMessage(button.dataset.difficulty);
    isChallengeWelcomeMessage = false;
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
    const isReverseChallenge = state.mode === "reverse-challenge";
    const difficultyId = isReverseChallenge ? state.reverseChallengeDifficultyId : state.challengeDifficultyId;
    if (!difficultyId) return;
    startRun({
      mode: isReverseChallenge ? "reverse-challenge" : "challenge",
      difficultyId,
      questions: isReverseChallenge ? createReverseChallengeQuestions() : createChallengeQuestions(),
    });
    render();
  });

  els.answerOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-answer]");
    if (!button) return;
    submitAnswer(button.dataset.answer, button);
  });

  els.btnFailOk.addEventListener("click", goHome);
  els.btnSuccessOk.addEventListener("click", goHome);
}

function renderStaticOptions() {
  els.practiceDifficulty.replaceChildren(...DIFFICULTIES.map(createDifficultyButton));
  els.challengeDifficulty.replaceChildren(...DIFFICULTIES.map(createDifficultyButton));
  els.danOptions.replaceChildren(...DAN_VALUES.map(createDanButton));
  renderTableSections();
  renderTableDanNav();
}

function createDifficultyButton(difficulty) {
  const button = document.createElement("button");
  const imageSrc = DIFFICULTY_IMAGES[difficulty.id] ?? DIFFICULTY_IMAGES.normal;
  button.className = `option-btn difficulty-btn is-${difficulty.id}`;
  button.type = "button";
  button.dataset.difficulty = difficulty.id;
  button.setAttribute("aria-label", difficulty.name);
  button.innerHTML = `
    <span class="difficulty-figure" aria-hidden="true">
      <img src="${imageSrc}" alt="" />
    </span>
    <span class="difficulty-label" aria-hidden="true">${difficulty.name.replace(" 레몬이", "")}</span>
  `;
  return button;
}

function createDanButton(dan) {
  const button = document.createElement("button");
  button.className = "dan-btn";
  button.type = "button";
  button.dataset.dan = String(dan);
  button.setAttribute("aria-label", `${dan}단`);
  button.textContent = String(dan);
  return button;
}

function render() {
  const state = getState();
  renderViews(state.view);
  renderSetupSelections();

  if (state.view === "home") renderHomeWelcomeMessage();
  if (state.view === "settings") renderSettings();
  if (state.view === "play") {
    renderPlay();
    return;
  }

  if (state.view === "table") renderTable();
  if (state.view === "practice-result") renderPracticeResult();
  if (state.view === "challenge-fail") renderChallengeFail();
  if (state.view === "challenge-success") renderChallengeSuccess();
}

function renderHomeWelcomeMessage() {
  els.homeWelcomeMessage.textContent = currentHomeWelcomeMessage;
}

function renderViews(activeView) {
  Object.entries(els.views).forEach(([key, view]) => {
    view.classList.toggle("is-active", key === activeView);
  });
}

function renderSetupSelections() {
  const state = getState();
  markSelected(els.practiceDifficulty, "[data-difficulty]", state.practiceDifficultyId, "difficulty");
  markSelected(
    els.challengeDifficulty,
    "[data-difficulty]",
    state.mode === "reverse-challenge" ? state.reverseChallengeDifficultyId : state.challengeDifficultyId,
    "difficulty",
  );
  renderChallengeIntroMessage(state);
  els.challengeSetupTitle.textContent = state.mode === "reverse-challenge" ? "거꾸로 도전" : "도전";

  els.danOptions.querySelectorAll("[data-dan]").forEach((button) => {
    const selected = state.selectedDans.includes(Number(button.dataset.dan));
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });

  els.btnStartPractice.disabled = !state.practiceDifficultyId || state.selectedDans.length === 0;
  els.btnStartChallenge.disabled = state.mode === "reverse-challenge"
    ? !state.reverseChallengeDifficultyId
    : !state.challengeDifficultyId;
}

function renderChallengeIntroMessage(state) {
  if (state.view === "challenge-setup" && !currentChallengeIntroMessage) {
    setRandomChallengeWelcomeMessage();
  }

  const shouldShow = state.view === "challenge-setup" && currentChallengeIntroMessage;
  els.challengeIntroMessage.hidden = !shouldShow;
  els.challengeIntroMessage.classList.toggle("is-welcome", shouldShow && isChallengeWelcomeMessage);
  els.challengeIntroMessage.classList.toggle("is-lemon", shouldShow && !isChallengeWelcomeMessage);

  if (!shouldShow) {
    els.challengeIntroMessage.replaceChildren();
    return;
  }

  if (isChallengeWelcomeMessage) {
    els.challengeIntroMessage.replaceChildren(createChallengeWelcomeContent(currentChallengeIntroMessage));
    return;
  }

  els.challengeIntroMessage.textContent = currentChallengeIntroMessage;
}

function renderSettings() {
  els.settingsPrizeForm.querySelectorAll("[data-prize-difficulty]").forEach((input) => {
    const difficultyId = input.dataset.prizeDifficulty;
    const prizeKind = input.dataset.prizeKind;
    input.value = getPrize(prizeKind, difficultyId);
    input.placeholder = getDefaultPrizes(prizeKind)[difficultyId] ?? "";
  });
}

function createChallengeWelcomeContent(message) {
  const wrapper = document.createElement("span");
  wrapper.className = "challenge-message-content";

  const copy = document.createElement("span");
  copy.className = "challenge-message-copy";
  copy.textContent = message;

  const prizeBlock = document.createElement("span");
  prizeBlock.className = "challenge-prize-block";
  const prizeTitle = document.createElement("span");
  prizeTitle.className = "challenge-prize-title";
  prizeTitle.textContent = "승리 상품";

  const prizeTable = document.createElement("table");
  prizeTable.className = "challenge-prize-table";
  prizeTable.setAttribute("aria-label", "승리 상품");
  const tableBody = document.createElement("tbody");

  const prizeKind = getState().mode === "reverse-challenge" ? "reverse" : "challenge";
  DIFFICULTIES.forEach((difficulty) => {
    const row = document.createElement("tr");
    const name = document.createElement("th");
    name.scope = "row";
    name.textContent = difficulty.name.replace(" 레몬이", "");
    const value = document.createElement("td");
    value.textContent = getPrize(prizeKind, difficulty.id);
    row.append(name, value);
    tableBody.append(row);
  });
  prizeTable.append(tableBody);
  prizeBlock.append(prizeTitle, prizeTable);

  wrapper.append(copy, prizeBlock);
  return wrapper;
}

function markSelected(root, selector, selectedValue, dataKey) {
  root.querySelectorAll(selector).forEach((button) => {
    const selected = button.dataset[dataKey] === selectedValue;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });
}

function getRandomChallengeIntroMessage(difficultyId) {
  const messages = challengeIntroMessages[difficultyId] ?? challengeIntroMessages.normal;
  return messages[Math.floor(Math.random() * messages.length)];
}

function setRandomChallengeWelcomeMessage() {
  currentChallengeIntroMessage = getRandomItem(challengeWelcomeMessages);
  isChallengeWelcomeMessage = true;
}

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getPlayTitle(state) {
  if (state.mode === "challenge") return "도전";
  if (state.mode === "reverse-challenge") return "거꾸로 도전";
  return state.isRetry ? "다시 풀기" : "연습";
}

function renderPlay() {
  const state = getState();
  const question = getCurrentQuestion();
  if (!question) return;

  const nextQuestionKey = `${state.mode}:${state.currentIndex}:${question.id}`;
  const difficulty = getDifficulty(state.activeDifficultyId);
  els.playTitle.textContent = getPlayTitle(state);
  els.questionCount.textContent = `${state.currentIndex + 1} / ${state.questions.length}`;
  els.difficultyLabel.textContent = difficulty.name;
  els.difficultyImage.src = DIFFICULTY_IMAGES[difficulty.id] ?? DIFFICULTY_IMAGES.normal;
  els.questionExpression.textContent = state.mode === "reverse-challenge" ? formatReverseQuestion(question) : formatQuestion(question);
  els.views.play.dataset.difficulty = difficulty.id;
  els.opponentLemon.src = THINKING_IMAGES[state.currentIndex % THINKING_IMAGES.length];
  renderAnswerChoices(question, state.mode);
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

function renderAnswerChoices(question, mode) {
  const fragment = document.createDocumentFragment();
  const choices = mode === "reverse-challenge" ? createReverseAnswerChoices(question) : createAnswerChoices(question);
  els.answerOptions.dataset.choiceCount = String(choices.length);
  choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = "answer-choice";
    button.type = "button";
    if (mode === "reverse-challenge") {
      button.dataset.answer = choice.id;
      button.textContent = formatQuestion(choice);
    } else {
      button.dataset.answer = String(choice);
      button.textContent = String(choice);
    }
    fragment.append(button);
  });
  els.answerOptions.replaceChildren(fragment);
}

function renderTableSections() {
  const fragment = document.createDocumentFragment();

  DAN_VALUES.forEach((dan) => {
    const section = document.createElement("section");
    section.className = "dan-table-section";
    section.id = `dan-${dan}`;
    section.dataset.tableSectionDan = String(dan);
    section.setAttribute("aria-labelledby", `dan-${dan}-title`);

    const heading = document.createElement("h2");
    heading.id = `dan-${dan}-title`;
    heading.textContent = `${dan}단`;

    const rows = document.createElement("div");
    rows.className = "dan-table-rows";

    for (let multiplier = 1; multiplier <= 9; multiplier += 1) {
      rows.append(createTableRow(dan, multiplier));
    }

    section.append(heading, rows);
    fragment.append(section);
  });

  els.tableSections.replaceChildren(fragment);
}

function createTableRow(dan, multiplier) {
  const answer = dan * multiplier;
  const row = document.createElement("p");
  row.className = "dan-table-row";

  const expression = document.createElement("span");
  expression.className = "dan-table-expression";
  expression.textContent = `${dan} × ${multiplier} =`;

  const answerSlot = document.createElement("span");
  answerSlot.className = "dan-table-answer";
  answerSlot.dataset.answerValue = String(answer);
  answerSlot.textContent = String(answer);

  row.append(expression, answerSlot);
  return row;
}

function renderTableDanNav() {
  const fragment = document.createDocumentFragment();

  DAN_VALUES.forEach((dan) => {
    const button = document.createElement("button");
    button.className = "table-dan-btn";
    button.type = "button";
    button.dataset.tableDan = String(dan);
    button.textContent = String(dan);
    button.setAttribute("aria-label", `${dan}단으로 이동`);
    fragment.append(button);
  });

  els.tableDanNav.replaceChildren(fragment);
}

function renderTable() {
  const state = getState();
  const answersVisible = state.tableAnswersVisible;
  els.btnToggleTableAnswers.textContent = answersVisible ? "답숨기기" : "답보이기";
  els.btnToggleTableAnswers.setAttribute("aria-pressed", answersVisible ? "false" : "true");
  els.tableSections.classList.toggle("is-answer-hidden", !answersVisible);

  els.tableSections.querySelectorAll(".dan-table-answer").forEach((slot) => {
    const answer = slot.dataset.answerValue;
    if (answersVisible) {
      const visibleAnswer = document.createElement("span");
      visibleAnswer.className = "dan-table-answer";
      visibleAnswer.dataset.answerValue = answer;
      visibleAnswer.textContent = answer;
      slot.replaceWith(visibleAnswer);
      return;
    }

    const answerButton = document.createElement("button");
    answerButton.className = "dan-table-answer hidden-answer-btn";
    answerButton.type = "button";
    answerButton.dataset.answerValue = answer;
    answerButton.dataset.tableAnswer = answer;
    answerButton.dataset.tableAnswerRevealed = "false";
    answerButton.setAttribute("aria-label", "정답 보기");
    slot.replaceWith(answerButton);
  });

  requestAnimationFrame(updateActiveTableDan);
}

function updateActiveTableDan() {
  if (getState().view !== "table") return;

  const scrollTop = els.tableScroll.scrollTop;
  const targetLine = scrollTop + els.tableScroll.clientHeight * 0.28;
  let nextDan = activeTableDan;

  els.tableSections.querySelectorAll("[data-table-section-dan]").forEach((section) => {
    if (section.offsetTop <= targetLine) {
      nextDan = Number(section.dataset.tableSectionDan);
    }
  });

  if (activeTableDan !== nextDan) {
    activeTableDan = nextDan;
    updateTableDanButtons();
  }
}

function updateTableDanButtons() {
  els.tableDanNav.querySelectorAll("[data-table-dan]").forEach((button) => {
    button.classList.remove("is-selected");
    button.removeAttribute("aria-current");
  });
}

function scrollToDan(dan, behavior = "smooth") {
  const target = els.tableSections.querySelector(`[data-table-section-dan="${dan}"]`);
  if (!target) return;

  const scrollRect = els.tableScroll.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const top = els.tableScroll.scrollTop + targetRect.top - scrollRect.top;

  els.tableScroll.scrollTo({
    top,
    behavior,
  });
  activeTableDan = dan;
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

  if (isCorrectAnswer(answer, question)) {
    handleCorrect();
    return;
  }

  handleWrong(question, activeQuestionKey);
}

function isCorrectAnswer(answer, question) {
  if (getState().mode === "reverse-challenge") {
    return answer === question.id;
  }
  return Number(answer) === question.answer;
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

  if (isChallengeMode(state.mode)) {
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

  if (isChallengeMode(state.mode)) {
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
      <img src="assets/surprised-character.png" alt="" class="result-lemon" />
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
  const prizeKind = getState().mode === "reverse-challenge" ? "reverse" : "challenge";
  els.challengeSuccessCopy.textContent = `${difficulty.name}를 이겼다! ${getPrize(prizeKind, difficulty.id)} 획득!`;
}

function isChallengeMode(mode) {
  return mode === "challenge" || mode === "reverse-challenge";
}

function loadChallengePrizes() {
  try {
    const stored = window.localStorage.getItem(PRIZE_STORAGE_KEY);
    if (!stored) return { ...DEFAULT_CHALLENGE_PRIZES };
    const parsed = JSON.parse(stored);
    return normalizeChallengePrizes(parsed);
  } catch {
    return { ...DEFAULT_CHALLENGE_PRIZES };
  }
}

function loadReverseChallengePrizes() {
  try {
    const stored = window.localStorage.getItem(REVERSE_PRIZE_STORAGE_KEY);
    if (!stored) return { ...DEFAULT_REVERSE_CHALLENGE_PRIZES };
    const parsed = JSON.parse(stored);
    return normalizePrizes(parsed, DEFAULT_REVERSE_CHALLENGE_PRIZES);
  } catch {
    return { ...DEFAULT_REVERSE_CHALLENGE_PRIZES };
  }
}

function normalizeChallengePrizes(value) {
  return normalizePrizes(value, DEFAULT_CHALLENGE_PRIZES);
}

function normalizePrizes(value, defaultPrizes) {
  return Object.fromEntries(
    Object.entries(defaultPrizes).map(([difficultyId, defaultPrize]) => {
      const prize = typeof value?.[difficultyId] === "string" ? value[difficultyId].trim() : "";
      return [difficultyId, prize || defaultPrize];
    }),
  );
}

function updatePrize(prizeKind, difficultyId, prize) {
  if (prizeKind === "reverse") {
    if (!Object.hasOwn(DEFAULT_REVERSE_CHALLENGE_PRIZES, difficultyId)) return;
    reverseChallengePrizes = normalizePrizes({
      ...reverseChallengePrizes,
      [difficultyId]: prize,
    }, DEFAULT_REVERSE_CHALLENGE_PRIZES);
    saveReverseChallengePrizes();
    return;
  }

  if (!Object.hasOwn(DEFAULT_CHALLENGE_PRIZES, difficultyId)) return;
  challengePrizes = normalizePrizes({
    ...challengePrizes,
    [difficultyId]: prize,
  }, DEFAULT_CHALLENGE_PRIZES);
  saveChallengePrizes();
}

function getPrize(prizeKind, difficultyId) {
  const prizes = prizeKind === "reverse" ? reverseChallengePrizes : challengePrizes;
  const defaults = getDefaultPrizes(prizeKind);
  return prizes[difficultyId] ?? defaults[difficultyId] ?? "";
}

function getDefaultPrizes(prizeKind) {
  return prizeKind === "reverse" ? DEFAULT_REVERSE_CHALLENGE_PRIZES : DEFAULT_CHALLENGE_PRIZES;
}

function saveChallengePrizes() {
  try {
    window.localStorage.setItem(PRIZE_STORAGE_KEY, JSON.stringify(challengePrizes));
  } catch {
    // Playing should continue even when private browsing blocks storage.
  }
}

function saveReverseChallengePrizes() {
  try {
    window.localStorage.setItem(REVERSE_PRIZE_STORAGE_KEY, JSON.stringify(reverseChallengePrizes));
  } catch {
    // Playing should continue even when private browsing blocks storage.
  }
}

function goHome() {
  clearRevealTimers();
  stopQuestionTimer();
  acceptingAnswer = false;
  activeQuestionKey = "";
  currentHomeWelcomeMessage = getRandomItem(homeWelcomeMessages);
  currentChallengeIntroMessage = "";
  isChallengeWelcomeMessage = true;
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
