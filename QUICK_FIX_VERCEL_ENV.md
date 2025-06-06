# 🚨 QUICK FIX: Shopee API Not Working on Vercel

## ❌ **PROBLEM:**
```
SHOPEE_SCRAPER_API_KEY disponível: NÃO ❌
USE_REAL_SHOPEE_API: undefined
```

## ✅ **IMMEDIATE SOLUTION:**

### **Step 1: Go to Vercel Dashboard**
1. Open: https://vercel.com/dashboard
2. Click on `easy-gift-search` project
3. Go to **Settings** → **Environment Variables**

### **Step 2: Add These Variables (EXACT NAMES):**

| Variable Name | Value | Environment |
|--------------|--------|-------------|
| `USE_REAL_SHOPEE_API` | `true` | Production, Preview, Development |
| `USE_REAL_REALTIME_API` | `true` | Production, Preview, Development |
| `SHOPEE_SCRAPER_API_KEY` | `[YOUR_SHOPEE_API_KEY]` | Production, Preview, Development |
| `USE_REAL_AMAZON_API` | `false` | Production, Preview, Development |
| `USE_REAL_ALIEXPRESS_API` | `false` | Production, Preview, Development |
| `USE_REAL_MERCADOLIVRE_API` | `false` | Production, Preview, Development |
| `OPENAI_API_KEY` | `[YOUR_OPENAI_API_KEY]` | Production, Preview, Development |
| `RAPIDAPI_KEY_NEW` | `[YOUR_RAPIDAPI_KEY]` | Production, Preview, Development |

### **Step 3: Redeploy**
1. Go to **Deployments** tab
2. Click **Redeploy** on latest deployment
3. Wait 2-3 minutes

### **Step 4: Verify Fix**
After redeployment, the logs should show:
```
🛍️ SHOPEE:
   ✅ REAL API ATIVA - Usando shopee-scraper1.p.rapidapi.com
   🔑 SHOPEE_SCRAPER_API_KEY configurada
```

## 🎯 **EXPECTED RESULT:**
- Shopee API will work with real data
- Other APIs will use mock data as intended
- No more "undefined" environment variables

**Time to fix: 5 minutes** ⏰
