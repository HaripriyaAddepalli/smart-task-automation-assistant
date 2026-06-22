# Production Deployment Guide

## Quick Start with Docker

### Prerequisites
- Docker & Docker Compose installed
- Environment variables set (see `.env` files)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd smart-task-automation-assistant
```

### 2. Configure Environment Variables

Create `.env` files with required secrets:

**backend/.env**
```env
PORT=5000
MONGO_URI=mongodb://admin:password@mongodb:27017/smart-task-assistant?authSource=admin
REDIS_URL=redis://redis:6379
GROQ_API_KEY=your_groq_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
FIREBASE_PROJECT_ID=smart-task-assistant-208e5
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
```

**frontend/.env.production**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

Services will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **MongoDB:** localhost:27017
- **Redis:** localhost:6379

---

## Kubernetes Deployment

### Prerequisites
- kubectl configured
- Docker images pushed to registry

### 1. Create namespace

```bash
kubectl create namespace smart-task
```

### 2. Deploy with provided manifests

```bash
# Configure secrets first
kubectl create secret generic app-secrets \
  --from-literal=groq-api-key=<key> \
  --from-literal=stripe-key=<key> \
  -n smart-task

# Deploy
kubectl apply -f k8s/ -n smart-task
```

---

## Manual Setup (Without Docker)

### Prerequisites
- Node.js 20+
- MongoDB 7.0+
- Redis 7+

### 1. Backend Setup

```bash
cd backend
npm ci
export MONGO_URI="mongodb://localhost:27017/smart-task-assistant"
export REDIS_URL="redis://localhost:6379"
export GROQ_API_KEY="your_key"
export NODE_ENV="production"

npm run build
npm start
```

Backend runs on: http://localhost:5000

### 2. Frontend Setup

```bash
cd frontend
npm ci
export VITE_API_URL="http://localhost:5000/api"

npm run build
npm run preview
```

Frontend runs on: http://localhost:5173

---

## Health Checks

### Backend Health
```bash
curl http://localhost:5000/health
# Expected: { "status": "ok", "timestamp": "2024-..." }
```

### Database Connection
- MongoDB at localhost:27017
- Redis at localhost:6379

### Verify Services
```bash
docker-compose ps
# All services should show "healthy" or "up"
```

---

## Scaling Configuration

### Docker Compose (Development)
Edit `docker-compose.yml` for resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### Kubernetes (Production)
Edit `k8s/backend-deployment.yml`:

```yaml
resources:
  limits:
    cpu: "1"
    memory: "1Gi"
  requests:
    cpu: "500m"
    memory: "512Mi"
```

---

## Monitoring & Logging

### Docker Logs
```bash
# Backend
docker-compose logs backend

# Follow real-time
docker-compose logs -f backend

# All services
docker-compose logs -f
```

### Common Issues

**MongoDB Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
Solution: Ensure MongoDB is running and URI is correct

**Redis Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
Solution: Ensure Redis is running and URL is correct

**Port Already in Use**
```
Address already in use :::5000
```
Solution: `lsof -i :5000` and kill the process, or change PORT

---

## Performance Tuning

### Backend Optimization
1. **Connection Pooling:** MongoDB/Redis automatically managed
2. **Rate Limiting:** Configured at 15 requests/minute (see middleware)
3. **Caching:** Redis caches AI responses for 1 hour

### Frontend Optimization
1. **Code Splitting:** Automatic via Vite
2. **PWA:** Workbox service worker for offline support
3. **Bundle:** ~500KB gzipped

---

## Security Checklist

- [ ] Environment variables set (never commit secrets)
- [ ] Firebase credentials configured
- [ ] Stripe webhook secret configured
- [ ] MongoDB authentication enabled
- [ ] CORS configured for frontend domain
- [ ] HTTPS enforced in production
- [ ] Rate limiting enabled
- [ ] Helmet security headers enabled

---

## Backup & Recovery

### MongoDB Backup
```bash
# Backup
docker-compose exec mongodb mongodump \
  --username admin \
  --password password \
  --authenticationDatabase admin \
  --out /backup

# Restore
docker-compose exec mongodb mongorestore \
  --username admin \
  --password password \
  --authenticationDatabase admin \
  /backup
```

### Redis Backup
```bash
# Backup
docker-compose exec redis redis-cli BGSAVE

# File location
docker-compose exec redis ls -la /data/
```

---

## Rollback Procedure

### Docker Compose
```bash
# Stop current version
docker-compose down

# Checkout previous version
git checkout <previous-commit>

# Restart with previous version
docker-compose up -d
```

### Kubernetes
```bash
# Rollback deployment
kubectl rollout undo deployment/backend -n smart-task
kubectl rollout undo deployment/frontend -n smart-task
```

---

## Vercel & Render PaaS Deployment

This section describes how to deploy the application's backend on Render and the frontend on Vercel.

### 1. Backend Deployment (Render)

Render supports deploying from your Git repository using Blueprints or direct service creation. We have provided a [render.yaml](file:///c:/Users/harip/smart-task-automation-assistant/render.yaml) Blueprint spec at the root of the project to automatically configure both the Express server and Redis cache.

#### Steps:
1. **Firebase Admin Credentials:**
   Render requires a secret file for Firebase Admin SDK authentication. Download your service account key JSON file from the Firebase Console (Settings -> Service Accounts -> Generate New Private Key).
2. **Deploy Blueprint on Render:**
   - Log into your Render dashboard, click **New** -> **Blueprint**.
   - Connect your GitHub repository.
   - Render will parse `render.yaml` and offer to create:
     - `smart-task-backend` (Node.js Web Service)
     - `smart-task-redis` (Managed Redis instance)
3. **Add Secret File:**
   - Go to the `smart-task-backend` settings, select the **Environment** tab.
   - Under the **Secret Files** section, click **Add Secret File**:
     - **Filename:** `firebase-credentials.json`
     - **Contents:** Paste the contents of your downloaded Firebase service account key JSON file.
4. **Configure Environment Variables:**
   - Set the following variables in the **Environment** tab of the `smart-task-backend` service:
     - `MONGO_URI`: Your MongoDB Atlas connection string (or another hosted MongoDB instance).
     - `GROQ_API_KEY`: Your Groq AI key.
     - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`).
     - (Optionally set Twilio, Telegram, Stripe, and Email keys as listed in the `render.yaml`).
5. **Deploy:**
   - Click **Deploy** to start the build and deployment process. Once complete, the backend URL will look like `https://smart-task-backend.onrender.com`.

---

### 2. Frontend Deployment (Vercel)

Vercel is optimized for deploying static client-side applications built with Vite.

#### Steps:
1. **Import Project to Vercel:**
   - Log into Vercel, click **Add New** -> **Project**.
   - Connect and import your Git repository.
2. **Configure Directory and Build Settings:**
   - **Root Directory:** Edit this setting and select the `frontend` subfolder.
   - **Framework Preset:** `Vite` (Vercel will auto-detect this).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. **Configure Environment Variables:**
   - Add the following environment variable:
     - **Key:** `VITE_API_URL`
     - **Value:** The HTTPS URL of your Render backend with `/api` appended (e.g., `https://smart-task-backend.onrender.com/api`).
4. **Deploy:**
   - Click **Deploy**. Vercel will build the frontend and serve it.
   - The included [vercel.json](file:///c:/Users/harip/smart-task-automation-assistant/frontend/vercel.json) configuration handles client-side routing, preventing 404 errors when refreshing routing paths.

---

## Support & Troubleshooting

For issues:
1. Check logs: `docker-compose logs -f service_name`
2. Verify environment variables
3. Ensure all services are healthy: `docker-compose ps`
4. Check port availability: `lsof -i :port`
5. Review INSPECTION_REPORT.md for architecture details

