# KEYSTONE — Deployment Guide

## Architecture (Vercel + Render)

```
User Browser
    │
    ▼
Vercel (React SPA — free)
    │  HTTPS API calls to
    ▼
Render (Spring Boot — free)
    │  JDBC
    ▼
Render PostgreSQL (free managed DB)
```

**Total cost: ₹0 / $0** — all free tiers.

---

## Step 1 — Push to GitHub

First push your code to GitHub (required by both Vercel and Render).

```bash
cd keystone
git init
git add .
git commit -m "feat: Project KEYSTONE - Field Service Management Platform"
```

Go to https://github.com/new → create a **public** repo named `keystone`

```bash
git remote add origin https://github.com/YOUR_USERNAME/keystone.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Deploy Backend + Database on Render

### 2a. Create a PostgreSQL database on Render

1. Go to https://dashboard.render.com → **New** → **PostgreSQL**
2. Fill in:
   - Name: `keystone-db`
   - Database: `keystone`
   - User: `keystone`
   - Plan: **Free**
3. Click **Create Database**
4. Wait ~2 minutes. Then copy these values from the database page:
   - **Internal Database URL** (starts with `postgres://`) — for Render-to-Render
   - **External Database URL** — for testing locally

### 2b. Create the Backend Web Service on Render

1. Go to https://dashboard.render.com → **New** → **Web Service**
2. Connect your GitHub repo → select the `keystone` repository
3. Configure:
   - **Name**: `keystone-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Plan**: Free
4. Set **Environment Variables** (click "Add Environment Variable" for each):

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Paste the **Internal Database URL** from Step 2a, but change `postgres://` to `jdbc:postgresql://` |
   | `DATABASE_USERNAME` | `keystone` |
   | `DATABASE_PASSWORD` | (copy from Render DB page) |
   | `JWT_SECRET` | any random 40+ char string e.g. `K3y$t0n3-Pr0d-S3cr3t-M3r1d14n-2024-S3cur3!` |
   | `SERVER_PORT` | `8081` |
   | `ALLOWED_ORIGINS` | `https://YOUR-VERCEL-APP.vercel.app` (fill after Step 3) |

   > **DATABASE_URL format**: Render gives `postgres://user:pass@host/db`
   > Change it to `jdbc:postgresql://host/db` and set user/pass separately.

5. Click **Create Web Service**
6. Render will build the Docker image (~5 min first time). Watch the logs.
7. Once deployed, your API will be at: `https://keystone-api.onrender.com`
8. Test it: visit `https://keystone-api.onrender.com/actuator/health` → should return `{"status":"UP"}`

---

## Step 3 — Deploy Frontend on Vercel

1. Go to https://vercel.com → **Add New Project**
2. Import your `keystone` GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variable**:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://keystone-api.onrender.com` |

5. Click **Deploy**
6. Vercel gives you a URL like `https://keystone-abc123.vercel.app`

---

## Step 4 — Update CORS on Render

Go back to your Render backend service → Environment:
- Update `ALLOWED_ORIGINS` = `https://keystone-abc123.vercel.app` (your actual Vercel URL)
- Click **Save Changes** → Render will redeploy automatically

---

## Step 5 — Verify Everything Works

1. Open your Vercel URL in a browser
2. Login with: `manager@keystone.dev` / `manager123`
3. You should see the dashboard with Indian data (TCS, Infosys, Reliance work orders)
4. Check Swagger: `https://keystone-api.onrender.com/swagger-ui/index.html`

---

## Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Manager | manager@keystone.dev | manager123 |
| Dispatcher | dispatcher@keystone.dev | dispatcher123 |
| Technician | technician@keystone.dev | technician123 |
| Customer | customer@keystone.dev | customer123 |
| Technician | rajesh.kumar@keystone.dev | technician123 |
| Technician | priya.sharma@keystone.dev | technician123 |
| Technician | amit.verma@keystone.dev | technician123 |
| Dispatcher | sunita.patel@keystone.dev | dispatcher123 |
| Customer (TCS) | vikram.singh@keystone.dev | customer123 |
| Customer (Infosys) | meera.nair@keystone.dev | customer123 |

---

## Common Issues

### "Application failed to start" on Render
- Check that `DATABASE_URL` starts with `jdbc:postgresql://` not `postgres://`
- Free Render DB takes ~30s to wake up on first connection — check logs

### CORS error in browser console
- Make sure `ALLOWED_ORIGINS` on Render matches your exact Vercel URL (no trailing slash)
- After updating, wait for Render to redeploy (~2 min)

### Render free tier goes to sleep
- Free Render services sleep after 15 min of inactivity
- First request after sleep takes ~30 seconds (cold start)
- This is normal for free tier — upgrade to Starter ($7/mo) to avoid it

### Vercel shows blank page / 404 on refresh
- The `vercel.json` in `frontend/` handles this — all routes go to `index.html`
- Make sure `frontend/vercel.json` is committed to your repo

---

## Local Development (Docker)

```bash
# Start just the database
docker-compose up postgres -d

# Backend (separate terminal)
cd backend
mvn spring-boot:run

# Frontend (separate terminal)
cd frontend
npm run dev
# → http://localhost:5173
```

Or run everything with Docker:
```bash
docker-compose up --build
# Frontend: http://localhost
# Backend:  http://localhost:8081
# Swagger:  http://localhost:8081/swagger-ui/index.html
```
