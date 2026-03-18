# Sophos Manchester Pool League

Web app for running a **single-elimination knockout bracket**: add players (4, 8, 16, or 32), generate the bracket, record winners, and show the bracket on a TV display. The main page works on phones; data is stored in the browser so it stays across days.

## Features

- **Players** – Add/remove players. Bracket generates only with **4, 8, 16, or 32** players (no byes).
- **Knockout bracket** – Generate bracket, set the winner for each match; winners advance to the next round until the final.
- **TV display** (`/display`) – Full-screen bracket view; updates in real time when you change data on the main page (same browser/device).
- **Password** – Optional app password via env var (see below).
- **Mobile** – Main page (add players, set winners) is responsive and usable on a phone.
- **Data** – Stored in the browser (localStorage). It **persists** when you close the tab and come back later, so you can run the tournament over several days on the same device. (Using the app on a different phone or PC will not show the same data unless you use the same browser profile.)

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 (main) or http://localhost:5173/display (TV).

## Deploy to Vercel with password

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: pool league bracket app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Create the repo on GitHub first (empty, no README), then run the above with your repo URL.

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub).
2. **Import** your GitHub repo. Vercel will detect Vite; use default settings and deploy.
3. After deploy, open **Project → Settings → Environment Variables**.
4. Add:
   - **Name:** `VITE_APP_PASSWORD`  
   - **Value:** your chosen password (e.g. `PoolLeague2024`)  
   - **Environment:** Production (and Preview if you want).
5. **Redeploy** (Deployments → … → Redeploy) so the password is picked up.

Anyone opening the app will see a password screen first; after entering the correct password they can use the app (session lasts until they close the browser).

**Alternative:** On a **Vercel Pro** plan you can use **Settings → Deployment Protection → Password Protection** and set a single password in the dashboard instead of using `VITE_APP_PASSWORD`.

### 3. SPA routing

The project includes `vercel.json` so `/display` and other routes work on Vercel (all routes serve `index.html`).

## Data persistence

- **localStorage** is used for players and bracket. It survives refresh and closing the browser, so the same device will still have the bracket if you continue the next day.
- Data is **per device/browser**. To have the same bracket on multiple devices (e.g. phone + TV), you’d need a backend/database; this version is single-device storage.

## Build

```bash
npm run build
npm run preview
```

## Tech

- React 18 + Vite, React Router
- localStorage (no backend)
- Optional password via `VITE_APP_PASSWORD`
