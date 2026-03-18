# Sophos Manchester Pool League

Web app for running a **single-elimination knockout bracket**: add players (4, 8, 16, or 32), generate the bracket, record winners, and show the bracket on a TV display. The main page works on phones; data is stored in the browser so it stays across days.

## Features

- **Players** – Add/remove players. Bracket generates only with **4, 8, 16, or 32** players (no byes).
- **Knockout bracket** – Generate bracket, set the winner for each match; winners advance to the next round until the final.
- **TV display** (`/display`) – Full-screen bracket view. On the **same device** it updates via the browser’s storage event. On **another device** (e.g. TV) it polls the API every few seconds—see **TV sync across devices** below.
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

### 4. TV sync across devices (laptop → TV)

If the TV is a **different device** (e.g. TV browser), it cannot see your laptop’s localStorage. To make the TV update when you change things on the laptop:

1. Create a free **Upstash Redis** database at [console.upstash.com](https://console.upstash.com) (sign in with GitHub).
2. In the database page, copy the **REST URL** and **REST Token**.
3. In Vercel: **Project → Settings → Environment Variables** add:
   - **Name:** `UPSTASH_REDIS_REST_URL` → **Value:** your REST URL  
   - **Name:** `UPSTASH_REDIS_REST_TOKEN` → **Value:** your REST Token  
   - **Environments:** Production (and Preview if you want).
4. **Redeploy** the project.

After that, the main page pushes state to the API whenever you change it, and the TV display polls the API every 2.5 seconds, so the TV stays in sync even on another device.

## Data persistence

- **localStorage** is used for players and bracket on the device where you edit. It survives refresh and closing the browser.
- With **Upstash Redis** configured (see above), the TV on another device stays in sync by polling the API; the API stores a copy of the state.

## Build

```bash
npm run build
npm run preview
```

## Tech

- React 18 + Vite, React Router
- localStorage + optional Upstash Redis (for TV sync across devices)
- Optional password via `VITE_APP_PASSWORD`
