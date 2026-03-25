/**
 * ダッシュボード - マイページ
 */
(function () {
  'use strict';

  const session = SakuraAuth.requireAuth();
  if (!session) return;

  const $ = (sel) => document.querySelector(sel);

  // --- デモデータ初期化 ---
  function initDemoData() {
    if (!SakuraStorage.get('portal_appointments')) {
      SakuraStorage.set('portal_appointments', [
        {
          id: 'apt_001',
          date: '2026-04-01',
          time: '10:30',
          endTime: '11:00',
          doctor: '山田先生',
          type: '再診',
          status: 'confirmed',
          location: '本館 2F 診察室3',
          notes: '前回の経過について'
        },
        {
          id: 'apt_002',
          date: '2026-04-15',
          time: '14:00',
          endTime: '14:50',
          doctor: '佐藤先生',
          type: 'カウンセリング',
          status: 'confirmed',
          location: '本館 3F カウンセリングルーム1',
          notes: ''
        },
        {
          id: 'apt_003',
          date: '2026-03-10',
          time: '10:00',
          endTime: '10:30',
          doctor: '山田先生',
          type: '再診',
          status: 'completed',
          location: '本館 2F 診察室3',
          notes: '処方薬の調整'
        },
        {
          id: 'apt_004',
          date: '2026-05-01',
          time: '11:00',
          endTime: '11:30',
          doctor: '山田先生',
          type: '再診',
          status: 'confirmed',
          location: '本館 2F 診察室3',
          notes: ''
        }
      ]);
    }

    if (!SakuraStorage.get('portal_notifications')) {
      SakuraStorage.set('portal_notifications', [
        {
          id: 'notif_001',
          type: 'reminder',
          title: '予約のリマインダー',
          message: '4月1日（水）10:30 に山田先生の再診予約があります。',
          date: '2026-03-24',
          read: false
        },
        {
          id: 'notif_002',
          type: 'announcement',
          title: 'ゴールデンウィーク休診のお知らせ',
          message: '4月29日（水）〜5月6日（水）は休診とさせていただきます。お薬の残量にご注意ください。',
          date: '2026-03-20',
          read: false
        },
        {
          id: 'notif_003',
          type: 'message',
          title: 'マインドフルネスアプリのご案内',
          message: '当クリニックのマインドフルネスアプリをご利用いただけるようになりました。瞑想タイマーや気分記録をお試しください。',
          date: '2026-03-15',
          read: true
        }
      ]);
    }
  }

  initDemoData();

  // --- 挨拶 ---
  const now = new Date();
  const hour = now.getHours();
  let greetingPrefix = 'こんにちは';
  if (hour < 11) greetingPrefix = 'おはようございます';
  else if (hour >= 18) greetingPrefix = 'こんばんは';

  const name = session.patientName.split(' ')[0];
  $('#greeting').textContent = `${greetingPrefix}、${name}さん`;

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  $('#todayDate').textContent =
    `${now.getFullYear()}年${months[now.getMonth()]}${now.getDate()}日（${days[now.getDay()]}）`;

  // --- 次の予約 ---
  const appointments = SakuraStorage.get('portal_appointments') || [];
  const todayStr = now.toISOString().split('T')[0];
  const upcoming = appointments
    .filter(a => a.date >= todayStr && a.status === 'confirmed')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  if (upcoming.length > 0) {
    const next = upcoming[0];
    const nextDate = new Date(next.date + 'T00:00:00');
    $('#nextAppointmentContent').innerHTML = `
      <div class="next-appointment-date">${nextDate.getMonth() + 1}月${nextDate.getDate()}日（${days[nextDate.getDay()]}）</div>
      <div class="next-appointment-time">${next.time} - ${next.endTime}　${next.type}</div>
      <div class="next-appointment-doctor">${next.doctor}　｜　${next.location}</div>
    `;
  }

  // --- 未読バッジ ---
  const notifications = SakuraStorage.get('portal_notifications') || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  if (unreadCount > 0) {
    const badge = $('#notifBadge');
    const navBadge = $('#navNotifBadge');
    if (badge) { badge.textContent = unreadCount; badge.style.display = 'inline-flex'; }
    if (navBadge) { navBadge.textContent = unreadCount; navBadge.style.display = 'inline-flex'; }
  }

  // --- ログアウト ---
  $('#logoutBtn').addEventListener('click', () => {
    if (confirm('ログアウトしますか？')) {
      SakuraAuth.logout();
      window.location.href = 'index.html';
    }
  });
})();
