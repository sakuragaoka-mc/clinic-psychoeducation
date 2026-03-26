/**
 * 文字サイズ変更ウィジェット
 * CSS zoom で全ページ統一的にスケーリング
 * localStorage に設定を保存
 */
(function() {
  'use strict';

  var STORAGE_KEY = 'sakura_fontZoom';
  var LEVELS = [0.9, 1.0, 1.1, 1.2, 1.3];
  var DEFAULT = 1.0;

  // 保存された値を即座に適用（ちらつき防止）
  var saved = localStorage.getItem(STORAGE_KEY);
  var current = saved ? parseFloat(saved) : DEFAULT;
  if (current !== 1.0) {
    document.documentElement.style.zoom = current;
  }

  document.addEventListener('DOMContentLoaded', function() {
    // ウィジェットのスタイルを注入
    var style = document.createElement('style');
    style.textContent =
      '.sakura-ft{position:fixed;bottom:16px;right:16px;z-index:9999;' +
      'display:flex;align-items:center;gap:2px;' +
      'background:#fff;border:1px solid #ebe8e3;border-radius:24px;' +
      'box-shadow:0 2px 12px rgba(0,0,0,0.1);padding:4px;' +
      'font-family:"Noto Sans JP",sans-serif;user-select:none;}' +
      '.sakura-ft button{border:none;background:none;cursor:pointer;' +
      'width:36px;height:36px;border-radius:50%;display:flex;' +
      'align-items:center;justify-content:center;font-weight:700;' +
      'color:#c06d86;font-size:16px;transition:background .15s;}' +
      '.sakura-ft button:hover{background:#faeef1;}' +
      '.sakura-ft button:disabled{color:#d8d4cd;cursor:default;background:none;}' +
      '.sakura-ft-label{font-size:11px;color:#827c73;min-width:32px;text-align:center;line-height:1;}' +
      '@media print{.sakura-ft{display:none!important;}}';
    document.head.appendChild(style);

    // ウィジェット作成
    var widget = document.createElement('div');
    widget.className = 'sakura-ft';
    widget.setAttribute('role', 'group');
    widget.setAttribute('aria-label', '文字サイズ変更');

    var btnMinus = document.createElement('button');
    btnMinus.textContent = 'A-';
    btnMinus.setAttribute('aria-label', '文字を小さくする');

    var label = document.createElement('span');
    label.className = 'sakura-ft-label';
    label.setAttribute('aria-live', 'polite');

    var btnPlus = document.createElement('button');
    btnPlus.textContent = 'A+';
    btnPlus.setAttribute('aria-label', '文字を大きくする');

    widget.appendChild(btnMinus);
    widget.appendChild(label);
    widget.appendChild(btnPlus);
    document.body.appendChild(widget);

    function update() {
      var pct = Math.round(current * 100);
      label.textContent = pct + '%';
      document.documentElement.style.zoom = current;
      // ウィジェット自体は常に同じサイズに
      widget.style.zoom = 1 / current;
      localStorage.setItem(STORAGE_KEY, current);
      btnMinus.disabled = current <= LEVELS[0];
      btnPlus.disabled = current >= LEVELS[LEVELS.length - 1];
    }

    function step(dir) {
      var idx = LEVELS.indexOf(current);
      if (idx === -1) {
        // 最も近いレベルを探す
        idx = LEVELS.reduce(function(best, v, i) {
          return Math.abs(v - current) < Math.abs(LEVELS[best] - current) ? i : best;
        }, 0);
      }
      var next = idx + dir;
      if (next >= 0 && next < LEVELS.length) {
        current = LEVELS[next];
        update();
      }
    }

    btnMinus.addEventListener('click', function() { step(-1); });
    btnPlus.addEventListener('click', function() { step(1); });

    update();
  });
})();
