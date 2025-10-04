# 🌌 Aurorae Haven

> **A calm, astro-themed productivity app designed for neurodivergent users.**  
> Manage routines, tasks, habits, notes, and stats with Markdown import/export, reminders, gamification, and secure local/mobile use.

---

## ✨ Features

- **Progressive Web App (PWA)**: Install on any device, works offline
- **Routines**: Create, edit, and run daily routines with timers
- **Tasks**: Prioritise using the Eisenhower matrix
- **Habits**: Track streaks and small wins
- **Notes & Brain Dump**: Markdown-ready, export/import `.md` and `.html`
- **Stats Foundation**: Track routine time and structured progress
- **Gamification** _(v2.0+)_: XP, levels, achievements, confetti/haptics
- **Reminders** _(v2.0+)_: Tasks, routines, and habits notifications
- **Secure by design**: Strict CSP, modular code, no inline scripts
- **Mobile-ready**: Android .APK packaging in v2.0

---

## 🛠️ Roadmap

See the [ROADMAP.md](./ROADMAP.md) for detailed milestones (Alpha, Beta, v1.0, v2.0, and beyond).

---

## 🚀 Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/aurorae-haven/aurorae-haven.git
   cd aurorae-haven
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the React development server:

   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

4. Build for production:

   ```bash
   npm run build
   ```

   The production build will be in the `dist/` directory

5. Test the production build locally:
   ```bash
   npm install -g serve
   serve -s dist
   ```

---

## 📦 Installation

### PWA Installation (Recommended)

Aurorae Haven is now a Progressive Web App! You can install it on your device:

1. Visit the app in a modern browser (Chrome, Firefox, Edge, Safari)
2. Look for the "Install" or "Add to Home Screen" prompt
3. Click install to add the app to your device
4. Launch from your home screen or app drawer

**Benefits**: Works offline, faster loading, native app experience

### Development Setup

- **Dependencies**:
  - Node.js 14+ (for building)
  - Modern browser (Chrome, Firefox, Edge, Safari)

- **Build Instructions**:

  ```bash
  npm install
  npm run build
  npm install -g serve
  serve -s dist
  ```

- **Install Methods**:
  - ✅ Progressive Web App (PWA) installation
  - Download and run locally (`index.html`)
  - Android `.APK` _(planned for v2.0)_

---

## 🏗️ Architecture

- **Progressive Web App (PWA)**: Installable, offline-capable, app-like experience
- **ReactJS**: Modular component-based architecture for maintainability
- **HTML5 & CSS**: Modern web standards with responsive design
- **Service Worker**: Enables offline functionality and caching strategies
- **Web Manifest**: Provides app metadata for installation
- **Modular Components**: Organized codebase with clear separation of concerns

### Deployment

The app is automatically deployed to GitHub Pages when changes are pushed to `main` or `feature-*` branches. The deployment workflow:

1. Installs Node.js dependencies
2. Builds the React application with `npm run build`
3. Copies PWA assets (service worker, manifest, icons)
4. Deploys to GitHub Pages

**Live URL**: `https://aurorae-haven.github.io/aurorae-haven/`

---

## 🔒 Security

- Enforced **Content Security Policy (CSP)**
- No inline scripts or styles
- External scripts loaded with **Subresource Integrity (SRI)** or self-hosted
- Regular audits to maintain secure defaults

---

## 📄 License

[MIT License](./LICENSE)

---

## 🙌 Contributing

Contributions, feedback, and ideas are welcome!
