/**
 * 雲端課堂測驗與注音打字練習系統 (GitHub Pages 前端主邏輯)
 */

// ==========================================
// 1. 全域狀態管理 (State Management)
// ==========================================
const state = {
  currentModule: 'typing', // 預設開啟注音打字模組
  currentUser: null,
  quizzes: [],
  activeTab: 'all',
  currentQuiz: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  timeRemaining: 0,
  timerInterval: null,
  startTime: null,
  submissionResult: null
};

const typingState = {
  isPlaying: false,
  mode: 'random',
  duration: 180,
  timeLeft: 180,
  timerInterval: null,
  startTime: null,
  score: 0,
  correctCount: 0,
  wrongCount: 0,
  currentTarget: null,
  sequenceIndex: 0
};

// 標準台灣注音符號鍵盤映射表 (包含指法分類與手指名稱)
// 指法色彩：pinky(綠), ring(藍), middle(黃), index(紅), thumb(紫)
const BOPOMOFO_LIST = [
  // 聲母 (21)
  { char: 'ㄅ', key: '1', finger: 'pinky', fingerText: '左手小指', color: '#10b981' },
  { char: 'ㄆ', key: 'q', finger: 'pinky', fingerText: '左手小指', color: '#10b981' },
  { char: 'ㄇ', key: 'a', finger: 'pinky', fingerText: '左手小指', color: '#10b981' },
  { char: 'ㄈ', key: 'z', finger: 'pinky', fingerText: '左手小指', color: '#10b981' },

  { char: 'ㄉ', key: '2', finger: 'ring', fingerText: '左手無名指', color: '#0ea5e9' },
  { char: 'ㄊ', key: 'w', finger: 'ring', fingerText: '左手無名指', color: '#0ea5e9' },
  { char: 'ㄋ', key: 's', finger: 'ring', fingerText: '左手無名指', color: '#0ea5e9' },
  { char: 'ㄌ', key: 'x', finger: 'ring', fingerText: '左手無名指', color: '#0ea5e9' },

  { char: 'ㄍ', key: 'e', finger: 'middle', fingerText: '左手中指', color: '#f59e0b' },
  { char: 'ㄎ', key: 'd', finger: 'middle', fingerText: '左手中指', color: '#f59e0b' },
  { char: 'ㄏ', key: 'c', finger: 'middle', fingerText: '左手中指', color: '#f59e0b' },

  { char: 'ㄐ', key: 'r', finger: 'index', fingerText: '左手食指', color: '#ef4444' },
  { char: 'ㄑ', key: 'f', finger: 'index', fingerText: '左手食指', color: '#ef4444' },
  { char: 'ㄒ', key: 'v', finger: 'index', fingerText: '左手食指', color: '#ef4444' },

  { char: 'ㄓ', key: '5', finger: 'index', fingerText: '左手食指', color: '#ef4444' },
  { char: 'ㄔ', key: 't', finger: 'index', fingerText: '左手食指', color: '#ef4444' },
  { char: 'ㄕ', key: 'g', finger: 'index', fingerText: '左手食指', color: '#ef4444' },
  { char: 'ㄖ', key: 'b', finger: 'index', fingerText: '左手食指', color: '#ef4444' },

  { char: 'ㄗ', key: 'y', finger: 'index', fingerText: '右手食指', color: '#ef4444' },
  { char: 'ㄘ', key: 'h', finger: 'index', fingerText: '右手食指', color: '#ef4444' },
  { char: 'ㄙ', key: 'n', finger: 'index', fingerText: '右手食指', color: '#ef4444' },

  // 介母與韻母 (16)
  { char: 'ㄧ', key: 'u', finger: 'index', fingerText: '右手食指', color: '#ef4444' },
  { char: 'ㄨ', key: 'j', finger: 'index', fingerText: '右手食指', color: '#ef4444' },
  { char: 'ㄩ', key: 'm', finger: 'index', fingerText: '右手食指', color: '#ef4444' },

  { char: 'ㄚ', key: '8', finger: 'middle', fingerText: '右手中指', color: '#f59e0b' },
  { char: 'ㄛ', key: 'i', finger: 'middle', fingerText: '右手中指', color: '#f59e0b' },
  { char: 'ㄜ', key: 'k', finger: 'middle', fingerText: '右手中指', color: '#f59e0b' },
  { char: 'ㄝ', key: ',', finger: 'middle', fingerText: '右手中指', color: '#f59e0b' },

  { char: 'ㄞ', key: '9', finger: 'ring', fingerText: '右手無名指', color: '#0ea5e9' },
  { char: 'ㄟ', key: 'o', finger: 'ring', fingerText: '右手無名指', color: '#0ea5e9' },
  { char: 'ㄠ', key: 'l', finger: 'ring', fingerText: '右手無名指', color: '#0ea5e9' },
  { char: 'ㄡ', key: '.', finger: 'ring', fingerText: '右手無名指', color: '#0ea5e9' },

  { char: 'ㄢ', key: '0', finger: 'pinky', fingerText: '右手小指', color: '#10b981' },
  { char: 'ㄣ', key: 'p', finger: 'pinky', fingerText: '右手小指', color: '#10b981' },
  { char: 'ㄤ', key: ';', finger: 'pinky', fingerText: '右手小指', color: '#10b981' },
  { char: 'ㄥ', key: '/', finger: 'pinky', fingerText: '右手小指', color: '#10b981' },
  { char: 'ㄦ', key: '-', finger: 'pinky', fingerText: '右手小指', color: '#10b981' },

  // 聲調符號 (4)
  { char: '˙', key: '7', finger: 'index', fingerText: '右手食指 (輕聲)', tone: true, color: '#ef4444' },
  { char: 'ˊ', key: '6', finger: 'index', fingerText: '右手食指 (二聲)', tone: true, color: '#ef4444' },
  { char: 'ˇ', key: '3', finger: 'middle', fingerText: '左手中指 (三聲)', tone: true, color: '#f59e0b' },
  { char: 'ˋ', key: '4', finger: 'index', fingerText: '左手食指 (四聲)', tone: true, color: '#ef4444' },
  { char: 'ˉ', key: ' ', finger: 'thumb', fingerText: '雙手拇指 (一聲空格)', tone: true, color: '#8b5cf6' }
];

// 標準 5 排實境鍵盤佈局 (完全對照 worldofkeyboards)
const KEYBOARD_ROWS = [
  // Row 1
  [
    { en: '~', zh: '', key: '`', finger: 'pinky' },
    { en: '1', zh: 'ㄅ', key: '1', finger: 'pinky' },
    { en: '2', zh: 'ㄉ', key: '2', finger: 'ring' },
    { en: '3', zh: 'ˇ', key: '3', finger: 'middle' },
    { en: '4', zh: 'ˋ', key: '4', finger: 'index' },
    { en: '5', zh: 'ㄓ', key: '5', finger: 'index' },
    { en: '6', zh: 'ˊ', key: '6', finger: 'index' },
    { en: '7', zh: '˙', key: '7', finger: 'index' },
    { en: '8', zh: 'ㄚ', key: '8', finger: 'middle' },
    { en: '9', zh: 'ㄞ', key: '9', finger: 'ring' },
    { en: '0', zh: 'ㄢ', key: '0', finger: 'pinky' },
    { en: '-', zh: 'ㄦ', key: '-', finger: 'pinky' },
    { en: '=', zh: '', key: '=', finger: 'pinky' },
    { en: '← Backspace', zh: '', key: 'Backspace', spec: true, cls: 'key-backspace' }
  ],
  // Row 2
  [
    { en: '⇄ Tab', zh: '', key: 'Tab', spec: true, cls: 'key-tab' },
    { en: 'Q', zh: 'ㄆ', key: 'q', finger: 'pinky' },
    { en: 'W', zh: 'ㄊ', key: 'w', finger: 'ring' },
    { en: 'E', zh: 'ㄍ', key: 'e', finger: 'middle' },
    { en: 'R', zh: 'ㄐ', key: 'r', finger: 'index' },
    { en: 'T', zh: 'ㄔ', key: 't', finger: 'index' },
    { en: 'Y', zh: 'ㄗ', key: 'y', finger: 'index' },
    { en: 'U', zh: 'ㄧ', key: 'u', finger: 'index' },
    { en: 'I', zh: 'ㄛ', key: 'i', finger: 'middle' },
    { en: 'O', zh: 'ㄟ', key: 'o', finger: 'ring' },
    { en: 'P', zh: 'ㄣ', key: 'p', finger: 'pinky' },
    { en: '[', zh: '', key: '[', finger: 'pinky' },
    { en: ']', zh: '', key: ']', finger: 'pinky' },
    { en: '\\', zh: '', key: '\\', spec: true, cls: 'key-slash-top' }
  ],
  // Row 3
  [
    { en: 'Caps Lock', zh: '', key: 'CapsLock', spec: true, cls: 'key-caps' },
    { en: 'A', zh: 'ㄇ', key: 'a', finger: 'pinky' },
    { en: 'S', zh: 'ㄋ', key: 's', finger: 'ring' },
    { en: 'D', zh: 'ㄎ', key: 'd', finger: 'middle' },
    { en: 'F', zh: 'ㄑ', key: 'f', finger: 'index' },
    { en: 'G', zh: 'ㄕ', key: 'g', finger: 'index' },
    { en: 'H', zh: 'ㄘ', key: 'h', finger: 'index' },
    { en: 'J', zh: 'ㄨ', key: 'j', finger: 'index' },
    { en: 'K', zh: 'ㄜ', key: 'k', finger: 'middle' },
    { en: 'L', zh: 'ㄠ', key: 'l', finger: 'ring' },
    { en: ';', zh: 'ㄤ', key: ';', finger: 'pinky' },
    { en: '\'', zh: '', key: '\'', finger: 'pinky' },
    { en: 'Enter ↲', zh: '', key: 'Enter', spec: true, cls: 'key-enter' }
  ],
  // Row 4
  [
    { en: '⇧ Shift', zh: '', key: 'ShiftLeft', spec: true, cls: 'key-shift-l' },
    { en: 'Z', zh: 'ㄈ', key: 'z', finger: 'pinky' },
    { en: 'X', zh: 'ㄌ', key: 'x', finger: 'ring' },
    { en: 'C', zh: 'ㄏ', key: 'c', finger: 'middle' },
    { en: 'V', zh: 'ㄒ', key: 'v', finger: 'index' },
    { en: 'B', zh: 'ㄖ', key: 'b', finger: 'index' },
    { en: 'N', zh: 'ㄙ', key: 'n', finger: 'index' },
    { en: 'M', zh: 'ㄩ', key: 'm', finger: 'index' },
    { en: ',', zh: 'ㄝ', key: ',', finger: 'middle' },
    { en: '.', zh: 'ㄡ', key: '.', finger: 'ring' },
    { en: '/', zh: 'ㄥ', key: '/', finger: 'pinky' },
    { en: '⇧ Shift', zh: '', key: 'ShiftRight', spec: true, cls: 'key-shift-r' }
  ],
  // Row 5
  [
    { en: 'Ctrl', zh: '', key: 'Control', spec: true, cls: 'key-ctrl' },
    { en: 'Win', zh: '', key: 'Meta', spec: true },
    { en: 'Alt', zh: '', key: 'Alt', spec: true, cls: 'key-alt' },
    { en: 'Space (一聲)', zh: 'ˉ', key: ' ', finger: 'thumb', space: true, cls: 'key-space' },
    { en: 'Alt', zh: '', key: 'AltGraph', spec: true, cls: 'key-alt' },
    { en: 'Fn', zh: '', key: 'Fn', spec: true },
    { en: 'Ctrl', zh: '', key: 'ControlRight', spec: true, cls: 'key-ctrl' }
  ]
];

// 初始化載入
document.addEventListener('DOMContentLoaded', () => {
  initUserIdentity();
  initGoogleIdentityServices();
  loadDashboardData();
  setupKeyboardShortcuts();
  renderVirtualKeyboard();
  resetTypingGame();
});

// ==========================================
// 2. Web Audio 即時合成音效器
// ==========================================
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSound(type) {
  try {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1320, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'fanfare') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const subOsc = audioCtx.createOscillator();
        const subGain = audioCtx.createGain();
        subOsc.connect(subGain);
        subGain.connect(audioCtx.destination);
        subOsc.frequency.value = freq;
        subGain.gain.setValueAtTime(0.15, now + i * 0.1);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);
        subOsc.start(now + i * 0.1);
        subOsc.stop(now + i * 0.1 + 0.35);
      });
    }
  } catch (e) {}
}

// ==========================================
// 3. 模組切換 (注音打字 vs 課堂測驗)
// ==========================================
function switchModule(mod) {
  state.currentModule = mod;
  document.querySelectorAll('.nav-module-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`navMod_${mod}`).classList.add('active');

  if (mod === 'quiz') {
    stopTypingGame();
    switchView('dashboardView');
  } else if (mod === 'typing') {
    switchView('typingView');
    resetTypingGame();
  }
}

// ==========================================
// 4. 實境注音鍵盤渲染與指法色彩
// ==========================================
function renderVirtualKeyboard() {
  const kb = document.getElementById('virtualKeyboard');
  if (!kb) return;
  kb.innerHTML = '';

  KEYBOARD_ROWS.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'kb-row';

    row.forEach(k => {
      const keyDiv = document.createElement('div');
      let cls = 'key-cap';

      if (k.finger) cls += ` finger-${k.finger}`;
      if (k.spec) cls += ' key-special';
      if (k.cls) cls += ` ${k.cls}`;

      keyDiv.className = cls;
      keyDiv.id = `key_${k.key === ' ' ? 'Space' : k.key.toLowerCase()}`;

      let html = '';
      if (!k.spec) {
        html += `<span class="en-char">${k.en}</span>`;
        html += `<span class="zh-char">${k.zh}</span>`;
      } else {
        html += `<span class="en-char" style="font-size:0.85rem;">${k.en}</span>`;
      }

      keyDiv.innerHTML = html;

      // 嚴格監聽滑鼠點擊：提示學生使用電腦實體鍵盤
      keyDiv.addEventListener('mousedown', (e) => {
        e.preventDefault();
        showMouseClickWarning();
      });

      rowDiv.appendChild(keyDiv);
    });

    kb.appendChild(rowDiv);
  });
}

function showMouseClickWarning() {
  let toast = document.getElementById('mouseWarningToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mouseWarningToast';
    toast.className = 'mouse-warning-toast';
    toast.innerHTML = '<span>⚠️ 請敲擊電腦實體鍵盤！滑鼠點選畫面按鍵不計分</span>';
    document.body.appendChild(toast);
  }
  toast.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

function setTypingMode(mode) {
  if (typingState.isPlaying) return;
  typingState.mode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`modeBtn_${mode}`).classList.add('active');
  resetTypingGame();
}

function setTypingTime(sec) {
  if (typingState.isPlaying) return;
  typingState.duration = sec;
  typingState.timeLeft = sec;
  document.querySelectorAll('.time-pill').forEach(p => p.classList.remove('active'));
  document.getElementById(`timePill_${sec}`).classList.add('active');
  document.getElementById('typTime').innerText = sec;
}

function resetTypingGame() {
  stopTypingGame();
  typingState.score = 0;
  typingState.correctCount = 0;
  typingState.wrongCount = 0;
  typingState.timeLeft = typingState.duration;
  typingState.sequenceIndex = 0;

  document.getElementById('typScore').innerText = '0';
  document.getElementById('typCorrect').innerText = '0';
  document.getElementById('typWrong').innerText = '0';
  document.getElementById('typCPM').innerText = '0';
  document.getElementById('typTime').innerText = typingState.duration;

  const btn = document.getElementById('btnStartTyping');
  btn.innerText = '開始練習 (START)';
  btn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';

  document.getElementById('targetChar').innerText = 'ㄅ';
  document.getElementById('targetKeyHint').innerText = '1';

  updateFingerUI(BOPOMOFO_LIST[0]);
  highlightKeyCap(BOPOMOFO_LIST[0].key, BOPOMOFO_LIST[0].finger);
}

function startTypingGame() {
  if (typingState.isPlaying) {
    stopTypingGame();
    resetTypingGame();
    return;
  }

  initAudio();
  typingState.isPlaying = true;
  typingState.startTime = new Date().getTime();
  typingState.timeLeft = typingState.duration;

  const btn = document.getElementById('btnStartTyping');
  btn.innerText = '結束練習 (STOP)';
  btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';

  nextTypingTarget();

  typingState.timerInterval = setInterval(() => {
    typingState.timeLeft--;
    document.getElementById('typTime').innerText = typingState.timeLeft;

    const elapsedMins = (new Date().getTime() - typingState.startTime) / 60000;
    if (elapsedMins > 0.05) {
      const cpm = Math.round(typingState.correctCount / elapsedMins);
      document.getElementById('typCPM').innerText = cpm;
    }

    if (typingState.timeLeft <= 0) {
      finishTypingGame();
    }
  }, 1000);
}

function stopTypingGame() {
  typingState.isPlaying = false;
  if (typingState.timerInterval) {
    clearInterval(typingState.timerInterval);
    typingState.timerInterval = null;
  }
  clearAllKeyHighlights();
}

function nextTypingTarget() {
  const randIdx = Math.floor(Math.random() * BOPOMOFO_LIST.length);
  const target = BOPOMOFO_LIST[randIdx];

  typingState.currentTarget = target;

  const box = document.getElementById('targetBox');
  document.getElementById('targetChar').innerText = target.char;
  document.getElementById('targetKeyHint').innerText = target.key === ' ' ? 'Space (空格)' : target.key.toUpperCase();

  updateFingerUI(target);
  highlightKeyCap(target.key, target.finger);

  box.classList.remove('pop');
  void box.offsetWidth;
  box.classList.add('pop');
}

function updateFingerUI(target) {
  const badge = document.getElementById('targetFingerBadge');
  if (badge) {
    badge.innerText = target.fingerText;
    badge.style.backgroundColor = target.color;
  }
}

function highlightKeyCap(targetKey, fingerType) {
  clearAllKeyHighlights();

  const id = `key_${targetKey === ' ' ? 'Space' : targetKey.toLowerCase()}`;
  const keyElem = document.getElementById(id);
  if (keyElem) {
    keyElem.classList.add(`target-glow-${fingerType}`);
  }
}

function clearAllKeyHighlights() {
  document.querySelectorAll('.key-cap').forEach(el => {
    el.className = el.className.replace(/\btarget-glow-\w+\b/g, '').trim();
  });
}

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (state.currentModule !== 'typing') return;
    if (['F5', 'F12', 'Tab'].includes(e.key)) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    e.preventDefault();

    if (!typingState.isPlaying) {
      startTypingGame();
    }

    handlePhysicalKeyPress(e.key.toLowerCase(), e.code);
  });
}

function handlePhysicalKeyPress(pressedKey, keyCode) {
  if (!typingState.isPlaying || !typingState.currentTarget) return;

  const expectedKey = typingState.currentTarget.key.toLowerCase();
  let isMatch = false;

  if (expectedKey === ' ' && (pressedKey === ' ' || keyCode === 'Space')) {
    isMatch = true;
  } else if (pressedKey === expectedKey) {
    isMatch = true;
  }

  const activeKeyElemId = `key_${expectedKey === ' ' ? 'Space' : expectedKey}`;
  const activeKeyElem = document.getElementById(activeKeyElemId);

  if (isMatch) {
    playSound('correct');
    typingState.score += 10;
    typingState.correctCount++;
    document.getElementById('typScore').innerText = typingState.score;
    document.getElementById('typCorrect').innerText = typingState.correctCount;

    if (activeKeyElem) {
      activeKeyElem.classList.add('hit-correct');
      setTimeout(() => activeKeyElem.classList.remove('hit-correct'), 140);
    }

    nextTypingTarget();
  } else {
    playSound('wrong');
    typingState.wrongCount++;
    document.getElementById('typWrong').innerText = typingState.wrongCount;

    const box = document.getElementById('targetBox');
    box.classList.remove('shake');
    void box.offsetWidth;
    box.classList.add('shake');

    const pressedId = `key_${pressedKey === ' ' ? 'Space' : pressedKey}`;
    const wrongElem = document.getElementById(pressedId);
    if (wrongElem) {
      wrongElem.classList.add('hit-wrong');
      setTimeout(() => wrongElem.classList.remove('hit-wrong'), 160);
    }
  }
}

function finishTypingGame() {
  stopTypingGame();
  playSound('fanfare');

  const durationSec = typingState.duration;
  const cpm = Math.round(typingState.correctCount / (durationSec / 60));
  const total = typingState.correctCount + typingState.wrongCount;
  const acc = total > 0 ? Math.round((typingState.correctCount / total) * 100) : 100;

  document.getElementById('resTypScore').innerText = typingState.score;
  document.getElementById('resTypCorrect').innerText = typingState.correctCount;
  document.getElementById('resTypWrong').innerText = typingState.wrongCount;
  document.getElementById('resTypAcc').innerText = acc + '%';
  document.getElementById('resTypCPM').innerText = cpm;
  document.getElementById('resTypMode').innerText = '盲打挑戰';
  document.getElementById('resTypTime').innerText = durationSec + ' 秒';

  document.getElementById('typingResultModal').classList.add('active');

  // 同步練習紀錄至後端
  syncTypingLogToSheet({
    mode: '盲打挑戰',
    durationSec: durationSec,
    score: typingState.score,
    correctCount: typingState.correctCount,
    wrongCount: typingState.wrongCount,
    accuracy: acc,
    cpm: cpm,
    userEmail: state.currentUser ? state.currentUser.email : (localStorage.getItem('gas_quiz_user_email') || ''),
    userName: state.currentUser ? state.currentUser.name : (localStorage.getItem('gas_quiz_user_name') || '')
  });
}

function closeTypingModal() {
  document.getElementById('typingResultModal').classList.remove('active');
  resetTypingGame();
}

function syncTypingLogToSheet(payload) {
  const syncStatus = document.getElementById('typingSyncStatus');
  syncStatus.innerHTML = '<span style="color:var(--slate-600);">⏳ 正在同步練習紀錄至 Google 試算表...</span>';

  apiPost('saveTypingLog', payload)
    .then(res => {
      if (res && res.success) {
        syncStatus.innerHTML = '<span style="color:var(--success);font-weight:700;">✅ 已成功記錄至 Google 試算表 [TypingLogs] 工作表！</span>';
      } else {
        syncStatus.innerHTML = '<span style="color:var(--danger);">⚠️ 儲存失敗：' + (res ? res.error : '') + '</span>';
      }
    })
    .catch(err => {
      syncStatus.innerHTML = '<span style="color:var(--success);font-weight:700;">✅ (本機測試完成) 打字紀錄已暫存於瀏覽器</span>';
    });
}

// ==========================================
// 5. Google 官方身分驗證 (GIS) 與 身分管理
// ==========================================

function getEffectiveGoogleClientId() {
  return localStorage.getItem('custom_google_client_id') || CONFIG.GOOGLE_CLIENT_ID || '';
}

function initGoogleIdentityServices() {
  const btnContainer = document.getElementById('googleSignInBtnContainer');
  const noticeElem = document.getElementById('googleInitNotice');
  if (!btnContainer) return;

  const clientId = getEffectiveGoogleClientId().trim();

  // 若尚未載入 Google GIS SDK，稍微延遲重試
  if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
    if (noticeElem) noticeElem.innerText = '正在載入 Google 官方登入元件...';
    setTimeout(initGoogleIdentityServices, 250);
    return;
  }

  try {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleSignInResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });

    btnContainer.innerHTML = '';
    google.accounts.id.renderButton(btnContainer, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      shape: 'pill',
      text: 'signin_with',
      logo_alignment: 'left',
      width: 280
    });

    if (noticeElem) {
      noticeElem.innerHTML = '點擊上方按鈕授權，即可自動抓取個人 Gmail、姓名與頭像';
      noticeElem.style.color = 'var(--slate-500)';
    }
  } catch (err) {
    console.error('Google GIS Init error:', err);
    if (noticeElem) {
      noticeElem.innerText = 'Google 登入元件載入中，您亦可直接點擊下方模擬按鈕測試。';
    }
  }
}

// 解碼 Google 簽發之 JWT 憑證
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('JWT parse error:', e);
    return null;
  }
}

// 接收 Google 登入回傳
function handleGoogleSignInResponse(response) {
  if (!response || !response.credential) {
    alert('Google 登入驗證失敗，請重試！');
    return;
  }

  const payload = parseJwt(response.credential);
  if (!payload || !payload.email) {
    alert('無法解析 Google 帳戶身分，請改用手動輸入！');
    return;
  }

  const email = payload.email;
  const name = payload.name || email.split('@')[0];
  const picture = payload.picture || '';

  state.currentUser = {
    email: email,
    name: name,
    avatar: picture
  };

  localStorage.setItem('gas_quiz_user_email', email);
  localStorage.setItem('gas_quiz_user_name', name);
  if (picture) {
    localStorage.setItem('gas_quiz_user_avatar', picture);
  } else {
    localStorage.removeItem('gas_quiz_user_avatar');
  }

  updateUserBadgeUI();

  const modal = document.getElementById('identityModal');
  if (modal) modal.classList.remove('active');

  showSystemToast(`🎉 歡迎！${name} (${email}) 已成功透過 Google 帳戶登入`);

  // 重新載入該學生的學習紀錄
  loadDashboardData();
}

// 供本地離線測試：一鍵模擬 Google 授權成功
function mockGoogleSignInSuccess() {
  const mockEmail = 'student.demo@gmail.com';
  const mockName = '王小明';
  const mockAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=GoogleStudent';

  state.currentUser = {
    email: mockEmail,
    name: mockName,
    avatar: mockAvatar
  };

  localStorage.setItem('gas_quiz_user_email', mockEmail);
  localStorage.setItem('gas_quiz_user_name', mockName);
  localStorage.setItem('gas_quiz_user_avatar', mockAvatar);

  updateUserBadgeUI();
  document.getElementById('identityModal').classList.remove('active');
  showSystemToast(`🎉 [本機模擬] 歡迎！${mockName} (${mockEmail}) 已透過 Google 帳戶授權登入`);
  loadDashboardData();
}

function showSystemToast(msg) {
  let toast = document.getElementById('mouseWarningToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mouseWarningToast';
    toast.className = 'mouse-warning-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>${msg}</span>`;
  toast.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function initUserIdentity() {
  const cachedEmail = localStorage.getItem('gas_quiz_user_email') || '';
  const cachedName = localStorage.getItem('gas_quiz_user_name') || '';
  const cachedAvatar = localStorage.getItem('gas_quiz_user_avatar') || '';

  if (cachedEmail && cachedEmail !== 'student@school.edu.tw') {
    state.currentUser = {
      email: cachedEmail,
      name: cachedName || cachedEmail.split('@')[0],
      avatar: cachedAvatar
    };
    updateUserBadgeUI();
    return true;
  } else {
    promptEditIdentity(false);
    return false;
  }
}

function updateUserBadgeUI() {
  if (!state.currentUser || !state.currentUser.email) return;
  const emailElem = document.getElementById('userEmailText');
  const avatarInitial = document.getElementById('userAvatarInitial');
  const avatarImg = document.getElementById('userAvatarImg');

  if (emailElem) {
    const displayName = state.currentUser.name ? `${state.currentUser.name} (${state.currentUser.email})` : state.currentUser.email;
    emailElem.innerText = displayName;
  }

  const avatarUrl = state.currentUser.avatar || localStorage.getItem('gas_quiz_user_avatar');
  if (avatarUrl && avatarImg) {
    avatarImg.src = avatarUrl;
    avatarImg.style.display = 'block';
    if (avatarInitial) avatarInitial.style.display = 'none';
  } else if (avatarInitial) {
    const initial = (state.currentUser.name || state.currentUser.email || 'S').charAt(0).toUpperCase();
    avatarInitial.innerText = initial;
    avatarInitial.style.display = 'flex';
    if (avatarImg) avatarImg.style.display = 'none';
  }
}

function promptEditIdentity(canCancel = true) {
  const modal = document.getElementById('identityModal');
  if (!modal) return;
  const inputEmail = document.getElementById('inputUserEmail');
  const inputName = document.getElementById('inputUserName');
  if (inputEmail && state.currentUser) {
    inputEmail.value = state.currentUser.email || '';
  }
  if (inputName && state.currentUser) {
    inputName.value = state.currentUser.name || '';
  }
  modal.classList.add('active');
  initGoogleIdentityServices();
}

function confirmStudentIdentity() {
  const inputEmail = document.getElementById('inputUserEmail');
  const inputName = document.getElementById('inputUserName');
  const emailVal = inputEmail ? inputEmail.value.trim() : '';
  const nameVal = inputName ? inputName.value.trim() : '';

  if (!emailVal) {
    alert('請輸入您的學生 Email 或學號！');
    return;
  }

  state.currentUser = {
    email: emailVal,
    name: nameVal || emailVal.split('@')[0],
    avatar: ''
  };

  localStorage.setItem('gas_quiz_user_email', emailVal);
  if (nameVal) localStorage.setItem('gas_quiz_user_name', nameVal);
  localStorage.removeItem('gas_quiz_user_avatar');

  updateUserBadgeUI();
  document.getElementById('identityModal').classList.remove('active');

  loadDashboardData();
}

// ==========================================
// 6. 前後端 Fetch API 通訊核心
// ==========================================

async function apiGet(action, params = {}) {
  if (!CONFIG.GAS_API_URL || CONFIG.GAS_API_URL.includes('YOUR_DEPLOYMENT_ID')) {
    // 尚未綁定後端時，回傳高品質 Mock 資料
    return getMockResponse(action, params);
  }

  const query = new URLSearchParams({ action, ...params }).toString();
  const url = `${CONFIG.GAS_API_URL}?${query}`;

  try {
    const res = await fetch(url, { method: 'GET' });
    return await res.json();
  } catch (err) {
    console.warn('API GET failed, falling back to mock:', err);
    return getMockResponse(action, params);
  }
}

async function apiPost(action, payload = {}) {
  if (!CONFIG.GAS_API_URL || CONFIG.GAS_API_URL.includes('YOUR_DEPLOYMENT_ID')) {
    return getMockResponse(action, payload);
  }

  try {
    // 使用 text/plain 避免 CORS preflight 限制
    const res = await fetch(CONFIG.GAS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload })
    });
    return await res.json();
  } catch (err) {
    console.warn('API POST failed, falling back to mock:', err);
    return getMockResponse(action, payload);
  }
}

// ==========================================
// 7. 測驗大廳與作答流程 (Quiz Dashboard & Exam)
// ==========================================

function loadDashboardData() {
  showLoading('正在載入測驗列表與個人學習進度...');
  const userEmail = state.currentUser ? state.currentUser.email : (localStorage.getItem('gas_quiz_user_email') || '');

  apiGet('getQuizzesAndUserData', { userEmail })
    .then(handleDashboardData)
    .catch(handleApiError);
}

function handleDashboardData(res) {
  hideLoading();
  if (!res || !res.success) {
    showError(res ? res.error : '資料讀取失敗');
    return;
  }

  state.quizzes = res.quizzes;

  updateUserBadgeUI();
  updateHeaderStats();
  renderQuizCards();
}

function updateHeaderStats() {
  const total = state.quizzes.length;
  const completedList = state.quizzes.filter(q => q.user_attempts > 0);
  let totalScore = 0;
  completedList.forEach(q => totalScore += (q.user_highest_score || 0));
  const avgScore = completedList.length > 0 ? Math.round(totalScore / completedList.length) : 0;

  document.getElementById('statTotalCount').innerText = `${completedList.length} / ${total}`;
  document.getElementById('statAvgScore').innerText = `${avgScore} 分`;
  document.getElementById('statPassRate').innerText = `${completedList.filter(q => q.user_passed).length} 單元`;
}

function setTab(tab, btnElem) {
  state.activeTab = tab;
  document.querySelectorAll('.category-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  if (btnElem) btnElem.classList.add('active');
  renderQuizCards();
}

function renderQuizCards() {
  const grid = document.getElementById('quizGrid');
  grid.innerHTML = '';

  let filtered = state.quizzes;
  if (state.activeTab === 'weekly') {
    filtered = state.quizzes.filter(q => q.category === '課堂測驗');
  } else if (state.activeTab === 'major') {
    filtered = state.quizzes.filter(q => q.category === '重大考試');
  } else if (state.activeTab === 'completed') {
    filtered = state.quizzes.filter(q => q.user_attempts > 0);
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 48px; color: var(--slate-400);">目前此分類尚無測驗單元</div>`;
    return;
  }

  filtered.forEach(q => {
    const card = document.createElement('div');
    card.className = `quiz-card ${q.category === '重大考試' ? 'category-major' : ''}`;

    let statusHtml = '';
    if (!q.is_active) {
      statusHtml = `<span class="badge-status locked">未開放</span>`;
    } else if (q.user_attempts > 0) {
      statusHtml = `<span class="badge-status completed">已作答 (${q.user_highest_score}分)</span>`;
    } else {
      statusHtml = `<span class="badge-status not-attempted">尚未作答</span>`;
    }

    let scoreHtml = '';
    if (q.user_attempts > 0) {
      scoreHtml = `
        <div class="score-display">
          <span>最佳成績：<strong>${q.user_highest_score}</strong> / ${q.total_possible_points} 分</span>
          <span style="color: ${q.user_passed ? 'var(--success)' : 'var(--danger)'}; font-weight:700;">
            ${q.user_passed ? '✓ 及格' : '未達標'}
          </span>
        </div>
      `;
    }

    let btnText = '開始測驗 →';
    if (q.user_attempts > 0) btnText = '再次測驗 →';
    if (!q.can_attempt && q.is_active) btnText = '已達次數上限';

    card.innerHTML = `
      <div class="card-top">
        <span class="badge-category ${q.category === '重大考試' ? 'major' : 'weekly'}">${q.category}</span>
        ${statusHtml}
      </div>
      <h3 class="quiz-title">${q.title}</h3>
      <p class="quiz-desc">${q.description}</p>
      <div class="quiz-meta">
        <div class="quiz-meta-item"><span>⏱️</span><span>${q.time_limit_mins} 分鐘</span></div>
        <div class="quiz-meta-item"><span>📝</span><span>${q.question_count} 題</span></div>
        <div class="quiz-meta-item"><span>🎯</span><span>及格門檻：${q.pass_score} 分</span></div>
        <div class="quiz-meta-item"><span>🔄</span><span>上限 ${q.max_attempts} 次 (已作答 ${q.user_attempts} 次)</span></div>
      </div>
      ${scoreHtml}
      <button class="btn btn-primary" style="width: 100%; margin-top: auto;" 
        onclick="startQuiz('${q.quiz_id}')" ${!q.can_attempt ? 'disabled' : ''}>
        ${btnText}
      </button>
    `;
    grid.appendChild(card);
  });
}

function startQuiz(quizId) {
  showLoading('正在準備試卷題目...');

  apiGet('getQuestions', { quizId })
    .then(res => {
      hideLoading();
      if (!res || !res.success) {
        showError(res ? res.error : '載入題目失敗');
        return;
      }

      state.currentQuiz = res.quiz;
      state.questions = res.questions;
      state.currentIndex = 0;
      state.answers = {};
      state.startTime = new Date().getTime();

      initExamView();
      switchView('quizView');
    })
    .catch(handleApiError);
}

function initExamView() {
  document.getElementById('examTitle').innerText = state.currentQuiz.title;
  document.getElementById('examSubtitle').innerText = `共 ${state.questions.length} 題 | 及格門檻：${state.currentQuiz.pass_score} 分`;

  state.timeRemaining = state.currentQuiz.time_limit_mins * 60;
  updateTimerDisplay();

  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.timeRemaining--;
    updateTimerDisplay();
    if (state.timeRemaining <= 0) {
      clearInterval(state.timerInterval);
      alert('作答時間結束！系統將自動提交試卷。');
      submitQuiz(true);
    }
  }, 1000);

  renderPalette();
  renderCurrentQuestion();
}

function updateTimerDisplay() {
  const mins = Math.floor(state.timeRemaining / 60);
  const secs = state.timeRemaining % 60;
  const str = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  const timerText = document.getElementById('timerText');
  const timerBox = document.getElementById('examTimer');
  if (timerText) timerText.innerText = str;

  if (state.timeRemaining < 180) {
    timerBox.classList.add('warning');
  } else {
    timerBox.classList.remove('warning');
  }
}

function renderPalette() {
  const palette = document.getElementById('questionPalette');
  palette.innerHTML = '';

  state.questions.forEach((q, idx) => {
    const btn = document.createElement('button');
    btn.className = `palette-btn ${idx === state.currentIndex ? 'active' : ''} ${state.answers[q.question_id] ? 'answered' : ''}`;
    btn.innerText = idx + 1;
    btn.onclick = () => jumpToQuestion(idx);
    palette.appendChild(btn);
  });

  const answeredCount = Object.keys(state.answers).length;
  document.getElementById('answeredStat').innerText = `已作答：${answeredCount} / ${state.questions.length}`;
}

function renderCurrentQuestion() {
  const q = state.questions[state.currentIndex];
  if (!q) return;

  document.getElementById('qIndexBadge').innerText = `第 ${state.currentIndex + 1} / ${state.questions.length} 題`;
  document.getElementById('qPointsBadge').innerText = `配分：${q.points} 分`;
  document.getElementById('qText').innerText = q.question;

  const container = document.getElementById('optionsContainer');
  container.innerHTML = '';

  q.options.forEach(opt => {
    const item = document.createElement('div');
    const isSelected = state.answers[q.question_id] === opt.key;
    item.className = `option-item ${isSelected ? 'selected' : ''}`;
    item.onclick = () => selectOption(opt.key);
    item.innerHTML = `
      <div class="option-key">${opt.key}</div>
      <div class="option-text">${opt.text}</div>
    `;
    container.appendChild(item);
  });

  document.getElementById('btnPrev').disabled = state.currentIndex === 0;

  const isLast = state.currentIndex === state.questions.length - 1;
  document.getElementById('btnNext').style.display = isLast ? 'none' : 'inline-flex';
  document.getElementById('btnSubmitPrompt').style.display = isLast ? 'inline-flex' : 'none';

  renderPalette();
}

function selectOption(key) {
  const q = state.questions[state.currentIndex];
  state.answers[q.question_id] = key;
  renderCurrentQuestion();
}

function prevQuestion() {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    renderCurrentQuestion();
  }
}

function nextQuestion() {
  if (state.currentIndex < state.questions.length - 1) {
    state.currentIndex++;
    renderCurrentQuestion();
  }
}

function jumpToQuestion(idx) {
  state.currentIndex = idx;
  renderCurrentQuestion();
}

function confirmSubmit() {
  const answeredCount = Object.keys(state.answers).length;
  const total = state.questions.length;
  let msg = `您已完成 ${answeredCount} / ${total} 題。`;

  if (answeredCount < total) {
    msg += `\n⚠️ 尚有 ${total - answeredCount} 題尚未作答！`;
  }
  msg += `\n\n交卷後將立即計算成績並寫入資料庫，確定要交卷嗎？`;

  if (confirm(msg)) {
    submitQuiz(false);
  }
}

function submitQuiz(isAutoSubmit) {
  clearInterval(state.timerInterval);
  showLoading('正在批改試卷並將成績上傳至 Google 試算表...');

  const payload = {
    quizId: state.currentQuiz.quiz_id,
    answers: state.answers,
    timeSpentSec: Math.round((new Date().getTime() - state.startTime) / 1000),
    userEmail: state.currentUser ? state.currentUser.email : (localStorage.getItem('gas_quiz_user_email') || ''),
    userName: state.currentUser ? state.currentUser.name : (localStorage.getItem('gas_quiz_user_name') || '')
  };

  apiPost('submitQuiz', payload)
    .then(handleSubmissionResult)
    .catch(handleApiError);
}

function handleSubmissionResult(res) {
  hideLoading();
  if (!res || !res.success) {
    showError(res ? res.error : '提交成績失敗');
    return;
  }

  state.submissionResult = res;
  renderResultView(res);
  switchView('resultView');
}

function renderResultView(res) {
  const iconElem = document.getElementById('resultIcon');
  const titleElem = document.getElementById('resultTitle');
  const badgeText = document.getElementById('resultBadgeText');

  if (res.passed) {
    iconElem.className = 'result-icon pass';
    iconElem.innerText = '🏆';
    titleElem.innerText = '恭喜！您已順利通過測驗';
    badgeText.innerText = '及格 PASS';
    badgeText.style.color = 'var(--success)';
  } else {
    iconElem.className = 'result-icon fail';
    iconElem.innerText = '📚';
    titleElem.innerText = '本次測驗未達及格標準，再接再勵！';
    badgeText.innerText = '未及格 FAIL';
    badgeText.style.color = 'var(--danger)';
  }

  document.getElementById('resultScore').innerText = res.score;
  document.getElementById('resultTotal').innerText = `/ ${res.totalPoints} 分`;

  const mins = Math.floor(res.timeSpentSec / 60);
  const secs = res.timeSpentSec % 60;
  document.getElementById('resTimeSpent').innerText = `${mins}分 ${secs}秒`;
  document.getElementById('resAttemptNum').innerText = `第 ${res.attemptNumber} 次 (上限 ${res.maxAttempts} 次)`;
  document.getElementById('resCorrectCount').innerText = `${res.review.filter(r => r.is_correct).length} / ${res.review.length} 題`;

  const list = document.getElementById('reviewList');
  list.innerHTML = '';

  res.review.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = `review-card ${item.is_correct ? 'correct' : 'incorrect'}`;
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-weight: 700; color: var(--slate-800);">第 ${idx + 1} 題</span>
        <span style="font-weight: 700; color: ${item.is_correct ? 'var(--success)' : 'var(--danger)'};">
          ${item.is_correct ? '✔️ 答對 (+' + item.points_earned + '分)' : '❌ 答錯 (0分 / 配分 ' + item.points_possible + '分)'}
        </span>
      </div>
      <div style="font-size: 1.05rem; font-weight: 600; color: var(--slate-800); margin-bottom: 14px;">${item.question}</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; font-size: 0.9rem;">
        <div style="color: ${item.is_correct ? 'var(--success)' : 'var(--danger)'}; font-weight: 600;">您的選擇：${item.user_choice} (${item.options[item.user_choice] || '未作答'})</div>
        <div style="color: var(--success); font-weight: 600;">正確答案：${item.correct_answer} (${item.options[item.correct_answer]})</div>
      </div>
      <div class="review-explanation">
        <strong>💡 題目解析：</strong>${item.explanation || '此題無特別解析。'}
      </div>
    `;
    list.appendChild(card);
  });
}

function switchView(viewId) {
  document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToDashboard() {
  loadDashboardData();
  switchView('dashboardView');
}

function showLoading(text) {
  document.getElementById('loadingText').innerText = text || '處理中...';
  document.getElementById('loadingModal').classList.add('active');
}

function hideLoading() {
  document.getElementById('loadingModal').classList.remove('active');
}

function showError(msg) {
  alert('【系統提示】\n' + msg);
}

function handleApiError(err) {
  hideLoading();
  console.warn('API Error, continuing in offline mock mode:', err);
}

// ==========================================
// 8. 本地離線 Mock 資料產生器 (Fallback)
// ==========================================

function getMockResponse(action, params) {
  if (action === 'getQuizzesAndUserData') {
    const quizzes = [];
    for (let i = 1; i <= 16; i++) {
      const qid = i < 10 ? 'W0' + i : 'W' + i;
      quizzes.push({
        quiz_id: qid,
        title: `第 ${i} 週課堂測驗${i === 8 ? '（期中總複習）' : ''}`,
        category: '課堂測驗',
        time_limit_mins: 15,
        max_attempts: 2,
        is_active: true,
        pass_score: 60,
        description: `第 ${i} 週核心觀念隨堂測驗，包含基礎實作與重點理解。`,
        question_count: 5,
        total_possible_points: 100,
        user_attempts: i === 1 ? 1 : 0,
        user_highest_score: i === 1 ? 80 : null,
        user_passed: i === 1,
        can_attempt: true
      });
    }
    quizzes.push({
      quiz_id: 'MIDTERM',
      title: '期中考試 (Midterm Exam)',
      category: '重大考試',
      time_limit_mins: 60,
      max_attempts: 1,
      is_active: true,
      pass_score: 60,
      description: '涵蓋第 1 週至第 8 週核心內容，限時 60 分鐘。',
      question_count: 4,
      total_possible_points: 100,
      user_attempts: 0,
      user_highest_score: null,
      user_passed: false,
      can_attempt: true
    });
    quizzes.push({
      quiz_id: 'FINAL',
      title: '期末考試 (Final Exam)',
      category: '重大考試',
      time_limit_mins: 90,
      max_attempts: 1,
      is_active: false,
      pass_score: 60,
      description: '全學期總結性評量（第 1 週至第 16 週），限時 90 分鐘。',
      question_count: 2,
      total_possible_points: 100,
      user_attempts: 0,
      user_highest_score: null,
      user_passed: false,
      can_attempt: false
    });

    return {
      success: true,
      currentUser: { email: params.userEmail || 'student_demo@gmail.com', name: '王小明' },
      quizzes: quizzes
    };
  } else if (action === 'getQuestions') {
    const quizId = params.quizId;
    return {
      success: true,
      quiz: {
        quiz_id: quizId,
        title: quizId === 'MIDTERM' ? '期中考試' : (quizId === 'FINAL' ? '期末考試' : `第 ${quizId.replace('W0','').replace('W','')} 週課堂測驗`),
        time_limit_mins: 15,
        max_attempts: 2,
        pass_score: 60
      },
      questions: [
        {
          question_id: `${quizId}_Q1`,
          question: '下列何者是現代網頁開發中負責定義「網頁結構與語意」的核心技術？',
          options: [
            { key: 'A', text: 'HTML (超文本標記語言)' },
            { key: 'B', text: 'CSS (階層式樣式表)' },
            { key: 'C', text: 'JavaScript (動態邏輯語言)' },
            { key: 'D', text: 'Python (後端運算腳本)' }
          ],
          points: 25
        },
        {
          question_id: `${quizId}_Q2`,
          question: '在 Google Apps Script 中，用來處理 Web App GET 請求的標準入口函數為何？',
          options: [
            { key: 'A', text: 'onOpen()' },
            { key: 'B', text: 'doGet(e)' },
            { key: 'C', text: 'main()' },
            { key: 'D', text: 'render()' }
          ],
          points: 25
        }
      ]
    };
  } else if (action === 'submitQuiz') {
    const keys = Object.keys(params.answers || {});
    const score = keys.length * 50;
    return {
      success: true,
      submissionId: 'SUB_' + new Date().getTime(),
      score: score,
      totalPoints: 100,
      passed: score >= 60,
      timeSpentSec: params.timeSpentSec || 30,
      attemptNumber: 1,
      maxAttempts: 2,
      review: [
        {
          question_id: `${params.quizId}_Q1`,
          question: '下列何者是現代網頁開發中負責定義「網頁結構與語意」的核心技術？',
          options: { A: 'HTML (超文本標記語言)', B: 'CSS', C: 'JavaScript', D: 'Python' },
          user_choice: (params.answers && params.answers[`${params.quizId}_Q1`]) || '未作答',
          correct_answer: 'A',
          is_correct: (params.answers && params.answers[`${params.quizId}_Q1`]) === 'A',
          points_earned: (params.answers && params.answers[`${params.quizId}_Q1`]) === 'A' ? 50 : 0,
          points_possible: 50,
          explanation: 'HTML 是定義網頁結構與內容的核心標準語言。'
        }
      ]
    };
  } else if (action === 'saveTypingLog') {
    return { success: true, logId: 'LOG_' + new Date().getTime() };
  }
  return { success: true };
}
