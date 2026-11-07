# TradeJournal - Installation & Deployment Guide

TradeJournal is a Progressive Web App (PWA) built with React 19, TypeScript, Vite, Tailwind CSS, and Firebase Firestore & Authentication.

---

## 1. Instant PWA Installation (Mobile & Desktop)

TradeJournal is a fully compliant Progressive Web App with offline service worker support and standalone display mode.

### Live Production URL
Open the production URL directly in your browser:
**`https://ais-pre-uvqdbjc7wyps4p7p7tqkkw-695364795447.asia-northeast1.run.app`**

### Android (Google Chrome & Samsung Internet)
1. Open the URL above in **Chrome** or **Samsung Internet**.
2. Tap the **Install** banner at the bottom or open the menu (**⋮**).
3. Tap **"Install App"** (or **"Add to Home screen"**).
4. TradeJournal will be installed as a standalone app with its own icon and offline capabilities.

### Desktop (Windows, macOS, Linux - Chrome & Edge)
1. Open the URL in **Google Chrome** or **Microsoft Edge**.
2. Look for the **Install App icon** (computer with downward arrow) on the right side of the URL address bar.
3. Click **"Install"**. TradeJournal will open in its own distraction-free app window.

### iPhone & iPad (Apple Safari)
1. Open the URL in **Safari**.
2. Tap the **Share** button (box with upward arrow) in the Safari toolbar.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top right.

---

## 2. Local Installation & Development

### Prerequisites
- Node.js 18.x or 20.x+
- npm 9+ or pnpm or yarn

### Quick Start
```bash
# 1. Extract the project export ZIP
unzip TradeJournal-Project-Export.zip -d TradeJournal
cd TradeJournal

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Production Build & Self-Hosting

### Build Static Assets
```bash
# Compile TypeScript and build production bundle
npm run build

# Preview production build locally
npm run preview
```
The optimized static production files are located in `dist/`.

### Hosting on Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Deploy dist folder
firebase deploy --only hosting
```

### Hosting on Vercel or Netlify
- Build command: `npm run build`
- Output directory: `dist`
- Single Page App routing: rewrite all routes to `/index.html`

---

## 4. Environment Configuration (`.env`)

Create a `.env` file based on `.env.example`:
```env
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="https://your-domain.com"
```

---

## 5. Offline & PWA Verification

- **Service Worker**: Uses `vite-plugin-pwa` with automatic updates (`autoUpdate`).
- **Cache Strategy**: Workbox caches all static assets, Google Fonts, and icons up to 6 MiB.
- **Database Persistence**: Firebase Firestore provides automatic offline persistence for all trade records, syncing seamlessly once an internet connection is re-established.
