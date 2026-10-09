# Find Back — Smart Campus Lost & Found 🎓🔍

> **Tagline:** *Lost it on campus? Find your way back to it.*

A complete, modern, responsive full-stack web application designed for a college hackathon. Built to solve the chaos of lost belongings scattered across informal WhatsApp groups, notice boards, and word of mouth on university campuses.

---

## 🌟 Key Features

### 1. 🎨 Modern & Responsive Campus UI
- Clean white background with navy blue accents (`#0f172a`, `#1e3a8a`, `#2563eb`), subtle gradients, and crisp typography.
- Fully responsive on mobile, tablet, and desktop devices.
- Attractive item cards, realistic photos, status badges, and smooth interactive transitions.

### 2. 📝 Dual-Mode Item Reporting
- **Report Lost Items:** Name, category, description, brand, color, campus location, date/time, and a **Confidential Ownership Clue** (e.g. lockscreen wallpaper, serial marks, secret contents) stored securely to verify future claims.
- **Report Found Items:** Name, category, description, photo upload with immediate preview, custody location (e.g. *"Left at Security Desk @ Library Gate 2"*), and finder information.
- **Privacy Shield:** Reporter and finder phone numbers and emails are hidden behind campus ID protection and never displayed publicly.

### 3. 🧠 Deterministic Smart Matching Engine
- Authentic algorithmic multi-factor similarity scoring (no dummy percentages or fake AI claims):
  - **Category match** (Weight: 35%)
  - **Keyword & description similarity** via Sorensen-Dice/Jaccard tokenization (Weight: 25%)
  - **Campus location proximity & zone mapping** (Weight: 20%)
  - **Date proximity** (Weight: 10%)
  - **Brand & colour consistency** (Weight: 10%)
- Explains **why** items match with human-readable reasoning bullets (e.g., *"Exact campus location match: CSE Department Lab 3"*, *"Matching brand: HP"*).

### 4. 🔒 Secure Anti-Fraud Claim Workflow
- Anyone claiming a found item must submit a claim with an **Ownership Proof Clue** that only the true owner would know.
- The finder or authorized campus administrator reviews the claim, compares the submitted proof against confidential records, and **Approves** or **Rejects** with notes.
- Contact details and safe handover instructions are unlocked **only upon authorized approval**.
- One-click **"Mark as Returned"** action closes the loop and updates campus statistics with celebration confetti!

### 5. 🛡️ Role-Based Admin & Security Dashboard
- Real-time campus recovery analytics: Total Reports, Active Lost, Found in Custody, Recovered Items, and Recovery Rate %.
- **Claims Resolution Center:** Inspect private clues, verify claimant credentials, and approve/reject handovers.
- **Campus Report Directory:** Search, filter, edit status, and delete items.
- **1-Click Demo Reset:** Restores database to realistic seed data anytime during presentations.

### 6. 🚀 Guided 5-Step Hackathon Demo Tour & Persona Switcher
- Built-in Hackathon Bar allowing 1-click switching between campus personas:
  - **Aarav Sharma** (Student A — Lost HP Laptop Charger in Lab 3)
  - **Priya Patel** (Student B — Found HP Charger in Lab 3)
  - **Officer Rajendra Kumar** (Admin — Campus Security Officer)
  - **Campus Visitor** (Guest)
- Interactive **5-step guided walkthrough** modal that navigates evaluators through the entire story arc.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Canvas Confetti |
| **Backend** | Node.js, Express, TypeScript, Multer, UUID |
| **Database** | Persistent file-backed JSON store with atomic writes (`server/data/db.json`) |
| **File Storage** | Multer disk storage in `server/uploads/` statically served via Express |

---

## 💻 Local Setup & Quick Start

### Prerequisites
- **Node.js** (v18 or higher recommended, tested on Node v24)
- **npm** (v9 or higher)

### Installation
Clone the repository and install dependencies in all workspaces:

```bash
# 1. Install root, server, and client packages
npm install
npm --prefix server install
npm --prefix client install
```

### Running in Development Mode
Launch both the Express backend (`http://localhost:5000`) and the Vite React frontend (`http://localhost:5173`) with a single command:

```bash
npm run dev
```

Open your browser at:
👉 **`http://localhost:5173`**

*(Requests to `/api` and `/uploads` are automatically proxied from Vite to the Express server on port 5000).*

---

## 🧪 Testing the Guided Hackathon Demo

1. Open **`http://localhost:5173`**.
2. Look at the top navy bar: **"HACKATHON DEMO MODE"**.
3. Click **"5-Step Guided Demo Flow"**:
   - **Step 1:** Aarav loses his HP 65W charger in CSE Lab 3 with a private secret clue (*"Orange electric tape on cord"*).
   - **Step 2:** Priya finds the charger in Lab 3 and reports it.
   - **Step 3:** The matching engine flags a **98% Match** with exact breakdown reasons.
   - **Step 4:** Aarav submits an ownership claim with his secret clue.
   - **Step 5:** Officer Raj inspects the claim in the Admin Center, approves it, unlocks contact details, and marks it as safely **Returned**!
4. Click **"Reset Demo"** at any time to restore fresh sample data.

---

## 📦 Production Build & Deployment

The application is structured for instant single-port cloud deployment:

### Step 1: Build the Project
```bash
# Builds the Vite React frontend into client/dist
npm run build
```

### Step 2: Test Production Server Locally
```bash
# Runs the Express backend which serves the built client and API on PORT 5000
npm run start
```
Open **`http://localhost:5000`** in your browser.

---

## ☁️ Deployment Guide (Live Hosting)

### Option A: Render.com / Railway.app (Recommended Free/Easy Hosting)
1. Push your repository to **GitHub**.
2. Create a new **Web Service** on [Render](https://render.com) or [Railway](https://railway.app).
3. Set **Build Command**:
   ```bash
   npm --prefix client install && npm --prefix client run build && npm --prefix server install
   ```
4. Set **Start Command**:
   ```bash
   npm --prefix server run start
   ```
5. Configure Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000` (or provided automatically by the host)
6. Add a persistent disk volume pointing to `server/uploads` and `server/data` if you want uploaded files to persist across dyno restarts.

### Option B: VPS (Ubuntu / Nginx / PM2)
```bash
git clone <repo-url> /var/www/findback
cd /var/www/findback
npm install
npm --prefix client install && npm --prefix client run build
npm --prefix server install
pm2 start "npm --prefix server run start" --name "findback"
```

---

## 🔐 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Port for Express backend |
| `NODE_ENV` | `development` | Environment mode (`development` / `production`) |

---

## 👥 Hackathon Demo Personas

| Name | Role | Email | Scenario Use Case |
|---|---|---|---|
| **Aarav Sharma** | Student | `aarav.sharma@campus.edu` | Loser of HP Laptop Charger & HydroFlask |
| **Priya Patel** | Student | `priya.patel@campus.edu` | Finder of HP Charger in CSE Lab 3 |
| **Officer Rajendra Kumar** | Admin | `security.desk@campus.edu` | Campus Security Officer reviewing claims |
| **Campus Visitor** | Guest | `guest@campus.edu` | New visitor exploring the platform |

---

## 📜 License
Built for the Campus College Hackathon 2026. Free to extend and deploy for any educational institution!
