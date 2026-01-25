const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const streakEl = document.getElementById("streak");
const highScoreEl = document.getElementById("highScore");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const difficultySelect = document.getElementById("difficulty");

const GAME_DURATION = 30; // seconds

const difficultyConfig = {
  easy: { spawnInterval: 900, lifeTime: 1300, penaltyChance: 0.18 },
  medium: { spawnInterval: 650, lifeTime: 1050, penaltyChance: 0.25 },
  hard: { spawnInterval: 480, lifeTime: 900, penaltyChance: 0.32 },
};

const HIGH_SCORE_KEY = "engagementArcadeHighScores";

let state = {
  score: 0,
  timeLeft: GAME_DURATION,
  streak: 0,
  highScore: 0,
  highScores: {
    easy: 0,
    medium: 0,
    hard: 0,
  },
  running: false,
  paused: false,
  lastTick: null,
  timers: {
    loop: null,
    spawn: null,
  },
};

function loadHighScores() {
  const stored = localStorage.getItem(HIGH_SCORE_KEY);
  if (!stored) {
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    ["easy", "medium", "hard"].forEach((key) => {
      const value = Number(parsed?.[key]);
      if (Number.isFinite(value) && value > 0) {
        state.highScores[key] = value;
      }
    });
  } catch {
    console.log("Error loading high scores");
  }
}

function saveHighScores() {
  localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(state.highScores));
}

function resetState() {
  state.score = 0;
  state.timeLeft = GAME_DURATION;
  state.streak = 0;
  state.running = false;
  state.paused = false;
  state.lastTick = null;
  clearTimers();
  clearTargets();
  updateHud();
  setStatus(
    "status-idle",
    "Press <strong>Start</strong> to play. Hit the glowing targets!"
  );
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  pauseBtn.textContent = "Pause";
  resetBtn.disabled = true;
}

function clearTimers() {
  if (state.timers.loop) {
    cancelAnimationFrame(state.timers.loop);
  }
  if (state.timers.spawn) {
    clearInterval(state.timers.spawn);
  }
  state.timers.loop = null;
  state.timers.spawn = null;
}

function clearTargets() {
  board.querySelectorAll(".target").forEach((t) => t.remove());
}

function updateHud() {
  scoreEl.textContent = state.score;
  timeEl.textContent = Math.max(0, Math.ceil(state.timeLeft));
  streakEl.textContent = state.streak;

  const difficulty = difficultySelect.value || "medium";
  state.highScore = state.highScores[difficulty] ?? 0;

  if (highScoreEl) {
    highScoreEl.textContent = state.highScore;
  }
}

function getDifficultySettings() {
  return difficultyConfig[difficultySelect.value] ?? difficultyConfig.medium;
}

function setStatus(statusClass, html) {
  statusEl.className = `status ${statusClass}`;
  statusEl.innerHTML = html;
}

function startGame() {
  if (state.running) return;
  resetState();
  state.running = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;
  difficultySelect.disabled = true;
  state.lastTick = performance.now();
  setStatus(
    "status-active",
    "Game on! Hit <strong>orange</strong> targets. Avoid <strong>red</strong> ones."
  );
  startLoop();
  startSpawning();
}

function togglePause() {
  if (!state.running) return;
  state.paused = !state.paused;

  if (state.paused) {
    clearTimers();
    pauseBtn.textContent = "Resume";
    setStatus(
      "status-paused",
      "Paused. Targets are frozen. Press <strong>Resume</strong> to continue."
    );
  } else {
    state.lastTick = performance.now();
    pauseBtn.textContent = "Pause";
    setStatus(
      "status-active",
      "Back in! Keep chasing those glowing targets."
    );
    startLoop();
    startSpawning();
  }
}

function endGame() {
  state.running = false;
  state.paused = false;
  clearTimers();
  pauseBtn.disabled = true;
  startBtn.disabled = true;
  difficultySelect.disabled = false;

  // updating high score
  const difficulty = difficultySelect.value || "medium";
  const currentBest = state.highScores[difficulty] ?? 0;
  if (state.score > currentBest) {
    state.highScores[difficulty] = state.score;
    saveHighScores();
  }

  updateHud();

  setStatus(
    "status-ended",
    `Time's up! Final score: <strong>${state.score}</strong> with a best streak of <strong>${state.streak}</strong>. Hit <strong>Reset</strong> to play again.`
  );
}

function gameLoop(now) {
  if (!state.running || state.paused) return;

  const elapsed = (now - state.lastTick) / 1000;
  state.lastTick = now;
  state.timeLeft -= elapsed;

  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    updateHud();
    endGame();
    return;
  }

  updateHud();
  state.timers.loop = requestAnimationFrame(gameLoop);
}

function startLoop() {
  state.timers.loop = requestAnimationFrame(gameLoop);
}

function startSpawning() {
  const settings = getDifficultySettings();
  state.timers.spawn = setInterval(spawnTarget, settings.spawnInterval);
}

function createTarget(x, y, isPenalty) {
  const target = document.createElement("button");
  target.className = "target" + (isPenalty ? " target-penalty" : "");
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;
  target.setAttribute("aria-label", isPenalty ? "Penalty target" : "Score target");
  target.dataset.isPenalty = isPenalty.toString();

  const glow = document.createElement("div");
  glow.className = "target-glow";
  const inner = document.createElement("div");
  inner.className = "target-inner";

  target.appendChild(glow);
  target.appendChild(inner);

  return target;
}

function handleTargetHit(target) {
  const isPenalty = target.dataset.isPenalty === "true";
  target.classList.add("target-hit");

  if (isPenalty) {
    state.score = Math.max(0, state.score - 5);
    state.streak = 0;
    setStatus(
      "status-active",
      "Ouch! That was a penalty. Watch for subtle red tones."
    );
  } else {
    const base = 10;
    state.streak += 1;
    const bonus = Math.floor(state.streak / 3) * 4;
    state.score += base + bonus;
    setStatus(
      "status-active",
      `Nice hit! Streak: <strong>${state.streak}</strong> (bonus +${bonus}).`
    );
  }

  updateHud();

  setTimeout(() => {
    target.remove();
  }, 180);
}

function spawnTarget() {
  if (!state.running || state.paused) return;

  const rect = board.getBoundingClientRect();
  const margin = 40;

  const x =
    Math.random() * (rect.width - margin * 2) +margin;
  const y =
    Math.random() * (rect.height - margin * 2) +
    margin;

  const settings = getDifficultySettings();
  const isPenalty = Math.random() < settings.penaltyChance;

  const target = createTarget(x, y, isPenalty);
  board.appendChild(target);

  const ttl = settings.lifeTime;
  setTimeout(() => {
    if (board.contains(target)) {
      target.remove();
      if (!isPenalty && state.running && !state.paused) {
        state.streak = 0;
        setStatus(
          "status-active",
          "Missed a target. Streak reset. Try tracking the movement pattern."
        );
        updateHud();
      }
    }
  }, ttl);
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
resetBtn.addEventListener("click", resetState);

board.addEventListener("click", (event) => {
  if (!state.running || state.paused) return;
  
  const target = event.target.closest(".target");
  if (target) {
    event.stopPropagation();
    handleTargetHit(target);
  } else {
    setStatus(
      "status-active",
    "Click directly on a target’s glow, not the board."
    );
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === " " || event.code === "Space") {
    event.preventDefault();
    if (!state.running) {
      startGame();
    } else {
      togglePause();
    }
  }
});

difficultySelect.addEventListener("change", () => {
  if (!state.running) {
    updateHud();
  }
});

loadHighScores();
resetState();

