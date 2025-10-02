# 🌌 My Stellar Trail

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
- **Gamification** *(v2.0+)*: XP, levels, achievements, confetti/haptics  
- **Reminders** *(v2.0+)*: Tasks, routines, and habits notifications  
- **Secure by design**: Strict CSP, modular code, no inline scripts  
- **Mobile-ready**: Android .APK packaging in v2.0  

---

## 🛠️ Roadmap
See the [ROADMAP.md](./ROADMAP.md) for detailed milestones (Alpha, Beta, v1.0, v2.0, and beyond).

---

## 🚀 Quick Start
> ⚠️ This section is a **stub**. Instructions will be expanded as development progresses.

1. Clone the repository:  
   ```bash
   git clone https://github.com/my-stellar-trail/my-stellar-trail.git
   cd my-stellar-trail
   git checkout -b feature-my_feature
   git branch -u origin feature-my_feature
   ```

2. Open in your browser (static HTML/JS app):  
   ```bash
   open index.html
   ```

3. (Optional) Run via local server for development:  
   ```bash
   npm install -g serve
   serve .
   ```

---

## 📦 Installation

### PWA Installation (Recommended)
My Stellar Trail is now a Progressive Web App! You can install it on your device:

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
  serve -s build
  ```

- **Install Methods**:  
  - ✅ Progressive Web App (PWA) installation  
  - Download and run locally (`index.html`)  
  - Android `.APK` *(planned for v2.0)*  

---

## 🏗️ Architecture
- **Progressive Web App (PWA)**: Installable, offline-capable, app-like experience  
- **ReactJS**: Modular component-based architecture for maintainability  
- **HTML5 & CSS**: Modern web standards with responsive design  
- **Service Worker**: Enables offline functionality and caching strategies  
- **Web Manifest**: Provides app metadata for installation  

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
