# CrisisOS — Production Deployment & Cloud Hosting Guide

This document outlines deployment configurations for Vercel, Docker containers, and multi-region cloud environments.

---

## 1. Vercel Deployment

1. Push your repository to GitHub.
2. Import the project into your Vercel dashboard.
3. Configure environment variables in Vercel settings:
   - `DATABASE_URL`: PostgreSQL connection string (e.g. Supabase / Neon / AWS RDS).
   - `NEXT_PUBLIC_APP_NAME`: `CrisisOS`.
4. Deploy — Next.js 16 App Router will automatically build and optimize all serverless route handlers.

---

## 2. Docker Deployment

Create a `Dockerfile` in the root:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```
