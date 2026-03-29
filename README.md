<div align="center">

# 🌱 Grovity

**Modern Productivity & Focus Management Platform**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)
![Firestore](https://img.shields.io/badge/Firestore-4285F4?logo=google-cloud&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

*Track tasks • Build habits • Manage time • Visualize growth*

[Features](#-features) • [Quick Start](#-quick-start) • [Firebase Setup](#-firebase-setup) • [Tech Stack](#-tech-stack)

</div>

---

## 📖 Overview

**Grovity** is a comprehensive productivity platform designed to help users **stay focused**, **track daily tasks**, **build positive habits**, and **monitor growth** through visual analytics.

Features a clean, responsive interface with **light/dark mode support**, **real-time synchronization** across all pages, and **cloud-based data persistence** powered by **Firebase Firestore**.

## ✅ Implementation Progress

### P0 (Launch Security) - Completed
- Strict Firebase security posture (deny-by-default, user-scoped docs)
- Authorized domains and API key restriction workflow
- Firebase App Check integration and enforcement readiness

### P1 (Core Reliability) - Completed
- Centralized auth guard utility (`auth-guard.js`)
- Startup health check page (`health.html` + `health.js`)
- CI baseline with HTML/JS checks and Playwright smoke tests

### P2 (Stability / Polish) - Completed
- Rate-limited Firestore write paths for sensitive mutations
- Reduced localStorage dependence for identity/session-derived UI state
- Incident logging hooks for auth/bootstrap/firestore failures with buffered fallback

---

## ✨ Features

### 🎯 Task Management
- Create, edit, and delete tasks with priority levels
- Mark tasks as current focus
- Real-time task completion tracking
- Task statistics and progress visualization
- **Cloud sync** — Access tasks from any device

### ⏱️ Focus Timer
- **Customizable Pomodoro-style timer** (5, 10, 15, 25, 50 minutes)
- Background timer synchronization across all pages
- Session tracking and completion statistics
- Visual progress indicators
- **Cross-device sync** — Continue timers on any device

### 📊 Habit Tracking
- Track good habits and habits to avoid
- Daily habit completion monitoring
- Separate lists for positive and negative habits
- Progress tracking with visual feedback
- **Cloud persistence** — Never lose your habit streaks

### 🌱 Growth Visualization
- Interactive **"Focus Garden"** with growing tree animation
- Visual representation of productivity growth
- Session-based progress stages

### 📈 Analytics Dashboard
- **Weekly task completion charts**
- **Monthly calendar view** with daily task counts
- **Achievement badges:**
  - Streak Master
  - Task Champion
  - Time Master
  - Habit Builder
  - Consistency King
- **Real-time statistics:**
  - Total tasks
  - Total sessions
  - Focus time
  - Average duration
- Personal notes section with character counter

### 🎨 User Experience
- **Light/Dark mode toggle**
- Fully responsive design (mobile, tablet, desktop)
- Real-time cross-page synchronization
- **Google OAuth authentication**
- **Cloud-based data persistence**
- Clean, modern UI with smooth transitions

---

## 🛠️ Tech Stack

### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

- **HTML5** — Semantic markup structure
- **Tailwind CSS** — Utility-first CSS framework (via CDN)
- **Vanilla JavaScript** — No framework dependencies
- **Font Awesome 6.5.0** — Icon library

### Authentication & Backend
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)
![Firestore](https://img.shields.io/badge/Firestore-4285F4?logo=google-cloud&logoColor=white)

- **Firebase Authentication** — Google OAuth sign-in
- **Firebase Firestore** — Cloud-based NoSQL database
- **Firebase Compat SDK v11.0.0** — Client-side integration

### Architecture
- **Modular JavaScript** — Separated into logical modules:
  - `config-loader.js` — Firebase configuration management
  - `firebase-init-secure.js` — Firebase initialization
  - `firestore-db.js` — Firestore API wrapper
  - `sync.js` — Global synchronization engine
  - `index.js` — Homepage and authentication
  - `workspace.js` — Task, habit, and timer management
  - `dashboard.js` — Analytics and statistics
  - `theme-system.js` — Light/dark mode handling
- **Event-driven** — Custom events for real-time updates
- **Cloud-based** — All data persists in Firestore, synced across devices

### Data Management

**Firestore Collections:**
```
users/{userId}/
├── tasks/all-tasks              # Task list with metadata
├── habits/all-habits            # Good habits and habits to avoid
├── habit-progress/{date}        # Daily habit completion tracking
└── notes/user-notes             # Dashboard notes
```

**LocalStorage (Fallback):**
- `grovity_theme` — Theme preference (light/dark)
- Local backup of tasks and notes for offline access

---

## 📁 File Structure
```
Grovity/
├── index.html                 # Landing page & authentication
├── login.html                 # Login page
├── signup.html                # Registration page
├── workspace.html             # Main workspace (tasks, habits, timer)
├── dashboard.html             # Analytics & statistics
├── theme-system.css           # Theme variables and styling
├── theme-system.js            # Theme toggle functionality
├── .env.local                 # Firebase credentials (local dev)
├── .env.local.example         # Example environment variables
├── package.json               # Project metadata
├── src/
│   ├── js/
│   │   ├── config-loader.js   # Firebase configuration
│   │   ├── firebase-init-secure.js # Firebase initialization
│   │   ├── firestore-db.js    # Firestore database service
│   │   ├── sync.js            # Synchronization engine
│   │   ├── index.js           # Homepage logic
│   │   ├── workspace.js       # Workspace functionality
│   │   └── dashboard.js       # Dashboard logic
│   └── input.css              # Tailwind CSS input file
└── dist/
    └── output.css             # Compiled Tailwind CSS (generated)
```

---

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Local web server (for development)
- Firebase project (for authentication and database)

### Installation

**1. Clone or download the project**
```bash
git clone https://github.com/LegendarySumit/grovity.git
cd Grovity
```

**2. Configure Firebase** (see [Firebase Setup](#-firebase-setup) below)

**3. Open in browser**

**Option A: Direct open**
- Simply open `index.html` in your browser

**Option B: Local server (recommended)**
```bash
# Using Python
python -m http.server 5000

# Using Node.js (http-server)
npx http-server

# Using VS Code Live Server
Right-click index.html > Open with Live Server
```

**4. Access the application**
```
http://localhost:5000
```

**5. Get started**
- Click "Sign up with Google"
- Grant permissions
- Start tracking your productivity!

---

## 🩺 Startup Health Check

Use the startup health page to verify Firebase runtime readiness before public releases:

- Open `health.html`
- Validate config presence, Firebase bootstrap, auth readiness, and Firestore reachability
- Re-run checks after changing env/config or App Check settings

---

## ✅ CI Checks

Minimal CI checks now cover HTML, JavaScript syntax, and top-level navigation smoke tests.

```bash
npm run check:html
npm run check:js
npm run test:smoke
```

Run all checks locally:

```bash
npm run ci
```

---

## 🛡️ P2 Stability Upgrades

Recent P2 hardening includes:

- Write-rate limits in `firestore-db.js` for task, habit, progress, and notes mutation paths
- Reduced identity/session reliance on localStorage by moving auth redirect and user cache flows into session-oriented guard logic
- Incident logging hooks for auth/bootstrap/firestore failures with buffered fallback and optional remote flush when auth + Firestore are available

---

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name (e.g., "Grovity")
4. Follow the setup wizard

### 2. Enable Google OAuth

1. In Firebase Console → **Authentication**
2. Click **"Get Started"**
3. Go to **"Sign-in method"** tab
4. Enable **Google** provider
5. Add your authorized domains

### 3. Enable Firestore Database

1. In Firebase Console → **Build** → **Firestore Database**
2. Click **"Create Database"**
3. Start in **Test mode** (update rules for production later)
4. Choose Firestore location

### 4. Set Firestore Security Rules
Use the production rules file in this repo:

- `firebase/firestore.rules`

Deploy with Firebase CLI:

```bash
firebase deploy --only firestore:rules,storage:rules
```

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 5. Get Firebase Credentials

1. Firebase Console → **Project Settings** (⚙️ icon)
2. Scroll to **"Your apps"** section
3. Click **"</> Web"** to add a web app
4. Copy the Firebase config object
5. Update `src/js/config-loader.js`:
```javascript
const firebaseConfig = {
  'fb_api_key': 'YOUR_API_KEY',
  'fb_auth_domain': 'YOUR_AUTH_DOMAIN',
  'fb_project_id': 'YOUR_PROJECT_ID',
  'fb_storage_bucket': 'YOUR_STORAGE_BUCKET',
  'fb_messaging_sender_id': 'YOUR_MESSAGING_SENDER_ID',
  'fb_app_id': 'YOUR_APP_ID'
};
```

### 6. Configure Firebase App Check (required before public launch)

1. Firebase Console → **Build** → **App Check**
2. Register your web app with **reCAPTCHA v3**
3. Copy the site key
4. Set it in runtime config as `fb_appcheck_site_key`

For full P0 launch hardening steps (domains, API restrictions, App Check enforcement), see:

- `docs/security/firebase-p0-launch-checklist.md`

---

## 📚 Usage

### Getting Started

1. **Sign Up** — Create account using Google OAuth
2. **Grant Permissions** — Allow Grovity to access your Google account
3. **Access Workspace** — Start adding tasks and habits
4. **Start Timer** — Focus on tasks with built-in timer
5. **Track Progress** — View analytics on dashboard

### Authentication
- **Google OAuth** — Secure login with Google account
- **Session Persistence** — Automatically login on return visits
- **Automatic Sign-Out** — Logout clears session data safely
- **Cross-Device Sync** — Same profile across all devices

### Key Workflows

#### 🎯 Task Management

1. Navigate to **Workspace**
2. Enter task name in input field
3. Click **"Add Task"** or press Enter
4. Mark complete by checking checkbox
5. Click star icon to set as **current focus**
6. Delete tasks using trash icon
7. **Cloud sync** — Changes save automatically

#### ⏱️ Focus Sessions

1. Set a task as **current focus**
2. Select time duration (5, 10, 15, 25, or 50 minutes)
3. Click **"Start Timer"**
4. Timer syncs across all pages and devices
5. Receive notification when time is up

#### 📊 Habit Tracking

1. Add **good habits** (e.g., "Drink 8 glasses of water")
2. Add **habits to avoid** (e.g., "Checking social media")
3. Check habits as completed throughout the day
4. Track progress daily across all devices

#### 📈 Analytics Review

1. Navigate to **Dashboard**
2. View weekly task completion chart
3. Check monthly calendar for daily summaries
4. Monitor achievements and streaks
5. Review total statistics

---

## ⚙️ Building Tailwind CSS (Optional)

If you need to modify styles:
```bash
# Install dependencies
npm install

# Build CSS
npm run build:css
```

---

## 🎨 Key Features Implementation

### Real-time Synchronization
- Custom event system (`grovity-focus-update`, `grovity-stats-update`)
- Firestore real-time listeners for instant updates
- Background timer intervals on all pages
- Prevents timer freezing when switching pages or devices

### Theme System
- CSS custom properties for dynamic theming
- Persistent theme preference in localStorage
- Smooth transitions between light/dark modes
- Comprehensive color palette for both themes

### Data Persistence
- **Cloud Storage** — Primary data stored in Firebase Firestore
- **Real-time Sync** — Changes sync across all devices automatically
- **Automatic Save** — Data saved instantly when created or modified
- **Secure** — Google OAuth authentication, Firestore security rules
- **Privacy** — Cloud-encrypted with user-specific data isolation
- **Offline Support** — Local cache fallback to localStorage

---

## 📊 Performance

✅ **Lightweight** — No heavy frameworks, minimal dependencies  
✅ **Fast Loading** — Optimized assets and code splitting  
✅ **Cloud Sync** — Real-time updates across all devices  
✅ **Offline Capable** — Local cache for offline access  
✅ **Sub-second Updates** — Firestore real-time listeners

---

## 🌐 Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## 🚨 Limitations

⚠️ **Single User** — Currently designed for individual productivity tracking  
⚠️ **Google Cloud** — Requires Firebase project and internet connection for sync  
⚠️ **Free Tier Limits** — Firebase free tier has daily read/write limits  
⚠️ **No Team Features** — Collaboration and multi-user support not yet implemented

---

## 🔮 Future Enhancements

- ✅ ~~Cloud synchronization across devices~~ (Implemented)
- ✅ ~~Google OAuth authentication~~ (Implemented)
- [ ] Data export/import functionality
- [ ] Advanced analytics and insights
- [ ] Team collaboration features
- [ ] Mobile app versions (iOS/Android)
- [ ] Integration with calendar apps
- [ ] Pomodoro technique variations
- [ ] Offline-first PWA support
- [ ] Custom theme colors

---

## 📄 License

This project is proprietary. All rights reserved.

---

## 👨‍💻 Author

**LegendarySumit**

- GitHub: [@LegendarySumit](https://github.com/LegendarySumit)
- Project: [Grovity](https://github.com/LegendarySumit/grovity)

---

## 🙏 Credits

**Developer:** LegendarySumit  
**Last Updated:** March 2026  
**Powered by:** Firebase & Firestore

---

<div align="center">

**🌱 Built with ❤️ for productivity enthusiasts**

*Stay focused • Build habits • Track growth • Sync across devices*

---

**⭐ Star this repo if you find it helpful!**

**☁️ Now with Firebase Cloud Sync & Google OAuth**

</div>
