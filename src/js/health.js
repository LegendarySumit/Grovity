(function () {
  var resultsRoot = document.getElementById('healthResults');
  var summary = document.getElementById('healthSummary');
  var rerunBtn = document.getElementById('rerunHealthCheck');

  function addResult(label, state, detail) {
    var colorClass = 'text-red-300 border-red-500/40 bg-red-500/10';
    if (state === 'pass') {
      colorClass = 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10';
    } else if (state === 'warn') {
      colorClass = 'text-amber-300 border-amber-500/40 bg-amber-500/10';
    }

    var icon = state === 'pass' ? 'fa-check' : state === 'warn' ? 'fa-triangle-exclamation' : 'fa-xmark';

    var card = document.createElement('div');
    card.className = 'rounded-xl border p-4 ' + colorClass;
    card.innerHTML =
      '<div class="flex items-start justify-between gap-3">' +
      '<div>' +
      '<p class="text-sm font-semibold">' + label + '</p>' +
      '<p class="text-xs mt-1 opacity-90">' + detail + '</p>' +
      '</div>' +
      '<i class="fa-solid ' + icon + ' text-sm mt-0.5"></i>' +
      '</div>';

    resultsRoot.appendChild(card);
  }

  function requiredConfigFields() {
    return [
      { name: 'window.__FB_API_KEY__', value: window.__FB_API_KEY__ },
      { name: 'window.__FB_AUTH_DOMAIN__', value: window.__FB_AUTH_DOMAIN__ },
      { name: 'window.__FB_PROJECT_ID__', value: window.__FB_PROJECT_ID__ },
      { name: 'window.__FB_APP_ID__', value: window.__FB_APP_ID__ },
      { name: 'window.__FB_APPCHECK_SITE_KEY__', value: window.__FB_APPCHECK_SITE_KEY__ }
    ];
  }

  async function checkFirestoreConnectivity() {
    if (!window.__fbDb || typeof window.__fbDb.collection !== 'function') {
      return { state: 'fail', detail: 'Firestore client is unavailable.' };
    }

    try {
      await window.__fbDb.collection('users').limit(1).get();
      return { state: 'pass', detail: 'Firestore responded successfully.' };
    } catch (error) {
      if (error && (error.code === 'permission-denied' || error.code === 'unauthenticated')) {
        return {
          state: 'pass',
          detail: 'Firestore is reachable (request denied by rules as expected for unauthenticated access).'
        };
      }

      return {
        state: 'fail',
        detail: 'Firestore check failed: ' + ((error && error.message) || 'Unknown error')
      };
    }
  }

  async function checkAuth() {
    if (!window.__fbAuth || typeof window.__fbAuth.onAuthStateChanged !== 'function') {
      return { state: 'fail', detail: 'Firebase Auth client is unavailable.' };
    }

    return new Promise(function (resolve) {
      var settled = false;
      var timeout = setTimeout(function () {
        if (settled) {
          return;
        }
        settled = true;
        resolve({ state: 'warn', detail: 'Auth listener did not resolve quickly. Retry if this persists.' });
      }, 5000);

      var unsubscribe = window.__fbAuth.onAuthStateChanged(function (user) {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeout);
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }

        if (user) {
          resolve({ state: 'pass', detail: 'Authenticated as ' + user.email + '.' });
          return;
        }

        resolve({ state: 'pass', detail: 'Auth is initialized and returned no active user.' });
      }, function (error) {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeout);
        resolve({ state: 'fail', detail: 'Auth listener error: ' + ((error && error.message) || 'Unknown error') });
      });
    });
  }

  async function runChecks() {
    resultsRoot.innerHTML = '';

    if (window.__grovityBootError) {
      addResult('Bootstrap state', 'fail', 'App bootstrap failed: ' + window.__grovityBootError);
      summary.textContent = 'Startup failed. Resolve bootstrap configuration first.';
      summary.className = 'text-sm text-red-300';
      return;
    }

    var missing = requiredConfigFields().filter(function (field) {
      return typeof field.value !== 'string' || field.value.trim().length === 0;
    });

    if (missing.length > 0) {
      addResult('Runtime config', 'fail', 'Missing config fields: ' + missing.map(function (item) { return item.name; }).join(', '));
    } else {
      addResult('Runtime config', 'pass', 'All required Firebase config values are present.');
    }

    if (window.firebase && typeof window.firebase.initializeApp === 'function') {
      addResult('Firebase SDK', 'pass', 'Firebase compat SDK loaded.');
    } else {
      addResult('Firebase SDK', 'fail', 'Firebase SDK not loaded.');
    }

    if (window.__fbAppCheck) {
      addResult('App Check', 'pass', 'App Check is active in this session.');
    } else {
      addResult('App Check', 'warn', 'App Check object not detected. Check environment and token state.');
    }

    var authStatus = await checkAuth();
    addResult('Authentication', authStatus.state, authStatus.detail);

    var firestoreStatus = await checkFirestoreConnectivity();
    addResult('Firestore connectivity', firestoreStatus.state, firestoreStatus.detail);

    var failedCards = resultsRoot.querySelectorAll('.text-red-300').length;
    var warnCards = resultsRoot.querySelectorAll('.text-amber-300').length;

    if (failedCards > 0) {
      summary.textContent = 'Health check finished with failures. Resolve the failed checks before public release.';
      summary.className = 'text-sm text-red-300';
      return;
    }

    if (warnCards > 0) {
      summary.textContent = 'Health check passed with warnings. Review warnings for production hardening.';
      summary.className = 'text-sm text-amber-300';
      return;
    }

    summary.textContent = 'All startup checks passed.';
    summary.className = 'text-sm text-emerald-300';
  }

  rerunBtn.addEventListener('click', runChecks);
  runChecks();
})();
