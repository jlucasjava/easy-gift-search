# 🚨 VERCEL ENVIRONMENT VARIABLES CONFIGURATION GUIDE

## ❌ PROBLEM IDENTIFIED:
The server running on port 10000 (Vercel production) is not loading the environment variables properly.

**Current Status:**
- Local environment: ✅ All variables loaded correctly  
- Vercel production: ❌ Variables showing as `undefined`

---

## 🔧 SOLUTION: Configure Environment Variables in Vercel Dashboard

### **Step 1: Access Vercel Dashboard**
1. Go to: https://vercel.com/dashboard
2. Find your project: `easy-gift-search`
3. Click on the project name

### **Step 2: Add Environment Variables**
1. Go to **Settings** tab
2. Click **Environment Variables** in the sidebar
3. Add the following variables:

```bash
# API Keys - REPLACE WITH YOUR ACTUAL KEYS
OPENAI_API_KEY=your_openai_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_KEY_NEW=your_rapidapi_key_new_here
SHOPEE_SCRAPER_API_KEY=your_shopee_scraper_api_key_here

# API Configuration - Only OpenAI and Shopee Active
USE_REAL_AMAZON_API=false
USE_REAL_SHOPEE_API=true
USE_REAL_ALIEXPRESS_API=false
USE_REAL_MERCADOLIVRE_API=false

# Advanced APIs
USE_LLAMA_API=true
USE_GOOGLE_SEARCH_API=true
USE_GOOGLE_SEARCH72_API=true
USE_ALIEXPRESS_DATAHUB_API=true
USE_BING_WEB_SEARCH_API=true
USE_GOOGLE_MAPS_API=true

# Environment
NODE_ENV=production
```

### **Step 3: Apply to All Environments**
For each variable:
1. Set **Environment**: `Production`, `Preview`, and `Development`
2. Click **Save**

### **Step 4: Redeploy**
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait for completion

---

## 🚀 ALTERNATIVE: Quick Fix via CLI

If you have Vercel CLI installed:

```bash
# Set environment variables via CLI
vercel env add OPENAI_API_KEY
vercel env add SHOPEE_SCRAPER_API_KEY
vercel env add USE_REAL_SHOPEE_API
vercel env add USE_REAL_AMAZON_API
# ... add all other variables

# Then redeploy
vercel --prod
```

---

## 🔍 VERIFICATION

After configuration, the server logs should show:
```
🛍️ SHOPEE:
   ✅ REAL API ATIVA - Usando shopee-scraper1.p.rapidapi.com
   🔑 SHOPEE_SCRAPER_API_KEY configurada
```

Instead of:
```
🛍️ SHOPEE:
   🔧 MODO DEMO - Usando dados mock do Shopee
```

---

## 📋 NEXT STEPS

1. **Immediate**: Configure environment variables in Vercel dashboard
2. **Deploy**: Trigger a new deployment
3. **Test**: Verify APIs are working with real data
4. **Monitor**: Check server logs for proper API configuration

**Status**: 🔧 **ENVIRONMENT CONFIGURATION REQUIRED**
