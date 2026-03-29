(function () {
  var USER_CACHE_KEY = 'grovity_user_session';
  var REDIRECT_KEY = 'grovity_redirect_after_login';

  function logAuthIncident(event, options) {
    if (window.grovityIncidentLogger && typeof window.grovityIncidentLogger.logIncident === 'function') {
      window.grovityIncidentLogger.logIncident('auth', event, options || {});
    }
  }

  function parseStoredUser() {
    try {
      return JSON.parse(sessionStorage.getItem(USER_CACHE_KEY) || '{}');
    } catch (error) {
      console.warn('Unable to parse stored user:', error);
      logAuthIncident('parse-session-user-failed', {
        level: 'warn',
        error: error
      });
      return {};
    }
  }

  function saveUser(user) {
    if (!user || !user.uid || !user.email) {
      return;
    }

    var payload = {
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      photo: user.photoURL || '',
      uid: user.uid
    };

    window.__grovityCurrentUser = payload;
    sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(payload));
  }

  function clearUserPreservingTheme() {
    var theme = localStorage.getItem('grovity_theme');
    sessionStorage.removeItem(USER_CACHE_KEY);
    window.__grovityCurrentUser = null;
    if (theme) {
      localStorage.setItem('grovity_theme', theme);
    }
  }

  function waitForFirebaseUser(timeoutMs) {
    return new Promise(function (resolve) {
      if (!window.__fbAuth || typeof window.__fbAuth.onAuthStateChanged !== 'function') {
        logAuthIncident('firebase-auth-unavailable', {
          level: 'warn',
          message: 'Firebase auth is unavailable while waiting for user.'
        });
        resolve(null);
        return;
      }

      var done = false;
      var timeout = setTimeout(function () {
        if (done) {
          return;
        }
        done = true;
        logAuthIncident('auth-state-timeout', {
          level: 'warn',
          message: 'Auth state listener timed out before resolving user.'
        });
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
      sessionStorage.setItem(REDIRECT_KEY, path);
    }
  }

  function getRedirectAfterLogin() {
    return sessionStorage.getItem(REDIRECT_KEY);
  }

  function clearRedirectAfterLogin() {
    sessionStorage.removeItem(REDIRECT_KEY);
  }

  async function requireAuth(options) {
    var opts = options || {};
    var redirectIfMissing = opts.redirectIfMissing || 'login.html';
    var redirectAfterLogin = opts.redirectAfterLogin || window.location.pathname.split('/').pop() || 'index.html';

    if (window.__grovityBootError) {
      logAuthIncident('require-auth-boot-error', {
        level: 'error',
        message: window.__grovityBootError
      });
      return null;
    }

    var user = await waitForFirebaseUser(opts.timeoutMs);
    if (user) {
      saveUser(user);
      if (window.grovityIncidentLogger && typeof window.grovityIncidentLogger.flushIncidentBuffer === 'function') {
        window.grovityIncidentLogger.flushIncidentBuffer();
      }
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
    if (window.grovityIncidentLogger && typeof window.grovityIncidentLogger.flushIncidentBuffer === 'function') {
      window.grovityIncidentLogger.flushIncidentBuffer();
    }
    var redirectTo = getRedirectAfterLogin();
    clearRedirectAfterLogin();
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
    if (window.__fbAuth && window.__fbAuth.currentUser) {
      return true;
    }
    var stored = parseStoredUser();
    return Boolean(stored && stored.uid && stored.email);
  }

  function getCachedUser() {
    if (window.__fbAuth && window.__fbAuth.currentUser) {
      var current = window.__fbAuth.currentUser;
      return {
        name: current.displayName || current.email.split('@')[0],
        email: current.email,
        photo: current.photoURL || '',
        uid: current.uid
      };
    }

    if (window.__grovityCurrentUser) {
      return window.__grovityCurrentUser;
    }

    return parseStoredUser();
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
      window.__fbSignOut().then(finish).catch(function (error) {
        logAuthIncident('logout-failed', {
          level: 'warn',
          error: error
        });
        finish();
      });
      return;
    }

    finish();
  }

  window.grovityAuthGuard = {
    requireAuth: requireAuth,
    redirectIfAuthenticated: redirectIfAuthenticated,
    getCurrentUser: getCurrentUser,
    isLoggedInSync: isLoggedInSync,
    getCachedUser: getCachedUser,
    saveUser: saveUser,
    logout: logout,
    setRedirectAfterLogin: setRedirectAfterLogin,
    getRedirectAfterLogin: getRedirectAfterLogin,
    clearRedirectAfterLogin: clearRedirectAfterLogin
  };

  if (window.__fbAuth && typeof window.__fbAuth.onAuthStateChanged === 'function') {
    window.__fbAuth.onAuthStateChanged(function (user) {
      if (user) {
        saveUser(user);
      }
    });
  }
})();
