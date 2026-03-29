(function () {
  var BUFFER_KEY = 'grovity_incident_buffer';
  var MAX_BUFFER = 50;
  var lastFingerprintAt = new Map();
  var REMOTE_COOLDOWN_MS = 10000;

  function nowIso() {
    return new Date().toISOString();
  }

  function readBuffer() {
    try {
      var raw = localStorage.getItem(BUFFER_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Incident buffer parse failed:', error);
      return [];
    }
  }

  function writeBuffer(buffer) {
    try {
      localStorage.setItem(BUFFER_KEY, JSON.stringify(buffer.slice(-MAX_BUFFER)));
    } catch (error) {
      console.warn('Incident buffer write failed:', error);
    }
  }

  function fingerprint(incident) {
    return [incident.category, incident.event, incident.errorCode || '', incident.message || ''].join('|');
  }

  function normalizeError(error) {
    if (!error) {
      return {};
    }

    return {
      errorCode: error.code || '',
      errorMessage: error.message || String(error)
    };
  }

  async function trySendRemote(incident) {
    if (!window.__fbDb || !window.__fbAuth || !window.__fbAuth.currentUser) {
      return false;
    }

    var fp = fingerprint(incident);
    var lastAt = lastFingerprintAt.get(fp) || 0;
    var now = Date.now();
    if (now - lastAt < REMOTE_COOLDOWN_MS) {
      return false;
    }

    lastFingerprintAt.set(fp, now);

    try {
      var uid = window.__fbAuth.currentUser.uid;
      await window.__fbDb
        .collection('users')
        .doc(uid)
        .collection('incidents')
        .doc('evt-' + now + '-' + Math.random().toString(36).slice(2, 8))
        .set({
          ...incident,
          userId: uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      return true;
    } catch (error) {
      return false;
    }
  }

  async function logIncident(category, event, options) {
    var opts = options || {};
    var errorData = normalizeError(opts.error);

    var incident = {
      timestamp: nowIso(),
      category: category,
      event: event,
      level: opts.level || 'error',
      message: opts.message || '',
      context: opts.context || {},
      errorCode: errorData.errorCode,
      errorMessage: errorData.errorMessage,
      url: window.location ? window.location.href : ''
    };

    var tag = '[GROVITY INCIDENT][' + category + '][' + event + ']';
    if (incident.level === 'warn') {
      console.warn(tag, incident.message || incident.errorMessage || 'warning', incident.context);
    } else {
      console.error(tag, incident.message || incident.errorMessage || 'error', incident.context);
    }

    var sent = await trySendRemote(incident);
    if (!sent) {
      var buffer = readBuffer();
      buffer.push(incident);
      writeBuffer(buffer);
    }

    return incident;
  }

  async function flushIncidentBuffer() {
    var buffer = readBuffer();
    if (!buffer.length) {
      return;
    }

    if (!window.__fbDb || !window.__fbAuth || !window.__fbAuth.currentUser) {
      return;
    }

    var remaining = [];
    for (var i = 0; i < buffer.length; i += 1) {
      var sent = await trySendRemote(buffer[i]);
      if (!sent) {
        remaining.push(buffer[i]);
      }
    }

    writeBuffer(remaining);
  }

  window.grovityIncidentLogger = {
    logIncident: logIncident,
    flushIncidentBuffer: flushIncidentBuffer
  };

  window.addEventListener('online', function () {
    flushIncidentBuffer();
  });
})();
