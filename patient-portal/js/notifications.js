/**
 * お知らせ - 患者ポータル
 */
(function () {
  'use strict';

  const session = SakuraAuth.requireAuth();
  if (!session) return;

  const STORAGE_KEY = 'portal_notifications';
  const $ = (sel) => document.querySelector(sel);

  const typeIcons = {
    reminder: { icon: '🔔', bg: 'var(--color-primary-100)' },
    announcement: { icon: '📢', bg: '#fef6ec' },
    message: { icon: '💬', bg: 'var(--color-accent-100)' }
  };

  function renderNotifications() {
    const notifications = SakuraStorage.get(STORAGE_KEY) || [];
    const list = $('#notificationList');
    const emptyState = $('#emptyState');

    if (notifications.length === 0) {
      list.innerHTML = '';
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    // 日付順（新しい順）
    const sorted = [...notifications].sort((a, b) => b.date.localeCompare(a.date));

    list.innerHTML = sorted.map(notif => {
      const typeInfo = typeIcons[notif.type] || typeIcons.message;
      const d = new Date(notif.date + 'T00:00:00');
      const timeAgo = getTimeAgo(d);

      return `
        <div class="notification-item ${notif.read ? '' : 'unread'}" data-id="${notif.id}">
          <div class="notification-icon" style="background: ${typeInfo.bg};">${typeInfo.icon}</div>
          <div class="notification-content">
            <h4>${escapeHtml(notif.title)}</h4>
            <p>${escapeHtml(notif.message)}</p>
            <div class="notification-time">${timeAgo}</div>
          </div>
        </div>
      `;
    }).join('');

    // クリックで既読
    list.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        markAsRead(id);
        item.classList.remove('unread');
      });
    });
  }

  function markAsRead(id) {
    const notifications = SakuraStorage.get(STORAGE_KEY) || [];
    const notif = notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      SakuraStorage.set(STORAGE_KEY, notifications);
    }
  }

  // すべて既読
  $('#markAllReadBtn').addEventListener('click', () => {
    const notifications = SakuraStorage.get(STORAGE_KEY) || [];
    notifications.forEach(n => { n.read = true; });
    SakuraStorage.set(STORAGE_KEY, notifications);
    renderNotifications();
  });

  function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  renderNotifications();
})();
