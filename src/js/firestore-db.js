// ============================================================
//  GROVITY — Firestore Database Service
//  Manages all cloud data persistence for tasks, habits, notes
// ============================================================

const GrovityDB = {
  // TASKS COLLECTION
  async saveTasks(userId, tasks) {
    if (!userId) {
      console.error('❌ NO userId provided to saveTasks');
      return;
    }
    console.log('📝 Saving tasks for user:', userId);
    console.log('📝 Tasks:', tasks);
    try {
      if (!window.__fbDb) {
        console.error('❌ Firestore database not initialized (window.__fbDb is null)');
        return;
      }
      await window.__fbDb.collection('users').doc(userId).collection('tasks').doc('all-tasks').set({
        tasks: tasks,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Tasks saved to Firestore successfully');
    } catch (error) {
      console.error('❌ Error saving tasks to Firestore:', error.code, error.message);
    }
  },

  async loadTasks(userId) {
    if (!userId) {
      console.error('No userId provided to loadTasks');
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
      return [];
    }
  },

  // HABITS COLLECTION
  async saveHabits(userId, habits) {
    if (!userId) {
      console.error('No userId provided to saveHabits');
      return;
    }
    try {
      await window.__fbDb.collection('users').doc(userId).collection('habits').doc('all-habits').set({
        habits: habits,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('✓ Habits saved to Firestore');
    } catch (error) {
      console.error('Error saving habits to Firestore:', error);
    }
  },

  async loadHabits(userId) {
    if (!userId) {
      console.error('No userId provided to loadHabits');
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
      return { good: [], bad: [] };
    }
  },

  // HABIT PROGRESS TRACKING
  async saveHabitProgress(userId, progress) {
    if (!userId) {
      console.error('No userId provided to saveHabitProgress');
      return;
    }
    try {
      const today = new Date().toDateString();
      await window.__fbDb.collection('users').doc(userId).collection('habit-progress').doc(today).set({
        progress: progress,
        date: today,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('✓ Habit progress saved to Firestore');
    } catch (error) {
      console.error('Error saving habit progress to Firestore:', error);
    }
  },

  async loadHabitProgress(userId) {
    if (!userId) {
      console.error('No userId provided to loadHabitProgress');
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
      return {};
    }
  },

  // NOTES COLLECTION
  async saveNote(userId, noteId, content) {
    if (!userId) {
      console.error('❌ NO userId provided to saveNote');
      return;
    }
    console.log('📝 Saving note:', noteId, 'Length:', content.length);
    try {
      if (!window.__fbDb) {
        console.error('❌ Firestore database not initialized (window.__fbDb is null)');
        return;
      }
      await window.__fbDb.collection('users').doc(userId).collection('notes').doc(noteId).set({
        content: content,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Note saved to Firestore successfully');
    } catch (error) {
      console.error('❌ Error saving note to Firestore:', error.code, error.message);
    }
  },

  async loadNote(userId, noteId) {
    if (!userId) {
      console.error('❌ NO userId provided to loadNote');
      return null;
    }
    try {
      if (!window.__fbDb) {
        console.error('❌ Firestore database not initialized (window.__fbDb is null)');
        return null;
      }
      console.log('📥 Loading note from Firestore:', noteId);
      const doc = await window.__fbDb.collection('users').doc(userId).collection('notes').doc(noteId).get();
      if (doc.exists) {
        console.log('✅ Note loaded from Firestore');
        return doc.data();
      } else {
        console.log('ℹ️ Note does not exist in Firestore');
        return null;
      }
    } catch (error) {
      console.error('❌ Error loading note from Firestore:', error.code, error.message);
      return null;
    }
  },

  async deleteNote(userId, noteId) {
    if (!userId) {
      console.error('❌ NO userId provided to deleteNote');
      return;
    }
    try {
      if (!window.__fbDb) {
        console.error('❌ Firestore database not initialized (window.__fbDb is null)');
        return;
      }
      console.log('🗑️ Deleting note from Firestore:', noteId);
      await window.__fbDb.collection('users').doc(userId).collection('notes').doc(noteId).delete();
      console.log('✅ Note deleted from Firestore');
    } catch (error) {
      console.error('❌ Error deleting note from Firestore:', error.code, error.message);
    }
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
      (error) => console.error('Error listening to tasks:', error)
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
      (error) => console.error('Error listening to habits:', error)
    );
  }
};

// Make available globally
window.__grovityDB = GrovityDB;
