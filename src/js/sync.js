/**
 * Grovity Sync Engine
 * Manages real-time synchronization between workspace and homepage
 */

const SYNC_KEYS = {
  CURRENT_FOCUS: 'grovity_current_focus',
  STATS: 'grovity_stats',
  TASKS: 'grovity_tasks',
  SESSION_HISTORY: 'grovity_session_history',
  DAILY_SUMMARY: 'grovity_daily_summary'
};

class GrovitySync {
  constructor() {
    this.listeners = new Map();
    this.setupStorageListener();
  }

  /**
   * Listen for storage changes from other tabs/windows
   */
  setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('grovity_')) {
        const callbacks = this.listeners.get(e.key);
        if (callbacks) {
          const newData = e.newValue ? JSON.parse(e.newValue) : null;
          callbacks.forEach(cb => cb(newData, e.key));
        }
      }
    });
  }

  /**
   * Subscribe to changes for a specific key
   */
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
  }

  /**
   * Unsubscribe from changes
   */
  unsubscribe(key, callback) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Update current focus session
   */
  updateCurrentFocus(focusData) {
    try {
      localStorage.setItem(SYNC_KEYS.CURRENT_FOCUS, JSON.stringify(focusData));
      // Trigger event for same-tab updates
      window.dispatchEvent(new CustomEvent('grovity-focus-update', { detail: focusData }));
    } catch (e) {
      console.error('Failed to update current focus:', e);
    }
  }

  /**
   * Get current focus session
   */
  getCurrentFocus() {
    try {
      const data = localStorage.getItem(SYNC_KEYS.CURRENT_FOCUS);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to get current focus:', e);
      return null;
    }
  }

  /**
   * Update statistics
   */
  updateStats(statsData) {
    try {
      localStorage.setItem(SYNC_KEYS.STATS, JSON.stringify(statsData));
      window.dispatchEvent(new CustomEvent('grovity-stats-update', { detail: statsData }));
    } catch (e) {
      console.error('Failed to update stats:', e);
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    try {
      const data = localStorage.getItem(SYNC_KEYS.STATS);
      if (!data) {
        // Initialize default stats
        const defaultStats = {
          totalTasksCompleted: 0,
          streak: 0,
          tasksCreatedToday: 0,
          focusSessionsToday: 0,
          lastActiveDate: new Date().toDateString()
        };
        this.updateStats(defaultStats);
        return defaultStats;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to get stats:', e);
      return {
        totalTasksCompleted: 0,
        streak: 0,
        tasksCreatedToday: 0,
        focusSessionsToday: 0,
        lastActiveDate: new Date().toDateString()
      };
    }
  }

  /**
   * Get next task from task list
   */
  getNextTask() {
    const tasks = JSON.parse(localStorage.getItem(SYNC_KEYS.TASKS) || '[]');
    const incompleteTasks = tasks.filter(t => !t.completed);
    return incompleteTasks.length > 0 ? incompleteTasks[0].text : 'No pending tasks';
  }

  /**
   * Increment task completion count
   */
  incrementTaskCompletion() {
    const stats = this.getStats();
    stats.totalTasksCompleted += 1;
    this.updateStats(stats);
  }

  /**
   * Increment tasks created today
   */
  incrementTasksCreatedToday() {
    const stats = this.getStats();
    const today = new Date().toDateString();
    
    // Reset daily counter if it's a new day
    if (stats.lastActiveDate !== today) {
      stats.tasksCreatedToday = 1;
      stats.focusSessionsToday = 0;
      stats.lastActiveDate = today;
    } else {
      stats.tasksCreatedToday += 1;
    }
    
    this.updateStats(stats);
  }

  /**
   * Increment focus sessions today
   */
  incrementFocusSessionsToday() {
    const stats = this.getStats();
    const today = new Date().toDateString();
    
    if (stats.lastActiveDate !== today) {
      stats.focusSessionsToday = 1;
      stats.tasksCreatedToday = 0;
      stats.lastActiveDate = today;
    } else {
      stats.focusSessionsToday += 1;
    }
    
    this.updateStats(stats);
  }

  /**
   * Update streak (call when task is completed)
   */
  updateStreak() {
    const stats = this.getStats();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (stats.lastActiveDate === today) {
      // Already active today, streak unchanged
      return;
    } else if (stats.lastActiveDate === yesterday) {
      // Consecutive day - increment streak
      stats.streak += 1;
    } else {
      // Gap detected - reset streak
      stats.streak = 1;
    }
    
    stats.lastActiveDate = today;
    this.updateStats(stats);
  }

  /**
   * Clear all sync data (for testing/reset)
   */
  clearAllData() {
    Object.values(SYNC_KEYS).forEach(key => localStorage.removeItem(key));
  }

  /**
   * Add completed focus session to history
   */
  addSessionToHistory(sessionData) {
    try {
      const history = this.getSessionHistory();
      const session = {
        id: Date.now(),
        taskName: sessionData.taskName,
        duration: sessionData.duration, // in minutes
        completedAt: new Date().toISOString(),
        date: new Date().toDateString()
      };
      history.unshift(session);
      
      // Keep only last 50 sessions
      if (history.length > 50) {
        history.length = 50;
      }
      
      localStorage.setItem(SYNC_KEYS.SESSION_HISTORY, JSON.stringify(history));
      this.updateDailySummary(sessionData.duration);
    } catch (e) {
      console.error('Failed to add session to history:', e);
    }
  }

  /**
   * Get session history
   */
  getSessionHistory() {
    try {
      const data = localStorage.getItem(SYNC_KEYS.SESSION_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to get session history:', e);
      return [];
    }
  }

  /**
   * Update daily summary with completed session
   */
  updateDailySummary(focusMinutes) {
    const summary = this.getDailySummary();
    const today = new Date().toDateString();
    
    if (!summary[today]) {
      summary[today] = {
        date: today,
        tasksCompleted: 0,
        focusSessions: 0,
        totalFocusMinutes: 0
      };
    }
    
    summary[today].focusSessions += 1;
    summary[today].totalFocusMinutes += focusMinutes;
    
    localStorage.setItem(SYNC_KEYS.DAILY_SUMMARY, JSON.stringify(summary));
  }

  /**
   * Get daily summary
   */
  getDailySummary() {
    const data = localStorage.getItem(SYNC_KEYS.DAILY_SUMMARY);
    return data ? JSON.parse(data) : {};
  }

  /**
   * Update daily task completion
   */
  updateDailyTaskCompletion() {
    const summary = this.getDailySummary();
    const today = new Date().toDateString();
    
    if (!summary[today]) {
      summary[today] = {
        date: today,
        tasksCompleted: 0,
        focusSessions: 0,
        totalFocusMinutes: 0
      };
    }
    
    summary[today].tasksCompleted += 1;
    localStorage.setItem(SYNC_KEYS.DAILY_SUMMARY, JSON.stringify(summary));
  }

  /**
   * Get weekly stats (last 7 days)
   */
  getWeeklyStats() {
    const summary = this.getDailySummary();
    const weekData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayName = days[date.getDay()];
      
      weekData.push({
        day: dayName,
        date: dateStr,
        tasksCompleted: summary[dateStr]?.tasksCompleted || 0,
        focusSessions: summary[dateStr]?.focusSessions || 0,
        totalMinutes: summary[dateStr]?.totalFocusMinutes || 0
      });
    }
    
    return weekData;
  }

  /**
   * Get total statistics
   */
  getTotalStats() {
    const history = this.getSessionHistory();
    const summary = this.getDailySummary();
    
    const totalSessions = history.length;
    const totalMinutes = history.reduce((sum, s) => sum + s.duration, 0);
    const avgDuration = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    
    const totalTasksCompleted = Object.values(summary).reduce((sum, day) => sum + day.tasksCompleted, 0);
    
    return {
      totalSessions,
      totalMinutes,
      avgDuration,
      totalTasksCompleted
    };
  }
}

// Export singleton instance
const grovitySync = new GrovitySync();
