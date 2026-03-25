/**
 * 瞑想タイマー - こころのクリニック桜が丘
 */
(function () {
  'use strict';

  // --- 定数 ---
  const CIRCUMFERENCE = 2 * Math.PI * 115; // SVG circle r=115
  const STORAGE_KEY = 'meditation_sessions';

  // --- DOM ---
  const $ = (sel) => document.querySelector(sel);
  const setupView = $('#setupView');
  const completeView = $('#completeView');
  const timerTime = $('#timerTime');
  const timerLabel = $('#timerLabel');
  const timerProgress = $('#timerProgress');
  const startBtn = $('#startBtn');
  const stopBtn = $('#stopBtn');
  const playIcon = $('#playIcon');
  const pauseIcon = $('#pauseIcon');
  const durationSelector = $('#durationSelector');
  const timerOptions = $('#timerOptions');
  const bellToggle = $('#bellToggle');
  const ambientToggle = $('#ambientToggle');
  const streakBadge = $('#streakBadge');
  const streakText = $('#streakText');
  const completeMessage = $('#completeMessage');
  const completeDatetime = $('#completeDatetime');
  const newSessionBtn = $('#newSessionBtn');
  const ariaLive = $('#ariaLive');

  // --- 状態 ---
  let state = {
    duration: 5 * 60,    // 秒
    remaining: 5 * 60,
    isRunning: false,
    isPaused: false,
    intervalId: null,
    startTime: null,
    bellEnabled: true,
    ambientEnabled: false
  };

  // --- 音声（Web Audio API） ---
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playBell(frequency, duration) {
    if (!state.bellEnabled) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // 音声再生エラーは無視
    }
  }

  function playStartBell() {
    playBell(528, 2.0); // C5音、柔らかいベル
  }

  function playEndBell() {
    playBell(396, 3.0); // G4音、低く長いベル
    setTimeout(() => playBell(528, 2.5), 800);
    setTimeout(() => playBell(660, 2.0), 1600);
  }

  // --- タイマー表示 ---
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updateDisplay() {
    timerTime.textContent = formatTime(state.remaining);

    const progress = 1 - (state.remaining / state.duration);
    const offset = CIRCUMFERENCE * (1 - progress);
    timerProgress.style.strokeDashoffset = offset;
  }

  function updateControlIcons() {
    if (state.isRunning && !state.isPaused) {
      playIcon.hidden = true;
      pauseIcon.hidden = false;
      stopBtn.hidden = false;
      startBtn.setAttribute('aria-label', '一時停止');
    } else if (state.isPaused) {
      playIcon.hidden = false;
      pauseIcon.hidden = true;
      stopBtn.hidden = false;
      startBtn.setAttribute('aria-label', '再開');
    } else {
      playIcon.hidden = false;
      pauseIcon.hidden = true;
      stopBtn.hidden = true;
      startBtn.setAttribute('aria-label', '瞑想を開始');
    }
  }

  // --- タイマーロジック ---
  function startTimer() {
    if (state.isPaused) {
      resumeTimer();
      return;
    }

    state.isRunning = true;
    state.isPaused = false;
    state.startTime = Date.now();
    state.remaining = state.duration;

    // UI更新
    durationSelector.style.display = 'none';
    timerOptions.style.display = 'none';
    timerLabel.textContent = '瞑想中...';
    updateControlIcons();
    updateDisplay();

    playStartBell();
    announce('瞑想を開始しました。' + formatTime(state.duration) + 'の瞑想です。');

    state.intervalId = setInterval(tick, 1000);
  }

  function resumeTimer() {
    state.isPaused = false;
    state.isRunning = true;
    timerLabel.textContent = '瞑想中...';
    updateControlIcons();
    state.intervalId = setInterval(tick, 1000);
    announce('瞑想を再開しました。');
  }

  function pauseTimer() {
    state.isPaused = true;
    clearInterval(state.intervalId);
    timerLabel.textContent = '一時停止中';
    updateControlIcons();
    announce('一時停止しました。残り' + formatTime(state.remaining));
  }

  function stopTimer() {
    clearInterval(state.intervalId);

    const elapsed = state.duration - state.remaining;

    // 10秒以上経過していたら記録を保存
    if (elapsed >= 10) {
      saveSession(elapsed, false);
    }

    resetTimer();
    announce('瞑想をリセットしました。');
  }

  function resetTimer() {
    clearInterval(state.intervalId);
    state.isRunning = false;
    state.isPaused = false;
    state.remaining = state.duration;

    durationSelector.style.display = 'flex';
    timerOptions.style.display = 'flex';
    timerLabel.textContent = 'タップして開始';
    updateControlIcons();
    updateDisplay();
  }

  function tick() {
    state.remaining--;

    if (state.remaining <= 0) {
      state.remaining = 0;
      clearInterval(state.intervalId);
      completeSession();
      return;
    }

    updateDisplay();

    // 5分ごとにスクリーンリーダーに通知
    if (state.remaining % 300 === 0 && state.remaining > 0) {
      announce('残り' + formatTime(state.remaining));
    }
  }

  function completeSession() {
    playEndBell();
    saveSession(state.duration, true);

    // 完了画面に切り替え
    const minutes = Math.floor(state.duration / 60);
    completeMessage.textContent = `${minutes}分間の瞑想を完了しました。`;

    const now = new Date();
    completeDatetime.textContent =
      `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ` +
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setupView.hidden = true;
    completeView.hidden = false;

    announce('瞑想が完了しました。お疲れさまでした。');
    resetTimer();
  }

  // --- データ保存 ---
  function saveSession(actualDuration, completed) {
    const session = {
      id: 'session_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      duration: state.duration,
      actualDuration: actualDuration,
      type: 'silent',
      completed: completed,
      timestamp: Date.now()
    };
    SakuraStorage.append(STORAGE_KEY, session);
  }

  // --- 連続記録 ---
  function updateStreak() {
    const sessions = SakuraStorage.get(STORAGE_KEY) || [];
    if (sessions.length === 0) {
      streakBadge.hidden = true;
      return;
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i <= 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const hasSession = sessions.some(s => s.date === dateStr && s.completed);
      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    if (streak > 0) {
      streakBadge.hidden = false;
      streakText.textContent = `${streak}日連続で瞑想しています`;
    } else {
      streakBadge.hidden = true;
    }
  }

  // --- アクセシビリティ ---
  function announce(message) {
    ariaLive.textContent = message;
  }

  // --- イベント ---
  // 開始/一時停止ボタン
  startBtn.addEventListener('click', () => {
    if (!state.isRunning) {
      startTimer();
    } else if (state.isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  });

  // 停止ボタン
  stopBtn.addEventListener('click', stopTimer);

  // 時間選択
  durationSelector.addEventListener('click', (e) => {
    const btn = e.target.closest('.duration-btn');
    if (!btn || state.isRunning) return;

    durationSelector.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const minutes = parseInt(btn.dataset.minutes, 10);
    state.duration = minutes * 60;
    state.remaining = state.duration;
    updateDisplay();
  });

  // トグル
  bellToggle.addEventListener('change', () => {
    state.bellEnabled = bellToggle.checked;
  });

  // もう一度ボタン
  newSessionBtn.addEventListener('click', () => {
    completeView.hidden = true;
    setupView.hidden = false;
    updateStreak();
  });

  // スペースキーで開始/一時停止
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      startBtn.click();
    }
  });

  // --- 初期化 ---
  function init() {
    timerProgress.style.strokeDasharray = CIRCUMFERENCE;
    timerProgress.style.strokeDashoffset = '0';
    updateDisplay();
    updateStreak();
  }

  init();
})();
