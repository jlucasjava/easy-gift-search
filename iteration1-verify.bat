@echo off
REM Easy Gift Search - Iteration 1 Verification
REM Production Verification Script
REM July 8, 2025

echo.
echo 🧪 EASY GIFT SEARCH - PRODUCTION VERIFICATION
echo ============================================================
echo 📅 Date: %date% %time%
echo.

cd /d "%~dp0backend"

echo 🔍 TESTING PRODUCTION ENDPOINTS...
echo ============================================

echo.
echo 1️⃣  Testing API Status...
node -e "
const https = require('https');
https.get('https://easy-gift-search.vercel.app/api/status', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ Status API: Working');
      console.log('📊 Response:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('❌ Status API: Error parsing JSON');
      console.log('📄 Raw response:', data.substring(0, 200));
    }
  });
}).on('error', (e) => {
  console.log('❌ Status API: Connection failed');
  console.log('🔍 Error:', e.message);
});
"

timeout /t 3 >nul

echo.
echo 2️⃣  Testing Search Endpoint...
node -e "
const https = require('https');
https.get('https://easy-gift-search.vercel.app/api/custom-search?query=smartphone&maxPrice=1000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ Search API: Working');
      console.log('📊 Results found:', json.length || 0);
      if (json.length > 0) {
        console.log('📱 Sample result:', json[0].title || 'N/A');
      }
    } catch (e) {
      console.log('❌ Search API: Error parsing JSON');
      console.log('📄 Raw response:', data.substring(0, 200));
    }
  });
}).on('error', (e) => {
  console.log('❌ Search API: Connection failed');
  console.log('🔍 Error:', e.message);
});
"

timeout /t 3 >nul

echo.
echo 3️⃣  Testing Recommendation Endpoint...
node -e "
const https = require('https');
https.get('https://easy-gift-search.vercel.app/api/recommend?budget=500&interests=tecnologia', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ Recommendation API: Working');
      console.log('💡 Recommendations found:', json.length || 0);
    } catch (e) {
      console.log('❌ Recommendation API: Error parsing JSON');
      console.log('📄 Raw response:', data.substring(0, 200));
    }
  });
}).on('error', (e) => {
  console.log('❌ Recommendation API: Connection failed');
  console.log('🔍 Error:', e.message);
});
"

echo.
echo ============================================
echo 📋 VERIFICATION RESULTS SUMMARY
echo ============================================
echo.
echo If all tests show ✅ Working:
echo   🎉 ITERATION 1 COMPLETE!
echo   ▶️  Ready for Iteration 2: Performance Optimization
echo.
echo If tests show ❌ Errors:
echo   ⚠️  Environment variables need configuration in Vercel
echo   📋 Follow steps in iteration1-activate.bat
echo.
echo 🌐 Manual Testing:
echo   🔗 https://easy-gift-search.vercel.app
echo   🔗 https://easy-gift-search.vercel.app/api/status
echo.

pause
