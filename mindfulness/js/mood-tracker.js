/**
 * 気分記録トラッカー - こころのクリニック桜が丘
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'mood_entries';
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // --- 状態 ---
  let selectedMood = null;
  let selectedEmotions = [];
  let selectedSleep = null;
  let selectedActivities = [];
  let calendarDate = new Date();
  let trendPeriod = 7;

  // --- タブ切り替え ---
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      $$('.tab-content').forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const target = tab.dataset.tab;
      $(`#tab-${target}`).classList.add('active');

      if (target === 'calendar') renderCalendar();
      if (target === 'trends') { renderChart(); renderInsights(); }
    });
  });

  // --- 気分選択 ---
  $$('.mood-option').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.mood-option').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-checked', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      selectedMood = parseInt(btn.dataset.mood, 10);
    });
  });

  // --- 感情タグ ---
  $('#emotionPills').addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    const emotion = pill.dataset.emotion;
    const isActive = pill.getAttribute('aria-pressed') === 'true';

    pill.setAttribute('aria-pressed', !isActive);
    pill.classList.toggle('active');

    if (isActive) {
      selectedEmotions = selectedEmotions.filter(e => e !== emotion);
    } else {
      selectedEmotions.push(emotion);
    }
  });

  // --- 睡眠 ---
  $('#sleepPills').addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (!pill) return;

    $$('#sleepPills .pill').forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
    pill.classList.add('active');
    pill.setAttribute('aria-pressed', 'true');
    selectedSleep = parseInt(pill.dataset.sleep, 10);
  });

  // --- 活動タグ ---
  $('#activityPills').addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    const activity = pill.dataset.activity;
    const isActive = pill.getAttribute('aria-pressed') === 'true';

    pill.setAttribute('aria-pressed', !isActive);
    pill.classList.toggle('active');

    if (isActive) {
      selectedActivities = selectedActivities.filter(a => a !== activity);
    } else {
      selectedActivities.push(activity);
    }
  });

  // --- メモ文字カウント ---
  const noteInput = $('#moodNote');
  const noteCount = $('#noteCount');
  noteInput.addEventListener('input', () => {
    noteCount.textContent = `${noteInput.value.length} / 500`;
  });

  // --- フォーム送信 ---
  $('#moodForm').addEventListener('submit', (e) => {
    e.preventDefault();

    if (selectedMood === null) {
      alert('気分を選択してください。');
      return;
    }

    const now = new Date();
    const hour = now.getHours();
    let timeOfDay = 'afternoon';
    if (hour < 11) timeOfDay = 'morning';
    else if (hour >= 18) timeOfDay = 'evening';

    const entry = {
      id: 'entry_' + Date.now(),
      date: now.toISOString().split('T')[0],
      time: timeOfDay,
      timestamp: Date.now(),
      mood: selectedMood,
      emotions: [...selectedEmotions],
      sleepQuality: selectedSleep,
      activities: [...selectedActivities],
      note: noteInput.value.trim(),
      edited: false,
      editedAt: null
    };

    SakuraStorage.append(STORAGE_KEY, entry);

    // UI フィードバック
    const msg = $('#savedMessage');
    msg.hidden = false;
    setTimeout(() => { msg.hidden = true; }, 3000);

    // フォームリセット
    resetForm();
  });

  function resetForm() {
    selectedMood = null;
    selectedEmotions = [];
    selectedSleep = null;
    selectedActivities = [];

    $$('.mood-option').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-checked', 'false'); });
    $$('#emotionPills .pill').forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
    $$('#sleepPills .pill').forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
    $$('#activityPills .pill').forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
    noteInput.value = '';
    noteCount.textContent = '0 / 500';
  }

  // --- カレンダー ---
  function renderCalendar() {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    $('#calendarTitle').textContent = `${year}年${month + 1}月`;

    const entries = SakuraStorage.get(STORAGE_KEY) || [];
    const grid = $('#calendarGrid');

    // ヘッダー以外をクリア
    const headers = grid.querySelectorAll('.mood-calendar-header');
    grid.innerHTML = '';
    headers.forEach(h => grid.appendChild(h));

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 空白セル
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'mood-calendar-day';
      grid.appendChild(empty);
    }

    // 日付セル
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEntries = entries.filter(e => e.date === dateStr);

      const cell = document.createElement('button');
      cell.className = 'mood-calendar-day';
      cell.textContent = day;
      cell.type = 'button';
      cell.setAttribute('aria-label', `${month + 1}月${day}日`);

      if (dateStr === todayStr) {
        cell.classList.add('today');
      }

      if (dayEntries.length > 0) {
        const avgMood = Math.round(dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length);
        const dot = document.createElement('span');
        dot.className = 'mood-dot';
        dot.style.background = `var(--color-mood-${avgMood})`;
        cell.appendChild(dot);
      }

      cell.addEventListener('click', () => showDayDetail(dateStr, dayEntries));
      grid.appendChild(cell);
    }
  }

  function showDayDetail(dateStr, entries) {
    const detail = $('#dayDetail');
    const d = new Date(dateStr + 'T00:00:00');
    $('#dayDetailTitle').textContent = `${d.getMonth() + 1}月${d.getDate()}日の記録`;

    const content = $('#dayDetailContent');
    if (entries.length === 0) {
      content.innerHTML = '<p class="text-sm text-muted">この日の記録はありません。</p>';
    } else {
      const moodLabels = ['', 'とても悪い', '悪い', 'ふつう', '良い', 'とても良い'];
      content.innerHTML = entries.map(e => `
        <div style="padding: var(--space-2) 0; border-bottom: 1px solid var(--color-neutral-200);">
          <div class="flex items-center gap-2">
            <span class="badge badge--primary">${moodLabels[e.mood]}</span>
            ${e.emotions.length ? `<span class="text-sm text-muted">${e.emotions.join(', ')}</span>` : ''}
          </div>
          ${e.note ? `<p class="text-sm mt-2">${escapeHtml(e.note)}</p>` : ''}
        </div>
      `).join('');
    }

    detail.hidden = false;
  }

  $('#prevMonth').addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
  });

  $('#nextMonth').addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
  });

  // --- トレンド ---
  function renderChart() {
    const entries = SakuraStorage.get(STORAGE_KEY) || [];
    MoodChart.draw('moodChart', entries, trendPeriod);
  }

  // トレンド期間切り替え
  $$('#tab-trends .pill').forEach(pill => {
    pill.addEventListener('click', () => {
      $$('#tab-trends .pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      trendPeriod = parseInt(pill.dataset.period, 10);
      renderChart();
      renderInsights();
    });
  });

  // --- インサイト ---
  function renderInsights() {
    const entries = SakuraStorage.get(STORAGE_KEY) || [];
    const container = $('#insightCards');
    container.innerHTML = '';

    if (entries.length < 3) {
      container.innerHTML = '<p class="text-sm text-muted">3日以上記録すると、気づきが表示されます。</p>';
      return;
    }

    const insights = [];

    // 今週 vs 先週の平均比較
    const today = new Date();
    const thisWeek = entries.filter(e => {
      const diff = (today - new Date(e.date)) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });
    const lastWeek = entries.filter(e => {
      const diff = (today - new Date(e.date)) / (1000 * 60 * 60 * 24);
      return diff > 7 && diff <= 14;
    });

    if (thisWeek.length > 0 && lastWeek.length > 0) {
      const thisAvg = thisWeek.reduce((s, e) => s + e.mood, 0) / thisWeek.length;
      const lastAvg = lastWeek.reduce((s, e) => s + e.mood, 0) / lastWeek.length;
      const diff = thisAvg - lastAvg;

      if (Math.abs(diff) > 0.3) {
        insights.push({
          icon: diff > 0 ? '📈' : '📉',
          text: `今週の平均気分は先週より${diff > 0 ? '良く' : '低く'}なっています（${thisAvg.toFixed(1)} vs ${lastAvg.toFixed(1)}）`
        });
      }
    }

    // よくある感情
    const emotionCounts = {};
    entries.slice(-30).forEach(e => {
      e.emotions.forEach(em => {
        emotionCounts[em] = (emotionCounts[em] || 0) + 1;
      });
    });
    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topEmotions.length > 0) {
      insights.push({
        icon: '💭',
        text: `最近多い感情: ${topEmotions.map(([e, c]) => `${e}(${c}回)`).join('、')}`
      });
    }

    // 活動と気分の相関
    const activityMoods = {};
    entries.slice(-30).forEach(e => {
      e.activities.forEach(a => {
        if (!activityMoods[a]) activityMoods[a] = [];
        activityMoods[a].push(e.mood);
      });
    });

    Object.entries(activityMoods).forEach(([activity, moods]) => {
      if (moods.length >= 3) {
        const avg = moods.reduce((s, m) => s + m, 0) / moods.length;
        if (avg >= 3.5) {
          insights.push({
            icon: '✨',
            text: `「${activity}」日は気分が良い傾向があります（平均 ${avg.toFixed(1)}）`
          });
        }
      }
    });

    if (insights.length === 0) {
      insights.push({
        icon: '📊',
        text: 'データが増えると、より詳しい分析ができるようになります。'
      });
    }

    container.innerHTML = insights.map(ins => `
      <div class="card" style="padding: var(--space-3) var(--space-4);">
        <div class="flex items-center gap-3">
          <span style="font-size: 20px;">${ins.icon}</span>
          <p class="text-sm">${ins.text}</p>
        </div>
      </div>
    `).join('');
  }

  // --- CSV出力 ---
  $('#exportBtn').addEventListener('click', () => {
    const headers = ['date', 'time', 'mood', 'emotions', 'sleepQuality', 'activities', 'note'];
    SakuraStorage.downloadCSV(STORAGE_KEY, '気分記録_エクスポート.csv', headers);
  });

  // --- ユーティリティ ---
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- 初期化 ---
  renderCalendar();

  // リサイズ対応
  window.addEventListener('resize', () => {
    if ($('#tab-trends').classList.contains('active')) {
      renderChart();
    }
  });
})();
