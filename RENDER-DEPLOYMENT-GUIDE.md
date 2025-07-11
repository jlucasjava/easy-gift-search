# 🚀 RENDER.COM DEPLOYMENT GUIDE
# Easy Gift Search - Production Configuration

## Build & Deploy Settings

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
cd backend && node server.js
```

## Required Environment Variables

Set these in Render.com dashboard:

```env
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=256
```

## Optional Environment Variables

```env
# Google Search API (for real search functionality)
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CX=your_google_cx_id

# Admin Access
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure_admin_password
JWT_SECRET=your_super_secure_jwt_secret

# Alerts & Monitoring
SLACK_WEBHOOK_URL=your_slack_webhook_url

# Cache (if using external Redis)
REDIS_URL=redis://your_redis_url
```

## Memory Optimization Settings

For Render's free tier, add these optimizations:

```env
NODE_OPTIONS=--max-old-space-size=256 --optimize-for-size
```

## Port Configuration

Render automatically sets:
- `PORT` (dynamic)
- `HOST=0.0.0.0`

Our server is now configured to use these automatically.

## Health Check Endpoint

Render will monitor: `https://your-app.onrender.com/api/health`

## Features Available

✅ **Real-time Analytics Dashboard**  
✅ **Admin Panel** at `/admin-dashboard.html`  
✅ **API Monitoring** at `/api/health` and `/api/metrics`  
✅ **Search Functionality** with fallback systems  
✅ **Performance Monitoring** with alerts  
✅ **WebSocket Real-time Updates**  

## Troubleshooting

### Port Issues
- Ensure server listens on `0.0.0.0:PORT`
- Render requires external accessibility

### Memory Issues  
- Set NODE_OPTIONS for memory optimization
- Monitor usage in logs
- Alert threshold adjusted to 95%

### API Issues
- Configure Google API keys for full functionality
- Fallback systems work without external APIs
