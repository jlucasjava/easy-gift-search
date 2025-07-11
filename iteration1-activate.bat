@echo off
REM Easy Gift Search - Iteration 1 Automation
REM Production Activation Script for Windows
REM July 8, 2025

echo.
echo 🚀 EASY GIFT SEARCH - ITERATION 1 AUTOMATION
echo ============================================================
echo 📅 Date: %date% %time%
echo.

echo 🔍 PHASE 1: Environment Verification
echo ============================================
cd /d "%~dp0backend"

if exist ".env" (
    echo ✅ .env file found
) else (
    echo ❌ .env file missing - creating from example
    copy ".env.example" ".env"
)

echo.
echo 🎯 PHASE 2: Local Testing
echo ============================================
echo Running local environment test...
node simple-test.js

echo.
echo 🌐 PHASE 3: Production Status Check
echo ============================================
echo Testing current production deployment...
node teste-producao-final.js

echo.
echo 📋 PHASE 4: Next Steps Summary
echo ============================================
echo.
echo ⏳ PENDING ACTIONS:
echo.
echo 1️⃣  Configure Vercel Environment Variables:
echo    🌐 https://vercel.com/dashboard
echo    📁 Find your "easy-gift-search" project
echo    ⚙️  Go to Settings → Environment Variables
echo.
echo 2️⃣  Add these environment variables:
echo    GOOGLE_SEARCH_API_KEY=AIzaSyBs07nRYL0fYREou8gwDkS7fruBydwXfvI
echo    GOOGLE_SEARCH_CX=e17d0e713876e4dca
echo    USE_GOOGLE_SEARCH_API=true
echo    NODE_ENV=production
echo    PORT=10000
echo    CACHE_TTL=3600
echo.
echo 3️⃣  Trigger New Deployment:
echo    💡 Vercel will automatically redeploy after adding variables
echo.
echo 4️⃣  Verify Production:
echo    🧪 Run: iteration1-verify.bat
echo    🌐 Visit: https://easy-gift-search.vercel.app
echo.
echo ✨ ESTIMATED TIME: 10-15 minutes
echo 🎉 Once complete, move to Iteration 2: Performance Optimization
echo.

echo 📊 DASHBOARD: Open iteration-dashboard.html to monitor progress
echo.

pause
