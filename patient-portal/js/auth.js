/**
 * 認証モジュール - マイページ
 * デモ版: localStorageベースの簡易認証
 */
const SakuraAuth = {
  STORAGE_KEY: 'portal_auth',
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30分

  // デモ用の患者データ
  DEFAULT_PATIENTS: [
    { id: 'P-20250001', name: '田中 花子', birthDate: '1985-03-15' },
    { id: 'P-20250002', name: '鈴木 太郎', birthDate: '1990-07-22' },
    { id: 'P-20250003', name: '山田 美咲', birthDate: '1978-11-08' },
    { id: 'demo', name: 'デモユーザー', birthDate: '2000-01-01' }
  ],

  getPatients() {
    const registered = SakuraStorage.get('portal_registered_patients') || [];
    return [...this.DEFAULT_PATIENTS, ...registered];
  },

  signup(name, birthDate, phone) {
    if (!name || !birthDate) return null;

    const registered = SakuraStorage.get('portal_registered_patients') || [];

    // 既存チェック
    const allPatients = [...this.DEFAULT_PATIENTS, ...registered];
    const exists = allPatients.find(
      p => p.name === name && p.birthDate === birthDate
    );
    if (exists) return { error: 'already_exists', patient: exists };

    // 新しいIDを生成
    const maxNum = allPatients
      .map(p => parseInt(p.id.replace('P-', ''), 10))
      .filter(n => !isNaN(n))
      .reduce((a, b) => Math.max(a, b), 20250000);
    const newId = 'P-' + String(maxNum + 1).padStart(8, '0');

    const newPatient = { id: newId, name: name, birthDate: birthDate, phone: phone || '' };
    registered.push(newPatient);
    SakuraStorage.set('portal_registered_patients', registered);
    return { success: true, patient: newPatient };
  },

  login(patientId, birthDate) {
    const patient = this.getPatients().find(
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

  // --- サインアップ切り替え ---
  const signupForm = document.getElementById('signupForm');
  const showSignupBtn = document.getElementById('showSignupBtn');
  const showLoginBtn = document.getElementById('showLoginBtn');

  if (showSignupBtn && signupForm) {
    showSignupBtn.addEventListener('click', () => {
      form.hidden = true;
      showSignupBtn.parentElement.hidden = true;
      signupForm.hidden = false;
      document.getElementById('loginError').style.display = 'none';
    });

    showLoginBtn.addEventListener('click', () => {
      signupForm.hidden = true;
      form.hidden = false;
      showSignupBtn.parentElement.hidden = false;
    });

    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signupName').value.trim();
      const birthDate = document.getElementById('signupBirthDate').value;
      const phone = document.getElementById('signupPhone').value.trim();
      const errorEl = document.getElementById('signupError');
      const successEl = document.getElementById('signupSuccess');

      if (!name || !birthDate) {
        errorEl.textContent = 'お名前と生年月日を入力してください。';
        errorEl.style.display = 'block';
        successEl.style.display = 'none';
        return;
      }

      const result = SakuraAuth.signup(name, birthDate, phone);

      if (result && result.error === 'already_exists') {
        errorEl.textContent = 'この情報はすでに登録されています。患者ID: ' + result.patient.id + ' でログインしてください。';
        errorEl.style.display = 'block';
        successEl.style.display = 'none';
      } else if (result && result.success) {
        errorEl.style.display = 'none';
        successEl.textContent = '登録が完了しました！ 患者ID: ' + result.patient.id + '（この番号を控えてください）';
        successEl.style.display = 'block';

        // ログインフォームに自動入力
        document.getElementById('patientId').value = result.patient.id;
        document.getElementById('birthDate').value = birthDate;

        setTimeout(() => {
          signupForm.hidden = true;
          form.hidden = false;
          showSignupBtn.parentElement.hidden = false;
        }, 3000);
      }
    });
  }
})();
