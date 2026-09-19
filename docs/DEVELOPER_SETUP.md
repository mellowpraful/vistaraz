# CrisisOS — Developer Setup & Local Environment Guide

This guide walks through setting up, configuring, and testing CrisisOS on a local developer workstation.

---

## 1. Prerequisites

- **Node.js:** v20.x or v24.x LTS
- **Package Manager:** npm v10+
- **Git:** v2.30+

---

## 2. Step-by-Step Local Setup

```bash
# 1. Clone repository
git clone https://github.com/mellowpraful/vistaraz.git
cd vistaraz

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Generate Prisma client & sync SQLite database
npx prisma generate
npx prisma db push

# 5. Seed synthetic multi-agency demo data
npx tsx prisma/seed.ts

# 6. Run automated test suite
npm test

# 7. Start local development server
npm run dev
```

Open `http://localhost:3000` in your browser.
