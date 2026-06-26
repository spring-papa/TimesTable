let timerId = 0;
let activeFrame = 0;

export function startQuestionTimer({ seconds, onTick, onExpire }) {
  stopQuestionTimer();

  const duration = seconds * 1000;
  const startedAt = performance.now();
  timerId += 1;
  const currentTimer = timerId;

  function update(now) {
    if (currentTimer !== timerId) return;

    const elapsed = now - startedAt;
    const remainingRatio = Math.max(0, 1 - elapsed / duration);
    onTick(remainingRatio);

    if (elapsed >= duration) {
      stopQuestionTimer();
      onExpire();
      return;
    }

    activeFrame = requestAnimationFrame(update);
  }

  onTick(1);
  activeFrame = requestAnimationFrame(update);
}

export function stopQuestionTimer() {
  timerId += 1;
  if (activeFrame) {
    cancelAnimationFrame(activeFrame);
    activeFrame = 0;
  }
}
