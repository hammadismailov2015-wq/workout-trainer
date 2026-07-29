/* ============================================================
   Домашний Тренажёр — логика приложения
   ============================================================ */

// --- Каталог упражнений ---
// anim — как робот-тренер показывает упражнение (класс анимации)
const EXERCISES = {
  squats:    { name: "Приседания",     ico: "🦵", cal: 8,  anim: "squatside" },
  pushups:   { name: "Отжимания",      ico: "💪", cal: 8,  anim: "pushup" },
  abs:       { name: "Пресс",          ico: "🔥", cal: 7,  anim: "crunch" },
  plank:     { name: "Планка",         ico: "🧘", cal: 5,  anim: "plank" },
  lunges:    { name: "Выпады",         ico: "🚶", cal: 8,  anim: "lunge" },
  burpee:    { name: "Бёрпи",          ico: "⚡", cal: 12, anim: "burpee" },
  jumpjack:  { name: "Джампинг-джек",  ico: "🤸", cal: 10, anim: "jump" },
  mountain:  { name: "Скалолаз",       ico: "⛰️", cal: 10, anim: "mountain" },
  legraise:  { name: "Подъём ног",     ico: "🦿", cal: 6,  anim: "legraise" },
  highknees: { name: "Бег с колен.",   ico: "🏃", cal: 11, anim: "run" },
  superman:  { name: "Супермен",       ico: "🦸", cal: 5,  anim: "superman" },
  wallsit:   { name: "Стульчик",       ico: "🪑", cal: 6,  anim: "wallsit" },
  // --- На тренировке (тренажёры) ---
  treadmill: { name: "Беговая дорожка", ico: "🏃", cal: 11, anim: "treadmill" },
  pullups:   { name: "Турник",          ico: "🤸", cal: 9,  anim: "pullup" },
  bike:      { name: "Велотренажёр",    ico: "🚴", cal: 10, anim: "bike" },
  dumbbell:  { name: "Гантели",         ico: "🏋️", cal: 7,  anim: "dumbbell" },
  jumprope:  { name: "Скакалка",        ico: "🪢", cal: 12, anim: "jumprope" },
};

// --- Готовые программы ---
const PROGRAMS = [
  { id: "full",    emoji: "🔥", name: "Всё тело",       meta: "12 мин · для всех",
    work: 40, rest: 20, rounds: 2, ex: ["jumpjack","squats","pushups","abs","lunges","plank"] },
  { id: "abs",     emoji: "🔥", name: "Пресс и кор",    meta: "8 мин · средне",
    work: 40, rest: 15, rounds: 2, ex: ["abs","plank","legraise","mountain","superman"] },
  { id: "legs",    emoji: "🦵", name: "Ноги и ягодицы", meta: "10 мин · средне",
    work: 45, rest: 15, rounds: 2, ex: ["squats","lunges","wallsit","highknees"] },
  { id: "upper",   emoji: "💪", name: "Верх тела",      meta: "9 мин · средне",
    work: 40, rest: 20, rounds: 2, ex: ["pushups","plank","superman","mountain"] },
  { id: "cardio",  emoji: "⚡", name: "Кардио-жиросжиг", meta: "10 мин · сложно",
    work: 35, rest: 15, rounds: 3, ex: ["jumpjack","burpee","highknees","mountain"] },
  { id: "quick",   emoji: "⏱️", name: "Быстрая 5 мин",  meta: "5 мин · разминка",
    work: 30, rest: 10, rounds: 1, ex: ["jumpjack","squats","pushups","abs","plank","lunges"] },
  { id: "gym",     emoji: "🏋️", name: "На тренировке",  meta: "тренажёры · 12 мин",
    work: 45, rest: 20, rounds: 2, ex: ["treadmill","pullups","bike","dumbbell","jumprope"] },
];

const PREP_TIME = 10; // подготовка перед стартом

// ============================================================
//  Состояние и хранилище
// ============================================================
const store = {
  get() {
    try { return JSON.parse(localStorage.getItem("gym_stats")) || {}; }
    catch { return {}; }
  },
  save(s) { localStorage.setItem("gym_stats", JSON.stringify(s)); },
};

function loadStats() {
  const s = store.get();
  document.getElementById("stat-workouts").textContent = s.workouts || 0;
  document.getElementById("stat-minutes").textContent = Math.round((s.seconds || 0) / 60);
  document.getElementById("stat-streak").textContent = s.streak || 0;
}

function recordWorkout(seconds, exercises, cals) {
  const s = store.get();
  s.workouts = (s.workouts || 0) + 1;
  s.seconds = (s.seconds || 0) + seconds;
  s.totalEx = (s.totalEx || 0) + exercises;
  // Подсчёт «дней подряд»
  const today = new Date().toDateString();
  const yest = new Date(Date.now() - 864e5).toDateString();
  if (s.lastDay === today) { /* уже был сегодня — стрик не меняем */ }
  else if (s.lastDay === yest) { s.streak = (s.streak || 0) + 1; }
  else { s.streak = 1; }
  s.lastDay = today;
  store.save(s);
}

// ============================================================
//  Навигация между экранами
// ============================================================
function goto(id) {
  document.querySelectorAll(".screen").forEach(el => el.classList.remove("active"));
  document.getElementById("screen-" + id).classList.add("active");
  window.scrollTo(0, 0);
  if (id === "home") loadStats();
}

document.querySelectorAll("[data-goto]").forEach(el =>
  el.addEventListener("click", () => goto(el.dataset.goto))
);

// ============================================================
//  Главный экран — рендер программ
// ============================================================
function renderPrograms() {
  const list = document.getElementById("program-list");
  list.innerHTML = "";
  PROGRAMS.forEach(p => {
    const btn = document.createElement("button");
    btn.className = "program-card";
    btn.innerHTML = `
      <span class="program-emoji">${p.emoji}</span>
      <span class="program-name">${p.name}</span>
      <span class="program-meta">${p.meta}</span>
      <span class="chev">›</span>`;
    btn.addEventListener("click", () => startWorkout(p));
    list.appendChild(btn);
  });
}

// ============================================================
//  Конструктор своей тренировки
// ============================================================
let selected = [];

function renderBuilder() {
  const grid = document.getElementById("exercise-grid");
  grid.innerHTML = "";
  Object.entries(EXERCISES).forEach(([key, ex]) => {
    const chip = document.createElement("div");
    chip.className = "ex-chip";
    chip.dataset.key = key;
    chip.innerHTML = `<span class="ex-ico">${ex.ico}</span>
      <span class="ex-t">${ex.name}</span><span class="badge"></span>`;
    chip.addEventListener("click", () => toggleExercise(key, chip));
    grid.appendChild(chip);
  });
}

function toggleExercise(key, chip) {
  const idx = selected.indexOf(key);
  if (idx === -1) selected.push(key);
  else selected.splice(idx, 1);
  chip.classList.toggle("on", selected.includes(key));
  // Обновить бейдж с порядковым номером
  document.querySelectorAll(".ex-chip").forEach(c => {
    const pos = selected.indexOf(c.dataset.key);
    c.querySelector(".badge").textContent = pos === -1 ? "" : (pos + 1);
  });
  document.getElementById("builder-count").textContent = "Выбрано: " + selected.length;
  document.getElementById("btn-start-custom").disabled = selected.length === 0;
}

document.getElementById("btn-custom").addEventListener("click", () => {
  selected = [];
  renderBuilder();
  document.getElementById("builder-count").textContent = "Выбрано: 0";
  document.getElementById("btn-start-custom").disabled = true;
  goto("builder");
});

document.getElementById("btn-start-custom").addEventListener("click", () => {
  const work   = clamp(+document.getElementById("set-work").value, 5, 300);
  const rest   = clamp(+document.getElementById("set-rest").value, 0, 300);
  const rounds = clamp(+document.getElementById("set-rounds").value, 1, 10);
  startWorkout({ name: "Своя тренировка", work, rest, rounds, ex: [...selected] });
});

function clamp(v, lo, hi) { v = isNaN(v) ? lo : v; return Math.max(lo, Math.min(hi, v)); }

// ============================================================
//  Движок тренировки
// ============================================================
let W = null; // текущее состояние тренировки

function buildSequence(prog) {
  // Плоский список шагов: [prep] -> (work, rest, work, rest ...) * rounds
  const seq = [{ type: "prep", key: null, dur: PREP_TIME }];
  for (let r = 0; r < prog.rounds; r++) {
    prog.ex.forEach((key, i) => {
      seq.push({ type: "work", key, dur: prog.work, round: r + 1 });
      const isLast = (r === prog.rounds - 1) && (i === prog.ex.length - 1);
      if (prog.rest > 0 && !isLast) seq.push({ type: "rest", key: null, dur: prog.rest, round: r + 1 });
    });
  }
  return seq;
}

function startWorkout(prog) {
  W = {
    prog,
    seq: buildSequence(prog),
    idx: 0,
    remaining: 0,
    paused: false,
    startedAt: Date.now(),
    workTime: 0,   // накопленное время «работы» для калорий
    curCal: 0,
    timer: null,
  };
  goto("workout");
  document.getElementById("screen-workout").classList.add("active");
  enterStep();
  runTick();
}

function enterStep() {
  const step = W.seq[W.idx];
  W.remaining = step.dur;

  const body  = document.getElementById("workout-body");
  body.classList.remove("rest", "prep");

  const phase = document.getElementById("phase-label");
  const name  = document.getElementById("ex-name");
  const next  = document.getElementById("next-up");

  if (step.type === "prep") {
    body.classList.add("prep");
    setRobotAnim("idle");
    phase.textContent = "Приготовься";
    name.textContent = "Начинаем!";
    next.textContent = "Первое: " + EXERCISES[W.seq[1].key].name;
    prepClip();
  } else if (step.type === "rest") {
    body.classList.add("rest");
    setRobotAnim("idle");
    phase.textContent = "Отдых";
    name.textContent = "Передохни";
    const nx = findNextWork(W.idx);
    next.textContent = nx ? "Далее: " + EXERCISES[nx.key].name : "";
    playClip("rest");
  } else { // work
    setRobotAnim(EXERCISES[step.key].anim);
    phase.textContent = "Работай!";
    name.textContent = EXERCISES[step.key].name;
    const nx = findNextWork(W.idx);
    next.textContent = nx ? "Далее: " + EXERCISES[nx.key].name : "Последнее упражнение 💪";
    playClip("work_" + step.key);
  }

  // Круг
  const rb = document.getElementById("round-badge");
  rb.textContent = step.round ? `Круг ${step.round}/${W.prog.rounds}` : "Разминка";

  beep(step.type === "work" ? "go" : "soft");
  updateTimerUI();
  updateProgress();
}

// Переключить анимацию робота-тренера
// Упражнения «в профиль» (лицом/животом к полу) показываются отдельными роботами
const SIDE_MODES = {
  pushup: "pushup-mode",
  plank: "plank-mode",
  mountain: "mountain-mode",
  superman: "superman-mode",
  squatside: "squat-mode",
  crunch: "crunch-mode",
  legraise: "legraise-mode",
  wallsit: "wallsit-mode",
  lunge: "lunge-mode",
  treadmill: "treadmill-mode",
  pullup: "pullup-mode",
  bike: "bike-mode",
  dumbbell: "dumbbell-mode",
  jumprope: "jumprope-mode",
};
const ALL_MODES = Object.values(SIDE_MODES);
function setRobotAnim(anim) {
  const robot = document.getElementById("robot");
  const stage = document.getElementById("robot-stage");
  stage.classList.remove(...ALL_MODES);
  if (SIDE_MODES[anim]) {
    stage.classList.add(SIDE_MODES[anim]);     // профильный робот
  } else if (robot) {
    robot.setAttribute("class", "robot anim-" + anim);
  }
}

function findNextWork(i) {
  for (let j = i + 1; j < W.seq.length; j++)
    if (W.seq[j].type === "work") return W.seq[j];
  return null;
}

function runTick() {
  clearInterval(W.timer);
  W.timer = setInterval(() => {
    if (W.paused) return;
    W.remaining--;
    const step = W.seq[W.idx];
    if (step.type === "work") { W.workTime++; W.curCal += (EXERCISES[step.key].cal / 60); }

    if (W.remaining <= 0) { nextStep(); return; }
    if (W.remaining <= 3) beep("tick");
    updateTimerUI();
  }, 1000);
}

function updateTimerUI() {
  const step = W.seq[W.idx];
  document.getElementById("timer-text").textContent = W.remaining;
  const ring = document.getElementById("ring-fg");
  const C = 339.29;
  const frac = step.dur > 0 ? W.remaining / step.dur : 0;
  ring.style.strokeDashoffset = C * (1 - frac);
}

function updateProgress() {
  const pct = (W.idx / (W.seq.length - 1)) * 100;
  document.getElementById("progress-fill").style.width = pct + "%";
}

function nextStep() {
  if (W.idx >= W.seq.length - 1) { finishWorkout(); return; }
  W.idx++;
  enterStep();
}

function prevStep() {
  if (W.idx > 0) { W.idx--; enterStep(); }
  else { W.remaining = W.seq[0].dur; updateTimerUI(); }
}

function finishWorkout() {
  clearInterval(W.timer);
  const secs = Math.round((Date.now() - W.startedAt) / 1000);
  const exCount = W.seq.filter(s => s.type === "work").length;
  const cals = Math.round(W.curCal);
  recordWorkout(secs, exCount, cals);
  beep("done");
  playClip("done");

  document.getElementById("done-time").textContent = fmtTime(secs);
  document.getElementById("done-ex").textContent = exCount;
  document.getElementById("done-cal").textContent = cals;

  document.getElementById("screen-workout").classList.remove("active");
  goto("done");
  document.getElementById("screen-done").classList.add("active");
}

function fmtTime(s) {
  const m = Math.floor(s / 60), r = s % 60;
  return m + ":" + String(r).padStart(2, "0");
}

// --- Управление ---
document.getElementById("btn-pause").addEventListener("click", () => {
  W.paused = !W.paused;
  document.getElementById("btn-pause").textContent = W.paused ? "▶" : "⏸";
  if (W.paused) { playClip("pause"); }
});
document.getElementById("btn-next").addEventListener("click", () => nextStep());
document.getElementById("btn-prev").addEventListener("click", () => prevStep());
document.getElementById("btn-quit").addEventListener("click", () => {
  if (confirm("Завершить тренировку?")) {
    clearInterval(W.timer);
    stopClip();
    document.getElementById("screen-workout").classList.remove("active");
    goto("home");
  }
});

// ============================================================
//  Звуковые сигналы (Web Audio, без файлов)
// ============================================================
let audioCtx = null;
function beep(kind) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    const map = { tick: 660, go: 880, soft: 440, done: 1046 };
    o.frequency.value = map[kind] || 600;
    o.type = "sine";
    const now = audioCtx.currentTime;
    g.gain.setValueAtTime(0.001, now);
    g.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + (kind === "done" ? 0.5 : 0.15));
    o.start(now);
    o.stop(now + (kind === "done" ? 0.5 : 0.16));
  } catch (e) { /* звук не критичен */ }
}

// ============================================================
//  Голос тренера — встроенные аудиофайлы (работают на любом телефоне)
// ============================================================
let voiceOn = localStorage.getItem("gym_voice") !== "off";
let voiceDir = localStorage.getItem("gym_vsound") || "m";      // m | f | fr
let voiceSpeed = localStorage.getItem("gym_vspeed") || "normal"; // slow | normal | fast
const SPEED_RATE = { slow: 0.85, normal: 1.0, fast: 1.25 };
let audioEl = null;

function getAudio() {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = "auto";
  }
  return audioEl;
}

function playClip(name) {
  if (!voiceOn) return;
  try {
    const a = getAudio();
    a.muted = false;
    a.src = "audio/" + voiceDir + "/" + name + ".mp3";
    a.currentTime = 0;
    a.preservesPitch = true; a.mozPreservesPitch = true; a.webkitPreservesPitch = true;
    a.playbackRate = SPEED_RATE[voiceSpeed] || 1.0;
    const pr = a.play();
    if (pr && pr.catch) pr.catch(() => {});
  } catch (e) {}
}

// Вступительная шутка для акцентов (иначе — обычное «Приготовься»)
const ACCENT_INTRO = { fr: "notfrench", de: "notgerman", gb: "notbritish" };
function prepClip() {
  playClip(ACCENT_INTRO[voiceDir] || "ready");
}

function stopClip() {
  try { if (audioEl) { audioEl.pause(); audioEl.currentTime = 0; } } catch (e) {}
}

// Переключатель голоса (быстрое вкл/выкл)
const voiceBtn = document.getElementById("voice-toggle");
function updateVoiceBtn() {
  voiceBtn.textContent = voiceOn ? "🔊" : "🔇";
  voiceBtn.classList.toggle("off", !voiceOn);
}
voiceBtn.addEventListener("click", () => {
  voiceOn = !voiceOn;
  localStorage.setItem("gym_voice", voiceOn ? "on" : "off");
  updateVoiceBtn();
  if (voiceOn) playClip("voiceon"); else stopClip();
});
updateVoiceBtn();

// --- Экран настроек ---
function renderSettings() {
  document.querySelectorAll("#opt-voice .opt").forEach(b => b.classList.toggle("on", b.dataset.v === voiceDir));
  document.querySelectorAll("#opt-speed .opt").forEach(b => b.classList.toggle("on", b.dataset.s === voiceSpeed));
}
document.querySelectorAll("#opt-voice .opt").forEach(btn => {
  btn.addEventListener("click", () => {
    voiceDir = btn.dataset.v;
    localStorage.setItem("gym_vsound", voiceDir);
    renderSettings();
    voiceOn = true; localStorage.setItem("gym_voice", "on"); updateVoiceBtn();
    // Проиграть пример: у акцентов — сразу шутка-разоблачение
    playClip(ACCENT_INTRO[voiceDir] || "voiceon");
  });
});
document.querySelectorAll("#opt-speed .opt").forEach(btn => {
  btn.addEventListener("click", () => {
    voiceSpeed = btn.dataset.s;
    localStorage.setItem("gym_vspeed", voiceSpeed);
    renderSettings();
    voiceOn = true; localStorage.setItem("gym_voice", "on"); updateVoiceBtn();
    playClip("voiceon");
  });
});
renderSettings();

// ============================================================
//  PWA — установка на телефон и офлайн-режим
// ============================================================
if ("serviceWorker" in navigator) {
  // Если управляющий SW уже был — при появлении нового один раз перезагружаем страницу
  if (navigator.serviceWorker.controller) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });
  }
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then((reg) => {
      reg.update();
      // Если новый SW уже ждёт — активируем немедленно
      if (reg.waiting) reg.waiting.postMessage("skip");
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (nw) nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) nw.postMessage("skip");
        });
      });
    }).catch(() => {});
  });
}

// ============================================================
//  Старт
// ============================================================
renderPrograms();
loadStats();
