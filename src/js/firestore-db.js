// ============================================================
//  GROVITY — Firestore Database Service
//  Manages all cloud data persistence for tasks, habits, notes
// ============================================================

const WRITE_RATE_LIMITS = {
  tasks: 600,
  habits: 800,
  habitProgress: 700,
  notes: 1500,
  noteDelete: 1200
};

const _writeTimers = new Map();
const _writePending = new Map();

function logFirestoreIncident(event, options) {
  if (window.grovityIncidentLogger && typeof window.grovityIncidentLogger.logIncident === 'function') {
    window.grovityIncidentLogger.logIncident('firestore', event, options || {});
  }
}

function ensureDb(operationName) {
  if (!window.__fbDb) {
    const message = 'Firestore database not initialized for operation: ' + operationName;
    console.error(message);
    logFirestoreIncident('db-unavailable', {
      level: 'error',
      message: message,
      context: { operation: operationName }
    });
    return false;
  }
  return true;
}

function withWriteRateLimit(key, delayMs, operation) {
  return new Promise(function (resolve, reject) {
    var pending = _writePending.get(key);
    if (!pending) {
      pending = { operation: null, resolvers: [] };
      _writePending.set(key, pending);
    }

    pending.operation = operation;
    pending.resolvers.push({ resolve: resolve, reject: reject });

    var existingTimer = _writeTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    var timer = setTimeout(async function () {
      _writeTimers.delete(key);
      var run = _writePending.get(key);
      _writePending.delete(key);
      if (!run || typeof run.operation !== 'function') {
        return;
      }

      try {
        var result = await run.operation();
        run.resolvers.forEach(function (entry) {
          entry.resolve(result);
        });
      } catch (error) {
        run.resolvers.forEach(function (entry) {
          entry.reject(error);
        });
      }
    }, Math.max(0, delayMs || 0));

    _writeTimers.set(key, timer);
  });
}

const GrovityDB = {
  // TASKS COLLECTION
  async saveTasks(userId, tasks) {
    if (!userId) {
      const message = 'No userId provided to saveTasks';
      console.error(message);
      logFirestoreIncident('save-tasks-missing-user', {
        level: 'warn',
        message: message
      });
      return;
    }

    if (!ensureDb('saveTasks')) {
      return;
    }

    return withWriteRateLimit('tasks:' + userId, WRITE_RATE_LIMITS.tasks, async function () {
      try {
        await window.__fbDb.collection('users').doc(userId).collection('tasks').doc('all-tasks').set({
          tasks: tasks,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (error) {
        console.error('Error saving tasks to Firestore:', error.code, error.message);
        logFirestoreIncident('save-tasks-failed', {
          level: 'error',
          error: error,
          context: { userId: userId }
        });
        throw error;
      }
    });
  },

  async loadTasks(userId) {
    if (!userId) {
      const message = 'No userId provided to loadTasks';
      console.error(message);
      logFirestoreIncident('load-tasks-missing-user', {
        level: 'warn',
        message: message
      });
      return [];
    }

    if (!ensureDb('loadTasks')) {
      return [];
    }

    try {
      const doc = await window.__fbDb.collection('users').doc(userId).collection('tasks').doc('all-tasks').get();
      if (doc.exists) {
        return doc.data().tasks || [];
      }
      return [];
    } catch (error) {
      console.error('Error loading tasks from Firestore:', error);
      logFirestoreIncident('load-tasks-failed', {
        level: 'warn',
        error: error,
        context: { userId: userId }
      });
      return [];
    }
  },

  // HABITS COLLECTION
  async saveHabits(userId, habits) {
    if (!userId) {
      const message = 'No userId provided to saveHabits';
      console.error(message);
      logFirestoreIncident('save-habits-missing-user', {
        level: 'warn',
        message: message
      });
      return;
    }

    if (!ensureDb('saveHabits')) {
      return;
    }

    return withWriteRateLimit('habits:' + userId, WRITE_RATE_LIMITS.habits, async function () {
      try {
        await window.__fbDb.collection('users').doc(userId).collection('habits').doc('all-habits').set({
          habits: habits,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (error) {
        console.error('Error saving habits to Firestore:', error);
        logFirestoreIncident('save-habits-failed', {
          level: 'error',
          error: error,
          context: { userId: userId }
        });
        throw error;
      }
    });
  },

  async loadHabits(userId) {
    if (!userId) {
      const message = 'No userId provided to loadHabits';
      console.error(message);
      logFirestoreIncident('load-habits-missing-user', {
        level: 'warn',
        message: message
      });
      return { good: [], bad: [] };
    }

    if (!ensureDb('loadHabits')) {
      return { good: [], bad: [] };
    }

    try {
      const doc = await window.__fbDb.collection('users').doc(userId).collection('habits').doc('all-habits').get();
      if (doc.exists) {
        return doc.data().habits || { good: [], bad: [] };
      }
      return { good: [], bad: [] };
    } catch (error) {
      console.error('Error loading habits from Firestore:', error);
      logFirestoreIncident('load-habits-failed', {
        level: 'warn',
        error: error,
        context: { userId: userId }
      });
      return { good: [], bad: [] };
    }
  },

  // HABIT PROGRESS TRACKING
  async saveHabitProgress(userId, progress) {
    if (!userId) {
      const message = 'No userId provided to saveHabitProgress';
      console.error(message);
      logFirestoreIncident('save-habit-progress-missing-user', {
        level: 'warn',
        message: message
      });
      return;
    }

    if (!ensureDb('saveHabitProgress')) {
      return;
    }

    return withWriteRateLimit('habit-progress:' + userId, WRITE_RATE_LIMITS.habitProgress, async function () {
      try {
        const today = new Date().toDateString();
        await window.__fbDb.collection('users').doc(userId).collection('habit-progress').doc(today).set({
          progress: progress,
          date: today,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (error) {
        console.error('Error saving habit progress to Firestore:', error);
        logFirestoreIncident('save-habit-progress-failed', {
          level: 'warn',
          error: error,
          context: { userId: userId }
        });
        throw error;
      }
    });
  },

  async loadHabitProgress(userId) {
    if (!userId) {
      const message = 'No userId provided to loadHabitProgress';
      console.error(message);
      logFirestoreIncident('load-habit-progress-missing-user', {
        level: 'warn',
        message: message
      });
      return {};
    }

    if (!ensureDb('loadHabitProgress')) {
      return {};
    }

    try {
      const today = new Date().toDateString();
      const doc = await window.__fbDb.collection('users').doc(userId).collection('habit-progress').doc(today).get();
      if (doc.exists) {
        return doc.data().progress || {};
      }
      return {};
    } catch (error) {
      console.error('Error loading habit progress from Firestore:', error);
      logFirestoreIncident('load-habit-progress-failed', {
        level: 'warn',
        error: error,
        context: { userId: userId }
      });
      return {};
    }
  },

  // NOTES COLLECTION
  async saveNote(userId, noteId, content) {
    if (!userId) {
      const message = 'No userId provided to saveNote';
      console.error(message);
      logFirestoreIncident('save-note-missing-user', {
        level: 'warn',
        message: message,
        context: { noteId: noteId }
      });
      return;
    }

    if (!ensureDb('saveNote')) {
      return;
    }

    return withWriteRateLimit('note:' + userId + ':' + noteId, WRITE_RATE_LIMITS.notes, async function () {
      try {
        await window.__fbDb.collection('users').doc(userId).collection('notes').doc(noteId).set({
          content: content,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error('Error saving note to Firestore:', error.code, error.message);
        logFirestoreIncident('save-note-failed', {
          level: 'warn',
          error: error,
          context: { userId: userId, noteId: noteId }
        });
        throw error;
      }
    });
  },

  async loadNote(userId, noteId) {
    if (!userId) {
      const message = 'No userId provided to loadNote';
      console.error(message);
      logFirestoreIncident('load-note-missing-user', {
        level: 'warn',
        message: message,
        context: { noteId: noteId }
      });
      return null;
    }

    if (!ensureDb('loadNote')) {
      return null;
    }

    try {
      const doc = await window.__fbDb.collection('users').doc(userId).collection('notes').doc(noteId).get();
      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (error) {
      console.error('Error loading note from Firestore:', error.code, error.message);
      logFirestoreIncident('load-note-failed', {
        level: 'warn',
        error: error,
        context: { userId: userId, noteId: noteId }
      });
      return null;
    }
  },

  async deleteNote(userId, noteId) {
    if (!userId) {
      const message = 'No userId provided to deleteNote';
      console.error(message);
      logFirestoreIncident('delete-note-missing-user', {
        level: 'warn',
        message: message,
        context: { noteId: noteId }
      });
      return;
    }

    if (!ensureDb('deleteNote')) {
      return;
    }

    return withWriteRateLimit('note-delete:' + userId + ':' + noteId, WRITE_RATE_LIMITS.noteDelete, async function () {
      try {
        await window.__fbDb.collection('users').doc(userId).collection('notes').doc(noteId).delete();
      } catch (error) {
        console.error('Error deleting note from Firestore:', error.code, error.message);
        logFirestoreIncident('delete-note-failed', {
          level: 'warn',
          error: error,
          context: { userId: userId, noteId: noteId }
        });
        throw error;
      }
    });
  },

  // REAL-TIME LISTENERS
  onTasksChange(userId, callback) {
    if (!userId) {
      console.error('No userId provided to onTasksChange');
      return () => {};
    }
    return window.__fbDb.collection('users').doc(userId).collection('tasks').doc('all-tasks').onSnapshot(
      (doc) => {
        if (doc.exists) {
          callback(doc.data().tasks || []);
        } else {
          callback([]);
        }
      },
      (error) => {
        console.error('Error listening to tasks:', error);
        logFirestoreIncident('tasks-listener-failed', {
          level: 'warn',
          error: error,
          context: { userId: userId }
        });
      }
    );
  },

  onHabitsChange(userId, callback) {
    if (!userId) {
      console.error('No userId provided to onHabitsChange');
      return () => {};
    }
    return window.__fbDb.collection('users').doc(userId).collection('habits').doc('all-habits').onSnapshot(
      (doc) => {
        if (doc.exists) {
          callback(doc.data().habits || { good: [], bad: [] });
        } else {
          callback({ good: [], bad: [] });
        }
      },
      (error) => {
        console.error('Error listening to habits:', error);
        logFirestoreIncident('habits-listener-failed', {
          level: 'warn',
          error: error,
          context: { userId: userId }
        });
      }
    );
  }
};

// Make available globally
window.__grovityDB = GrovityDB;
