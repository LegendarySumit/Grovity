const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const TASKS_KEY = "grovity_tasks";
let tasks = [];

// HABIT TRACKER
const HABITS_KEY = "grovity_habits";
const HABIT_PROGRESS_KEY = "grovity_habit_progress";
let habits = { good: [], bad: [] };

const goodHabitInput = document.getElementById('goodHabitInput');
const badHabitInput = document.getElementById('badHabitInput');
const addGoodHabitBtn = document.getElementById('addGoodHabitBtn');
const addBadHabitBtn = document.getElementById('addBadHabitBtn');
const goodHabitsList = document.getElementById('goodHabitsList');
const badHabitsList = document.getElementById('badHabitsList');

function loadHabits() {
  habits = JSON.parse(localStorage.getItem(HABITS_KEY) || '{"good":[],"bad":[]}');
  renderHabits();
}

function saveHabits() {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

function getTodayProgress() {
  const today = new Date().toDateString();
  const allProgress = JSON.parse(localStorage.getItem(HABIT_PROGRESS_KEY) || '{}');
  return allProgress[today] || {};
}

function saveTodayProgress(progress) {
  const today = new Date().toDateString();
  const allProgress = JSON.parse(localStorage.getItem(HABIT_PROGRESS_KEY) || '{}');
  allProgress[today] = progress;
  localStorage.setItem(HABIT_PROGRESS_KEY, JSON.stringify(allProgress));
}

function renderHabits() {
  const todayProgress = getTodayProgress();
  
  // Render Good Habits
  goodHabitsList.innerHTML = habits.good.length === 0 
    ? '<p class="text-xs text-slate-500">No good habits added yet</p>'
    : habits.good.map(habit => `
      <label class="flex items-center gap-3 p-2 rounded-lg border border-slate-800 bg-slate-950 hover:border-emerald-500/30 cursor-pointer transition">
        <input type="checkbox" 
          data-habit-type="good" 
          data-habit-id="${habit.id}" 
          ${todayProgress[habit.id] ? 'checked' : ''}
          class="w-4 h-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950" />
        <span class="text-sm text-slate-200 flex-1">${habit.name}</span>
        <button class="text-slate-500 hover:text-red-400 text-xs" data-delete-good="${habit.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </label>
    `).join('');
  
  // Render Bad Habits
  badHabitsList.innerHTML = habits.bad.length === 0
    ? '<p class="text-xs text-slate-500">No habits to avoid added yet</p>'
    : habits.bad.map(habit => `
      <label class="flex items-center gap-3 p-2 rounded-lg border border-slate-800 bg-slate-950 hover:border-red-500/30 cursor-pointer transition">
        <input type="checkbox" 
          data-habit-type="bad" 
          data-habit-id="${habit.id}" 
          ${todayProgress[habit.id] ? 'checked' : ''}
          class="w-4 h-4 rounded border-slate-600 bg-slate-900 text-red-500 focus:ring-red-500 focus:ring-offset-slate-950" />
        <span class="text-sm text-slate-200 flex-1">${habit.name}</span>
        <button class="text-slate-500 hover:text-red-400 text-xs" data-delete-bad="${habit.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </label>
    `).join('');
}

function addHabit(type) {
  const input = type === 'good' ? goodHabitInput : badHabitInput;
  const name = input.value.trim();
  if (!name) return;
  
  const habit = {
    id: Date.now(),
    name: name
  };
  
  habits[type].push(habit);
  saveHabits();
  renderHabits();
  input.value = '';
}

addGoodHabitBtn.addEventListener('click', () => addHabit('good'));
addBadHabitBtn.addEventListener('click', () => addHabit('bad'));

goodHabitInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addHabit('good');
});

badHabitInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addHabit('bad');
});

// Handle checkbox changes and deletions
document.addEventListener('click', (e) => {
  // Handle habit checkbox
  if (e.target.dataset.habitId) {
    const habitId = e.target.dataset.habitId;
    const todayProgress = getTodayProgress();
    todayProgress[habitId] = e.target.checked;
    saveTodayProgress(todayProgress);
  }
  
  // Handle delete good habit
  if (e.target.closest('[data-delete-good]')) {
    const id = e.target.closest('[data-delete-good]').dataset.deleteGood;
    habits.good = habits.good.filter(h => h.id != id);
    saveHabits();
    renderHabits();
  }
  
  // Handle delete bad habit
  if (e.target.closest('[data-delete-bad]')) {
    const id = e.target.closest('[data-delete-bad]').dataset.deleteBad;
    habits.bad = habits.bad.filter(h => h.id != id);
    saveHabits();
    renderHabits();
  }
});

loadHabits();

// VISUAL GROWTH SYSTEM (Emoji-based)
const treeGrowth = document.getElementById('treeGrowth');
const growthStageText = document.getElementById('growthStageText');

const growthStages = [
  { progress: 0, emoji: '🌰', text: 'Seed planted', size: 'text-3xl', opacity: 'opacity-70' },
  { progress: 10, emoji: '🌱', text: 'Sprouting', size: 'text-4xl', opacity: 'opacity-80' },
  { progress: 25, emoji: '🌿', text: 'Growing', size: 'text-5xl', opacity: 'opacity-85' },
  { progress: 40, emoji: '🪴', text: 'Young plant', size: 'text-6xl', opacity: 'opacity-90' },
  { progress: 60, emoji: '🌳', text: 'Strong tree', size: 'text-7xl', opacity: 'opacity-95' },
  { progress: 80, emoji: '🌲', text: 'Mighty tree', size: 'text-8xl', opacity: 'opacity-100' },
  { progress: 95, emoji: '🎄', text: 'Perfect!', size: 'text-9xl', opacity: 'opacity-100' }
];

let lastStageIndex = -1;

function updateGrowth() {
  if (!isRunning || totalSeconds === 0) {
    // Show seed when not running
    treeGrowth.innerHTML = '<span class="text-3xl opacity-50">🌰</span>';
    growthStageText.textContent = 'Ready to plant';
    lastStageIndex = -1;
    return;
  }

  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  
  // Find appropriate stage
  let currentStageIndex = 0;
  for (let i = 0; i < growthStages.length; i++) {
    if (progress >= growthStages[i].progress) {
      currentStageIndex = i;
    }
  }
  
  // Only update if stage changed (prevents flickering)
  if (currentStageIndex !== lastStageIndex) {
    const currentStage = growthStages[currentStageIndex];
    
    treeGrowth.innerHTML = `
      <div class="${currentStage.size} ${currentStage.opacity} transition-all duration-1000 ease-out">
        ${currentStage.emoji}
      </div>
    `;
    
    growthStageText.textContent = currentStage.text;
    lastStageIndex = currentStageIndex;
  }
}

function loadTasks() {
  tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
  renderTasks();
}

function saveTasks() { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }

function renderTasks() {
  taskList.innerHTML = "";
  if (!tasks.length) {
    const li = document.createElement("li");
    li.className = "text-slate-500 text-xs";
    li.textContent = "No tasks added yet";
    taskList.appendChild(li);
    return;
  }

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    const isCurrentFocus = task.isCurrentFocus === true;
    li.className = `flex items-center justify-between gap-2 rounded-lg border ${isCurrentFocus ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/80'} px-3 py-2`;
    li.innerHTML = `
      <label class="flex items-center gap-2 flex-1 cursor-pointer" title="Set as current focus task">
        <input type="checkbox" data-id="${task.id}" class="h-4 w-4 rounded border-slate-600 bg-slate-950 text-blue-500 focus:ring-blue-500" ${isCurrentFocus ? "checked" : ""}/>
        <span class="text-xs md:text-sm text-slate-200 ${isCurrentFocus ? 'font-semibold' : ''}">${task.text}${isCurrentFocus ? ' 🎯' : ''}</span>
      </label>
      <button class="text-[11px] text-slate-500 hover:text-red-400" data-del="${task.id}">Delete</button>`;
    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;
  
  // If this is the first task, make it the current focus automatically
  const isFirstTask = tasks.length === 0;
  tasks.unshift({ 
    id: Date.now(), 
    text, 
    isCurrentFocus: isFirstTask 
  });
  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
  
  // Sync: Increment tasks created today and update current focus
  grovitySync.incrementTasksCreatedToday();
  if (isFirstTask) {
    updateCurrentFocusTask();
  }
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

taskList.addEventListener("click", (e) => {
  if (e.target.dataset.id) {
    const id = e.target.dataset.id;
    
    // Toggle current focus for this task
    tasks = tasks.map(t => ({
      ...t,
      isCurrentFocus: t.id == id ? !t.isCurrentFocus : false
    }));
    
    saveTasks();
    renderTasks();
    updateCurrentFocusTask();
  }
  if (e.target.dataset.del) {
    const id = e.target.dataset.del;
    const deletingCurrentFocus = tasks.find(t => t.id == id)?.isCurrentFocus;
    
    tasks = tasks.filter(t => t.id != id);
    
    // If we deleted the current focus task and there are remaining tasks,
    // set the first task as current focus
    if (deletingCurrentFocus && tasks.length > 0) {
      tasks[0].isCurrentFocus = true;
    }
    
    saveTasks();
    renderTasks();
    updateCurrentFocusTask();
  }
});

// Update current focus task in sync
function updateCurrentFocusTask() {
  const currentTask = tasks.find(t => t.isCurrentFocus);
  const currentFocusData = grovitySync.getCurrentFocus() || {};
  
  // Preserve timer state but update task name
  grovitySync.updateCurrentFocus({
    ...currentFocusData,
    taskName: currentTask ? currentTask.text : 'No active task',
    taskId: currentTask ? currentTask.id : null
  });
}

loadTasks();

// TIMER FUNCTIONALITY
const timerDisplay = document.getElementById('timerDisplay');
const timerProgress = document.getElementById('timerProgress');
const timerStatus = document.getElementById('timerStatus');
const startTimerBtn = document.getElementById('startTimerBtn');
const resetTimerBtn = document.getElementById('resetTimerBtn');
const customPopup = document.getElementById('customPopup');
const customInput = document.getElementById('customInput');
const customError = document.getElementById('customError');
const cancelCustom = document.getElementById('cancelCustom');
const applyCustom = document.getElementById('applyCustom');
const timeBtns = document.querySelectorAll('.time-btn');

let timerInterval = null;
let totalSeconds = 25 * 60;
let remainingSeconds = totalSeconds;
let isRunning = false;
let sessionStarted = false;

// Restore timer state from localStorage
function restoreTimerState() {
  const focusData = grovitySync.getCurrentFocus();
  if (focusData && focusData.totalMinutes) {
    totalSeconds = focusData.totalMinutes * 60;
    remainingSeconds = focusData.remainingSeconds || totalSeconds;
    isRunning = focusData.isRunning || false;
    sessionStarted = focusData.sessionStarted || false;
    
    // Update display immediately
    updateDisplay();
    
    // Resume timer if it was running
    if (isRunning && remainingSeconds > 0) {
      startTimerBtn.textContent = 'Pause';
      timerStatus.textContent = 'Timer running...';
      
      // Clear any existing interval
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      
      // Start the interval to continue countdown
      timerInterval = setInterval(() => {
        if (remainingSeconds > 0) {
          remainingSeconds--;
          updateDisplay();
          syncCurrentFocus();
        } else {
          completeSession();
          stopTimer();
          timerStatus.textContent = 'Time\'s up! 🎉';
          playNotification();
        }
      }, 1000);
    }
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(remainingSeconds);
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  timerProgress.style.width = progress + '%';
  
  // Update growth visualization
  updateGrowth();
}

function startTimer() {
  if (isRunning) return;
  
  // If no task is marked as current focus, set the first task
  if (!tasks.find(t => t.isCurrentFocus) && tasks.length > 0) {
    tasks[0].isCurrentFocus = true;
    saveTasks();
    renderTasks();
  }
  
  isRunning = true;
  startTimerBtn.textContent = 'Pause';
  timerStatus.textContent = 'Timer running...';
  
  // Sync: Update current focus and count session only on first start
  if (!sessionStarted) {
    grovitySync.incrementFocusSessionsToday();
    sessionStarted = true;
  }
  syncCurrentFocus();

  // Clear any existing interval first
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateDisplay();
      syncCurrentFocus();
    } else {
      completeSession();
      stopTimer();
      timerStatus.textContent = 'Time\'s up! 🎉';
      playNotification();
    }
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  startTimerBtn.textContent = 'Start';
  timerStatus.textContent = 'Timer paused';
  
  // Sync: Update paused state
  syncCurrentFocus();
}

function stopTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  startTimerBtn.textContent = 'Start';
}

function completeSession() {
  const completedMinutes = Math.floor((totalSeconds - remainingSeconds) / 60);
  if (completedMinutes > 0) {
    const currentTask = tasks.find(t => t.isCurrentFocus);
    const taskName = currentTask ? currentTask.text : 'Focus Session';
    grovitySync.addSessionToHistory({
      taskName: taskName,
      duration: completedMinutes
    });
  }
}

function resetTimer() {
  stopTimer();
  remainingSeconds = totalSeconds;
  updateDisplay();
  timerStatus.textContent = 'Timer not started';
  sessionStarted = false;
  
  // Reset growth to seed
  updateGrowth();
  
  // Sync: Update reset state
  syncCurrentFocus();
}

function playNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Grovity Timer', { body: 'Your focus session is complete!' });
  }
}

// Event Listeners
startTimerBtn.addEventListener('click', () => {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
});

resetTimerBtn.addEventListener('click', resetTimer);

timeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.custom) {
      customPopup.classList.remove('hidden');
      customInput.focus();
    } else {
      const minutes = parseInt(btn.dataset.time);
      totalSeconds = minutes * 60;
      sessionStarted = false;
      resetTimer();
      timeBtns.forEach(b => b.classList.remove('bg-blue-500', 'text-white'));
      btn.classList.add('bg-blue-500', 'text-white');
    }
  });
});

cancelCustom.addEventListener('click', () => {
  customPopup.classList.add('hidden');
  customInput.value = '';
  customError.classList.add('hidden');
});

applyCustom.addEventListener('click', () => {
  const minutes = parseInt(customInput.value);
  if (!minutes || minutes < 1 || minutes > 180) {
    customError.textContent = 'Please enter a value between 1 and 180';
    customError.classList.remove('hidden');
    return;
  }
  totalSeconds = minutes * 60;
  sessionStarted = false;
  resetTimer();
  customPopup.classList.add('hidden');
  customInput.value = '';
  customError.classList.add('hidden');
  timeBtns.forEach(b => b.classList.remove('bg-blue-500', 'text-white'));
});

customInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    applyCustom.click();
  }
});

// Quick time buttons in custom popup
document.querySelectorAll('.quick-time-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    customInput.value = btn.dataset.minutes;
    customError.classList.add('hidden');
  });
});

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// Sync current focus to localStorage
function syncCurrentFocus() {
  const currentTask = tasks.find(t => t.isCurrentFocus);
  grovitySync.updateCurrentFocus({
    taskName: currentTask ? currentTask.text : 'No active task',
    taskId: currentTask ? currentTask.id : null,
    totalMinutes: Math.floor(totalSeconds / 60),
    remainingSeconds: remainingSeconds,
    isRunning: isRunning,
    sessionStarted: sessionStarted,
    timestamp: Date.now()
  });
}

// Initialize - restore state and update display
restoreTimerState();
updateDisplay();
syncCurrentFocus();

// Listen for storage changes from other tabs (e.g., homepage updating timer)
window.addEventListener('storage', (e) => {
  if (e.key === 'grovity_current_focus') {
    const focusData = grovitySync.getCurrentFocus();
    if (focusData && focusData.totalMinutes) {
      // Stop current interval to avoid conflicts
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      
      // Update local timer state from localStorage
      remainingSeconds = focusData.remainingSeconds || remainingSeconds;
      totalSeconds = focusData.totalMinutes * 60;
      isRunning = focusData.isRunning || false;
      sessionStarted = focusData.sessionStarted || false;
      
      // Update UI
      updateDisplay();
      
      // Update button state
      if (isRunning) {
        startTimerBtn.textContent = 'Pause';
        timerStatus.textContent = 'Timer running...';
        // Restart interval to continue countdown
        startTimer();
      } else {
        startTimerBtn.textContent = 'Start';
        timerStatus.textContent = isRunning === false && remainingSeconds < totalSeconds ? 'Timer paused' : 'Timer not started';
      }
    }
  }
});

// Also listen for same-page custom events
window.addEventListener('grovity-focus-update', () => {
  const focusData = grovitySync.getCurrentFocus();
  if (focusData) {
    remainingSeconds = focusData.remainingSeconds || remainingSeconds;
    updateDisplay();
  }
});

// Periodically check and sync with localStorage (every 2 seconds)
setInterval(() => {
  const focusData = grovitySync.getCurrentFocus();
  if (focusData && focusData.remainingSeconds !== undefined) {
    // Only update if there's a significant difference (more than 2 seconds)
    const diff = Math.abs(remainingSeconds - focusData.remainingSeconds);
    if (diff > 2) {
      remainingSeconds = focusData.remainingSeconds;
      updateDisplay();
    }
  }
}, 2000);

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
