const stage = document.querySelector("#cat-stage");
const status = document.querySelector("#status");
const bondMeter = document.querySelector("#bond-meter");
const energyMeter = document.querySelector("#energy-meter");
const bondValue = document.querySelector("#bond-value");
const energyValue = document.querySelector("#energy-value");
const sleepLabel = document.querySelector("#sleep-label");
const pageToggle = document.querySelector("#page-toggle");

const defaults = { bond: 32, energy: 72 };
const ENABLED_KEY = "chonkyPetEnabled";
let stats = { ...defaults };
let idleTimer;
const storage = globalThis.chrome?.storage?.local;

const actions = {
  play: { state: "playing", message: "Chonky is having the best time!", bond: 12, energy: -8 },
  feed: { state: "eating", message: "Nom nom! Chonky loves that treat.", bond: 4, energy: 12 },
  stroll: { state: "stroll", message: "Chonky is having a little stroll.", bond: 8, energy: -4 },
};

function renderStats() {
  bondValue.textContent = `${stats.bond}%`;
  energyValue.textContent = `${stats.energy}%`;
  bondMeter.setAttribute("aria-valuenow", stats.bond);
  energyMeter.setAttribute("aria-valuenow", stats.energy);
  bondMeter.querySelector(".meter-fill").style.width = `${stats.bond}%`;
  energyMeter.querySelector(".meter-fill").style.width = `${stats.energy}%`;
}

function setState(state, message) {
  clearTimeout(idleTimer);
  stage.className = `cat-stage state-${state}`;
  status.textContent = message;
  sleepLabel.textContent = state === "sleeping" ? "Wake" : "Nap";
  if (state !== "sleeping" && state !== "idle") {
    idleTimer = setTimeout(() => setState("idle", "Chonky is enjoying the sunshine."), 2600);
  }
}

async function saveStats() {
  try {
    await storage?.set({ chonkyStats: stats });
  } catch {
    // The pet still works if extension storage is unavailable.
  }
}

document.querySelector(".actions").addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  if (action === "sleep") {
    const waking = stage.classList.contains("state-sleeping");
    setState(waking ? "idle" : "sleeping", waking ? "Chonky is enjoying the sunshine." : "Shhh… Chonky is taking a cozy nap.");
    if (!waking) {
      stats.energy = Math.min(100, stats.energy + 8);
      renderStats();
      await saveStats();
    }
    return;
  }

  const next = actions[action];
  if (!next) return;
  stats.bond = Math.max(0, Math.min(100, stats.bond + next.bond));
  stats.energy = Math.max(0, Math.min(100, stats.energy + next.energy));
  setState(next.state, next.message);
  renderStats();
  await saveStats();
});

async function loadStats() {
  if (!storage) return;
  try {
    const saved = await storage.get("chonkyStats");
    if (saved.chonkyStats) {
      stats.bond = clampStat(saved.chonkyStats.bond, defaults.bond);
      stats.energy = clampStat(saved.chonkyStats.energy, defaults.energy);
    }
  } catch {
    // Use the default stats when extension storage is unavailable.
  }
  renderStats();
}

function clampStat(value, fallback) {
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : fallback;
}

pageToggle?.addEventListener("change", async () => {
  try {
    await storage?.set({ [ENABLED_KEY]: pageToggle.checked });
  } catch {
    // The toggle preference just won't persist without extension storage.
  }
});

async function loadEnabled() {
  if (!storage || !pageToggle) return;
  try {
    const saved = await storage.get(ENABLED_KEY);
    pageToggle.checked = saved[ENABLED_KEY] !== false;
  } catch {
    // Default to enabled when extension storage is unavailable.
  }
}

renderStats();
loadStats();
loadEnabled();
