/**
 * 認証モジュール - マイページ
 * localStorageベースの認証（パスワード・メール対応）
 */
const SakuraAuth = {
  STORAGE_KEY: 'portal_auth',
  SESSION_TIMEOUT: 30 * 60 * 1000,

  DEFAULT_PATIENTS: [
    { id: 'demo', name: 'デモユーザー', birthDate: '2000-01-01', password: 'demo', email: 'demo@example.com' }
  ],

  getPatients() {
    const registered = SakuraStorage.get('portal_registered_patients') || [];
    return [...this.DEFAULT_PATIENTS, ...registered];
  },

  signup(id, password, name, email, birthDate) {
    if (!id || !password || !name || !email || !birthDate) return { error: 'missing_fields' };
    if (id.length < 3) return { error: 'id_too_short' };
    if (password.length < 6) return { error: 'password_too_short' };

    const registered = SakuraStorage.get('portal_registered_patients') || [];
    const allPatients = [...this.DEFAULT_PATIENTS, ...registered];

    if (allPatients.find(p => p.id.toLowerCase() === id.toLowerCase())) {
      return { error: 'id_taken' };
    }

    const newPatient = { id, name, birthDate, email, password };
    registered.push(newPatient);
    SakuraStorage.set('portal_registered_patients', registered);
    return { success: true, patient: newPatient };
  },

  login(loginId, password) {
    const patient = this.getPatients().find(
      p => p.id.toLowerCase() === loginId.toLowerCase() && p.password === password
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

  resetPassword(loginId, email, newPassword) {
    const registered = SakuraStorage.get('portal_registered_patients') || [];
    const allPatients = [...this.DEFAULT_PATIENTS, ...registered];
    const patient = allPatients.find(
      p => p.id.toLowerCase() === loginId.toLowerCase() && p.email.toLowerCase() === email.toLowerCase()
    );
    if (!patient) return { error: 'not_found' };
    if (newPassword && newPassword.length < 6) return { error: 'password_too_short' };
    if (newPassword) {
      // Update password in registered list
      const reg = registered.find(p => p.id.toLowerCase() === loginId.toLowerCase());
      if (reg) {
        reg.password = newPassword;
        SakuraStorage.set('portal_registered_patients', registered);
        return { success: true };
      }
      // Demo user
      return { error: 'demo_user' };
    }
    return { verified: true };
  },

  logout() {
    SakuraStorage.clear(this.STORAGE_KEY);
  },

  getSession() {
    const session = SakuraStorage.get(this.STORAGE_KEY);
    if (!session || !session.isLoggedIn) return null;
    if (Date.now() - session.lastActivity > this.SESSION_TIMEOUT) {
      this.logout();
      return null;
    }
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
  if (!form) return;

  const existingSession = SakuraAuth.getSession();
  if (existingSession) {
    window.location.href = 'dashboard.html';
    return;
  }

  const signupForm = document.getElementById('signupForm');
  const resetForm = document.getElementById('resetForm');
  const showSignupBtn = document.getElementById('showSignupBtn');
  const showLoginBtn = document.getElementById('showLoginBtn');
  const showResetBtn = document.getElementById('showResetBtn');
  const showLoginFromResetBtn = document.getElementById('showLoginFromResetBtn');

  function showOnly(target) {
    [form, signupForm, resetForm].forEach(f => { if (f) f.hidden = true; });
    if (showSignupBtn) showSignupBtn.parentElement.hidden = true;
    if (target) target.hidden = false;
    if (target === form && showSignupBtn) showSignupBtn.parentElement.hidden = false;
    // Clear errors
    document.querySelectorAll('.login-error').forEach(e => e.style.display = 'none');
  }

  // --- Login ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('patientId').value.trim();
    const pw = document.getElementById('loginPassword').value;
    const session = SakuraAuth.login(id, pw);
    if (session) {
      window.location.href = 'dashboard.html';
    } else {
      const err = document.getElementById('loginError');
      err.style.display = 'block';
      document.getElementById('patientId').focus();
    }
  });

  // --- Show signup ---
  if (showSignupBtn) showSignupBtn.addEventListener('click', () => showOnly(signupForm));
  if (showLoginBtn) showLoginBtn.addEventListener('click', () => showOnly(form));
  if (showResetBtn) showResetBtn.addEventListener('click', () => showOnly(resetForm));
  if (showLoginFromResetBtn) showLoginFromResetBtn.addEventListener('click', () => showOnly(form));

  // --- Signup ---
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('signupId').value.trim();
      const pw = document.getElementById('signupPassword').value;
      const pwConfirm = document.getElementById('signupPasswordConfirm').value;
      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const birth = document.getElementById('signupBirthDate').value;
      const errEl = document.getElementById('signupError');
      const sucEl = document.getElementById('signupSuccess');

      if (pw !== pwConfirm) {
        errEl.textContent = 'パスワードが一致しません。';
        errEl.style.display = 'block';
        sucEl.style.display = 'none';
        return;
      }

      const result = SakuraAuth.signup(id, pw, name, email, birth);
      if (!result) return;

      if (result.error === 'missing_fields') {
        errEl.textContent = 'すべての項目を入力してください。';
      } else if (result.error === 'id_too_short') {
        errEl.textContent = 'ログインIDは3文字以上にしてください。';
      } else if (result.error === 'password_too_short') {
        errEl.textContent = 'パスワードは6文字以上にしてください。';
      } else if (result.error === 'id_taken') {
        errEl.textContent = 'このIDはすでに使われています。';
      } else if (result.success) {
        errEl.style.display = 'none';
        sucEl.textContent = '登録完了！ ID「' + id + '」とパスワードでログインできます。';
        sucEl.style.display = 'block';
        document.getElementById('patientId').value = id;
        setTimeout(() => showOnly(form), 3000);
        return;
      }
      errEl.style.display = 'block';
      sucEl.style.display = 'none';
    });
  }

  // --- Password reset ---
  if (resetForm) {
    let verified = false;
    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('resetId').value.trim();
      const email = document.getElementById('resetEmail').value.trim();
      const errEl = document.getElementById('resetError');
      const sucEl = document.getElementById('resetSuccess');
      const newPwGroup = document.getElementById('newPasswordGroup');
      const submitBtn = document.getElementById('resetSubmitBtn');

      if (!verified) {
        // Step 1: verify ID + email
        const result = SakuraAuth.resetPassword(id, email);
        if (result && result.verified) {
          newPwGroup.hidden = false;
          document.getElementById('resetNewPassword').required = true;
          submitBtn.textContent = 'パスワードを変更';
          verified = true;
          errEl.style.display = 'none';
          sucEl.textContent = '確認が取れました。新しいパスワードを入力してください。';
          sucEl.style.display = 'block';
        } else if (result && result.error === 'not_found') {
          errEl.textContent = 'IDとメールアドレスの組み合わせが見つかりません。';
          errEl.style.display = 'block';
          sucEl.style.display = 'none';
        }
      } else {
        // Step 2: set new password
        const newPw = document.getElementById('resetNewPassword').value;
        const result = SakuraAuth.resetPassword(id, email, newPw);
        if (result && result.success) {
          errEl.style.display = 'none';
          sucEl.textContent = 'パスワードを変更しました。新しいパスワードでログインしてください。';
          sucEl.style.display = 'block';
          document.getElementById('patientId').value = id;
          verified = false;
          setTimeout(() => {
            showOnly(form);
            newPwGroup.hidden = true;
            submitBtn.textContent = '確認する';
          }, 3000);
        } else if (result && result.error === 'password_too_short') {
          errEl.textContent = 'パスワードは6文字以上にしてください。';
          errEl.style.display = 'block';
          sucEl.style.display = 'none';
        } else if (result && result.error === 'demo_user') {
          errEl.textContent = 'デモユーザーのパスワードは変更できません。';
          errEl.style.display = 'block';
          sucEl.style.display = 'none';
        }
      }
    });
  }
})();
