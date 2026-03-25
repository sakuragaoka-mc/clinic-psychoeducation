/**
 * 気分トレンドグラフ描画 - Canvas 2D
 */
const MoodChart = {
  draw(canvasId, entries, days) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 30, right: 20, bottom: 40, left: 40 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // 背景クリア
    ctx.clearRect(0, 0, w, h);

    // 日付範囲を作成
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    // データポイント作成（日ごとの平均）
    const points = dates.map(dateStr => {
      const dayEntries = entries.filter(e => e.date === dateStr);
      if (dayEntries.length === 0) return null;
      const avg = dayEntries.reduce((sum, e) => sum + e.mood, 0) / dayEntries.length;
      return avg;
    });

    // Y軸グリッド線
    ctx.strokeStyle = '#ebe8e3';
    ctx.lineWidth = 0.5;
    const labels = ['1', '2', '3', '4', '5'];
    const moodLabels = ['とても悪い', '悪い', 'ふつう', '良い', 'とても良い'];

    for (let i = 0; i < 5; i++) {
      const y = padding.top + chartH - (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // ラベル
      ctx.fillStyle = '#ada79e';
      ctx.font = '11px "Noto Sans JP", sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[i], padding.left - 8, y);
    }

    // データがない場合
    const hasData = points.some(p => p !== null);
    if (!hasData) {
      ctx.fillStyle = '#ada79e';
      ctx.font = '14px "Noto Sans JP", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('まだ記録がありません', w / 2, h / 2);
      return;
    }

    // 線グラフ描画
    const moodColors = ['#9aa4b5', '#b3bdd0', '#d0ccb3', '#c3ddb5', '#edb8c5'];
    const validPoints = [];

    points.forEach((val, i) => {
      if (val !== null) {
        const x = padding.left + (i / (dates.length - 1)) * chartW;
        const y = padding.top + chartH - ((val - 1) / 4) * chartH;
        validPoints.push({ x, y, val, date: dates[i] });
      }
    });

    // グラデーションエリア
    if (validPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(validPoints[0].x, padding.top + chartH);
      validPoints.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(validPoints[validPoints.length - 1].x, padding.top + chartH);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      gradient.addColorStop(0, 'rgba(212, 129, 154, 0.15)');
      gradient.addColorStop(1, 'rgba(212, 129, 154, 0.02)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // 線
    if (validPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(validPoints[0].x, validPoints[0].y);
      for (let i = 1; i < validPoints.length; i++) {
        ctx.lineTo(validPoints[i].x, validPoints[i].y);
      }
      ctx.strokeStyle = '#d4819a';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // ドット
    validPoints.forEach(p => {
      const moodIdx = Math.round(p.val) - 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = moodColors[moodIdx] || '#d4819a';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // X軸日付ラベル
    ctx.fillStyle = '#ada79e';
    ctx.font = '10px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const labelStep = Math.max(1, Math.floor(dates.length / 7));
    dates.forEach((dateStr, i) => {
      if (i % labelStep === 0 || i === dates.length - 1) {
        const x = padding.left + (i / (dates.length - 1)) * chartW;
        const d = new Date(dateStr);
        const label = `${d.getMonth() + 1}/${d.getDate()}`;
        ctx.fillText(label, x, padding.top + chartH + 8);
      }
    });
  }
};
