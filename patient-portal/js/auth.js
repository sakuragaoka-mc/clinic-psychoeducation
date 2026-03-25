/**
 * 認証モジュール - 患者ポータル
 * デモ版: localStorageベースの簡易認証
 */
const SakuraAuth = {
  STORAGE_KEY: 'portal_auth',
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30分

  // デモ用の患者データ
  DEMO_PATIENTS: [
    { id: 'P-20250001', name: '田中 花子', birthDate: '1985-03-15' },
    { id: 'P-20250002', name: '鈴木 太郎', birthDate: '1990-07-22' },
    { id: 'P-20250003', name: '山田 美咲', birthDate: '1978-11-08' },
    { id: 'demo', name: 'デモユーザー', birthDate: '2000-01-01' }
  ],

  login(patientId, birthDate) {
    const patient = this.DEMO_PATIENTS.find(
      p => p.id.toLowerCase() === patientId.toLowerCase() && p.birthDate === birthDate
    );

    if (!patient) return null;

    const session = {
      isLoggedIn: true,
      patientId: patient.id,
      patientName: patient.name,
      loginAt: Date.now(),
      lastActivity: Date.now()
    };

    SakuraStorage.set(this.STORAGE_KEY, session);
    return session;
  },

  logout() {
    SakuraStorage.clear(this.STORAGE_KEY);
  },

  getSession() {
    const session = SakuraStorage.get(this.STORAGE_KEY);
    if (!session || !session.isLoggedIn) return null;

    // セッションタイムアウト確認
    if (Date.now() - session.lastActivity > this.SESSION_TIMEOUT) {
      this.logout();
      return null;
    }

    // 最終アクティビティ更新
    session.lastActivity = Date.now();
    SakuraStorage.set(this.STORAGE_KEY, session);
    return session;
  },

  requireAuth() {
    const session = this.getSession();
    if (!session) {
      window.location.href = 'index.html';
      return null;
    }
    return session;
  }
};

// --- ログインページのロジック ---
(function () {
  const form = document.getElementById('loginForm');
  if (!form) return; // ログインページ以外では実行しない

  // 既にログイン済みならダッシュボードへ
  const existingSession = SakuraAuth.getSession();
  if (existingSession) {
    window.location.href = 'dashboard.html';
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const patientId = document.getElementById('patientId').value.trim();
    const birthDate = document.getElementById('birthDate').value;
    const errorEl = document.getElementById('loginError');

    const session = SakuraAuth.login(patientId, birthDate);

    if (session) {
      window.location.href = 'dashboard.html';
    } else {
      errorEl.style.display = 'block';
      document.getElementById('patientId').focus();
    }
  });
})();
