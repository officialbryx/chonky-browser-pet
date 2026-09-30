// Injects Chonky as a small animated companion that floats on top of every page.
(() => {
  const HOST_ID = "chonky-browser-pet-host";
  if (document.getElementById(HOST_ID)) return;

  const storage = globalThis.chrome?.storage?.local;
  const STATS_KEY = "chonkyStats";
  const ENABLED_KEY = "chonkyPetEnabled";
  const defaults = { bond: 32, energy: 72 };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CAT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 136" shape-rendering="crispEdges">
    <g class="cat">
      <path fill="#db773f" d="M28 52h12V28h12V16h24v12h32V16h24v12h12v24h12v44h-12v16h-16v-12h-12v12H56v-12H44v12H28v-16H16V52h12z"/>
      <path fill="#f3a65f" d="M40 52h12V40h12V28h8v20h16V28h8v12h12v12h12v32h-8v12H48V84h-8z"/>
      <path fill="#f7c8a0" d="M48 28h16v16H48zM96 28h16v16H96z"/>
      <path fill="#b95735" d="M64 28h8v12h-8zM96 28h8v12h-8z"/>
      <path fill="#b95735" d="M32 60h12v8H32zM116 60h12v8h-12zM56 48h8v8h-8zM100 48h8v8h-8z"/>
      <path fill="#573b36" d="M56 64h8v12h-8zM96 64h8v12h-8z"/>
      <path fill="#e68172" d="M72 76h16v8H72z"/>
      <path fill="#573b36" d="M76 72h8v8h-8zM72 84h4v4h-4zM84 84h4v4h-4z"/>
      <path fill="#cf6942" d="M16 68h12v16H16zM8 52h12v16H8zM16 40h12v12H16z"/>
      <path fill="#db773f" d="M40 100h20v12H48v12H32v-16h8zM100 100h20v8h8v16h-16v-12h-12z"/>
      <path fill="#ffd9b5" d="M64 92h8v4h-8zM88 92h8v4h-8z"/>
    </g>
  </svg>`;

  const STYLES = `
    :host { all: initial; }
    * { box-sizing: border-box; }
    .stage {
      position: fixed;
      bottom: 14px;
      left: 24px;
      width: 96px;
      height: 108px;
      z-index: 2147483647;
      font-family: "Trebuchet MS", Arial, sans-serif;
      pointer-events: none;
    }
    .shadow-ellipse {
      position: absolute;
      bottom: 10px;
      left: 50%;
      width: 58px;
      height: 10px;
      border-radius: 50%;
      background: rgb(60 40 30 / 22%);
      transform: translateX(-50%);
      filter: blur(0.5px);
    }
    .facing {
      position: absolute;
      bottom: 14px;
      left: 50%;
      width: 84px;
      height: 72px;
      margin-left: -42px;
      pointer-events: auto;
      cursor: pointer;
    }
    .facing:focus-visible {
      outline: 2px solid #bd7b61;
      outline-offset: 3px;
      border-radius: 10px;
    }
    .bounce { width: 100%; height: 100%; }
    .bounce svg {
      display: block;
      width: 100%;
      height: 100%;
      image-rendering: pixelated;
      filter: drop-shadow(0 3px 3px rgb(0 0 0 / 22%));
    }
    .zzz {
      position: absolute;
      top: -6px;
      right: -6px;
      display: none;
      color: #9b7e8f;
      font-size: 13px;
      font-weight: 800;
    }
    .state-sleep .zzz {
      display: block;
      animation: chonky-float 1.8s ease-in-out infinite;
    }
    .fx {
      position: absolute;
      bottom: 90px;
      left: 50%;
      width: 0;
      height: 0;
      pointer-events: none;
    }
    .fx-item {
      position: absolute;
      left: 0;
      bottom: 0;
      transform: translateX(-50%);
      font-size: 20px;
      animation: chonky-fx-float 1.4s ease-out forwards;
    }
    .speech {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translate(-50%, 6px);
      padding: 5px 10px;
      max-width: 150px;
      border-radius: 12px;
      background: #fff6ee;
      border: 1px solid #f0dfd1;
      color: #6b5142;
      font-size: 11px;
      font-weight: 700;
      text-align: center;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      box-shadow: 0 6px 16px rgb(105 71 49 / 18%);
      transition: opacity 160ms ease, transform 160ms ease;
    }
    .speech.show { opacity: 1; transform: translate(-50%, 0); }

    .state-sit .bounce { animation: chonky-idle 2.6s ease-in-out infinite; }
    .state-walk .bounce { animation: chonky-walk 0.5s ease-in-out infinite; }
    .state-sleep .bounce { animation: chonky-sleep 3s ease-in-out infinite; }
    .state-eat .bounce { animation: chonky-eat 350ms ease-in-out infinite alternate; }
    .state-play .bounce { animation: chonky-play 450ms ease-in-out infinite alternate; }
    .state-sleep .shadow-ellipse { opacity: 0.55; }

    @keyframes chonky-idle {
      50% { transform: translateY(-3px); }
    }
    @keyframes chonky-walk {
      0%, 100% { transform: translateY(0) rotate(-2deg); }
      50% { transform: translateY(-7px) rotate(2deg); }
    }
    @keyframes chonky-sleep {
      50% { transform: translateY(2px) scale(0.97); }
    }
    @keyframes chonky-eat {
      to { transform: translateY(3px) scaleY(0.95); }
    }
    @keyframes chonky-play {
      to { transform: translateY(-10px) rotate(6deg); }
    }
    @keyframes chonky-float {
      50% { transform: translateY(-5px); }
    }
    @keyframes chonky-fx-float {
      0% { opacity: 0; transform: translate(-50%, 10px) scale(0.6); }
      25% { opacity: 1; }
      100% { opacity: 0; transform: translate(-50%, -44px) scale(1.15); }
    }

    @media (prefers-reduced-motion: reduce) {
      .bounce, .zzz, .fx-item { animation: none !important; }
    }
  `;

  const host = document.createElement("div");
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>${STYLES}</style>
    <div class="stage state-sit" id="stage">
      <span class="shadow-ellipse"></span>
      <div class="facing" id="facing" role="button" tabindex="0" aria-label="Pet Chonky the cat">
        <div class="bounce" id="bounce">${CAT_SVG}</div>
        <span class="zzz" aria-hidden="true">z z</span>
      </div>
      <div class="fx" id="fx"></div>
      <div class="speech" id="speech"></div>
    </div>
  `;

  const mount = () => (document.documentElement || document.body).appendChild(host);
  if (document.documentElement) mount();
  else document.addEventListener("DOMContentLoaded", mount);

  const stage = shadow.querySelector("#stage");
  const facing = shadow.querySelector("#facing");
  const fx = shadow.querySelector("#fx");
  const speech = shadow.querySelector("#speech");

  let x = clampX(Math.random() * (window.innerWidth - 140) + 20);
  let dir = 1;
  let behaviorTimer = null;
  let speechTimer = null;
  let lastPetAt = 0;
  let enabled = true;

  stage.style.left = `${x}px`;

  function clampX(value) {
    const max = Math.max(8, window.innerWidth - 108);
    return Math.min(Math.max(8, value), max);
  }

  function setState(name) {
    stage.className = `stage state-${name}`;
  }

  function setFacing(direction, hovered) {
    dir = direction;
    facing.style.transform = `scaleX(${dir})${hovered ? " scale(1.08)" : ""}`;
  }

  function moveTo(target, durationMs) {
    x = clampX(target);
    stage.style.transition = durationMs ? `left ${durationMs}ms linear` : "none";
    stage.style.left = `${x}px`;
  }

  function spawnFx(emoji) {
    const el = document.createElement("span");
    el.textContent = emoji;
    el.className = "fx-item";
    fx.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }

  function say(text, ms = 1600) {
    speech.textContent = text;
    speech.classList.add("show");
    clearTimeout(speechTimer);
    speechTimer = setTimeout(() => speech.classList.remove("show"), ms);
  }

  async function bumpBond(amount) {
    if (!storage) return;
    try {
      const saved = await storage.get(STATS_KEY);
      const stats = { ...defaults, ...(saved[STATS_KEY] || {}) };
      stats.bond = Math.max(0, Math.min(100, stats.bond + amount));
      await storage.set({ [STATS_KEY]: stats });
    } catch {
      // Ambient play still works without persisted stats.
    }
  }

  const GREETINGS = ["Chonky purrs happily!", "Mrrp! ♡", "Best cuddle ever.", "Chonky nuzzles you."];

  const WEIGHTS = [
    ["walk", 5],
    ["sit", 3],
    ["sleep", 2],
    ["play", 2],
    ["eat", 2],
  ];

  function pickBehavior() {
    const total = WEIGHTS.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = Math.random() * total;
    for (const [name, weight] of WEIGHTS) {
      roll -= weight;
      if (roll <= 0) return name;
    }
    return "sit";
  }

  function scheduleNext(delay) {
    clearTimeout(behaviorTimer);
    behaviorTimer = setTimeout(runBehavior, delay);
  }

  function runBehavior() {
    if (!enabled) return scheduleNext(1000);

    if (reduceMotion) {
      setState("sit");
      return scheduleNext(4000);
    }

    const behavior = pickBehavior();

    if (behavior === "walk") {
      const target = Math.random() * (window.innerWidth - 140) + 20;
      const distance = Math.abs(target - x);
      const duration = Math.max(1200, distance * 18);
      setFacing(target >= x ? 1 : -1);
      setState("walk");
      moveTo(target, duration);
      scheduleNext(duration + 150);
      return;
    }

    if (behavior === "sleep") {
      setState("sleep");
      scheduleNext(7000 + Math.random() * 6000);
      return;
    }

    if (behavior === "eat") {
      setState("eat");
      spawnFx("🐟");
      scheduleNext(2200);
      return;
    }

    if (behavior === "play") {
      setState("play");
      spawnFx("🧶");
      scheduleNext(2200);
      return;
    }

    setState("sit");
    scheduleNext(2600 + Math.random() * 2600);
  }

  facing.addEventListener("mouseenter", () => setFacing(dir, true));
  facing.addEventListener("mouseleave", () => setFacing(dir, false));

  facing.addEventListener("click", () => {
    const now = Date.now();
    if (now - lastPetAt < 2500) return;
    lastPetAt = now;
    setState("play");
    spawnFx("♡");
    say(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    bumpBond(2);
    scheduleNext(1600);
  });

  facing.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      facing.click();
    }
  });

  window.addEventListener("resize", () => moveTo(x, 0));

  function applyEnabled() {
    host.style.display = enabled ? "block" : "none";
  }

  async function loadEnabled() {
    if (!storage) return;
    try {
      const saved = await storage.get(ENABLED_KEY);
      enabled = saved[ENABLED_KEY] !== false;
    } catch {
      enabled = true;
    }
  }

  storage?.onChanged?.addListener((changes, area) => {
    if (area !== "local" || !changes[ENABLED_KEY]) return;
    enabled = changes[ENABLED_KEY].newValue !== false;
    applyEnabled();
  });

  loadEnabled().then(() => {
    applyEnabled();
    scheduleNext(500);
  });
})();
