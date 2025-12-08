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

### Architecture
- **Modular JavaScript** - Separated into logical modules:
  - `sync.js` - Global synchronization engine
  - `index.js` - Homepage and authentication
  - `workspace.js` - Task, habit, and timer management
  - `dashboard.js` - Analytics and statistics
  - `theme-system.js` - Light/dark mode handling
- **Event-driven** - Custom events for real-time updates (`grovity-focus-update`, `grovity-stats-update`)
- **LocalStorage API** - Client-side data persistence

### Data Management
- `grovity_user` - User profile data
- `grovity_plan` - Selected subscription plan
- `grovity_tasks` - Task list with metadata
- `grovity_current_focus` - Active timer session data
- `grovity_stats` - User statistics and progress
- `grovity_session_history` - Completed session records
- `grovity_daily_summary` - Daily task summaries
- `grovity_notes` - Dashboard notes
- `grovity_theme` - Theme preference (light/dark)

## File Structure

```
Grovity/
├── index.html              # Landing page & authentication
├── login.html              # Login page
├── signup.html             # Registration page
├── workspace.html          # Main workspace (tasks, habits, timer)
├── dashboard.html          # Analytics & statistics
├── theme-system.css        # Theme variables and styling
├── theme-system.js         # Theme toggle functionality
├── package.json            # Project metadata
├── src/
│   ├── js/
│   │   ├── sync.js         # Synchronization engine
│   │   ├── index.js        # Homepage logic
│   │   ├── workspace.js    # Workspace functionality
│   │   └── dashboard.js    # Dashboard logic
│   └── input.css           # Tailwind CSS input file
└── dist/
    └── output.css          # Compiled Tailwind CSS (generated)
```

## Installation & Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Quick Start

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd Grovity
   ```

2. **Open in browser**
   - Simply open `index.html` in your browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server
     
     # Using VS Code Live Server extension
     Right-click index.html > Open with Live Server
     ```

3. **Access the application**
   - Navigate to `http://localhost:8000` (or appropriate port)
   - Create an account or login
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
1. **Sign Up** - Create an account with name, email, and password
2. **Select Plan** - Choose between Starter, Pro, or Enterprise
3. **Access Workspace** - Start adding tasks and building habits
4. **Start Timer** - Focus on tasks with the built-in timer
5. **Track Progress** - View analytics on the dashboard

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
- All data stored in browser localStorage
- Automatic save on every change
- No server dependency
- Privacy-focused (data never leaves the browser)

## Limitations

- **Local Storage Only** - Data is browser-specific (not synced across devices)
- **Single User** - No multi-user support or cloud backup
- **Browser Dependent** - Clearing browser data will erase all progress
- **No Backend** - All processing happens client-side

## Future Enhancements (Potential)

- Cloud synchronization across devices
- Data export/import functionality
- Advanced analytics and insights
- Team collaboration features
- Mobile app versions
- Integration with calendar apps
- Pomodoro technique variations

## License

This project is proprietary. All rights reserved.

## Credits

**Developer:** LegendarySumit 
**Last Updated:** December 2025

---

Built with ❤️ for productivity enthusiasts
