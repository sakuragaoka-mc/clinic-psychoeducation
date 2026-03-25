/**
 * 予約一覧 - 患者ポータル
 */
(function () {
  'use strict';

  const session = SakuraAuth.requireAuth();
  if (!session) return;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const statusLabels = {
    confirmed: { text: '予約済み', class: 'badge--primary' },
    waitlisted: { text: 'キャンセル待ち', class: 'badge--warning' },
    completed: { text: '完了', class: 'badge--success' },
    cancelled: { text: 'キャンセル', class: '' }
  };

  let currentFilter = 'upcoming';

  function renderAppointments() {
    const appointments = SakuraStorage.get('portal_appointments') || [];
    const todayStr = new Date().toISOString().split('T')[0];
    const list = $('#appointmentList');
    const emptyState = $('#emptyState');

    let filtered;
    if (currentFilter === 'upcoming') {
      filtered = appointments.filter(a => a.date >= todayStr && a.status !== 'completed');
    } else if (currentFilter === 'past') {
      filtered = appointments.filter(a => a.date < todayStr || a.status === 'completed');
    } else {
      filtered = [...appointments];
    }

    filtered.sort((a, b) => {
      if (currentFilter === 'past') {
        return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
      }
      return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
    });

    if (filtered.length === 0) {
      list.innerHTML = '';
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    list.innerHTML = filtered.map(apt => {
      const d = new Date(apt.date + 'T00:00:00');
      const status = statusLabels[apt.status] || { text: apt.status, class: '' };

      return `
        <div class="appointment-item" data-id="${apt.id}">
          <div class="appointment-item-header">
            <div class="appointment-date-badge">
              <span class="month">${d.getMonth() + 1}月</span>
              <span class="day">${d.getDate()}</span>
            </div>
            <div class="appointment-info">
              <h4>${apt.time} - ${apt.endTime}　${apt.type}</h4>
              <p>${apt.doctor}　<span class="badge ${status.class}">${status.text}</span></p>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-neutral-300); flex-shrink: 0;">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <div class="appointment-detail">
            <p><strong>日時:</strong> ${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${days[d.getDay()]}）${apt.time} - ${apt.endTime}</p>
            <p><strong>場所:</strong> ${apt.location}</p>
            ${apt.notes ? `<p><strong>備考:</strong> ${apt.notes}</p>` : ''}
            <p style="margin-top: var(--space-3); font-size: var(--text-xs); color: var(--color-neutral-400);">
              キャンセル・変更はお電話にてお願いいたします。
            </p>
          </div>
        </div>
      `;
    }).join('');

    // 展開/折りたたみ
    list.querySelectorAll('.appointment-item').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('expanded');
      });
    });
  }

  // フィルタ
  $$('.pill[data-filter]').forEach(pill => {
    pill.addEventListener('click', () => {
      $$('.pill[data-filter]').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      renderAppointments();
    });
  });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  renderAppointments();
})();
