function escapeHTML(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Sidebar Navigation
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

function openMenu() {
  sidebar.classList.remove('translate-x-full');
  overlay.classList.remove('hidden');
}

function closeMenu() {
  sidebar.classList.add('translate-x-full');
  overlay.classList.add('hidden');
}

menuBtn.addEventListener('click', openMenu);
closeBtn.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);

// Support Modal
const contactSupport = document.getElementById('contactSupport');
const supportModal = document.getElementById('supportModal');
const closeSupportModal = document.getElementById('closeSupportModal');

contactSupport.addEventListener('click', () => {
  supportModal.classList.remove('hidden');
});

closeSupportModal.addEventListener('click', () => {
  supportModal.classList.add('hidden');
});

// Dashboard Data Loading
function loadDashboard() {
  const stats = grovitySync.getStats();
  const totalStats = grovitySync.getTotalStats();
  const weeklyStats = grovitySync.getWeeklyStats();
  const sessionHistory = grovitySync.getSessionHistory();
  const tasks = JSON.parse(localStorage.getItem('grovity_tasks') || '[]');
  
  // Load user profile data
  const userData = JSON.parse(localStorage.getItem('grovity_user') || '{}');
  const userPlan = localStorage.getItem('grovity_plan') || 'Starter';
  
  if (userData.name) {
    document.getElementById('userName').textContent = userData.name;
  }
  if (userData.email) {
    document.getElementById('userEmail').textContent = userData.email;
  }
  document.getElementById('currentPlan').textContent = userPlan;

  // Update streak badge
  document.getElementById('streakBadge').textContent = `🔥 ${stats.streak} day${stats.streak !== 1 ? 's' : ''}`;

  // Update total stats cards
  document.getElementById('totalTasksCompleted').textContent = totalStats.totalTasksCompleted;
  document.getElementById('totalSessions').textContent = totalStats.totalSessions;
  document.getElementById('totalMinutes').textContent = totalStats.totalMinutes;
  document.getElementById('avgDuration').textContent = totalStats.avgDuration;

  // Update today's performance
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const pendingTasks = totalTasks - completedTasks;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  document.getElementById('todayCompleted').textContent = completedTasks;
  document.getElementById('todayPending').textContent = pendingTasks;
  document.getElementById('todayTasksRatio').textContent = `${completedTasks} / ${totalTasks}`;
  document.getElementById('todayTasksProgress').style.width = progressPercent + '%';

  // Render weekly chart
  renderWeeklyChart(weeklyStats);

  // Render session history
  renderSessionHistory(sessionHistory);
}

function renderWeeklyChart(weekData) {
  const weekChart = document.getElementById('weekChart');
  const maxTasks = Math.max(...weekData.map(d => d.tasksCompleted), 1);
  const weekTotal = weekData.reduce((sum, d) => sum + d.tasksCompleted, 0);
  
  document.getElementById('weekTotal').textContent = `${weekTotal} task${weekTotal !== 1 ? 's' : ''}`;

  weekChart.innerHTML = weekData.map(day => {
    const heightPercent = (day.tasksCompleted / maxTasks) * 100;
    return `
      <div class="flex-1 flex flex-col items-center gap-2 group">
        <div class="w-full bg-slate-800 rounded-t-lg overflow-hidden relative" style="height: 100%;">
          <div class="absolute bottom-0 w-full bg-blue-500 group-hover:bg-blue-400 transition-all rounded-t-lg" 
               style="height: ${heightPercent}%"
               title="${day.tasksCompleted} tasks"></div>
        </div>
        <span class="text-xs text-slate-500">${day.day}</span>
      </div>
    `;
  }).join('');
}

function renderSessionHistory(sessions) {
  const sessionHistory = document.getElementById('sessionHistory');
  const sessionHistoryFull = document.getElementById('sessionHistoryFull');
  
  if (!sessionHistory) return; // Exit if element doesn't exist
  
  if (sessions.length === 0) {
    const emptyHTML = `
      <div class="text-center text-slate-500 py-8">
        <i class="fa-solid fa-clock text-4xl mb-3 opacity-50"></i>
        <p class="text-sm">No focus sessions completed yet</p>
        <a href="workspace.html" class="text-blue-400 hover:text-blue-300 text-xs mt-2 inline-block">
          Start your first session →
        </a>
      </div>
    `;
    sessionHistory.innerHTML = emptyHTML;
    if (sessionHistoryFull) sessionHistoryFull.innerHTML = emptyHTML;
    return;
  }

  const recentSessions = sessions.slice(0, 5);
  const allSessions = sessions.slice(0, 10);
  
  const renderSession = (session) => {
    const sessionDate = new Date(session.completedAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let timeLabel;
    if (sessionDate.toDateString() === today.toDateString()) {
      timeLabel = 'Today';
    } else if (sessionDate.toDateString() === yesterday.toDateString()) {
      timeLabel = 'Yesterday';
    } else {
      timeLabel = sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    return `
      <div class="flex items-center justify-between gap-4 bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-clock text-blue-400 text-sm"></i>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-white truncate">${escapeHTML(session.taskName)}</p>
            <p class="text-xs text-slate-500">${timeLabel} • ${sessionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <p class="text-lg font-bold text-purple-400">${session.duration}</p>
          <p class="text-xs text-slate-500">min</p>
        </div>
      </div>
    `;
  };

  sessionHistory.innerHTML = recentSessions.map(renderSession).join('');
  if (sessionHistoryFull) {
    sessionHistoryFull.innerHTML = allSessions.map(renderSession).join('');
  }
}

// Monthly Calendar
let currentCalendarDate = new Date();

function renderCalendar() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  // Update month display
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
  
  // Get daily summary data
  const dailySummary = JSON.parse(localStorage.getItem('grovity_daily_summary') || '{}');
  
  // Calculate first day of month and total days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const calendarGrid = document.getElementById('calendarGrid');
  let html = '';
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="aspect-square"></div>';
  }
  
  // Add days of month
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = new Date(year, month, day).toDateString();
    const dayData = dailySummary[dateKey] || { tasksCompleted: 0, focusSessions: 0 };
    
    const isToday = today.getFullYear() === year && 
                   today.getMonth() === month && 
                   today.getDate() === day;
    
    // Determine activity level
    const totalActivity = dayData.tasksCompleted + dayData.focusSessions;
    let bgClass = 'bg-slate-800/50';
    if (totalActivity >= 10) bgClass = 'bg-emerald-500';
    else if (totalActivity >= 5) bgClass = 'bg-emerald-500/60';
    else if (totalActivity >= 1) bgClass = 'bg-emerald-500/30';
    
    const borderClass = isToday ? 'ring-2 ring-blue-400' : 'border border-slate-700/50';
    
    html += `
      <div class="aspect-square rounded-lg m-0.5 ${bgClass} ${borderClass} flex items-center justify-center text-[10px] font-medium transition-all hover:scale-105 hover:ring-2 hover:ring-slate-600 cursor-pointer"
           title="${dateKey}: ${dayData.tasksCompleted} tasks, ${dayData.focusSessions} sessions">
        <span class="text-slate-200">${day}</span>
      </div>
    `;
  }
  
  calendarGrid.innerHTML = html;
}

document.getElementById('prevMonth').addEventListener('click', () => {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
  renderCalendar();
});

// Achievement System - Comprehensive with Star Progression
const achievementDefinitions = [
  // Task Completion Achievements (3 stars)
  { 
    id: 'tasks-bronze', 
    category: 'Tasks',
    levels: [
      { name: 'Task Starter', icon: '🎯', description: 'Complete 5 tasks', stars: 1, requirement: 5 },
      { name: 'Task Warrior', icon: '🎯', description: 'Complete 15 tasks', stars: 2, requirement: 15 },
      { name: 'Task Master', icon: '🎯', description: 'Complete 30 tasks', stars: 3, requirement: 30 }
    ],
    getCurrentValue: (stats) => stats.totalTasks
  },
  
  // Focus Time Achievements (3 stars)
  { 
    id: 'time-bronze', 
    category: 'Focus Time',
    levels: [
      { name: 'Focus Beginner', icon: '⏰', description: '30 minutes of focus', stars: 1, requirement: 30 },
      { name: 'Focus Enthusiast', icon: '⏰', description: '120 minutes of focus', stars: 2, requirement: 120 },
      { name: 'Focus Champion', icon: '⏰', description: '300 minutes of focus', stars: 3, requirement: 300 }
    ],
    getCurrentValue: (stats) => stats.totalMinutes
  },
  
  // Daily Streak Achievements (3 stars)
  { 
    id: 'streak-bronze', 
    category: 'Consistency',
    levels: [
      { name: 'Week Streak', icon: '🔥', description: 'Focus for 7 days', stars: 1, requirement: 7 },
      { name: 'Fortnight Focus', icon: '🔥', description: 'Focus for 14 days', stars: 2, requirement: 14 },
      { name: 'Monthly Master', icon: '🔥', description: 'Focus for 21 days', stars: 3, requirement: 21 }
    ],
    getCurrentValue: (stats) => stats.currentStreak
  },
  
  // Session Count Achievements (3 stars)
  { 
    id: 'sessions-bronze', 
    category: 'Sessions',
    levels: [
      { name: 'Session Starter', icon: '🎬', description: 'Complete 5 sessions', stars: 1, requirement: 5 },
      { name: 'Session Pro', icon: '🎬', description: 'Complete 20 sessions', stars: 2, requirement: 20 },
      { name: 'Session Legend', icon: '🎬', description: 'Complete 50 sessions', stars: 3, requirement: 50 }
    ],
    getCurrentValue: (stats) => stats.totalSessions
  },
  
  // Productivity Achievements (3 stars)
  { 
    id: 'productivity-bronze', 
    category: 'Productivity',
    levels: [
      { name: 'Rising Star', icon: '⭐', description: '10 tasks + 60 min', stars: 1, requirement: { tasks: 10, minutes: 60 } },
      { name: 'Shining Star', icon: '⭐', description: '25 tasks + 150 min', stars: 2, requirement: { tasks: 25, minutes: 150 } },
      { name: 'Superstar', icon: '⭐', description: '50 tasks + 300 min', stars: 3, requirement: { tasks: 50, minutes: 300 } }
    ],
    getCurrentValue: (stats) => ({ tasks: stats.totalTasks, minutes: stats.totalMinutes })
  }
];

function renderAchievements() {
  try {
    const stats = grovitySync.getStats();
    const totalStats = grovitySync.getTotalStats();
    
    const achievementData = {
      totalTasks: totalStats.totalTasksCompleted || 0,
      totalSessions: totalStats.totalSessions || 0,
      totalMinutes: totalStats.totalMinutes || 0,
      currentStreak: stats.streak || 0
    };
    
    const achievementsHTML = achievementDefinitions.map(achievement => {
      const currentValue = achievement.getCurrentValue(achievementData);
      
      // Determine current level
      let currentLevel = -1;
      let isCompleted = false;
      
      for (let i = achievement.levels.length - 1; i >= 0; i--) {
        const level = achievement.levels[i];
        
        // Check if requirement is met
        let requirementMet = false;
        if (typeof level.requirement === 'number') {
          requirementMet = currentValue >= level.requirement;
        } else {
          // For complex requirements (productivity)
          requirementMet = currentValue.tasks >= level.requirement.tasks && 
                          currentValue.minutes >= level.requirement.minutes;
        }
        
        if (requirementMet) {
          currentLevel = i;
          isCompleted = i === achievement.levels.length - 1;
          break;
        }
      }
      
      // If no level achieved yet, show first level as target
      const activeLevelData = currentLevel >= 0 ? achievement.levels[currentLevel] : achievement.levels[0];
      const nextLevelData = currentLevel >= 0 ? achievement.levels[currentLevel + 1] : achievement.levels[0];
      
      // Calculate progress for current level
      let progressPercent = 0;
      let progressText = '';
      
      if (currentLevel >= 0 && nextLevelData) {
        // Working towards next level
        if (typeof nextLevelData.requirement === 'number') {
          const prevRequirement = activeLevelData.requirement;
          const currentProgress = (currentValue || 0) - prevRequirement;
          const requiredProgress = nextLevelData.requirement - prevRequirement;
          progressPercent = Math.max(0, Math.min(100, (currentProgress / requiredProgress) * 100));
          progressText = `${currentValue || 0} / ${nextLevelData.requirement}`;
        } else {
          const tasks = currentValue?.tasks || 0;
          const minutes = currentValue?.minutes || 0;
          const taskProgress = (tasks / nextLevelData.requirement.tasks) * 100;
          const minuteProgress = (minutes / nextLevelData.requirement.minutes) * 100;
          progressPercent = Math.max(0, Math.min(100, Math.min(taskProgress, minuteProgress)));
          progressText = `${tasks}/${nextLevelData.requirement.tasks} tasks, ${minutes}/${nextLevelData.requirement.minutes} min`;
        }
      } else if (currentLevel >= 0 && isCompleted) {
        // Max level achieved
        progressPercent = 100;
        if (typeof activeLevelData.requirement === 'number') {
          progressText = `${currentValue || 0} / ${activeLevelData.requirement}`;
        } else {
          progressText = 'Max Level!';
        }
      } else {
        // No level achieved yet, show progress to first level
        if (typeof achievement.levels[0].requirement === 'number') {
          const val = currentValue || 0;
          progressPercent = Math.max(0, Math.min(100, (val / achievement.levels[0].requirement) * 100));
          progressText = `${val} / ${achievement.levels[0].requirement}`;
        } else {
          const tasks = currentValue?.tasks || 0;
          const minutes = currentValue?.minutes || 0;
          const taskProgress = (tasks / achievement.levels[0].requirement.tasks) * 100;
          const minuteProgress = (minutes / achievement.levels[0].requirement.minutes) * 100;
          progressPercent = Math.max(0, Math.min(100, Math.min(taskProgress, minuteProgress)));
          progressText = `${tasks}/${achievement.levels[0].requirement.tasks} tasks, ${minutes}/${achievement.levels[0].requirement.minutes} min`;
        }
      }
      
      // Render stars
      const totalStars = 3;
      const earnedStars = currentLevel >= 0 ? activeLevelData.stars : 0;
      const starsHTML = Array.from({ length: totalStars }, (_, i) => {
        if (i < earnedStars) {
          return '<i class="fa-solid fa-star text-yellow-400 text-sm"></i>';
        } else {
          return '<i class="fa-regular fa-star text-slate-600 text-sm"></i>';
        }
      }).join('');
      
      const bgClass = earnedStars > 0 
        ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-emerald-500/50' 
        : 'bg-slate-900/50 border-slate-700';
      
      const textClass = earnedStars > 0 ? 'text-white' : 'text-slate-400';
      const iconScale = earnedStars > 0 ? 'scale-110' : 'scale-100';
      
      return `
        <div class="relative bg-slate-950 border ${bgClass} rounded-xl p-3 transition-all hover:scale-[1.02] hover:border-emerald-400/50">
          <div class="flex items-start gap-3 mb-2">
            <div class="text-3xl ${iconScale} transition-transform shrink-0">${activeLevelData.icon}</div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold ${textClass} truncate">${activeLevelData.name}</p>
              <p class="text-xs text-slate-500 truncate">${activeLevelData.description}</p>
              <div class="flex items-center gap-1 mt-1">
                ${starsHTML}
              </div>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="relative h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
            <div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500" style="width: ${progressPercent}%"></div>
          </div>
          <p class="text-xs text-slate-500 text-right">${progressText}</p>
          
          ${isCompleted ? '<div class="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"><i class="fa-solid fa-check text-white text-xs"></i></div>' : ''}
        </div>
      `;
    }).join('');

    document.getElementById('achievementsList').innerHTML = achievementsHTML || '<p class="text-center text-slate-500 text-sm py-8">No achievements yet</p>';
  } catch (error) {
    console.error('Error rendering achievements:', error);
    document.getElementById('achievementsList').innerHTML = '<p class="text-center text-red-500 text-sm py-8">Error loading achievements</p>';
  }
}

// Initial load
loadDashboard();
renderCalendar();
renderAchievements();

// Refresh every 5 seconds
setInterval(() => {
  loadDashboard();
  renderCalendar();
  renderAchievements();
}, 5000);

// Listen for storage changes (cross-tab sync)
window.addEventListener('storage', (e) => {
  if (e.key && e.key.startsWith('grovity_')) {
    loadDashboard();
    renderCalendar();
    renderAchievements();
  }
});

// Listen for real-time stats updates (same-tab sync)
window.addEventListener('grovity-stats-update', () => {
  loadDashboard();
  renderCalendar();
  renderAchievements();
});

// Listen for real-time focus updates (same-tab sync)
window.addEventListener('grovity-focus-update', () => {
  loadDashboard();
  // Restart background timer if a new focus session just started
  startDashboardBackgroundTimer();
});

// ===== NOTES SECTION FUNCTIONALITY =====
const NOTES_KEY = 'grovity_notes';
const notesArea = document.getElementById('notesArea');
const charCount = document.getElementById('charCount');
const saveNotesBtn = document.getElementById('saveNotes');
const clearNotesBtn = document.getElementById('clearNotes');

if (notesArea && charCount && saveNotesBtn && clearNotesBtn) {
  // Load saved notes
  function loadNotes() {
    const savedNotes = localStorage.getItem(NOTES_KEY) || '';
    notesArea.value = savedNotes;
    updateCharCount();
  }

  // Update character count
  function updateCharCount() {
    const count = notesArea.value.length;
    charCount.textContent = count + ' character' + (count !== 1 ? 's' : '');
  }

  // Update character count and auto-save as user types
  notesArea.addEventListener('input', function() {
    updateCharCount();
    localStorage.setItem(NOTES_KEY, notesArea.value);
  });

  // Save notes when save button is clicked
  saveNotesBtn.addEventListener('click', function() {
    localStorage.setItem(NOTES_KEY, notesArea.value);
    // Visual feedback - change icon color
    saveNotesBtn.style.color = '#10b981';
    setTimeout(function() {
      saveNotesBtn.style.color = '';
    }, 1000);
  });

  // Clear all notes when clear button is clicked
  clearNotesBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all notes? This action cannot be undone.')) {
      notesArea.value = '';
      localStorage.setItem(NOTES_KEY, '');
      updateCharCount();
    }
  });

  // Load notes on page load
  loadNotes();
}

// Background timer to keep countdown running when on dashboard page
// This prevents the timer from freezing when viewing dashboard
let dashboardTimerInterval = null;

function startDashboardBackgroundTimer() {
  if (dashboardTimerInterval) {
    clearInterval(dashboardTimerInterval);
  }

  dashboardTimerInterval = setInterval(() => {
    const focus = grovitySync.getCurrentFocus();
    if (focus && focus.isRunning && focus.remainingSeconds > 0) {
      // Decrement the remaining seconds to keep timer running
      focus.remainingSeconds--;
      
      // Update localStorage with new remaining time
      grovitySync.updateCurrentFocus(focus);
      
      // Check if timer completed
      if (focus.remainingSeconds <= 0) {
        clearInterval(dashboardTimerInterval);
        dashboardTimerInterval = null;
      }
    } else if (!focus || !focus.isRunning) {
      // Timer stopped or paused - stop the interval
      clearInterval(dashboardTimerInterval);
      dashboardTimerInterval = null;
    }
  }, 1000);
}

// Start the background timer when page loads
startDashboardBackgroundTimer();

// Handle logout
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    var theme = localStorage.getItem('grovity_theme');
    var doLogout = function() {
      localStorage.clear();
      if (theme) localStorage.setItem('grovity_theme', theme);
      window.location.href = 'index.html';
    };
    if (window.__fbSignOut) {
      window.__fbSignOut().then(doLogout).catch(doLogout);
    } else {
      doLogout();
    }
  }
}
