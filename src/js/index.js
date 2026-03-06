// Check if user is logged in - ONLY check for user data, NOT plan
function isUserLoggedIn() {
  const user = JSON.parse(localStorage.getItem('grovity_user') || '{}');
  // User is logged in ONLY if they have email/name
  return user.email && user.email.length > 0;
}

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

// Update navigation buttons based on login status
function updateNavButtons() {
  const isLoggedIn = isUserLoggedIn();
  
  // Desktop navigation
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navSignupBtn = document.getElementById('navSignupBtn');
  const navWorkspaceBtn = document.getElementById('navWorkspaceBtn');
  const navLogoutBtn = document.getElementById('navLogoutBtn');
  
  // Sidebar navigation
  const sidebarLoginBtn = document.getElementById('sidebarLoginBtn');
  const sidebarSignupBtn = document.getElementById('sidebarSignupBtn');
  const sidebarWorkspaceBtn = document.getElementById('sidebarWorkspaceBtn');
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
  
  if (isLoggedIn) {
    // Hide login/signup, show workspace/logout
    if (navLoginBtn) navLoginBtn.style.display = 'none';
    if (navSignupBtn) navSignupBtn.style.display = 'none';
    if (navWorkspaceBtn) navWorkspaceBtn.style.display = 'inline-block';
    if (navLogoutBtn) navLogoutBtn.style.display = 'inline-block';
    
    if (sidebarLoginBtn) sidebarLoginBtn.style.display = 'none';
    if (sidebarSignupBtn) sidebarSignupBtn.style.display = 'none';
    if (sidebarWorkspaceBtn) sidebarWorkspaceBtn.style.display = 'block';
    if (sidebarLogoutBtn) sidebarLogoutBtn.style.display = 'block';
  } else {
    // Show login/signup, hide workspace/logout
    if (navLoginBtn) navLoginBtn.style.display = 'inline-block';
    if (navSignupBtn) navSignupBtn.style.display = 'inline-block';
    if (navWorkspaceBtn) navWorkspaceBtn.style.display = 'none';
    if (navLogoutBtn) navLogoutBtn.style.display = 'none';
    
    if (sidebarLoginBtn) sidebarLoginBtn.style.display = 'block';
    if (sidebarSignupBtn) sidebarSignupBtn.style.display = 'block';
    if (sidebarWorkspaceBtn) sidebarWorkspaceBtn.style.display = 'none';
    if (sidebarLogoutBtn) sidebarLogoutBtn.style.display = 'none';
  }
}

// Require login before accessing any feature
function requireLogin(destination) {
  if (!isUserLoggedIn()) {
    // Not logged in - redirect to login page
    localStorage.setItem('grovity_redirect_after_login', destination);
    window.location.href = 'login.html';
    return false;
  }
  
  // User is logged in
  if (destination.startsWith('#')) {
    // It's a section on the same page - scroll to it
    const section = document.querySelector(destination);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else {
    // It's a different page - navigate to it
    window.location.href = destination;
  }
  return false;
}

// Redirect to workspace with login check
function redirectToWorkspace() {
  if (!isUserLoggedIn()) {
    // Not logged in - redirect to login
    localStorage.setItem('grovity_redirect_after_login', 'workspace.html');
    window.location.href = 'login.html';
  } else {
    // Logged in - go to workspace
    window.location.href = 'workspace.html';
  }
}

// Scroll to testimonials/reviews section
function scrollToReviews() {
  const reviewSection = document.getElementById('testimonials');
  if (reviewSection) {
    reviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

const btn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

function openMenu() {
  sidebar.classList.remove('hidden');
  overlay.classList.remove('hidden');
  sidebar.classList.remove('translate-x-full');
}

function closeMenu() {
  sidebar.classList.add('translate-x-full');
  setTimeout(() => sidebar.classList.add('hidden'), 300);
  overlay.classList.add('hidden');
}

btn.addEventListener('click', openMenu);
closeBtn.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);

// REAL-TIME SYNC - Update homepage from workspace data
const timerMins = document.getElementById('timerMins');
const timerSecs = document.getElementById('timerSecs');
const progressBarHome = document.getElementById('progressBarHome');
const currentFocusTask = document.getElementById('currentFocusTask');
const focusStatus = document.getElementById('focusStatus');
const sessionsToday = document.getElementById('sessionsToday');
const tasksToday = document.getElementById('tasksToday');
const streakCount = document.getElementById('streakCount');
const nextTaskPreview = document.getElementById('nextTaskPreview');

let homeTimerInterval = null;
let lastKnownRemainingSeconds = 0;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return {
    mins: mins.toString().padStart(2, '0'),
    secs: secs.toString().padStart(2, '0')
  };
}

// Run the timer countdown on homepage
function startHomeTimer() {
  if (homeTimerInterval) {
    clearInterval(homeTimerInterval);
  }

  homeTimerInterval = setInterval(() => {
    const focus = grovitySync.getCurrentFocus();
    if (focus && focus.isRunning && focus.remainingSeconds > 0) {
      // Decrement the remaining seconds
      focus.remainingSeconds--;
      lastKnownRemainingSeconds = focus.remainingSeconds;
      
      // Update localStorage with new remaining time
      grovitySync.updateCurrentFocus(focus);
      
      // Update display
      updateHomepageUI();
      
      // Check if timer completed
      if (focus.remainingSeconds <= 0) {
        stopHomeTimer();
      }
    } else if (!focus || !focus.isRunning) {
      // Timer stopped or paused
      stopHomeTimer();
    }
  }, 1000);
}

function stopHomeTimer() {
  if (homeTimerInterval) {
    clearInterval(homeTimerInterval);
    homeTimerInterval = null;
  }
}

function updateHomepageUI() {
  // Get current focus data
  const focus = grovitySync.getCurrentFocus();
  const stats = grovitySync.getStats();
  const allTasks = JSON.parse(localStorage.getItem('grovity_tasks') || '[]');
  const currentTask = allTasks.find(t => t.isCurrentFocus);
  const nextTask = allTasks.find(t => !t.isCurrentFocus);

  // Update timer display
  if (focus && focus.remainingSeconds !== undefined && focus.totalMinutes) {
    const time = formatTime(focus.remainingSeconds);
    timerMins.textContent = time.mins;
    timerSecs.textContent = time.secs;

    // Update task name - show current focus task or the task name from focus data
    const displayTaskName = currentTask ? currentTask.text : (focus.taskName || 'No active task');
    currentFocusTask.textContent = `${displayTaskName} – ${focus.totalMinutes} min`;

    // Update status badge and start/stop home timer
    if (focus.isRunning) {
      focusStatus.textContent = 'Deep Focus';
      focusStatus.className = 'text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40';
      
      // Start the countdown on homepage if not already running
      if (!homeTimerInterval) {
        startHomeTimer();
      }
    } else {
      focusStatus.textContent = 'Paused';
      focusStatus.className = 'text-[10px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/40';
      stopHomeTimer();
    }

    // Update progress bar
    const progress = ((focus.totalMinutes * 60 - focus.remainingSeconds) / (focus.totalMinutes * 60)) * 100;
    progressBarHome.style.width = progress + '%';
  } else {
    // No active timer
    timerMins.textContent = '00';
    timerSecs.textContent = '00';
    currentFocusTask.textContent = currentTask ? currentTask.text : 'No active session';
    focusStatus.textContent = 'Idle';
    focusStatus.className = 'text-[10px] px-2 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/40';
    progressBarHome.style.width = '0%';
    stopHomeTimer();
  }

  // Update stats
  const totalTasks = allTasks.length;
  
  sessionsToday.textContent = `${stats.focusSessionsToday} session${stats.focusSessionsToday !== 1 ? 's' : ''}`;
  tasksToday.textContent = `${totalTasks} total`;
  streakCount.textContent = `${stats.streak} day${stats.streak !== 1 ? 's' : ''}`;

  // Update next task preview
  nextTaskPreview.textContent = nextTask ? `Next: ${nextTask.text}` : 'Next: No pending tasks';
}

// Initial load
updateHomepageUI();
updateNavButtons();

// Listen for storage changes (from other tabs/windows)
window.addEventListener('storage', (e) => {
  if (e.key && e.key.startsWith('grovity_')) {
    updateHomepageUI();
    updateNavButtons();
  }
});

// Listen for same-tab updates
window.addEventListener('grovity-focus-update', updateHomepageUI);
window.addEventListener('grovity-stats-update', updateHomepageUI);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  stopHomeTimer();
});

// Plan Selection System - Requires login first
function selectPlan(planName) {
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    // Not logged in - redirect to signup/login
    localStorage.setItem('grovity_selected_plan', planName);
    localStorage.setItem('grovity_redirect_after_login', 'workspace.html');
    window.location.href = 'signup.html';
    return;
  }
  
  // User is logged in - proceed with plan selection
  localStorage.setItem('grovity_plan', planName);
  
  // Show confirmation popup
  const popup = document.getElementById('planSelectedPopup');
  document.getElementById('selectedPlanName').textContent = planName;
  popup.classList.remove('hidden');
  
  // Auto-close after 2 seconds and redirect to workspace
  setTimeout(() => {
    popup.classList.add('hidden');
    window.location.href = 'workspace.html';
  }, 2000);
}

function checkPlanAccess(destination) {
  // First check if user is logged in
  if (!isUserLoggedIn()) {
    localStorage.setItem('grovity_redirect_after_login', destination);
    window.location.href = 'login.html';
    return;
  }
  
  // User is logged in - check if they have a plan
  const selectedPlan = localStorage.getItem('grovity_plan');
  
  if (!selectedPlan) {
    // Show "select plan" popup
    document.getElementById('noPlanPopup').classList.remove('hidden');
  } else {
    // Allow access
    window.location.href = destination;
  }
}

function closeNoPlanPopup() {
  document.getElementById('noPlanPopup').classList.add('hidden');
  // Scroll to pricing section
  document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
}

function closePlanSelectedPopup() {
  document.getElementById('planSelectedPopup').classList.add('hidden');
}
