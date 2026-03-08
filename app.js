const breathOrb = document.getElementById("breathOrb");
const phaseText = document.getElementById("phaseText");
const toggleBreath = document.getElementById("toggleBreath");
const paceRange = document.getElementById("paceRange");
const paceValue = document.getElementById("paceValue");
const affirmationText = document.getElementById("affirmationText");
const newAffirmation = document.getElementById("newAffirmation");
const dailyImportant = document.getElementById("dailyImportant");
const dailyBoundary = document.getElementById("dailyBoundary");
const dailyCalmChoice = document.getElementById("dailyCalmChoice");
const saveDaily = document.getElementById("saveDaily");
const dailySaved = document.getElementById("dailySaved");
const weeklyWins = document.getElementById("weeklyWins");
const weeklyComposure = document.getElementById("weeklyComposure");
const weeklyBoundary = document.getElementById("weeklyBoundary");
const weeklyNext = document.getElementById("weeklyNext");
const saveWeekly = document.getElementById("saveWeekly");
const weeklySaved = document.getElementById("weeklySaved");
const resetPhase = document.getElementById("resetPhase");
const resetCountdown = document.getElementById("resetCountdown");
const resetFill = document.getElementById("resetFill");
const toggleReset = document.getElementById("toggleReset");
const petalLayer = document.getElementById("petalLayer");
const installBtn = document.getElementById("installBtn");

const affirmations = [
  "I do not need permission to grow. I do not need applause to continue.",
  "My time, effort, and future belong to me.",
  "I build with patience, move with intention, and stay the course.",
  "Small calm steps still count as progress.",
  "You are safe to move slowly.",
  "Peace is built one gentle choice at a time."
];

const storageKeys = {
  daily: "qr.dailyCheckin.v1",
  weekly: "qr.weeklyLog.v1"
};

let running = false;
let cycleSeconds = Number(paceRange.value);
let cycleStart = performance.now();
let rafId = null;
let resetRemaining = 300;
let resetTimerId = null;
const resetSteps = [
  "Stop what you are doing. Soften your gaze.",
  "Take five deep breaths. Inhale 4, hold 4, exhale 6.",
  "Name three things you can control right now.",
  "Choose one action that moves you forward slightly.",
  "Begin."
];

function updateBreathDuration() {
  breathOrb.style.animationDuration = `${cycleSeconds}s`;
  paceValue.textContent = String(cycleSeconds);
}

function currentPhase(elapsed) {
  const progress = (elapsed % cycleSeconds) / cycleSeconds;
  if (progress < 0.4) return "Inhale";
  if (progress < 0.6) return "Hold";
  return "Exhale";
}

function tick(now) {
  if (!running) return;
  phaseText.textContent = currentPhase((now - cycleStart) / 1000);
  rafId = requestAnimationFrame(tick);
}

toggleBreath.addEventListener("click", () => {
  running = !running;
  breathOrb.classList.toggle("running", running);

  if (running) {
    cycleStart = performance.now();
    toggleBreath.textContent = "Pause";
    rafId = requestAnimationFrame(tick);
  } else {
    toggleBreath.textContent = "Start";
    phaseText.textContent = "Paused";
    cancelAnimationFrame(rafId);
  }
});

paceRange.addEventListener("input", (event) => {
  cycleSeconds = Number(event.target.value);
  updateBreathDuration();
  cycleStart = performance.now();
});

newAffirmation.addEventListener("click", () => {
  const next = affirmations[Math.floor(Math.random() * affirmations.length)];
  affirmationText.textContent = next;
});

const petalPalette = ["#f5d9de", "#cfe2cc", "#ddd2ef", "#f8e8ec", "#dcecd9"];

document.addEventListener("pointerdown", (event) => {
  const target = event.target;
  if (target.closest("button, input, label, textarea")) return;

  const petalSize = Math.floor(Math.random() * 12) + 30;
  const petal = document.createElement("span");
  petal.className = "petal";
  petal.style.setProperty("--petal-size", `${petalSize}px`);
  petal.style.left = `${event.clientX - petalSize / 2}px`;
  petal.style.top = `${event.clientY - petalSize / 2}px`;
  petal.style.background = petalPalette[Math.floor(Math.random() * petalPalette.length)];
  petal.style.setProperty("--x-shift", `${(Math.random() * 80 - 40).toFixed(0)}px`);
  petalLayer.appendChild(petal);
  petal.addEventListener("animationend", () => petal.remove());
});

function readSaved(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSaved(key, payload) {
  localStorage.setItem(key, JSON.stringify(payload));
}

function dateLabel(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return `Saved ${date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })}`;
}

function loadDaily() {
  const data = readSaved(storageKeys.daily);
  if (!data) return;
  dailyImportant.value = data.important || "";
  dailyBoundary.value = data.boundary || "";
  dailyCalmChoice.value = data.calmChoice || "";
  dailySaved.textContent = dateLabel(data.updatedAt);
}

function loadWeekly() {
  const data = readSaved(storageKeys.weekly);
  if (!data) return;
  weeklyWins.value = data.wins || "";
  weeklyComposure.value = data.composure || "";
  weeklyBoundary.value = data.boundary || "";
  weeklyNext.value = data.nextWeek || "";
  weeklySaved.textContent = dateLabel(data.updatedAt);
}

saveDaily.addEventListener("click", () => {
  const payload = {
    important: dailyImportant.value.trim(),
    boundary: dailyBoundary.value.trim(),
    calmChoice: dailyCalmChoice.value.trim(),
    updatedAt: new Date().toISOString()
  };
  writeSaved(storageKeys.daily, payload);
  dailySaved.textContent = dateLabel(payload.updatedAt);
});

saveWeekly.addEventListener("click", () => {
  const payload = {
    wins: weeklyWins.value.trim(),
    composure: weeklyComposure.value.trim(),
    boundary: weeklyBoundary.value.trim(),
    nextWeek: weeklyNext.value.trim(),
    updatedAt: new Date().toISOString()
  };
  writeSaved(storageKeys.weekly, payload);
  weeklySaved.textContent = dateLabel(payload.updatedAt);
});

function countdownLabel(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function renderReset() {
  const elapsed = 300 - resetRemaining;
  const stepIndex = Math.min(resetSteps.length - 1, Math.floor(elapsed / 60));
  resetPhase.textContent = resetSteps[stepIndex];
  resetCountdown.textContent = countdownLabel(resetRemaining);
  resetFill.style.width = `${((elapsed / 300) * 100).toFixed(1)}%`;
}

function stopReset(finished) {
  clearInterval(resetTimerId);
  resetTimerId = null;
  toggleReset.textContent = "Start reset";
  if (finished) {
    resetPhase.textContent = "Reset complete. Begin your next small step.";
    resetCountdown.textContent = "0:00";
    resetFill.style.width = "100%";
  }
}

toggleReset.addEventListener("click", () => {
  if (resetTimerId) {
    stopReset(false);
    resetPhase.textContent = "Reset paused. Press Start reset to begin again.";
    return;
  }

  resetRemaining = 300;
  renderReset();
  toggleReset.textContent = "Stop reset";
  resetTimerId = setInterval(() => {
    resetRemaining -= 1;
    renderReset();
    if (resetRemaining <= 0) {
      stopReset(true);
    }
  }, 1000);
});

let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.hidden = false;
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

window.addEventListener("appinstalled", () => {
  installBtn.hidden = true;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // App still works without offline cache.
    });
  });
}

updateBreathDuration();
renderReset();
loadDaily();
loadWeekly();
