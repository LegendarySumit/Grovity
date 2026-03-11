# Grovity

A modern productivity and focus management web application that helps users track tasks, build habits, manage time, and visualize progress.

## Overview

Grovity is a comprehensive productivity platform designed to help users stay focused, track their daily tasks, build positive habits, and monitor their growth through visual analytics. The application features a clean, responsive interface with light/dark mode support and real-time synchronization across all pages.

## Features

### 🎯 Task Management
- Create, edit, and delete tasks with priority levels
- Mark tasks as current focus
- Real-time task completion tracking
- Task statistics and progress visualization

### ⏱️ Focus Timer
- Customizable Pomodoro-style timer (5, 10, 15, 25, 50 minutes)
- Background timer synchronization across all pages
- Session tracking and completion statistics
- Visual progress indicators

### 📊 Habit Tracking
- Track good habits and habits to avoid
- Daily habit completion monitoring
- Separate lists for positive and negative habits
- Progress tracking with visual feedback

### 🌱 Growth Visualization
- Interactive "Focus Garden" with growing tree animation
- Visual representation of productivity growth
- Session-based progress stages

### 📈 Analytics Dashboard
- Weekly task completion charts
- Monthly calendar view with daily task counts
- Achievement badges (Streak Master, Task Champion, Time Master, Habit Builder, Consistency King)
- Real-time statistics (total tasks, sessions, focus time, average duration)
- Personal notes section with character counter

### 🎨 User Experience
- Light/Dark mode toggle
- Fully responsive design (mobile, tablet, desktop)
- Real-time cross-page synchronization
- Persistent data storage using localStorage
- Clean, modern UI with smooth transitions

## Tech Stack

### Frontend
- **HTML5** - Semantic markup structure
- **Tailwind CSS** - Utility-first CSS framework (via CDN)
- **Vanilla JavaScript** - No framework dependencies
- **Font Awesome 6.5.0** - Icon library

### Authentication & Backend
- **Firebase Authentication** - Google OAuth sign-in
- **Firebase Firestore** - Cloud-based NoSQL database
- **Firebase Compat SDK v11.0.0** - Client-side Firebase integration

### Architecture
- **Modular JavaScript** - Separated into logical modules:
  - `config-loader.js` - Firebase configuration management
  - `firebase-init-secure.js` - Firebase initialization
  - `firestore-db.js` - Firestore API wrapper
  - `sync.js` - Global synchronization engine
  - `index.js` - Homepage and authentication
  - `workspace.js` - Task, habit, and timer management
  - `dashboard.js` - Analytics and statistics
  - `theme-system.js` - Light/dark mode handling
- **Event-driven** - Custom events for real-time updates
- **Cloud-based** - All data persists in Firestore, synced across devices

### Data Management
- **Firestore Collections:**
  - `users/{userId}/tasks/all-tasks` - Task list with metadata
  - `users/{userId}/habits/all-habits` - Good habits and habits to avoid
  - `users/{userId}/habit-progress/{date}` - Daily habit completion tracking
  - `users/{userId}/notes/user-notes` - Dashboard notes
- **LocalStorage (Fallback):**
  - `grovity_theme` - Theme preference (light/dark)
  - Local backup of tasks and notes for offline access

## File Structure

```
Grovity/
├── index.html                 # Landing page & authentication
├── login.html                 # Login page
├── signup.html                # Registration page
├── workspace.html             # Main workspace (tasks, habits, timer)
├── dashboard.html             # Analytics & statistics
├── theme-system.css           # Theme variables and styling
├── theme-system.js            # Theme toggle functionality
├── .env.local                 # Firebase credentials (local development)
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

## Installation & Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for development)
- Firebase project (for authentication and database)

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing project
   - Enable Google OAuth in Authentication section

2. **Enable Firestore Database**
   - In Firebase Console → Build → Firestore Database
   - Click "Create Database"
   - Start in Test mode (temporary, update rules for production)

3. **Set Firestore Security Rules**
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

4. **Get Firebase Credentials**
   - Firebase Console → Project Settings
   - Copy API Key, Auth Domain, Project ID, etc.
   - Add to `src/js/config-loader.js`:
   ```javascript
   const firebaseConfig = {
     'fb_api_key': 'YOUR_API_KEY',
     'fb_auth_domain': 'YOUR_AUTH_DOMAIN',
     'fb_project_id': 'YOUR_PROJECT_ID',
     // ... other credentials
   };
   ```

### Quick Start

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd Grovity
   ```

2. **Configure Firebase**
   - Copy `.env.local.example` to `.env.local`
   - Update `src/js/config-loader.js` with your Firebase credentials

3. **Open in browser**
   - Simply open `index.html` in your browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 5000
     
     # Using Node.js (http-server)
     npx http-server
     
     # Using VS Code Live Server extension
     Right-click index.html > Open with Live Server
     ```

4. **Access the application**
   - Navigate to `http://localhost:5000` (or appropriate port)
   - Click "Sign up with Google"
   - Start tracking your productivity!

### Building Tailwind CSS (Optional)

If you need to modify styles:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build CSS**
   ```bash
   npm run build:css
   ```

## Usage

### Getting Started
1. **Sign Up** - Create an account using Google OAuth
2. **Grant Permissions** - Allow Grovity to access your Google account
3. **Access Workspace** - Start adding tasks and building habits
4. **Start Timer** - Focus on tasks with the built-in timer
5. **Track Progress** - View analytics on the dashboard

### Authentication
- **Google OAuth** - Secure login with Google account
- **Session Persistence** - Automatically login on return visits
- **Automatic Sign-Out** - Logout clears session data safely
- **Cross-Device Sync** - Same profile across all devices

### Key Workflows

#### Task Management
1. Navigate to Workspace
2. Enter task name in the input field
3. Click "Add Task" or press Enter
4. Mark tasks as complete by checking the checkbox
5. Click the star icon to set as current focus
6. Delete tasks using the trash icon

#### Focus Sessions
1. Set a task as current focus
2. Select time duration (5, 10, 15, 25, or 50 minutes)
3. Click "Start Timer"
4. Timer syncs across all pages in real-time
5. Receive notification when time is up

#### Habit Tracking
1. Add good habits (e.g., "Drink 8 glasses of water")
2. Add habits to avoid (e.g., "Checking social media")
3. Check habits as completed throughout the day
4. Track progress daily

#### Analytics Review
1. Navigate to Dashboard
2. View weekly task completion chart
3. Check monthly calendar for daily summaries
4. Monitor achievements and streaks
5. Review total statistics

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Lightweight** - No heavy frameworks, minimal dependencies
- **Fast Loading** - Optimized assets and code splitting
- **Offline Capable** - All data stored locally
- **Real-time Updates** - Sub-second synchronization between pages

## Key Features Implementation

### Real-time Synchronization
- Custom event system (`grovity-focus-update`, `grovity-stats-update`)
- Storage event listeners for cross-tab sync
- Background timer intervals on all pages
- Prevents timer freezing when switching pages

### Theme System
- CSS custom properties for dynamic theming
- Persistent theme preference in localStorage
- Smooth transitions between light/dark modes
- Comprehensive color palette for both themes

### Data Persistence
- **Cloud Storage:** Primary data stored in Firebase Firestore (tasks, habits, notes)
- **Real-time Sync:** Changes sync across all devices automatically
- **Automatic Save:** Data saved instantly when created or modified
- **Secure:** Google OAuth authentication, Firestore security rules
- **Privacy:** Cloud-encrypted with user-specific data isolation
- **Offline Support:** Local cache fallback to localStorage

## Limitations

- **Single User** - Currently designed for individual productivity tracking
- **Google Cloud** - Requires Firebase project and internet connection for sync
- **Free Tier Limits** - Firebase free tier has daily read/write limits
- **No Team Features** - Collaboration and multi-user support not yet implemented

## Future Enhancements (Potential)

- ✅ ~~Cloud synchronization across devices~~ (Implemented with Firestore)
- ✅ ~~Google OAuth authentication~~ (Implemented)
- Data export/import functionality
- Advanced analytics and insights
- Team collaboration features
- Mobile app versions
- Integration with calendar apps
- Pomodoro technique variations
- Offline-first PWA support

## License

This project is proprietary. All rights reserved.

## Credits

**Developer:** LegendarySumit 
**Last Updated:** March 2026

---

Built with ❤️ for productivity enthusiasts
Powered by Firebase & Firestore
