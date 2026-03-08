const breathOrb = document.getElementById("breathOrb");
const phaseText = document.getElementById("phaseText");
const toggleBreath = document.getElementById("toggleBreath");
const paceRange = document.getElementById("paceRange");
const paceValue = document.getElementById("paceValue");
const promptText = document.getElementById("promptText");
const newPrompt = document.getElementById("newPrompt");
const petalLayer = document.getElementById("petalLayer");
const installBtn = document.getElementById("installBtn");

const prompts = [
  "Let this moment be enough.",
  "Small calm steps still count as progress.",
  "Relax your jaw, drop your shoulders, breathe low.",
  "You can pause and still stay on path.",
  "Peace is built one gentle choice at a time.",
  "You are safe to move slowly."
];

let running = false;
let cycleSeconds = Number(paceRange.value);
let cycleStart = performance.now();
let rafId = null;

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

newPrompt.addEventListener("click", () => {
  const next = prompts[Math.floor(Math.random() * prompts.length)];
  promptText.textContent = next;
});

const petalPalette = ["#f5d9de", "#cfe2cc", "#ddd2ef", "#f8e8ec", "#dcecd9"];

document.addEventListener("pointerdown", (event) => {
  const target = event.target;
  if (target.closest("button, input, label")) return;

  const petal = document.createElement("span");
  petal.className = "petal";
  petal.style.left = `${event.clientX - 9}px`;
  petal.style.top = `${event.clientY - 9}px`;
  petal.style.background = petalPalette[Math.floor(Math.random() * petalPalette.length)];
  petal.style.setProperty("--x-shift", `${(Math.random() * 80 - 40).toFixed(0)}px`);
  petalLayer.appendChild(petal);
  petal.addEventListener("animationend", () => petal.remove());
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
