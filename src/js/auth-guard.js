(function () {
  function parseStoredUser() {
    try {
      return JSON.parse(localStorage.getItem('grovity_user') || '{}');
    } catch (error) {
      console.warn('Unable to parse stored user:', error);
      return {};
    }
  }

  function saveUser(user) {
    if (!user || !user.uid || !user.email) {
      return;
    }

    localStorage.setItem('grovity_user', JSON.stringify({
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      photo: user.photoURL || '',
      uid: user.uid
    }));
  }

  function clearUserPreservingTheme() {
    var theme = localStorage.getItem('grovity_theme');
    localStorage.removeItem('grovity_user');
    if (theme) {
      localStorage.setItem('grovity_theme', theme);
    }
  }

  function waitForFirebaseUser(timeoutMs) {
    return new Promise(function (resolve) {
      if (!window.__fbAuth || typeof window.__fbAuth.onAuthStateChanged !== 'function') {
        resolve(null);
        return;
      }

      var done = false;
      var timeout = setTimeout(function () {
        if (done) {
          return;
        }
        done = true;
        resolve(null);
      }, typeof timeoutMs === 'number' ? timeoutMs : 7000);

      var unsubscribe = window.__fbAuth.onAuthStateChanged(function (user) {
        if (done) {
          return;
        }
        done = true;
        clearTimeout(timeout);
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
        resolve(user || null);
      });
    });
  }

  function setRedirectAfterLogin(path) {
    if (path && typeof path === 'string') {
      localStorage.setItem('grovity_redirect_after_login', path);
    }
  }

  async function requireAuth(options) {
    var opts = options || {};
    var redirectIfMissing = opts.redirectIfMissing || 'login.html';
    var redirectAfterLogin = opts.redirectAfterLogin || window.location.pathname.split('/').pop() || 'index.html';

    if (window.__grovityBootError) {
      return null;
    }

    var user = await waitForFirebaseUser(opts.timeoutMs);
    if (user) {
      saveUser(user);
      if (typeof opts.onAuthorized === 'function') {
        opts.onAuthorized(user);
      }
      return user;
    }

    setRedirectAfterLogin(redirectAfterLogin);
    window.location.href = redirectIfMissing;
    return null;
  }

  async function redirectIfAuthenticated(destination) {
    if (window.__grovityBootError) {
      return false;
    }

    var user = await waitForFirebaseUser(6000);
    if (!user) {
      return false;
    }

    saveUser(user);
    var redirectTo = localStorage.getItem('grovity_redirect_after_login');
    localStorage.removeItem('grovity_redirect_after_login');
    window.location.href = redirectTo || destination || 'workspace.html';
    return true;
  }

  async function getCurrentUser() {
    if (window.__grovityBootError) {
      return null;
    }

    var user = await waitForFirebaseUser(5000);
    if (user) {
      saveUser(user);
      return user;
    }

    return null;
  }

  function isLoggedInSync() {
    var stored = parseStoredUser();
    return Boolean(stored && stored.uid && stored.email);
  }

  function logout(options) {
    var opts = options || {};
    var destination = opts.destination || 'index.html';

    var finish = function () {
      clearUserPreservingTheme();
      if (typeof opts.afterLogout === 'function') {
        opts.afterLogout();
      }
      window.location.href = destination;
    };

    if (window.__fbSignOut) {
      window.__fbSignOut().then(finish).catch(finish);
      return;
    }

    finish();
  }

  window.grovityAuthGuard = {
    requireAuth: requireAuth,
    redirectIfAuthenticated: redirectIfAuthenticated,
    getCurrentUser: getCurrentUser,
    isLoggedInSync: isLoggedInSync,
    saveUser: saveUser,
    logout: logout,
    setRedirectAfterLogin: setRedirectAfterLogin
  };
})();
