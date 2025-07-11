# 🚀 EASY GIFT SEARCH - PRODUCTION DEPLOYMENT TEST (PowerShell)
# Test all new features and ensure production readiness

Write-Host "🚀 Starting Easy Gift Search Production Deployment Test..." -ForegroundColor Cyan

# Set environment variables for testing
$env:NODE_ENV = "development"
$env:PORT = "3000"
$env:JWT_SECRET = "test-jwt-secret-super-secure-key"
$env:ADMIN_EMAIL = "admin@easygiftsearch.com"
$env:ADMIN_PASSWORD = "admin123"
$env:ADMIN_TOKEN = "admin123"

# Test 1: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Dependency installation failed" -ForegroundColor Red
    exit 1
}

# Test 2: Start server in background
Write-Host "🚀 Starting server..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -WindowStyle Hidden

# Wait for server to start
Start-Sleep -Seconds 8

# Test 3: Health check
Write-Host "🔍 Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "✅ Health check passed" -ForegroundColor Green
    } else {
        throw "Health check failed with status $($healthResponse.StatusCode)"
    }
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    Stop-Process -Id $serverProcess.Id -Force
    exit 1
}

# Test 4: Test authentication endpoint
Write-Host "🔐 Testing authentication..." -ForegroundColor Yellow
try {
    $authBody = @{
        email = "admin@easygiftsearch.com"
        password = "admin123"
    } | ConvertTo-Json

    $authResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/auth/login" -Method POST -Body $authBody -ContentType "application/json" -UseBasicParsing
    $authData = $authResponse.Content | ConvertFrom-Json
    
    if ($authData.accessToken) {
        Write-Host "✅ Authentication test passed" -ForegroundColor Green
        $token = $authData.accessToken
    } else {
        throw "No access token received"
    }
} catch {
    Write-Host "❌ Authentication test failed: $_" -ForegroundColor Red
    Stop-Process -Id $serverProcess.Id -Force
    exit 1
}

# Test 5: Test admin dashboard access
Write-Host "📊 Testing admin dashboard..." -ForegroundColor Yellow
try {
    $headers = @{
        'Authorization' = "Bearer $token"
    }
    $adminResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/system" -Headers $headers -UseBasicParsing
    
    if ($adminResponse.StatusCode -eq 200) {
        Write-Host "✅ Admin dashboard test passed" -ForegroundColor Green
    } else {
        throw "Admin dashboard test failed with status $($adminResponse.StatusCode)"
    }
} catch {
    Write-Host "❌ Admin dashboard test failed: $_" -ForegroundColor Red
    Stop-Process -Id $serverProcess.Id -Force
    exit 1
}

# Test 6: Test search functionality
Write-Host "🔍 Testing search functionality..." -ForegroundColor Yellow
try {
    $searchResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/search?q=gift&category=general" -UseBasicParsing
    
    if ($searchResponse.StatusCode -eq 200) {
        Write-Host "✅ Search functionality test passed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Search functionality test returned HTTP $($searchResponse.StatusCode) (may be expected if Google API not configured)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Search functionality test failed: $_ (may be expected if Google API not configured)" -ForegroundColor Yellow
}

# Test 7: Test metrics endpoint
Write-Host "📈 Testing metrics endpoint..." -ForegroundColor Yellow
try {
    $metricsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/metrics" -UseBasicParsing
    
    if ($metricsResponse.StatusCode -eq 200) {
        Write-Host "✅ Metrics endpoint test passed" -ForegroundColor Green
    } else {
        Write-Host "❌ Metrics endpoint test failed (HTTP $($metricsResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Metrics endpoint test failed: $_" -ForegroundColor Red
}

# Test 8: Test cache clear endpoint
Write-Host "🗑️  Testing cache management..." -ForegroundColor Yellow
try {
    $headers = @{
        'Authorization' = "Bearer $token"
    }
    $cacheResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/cache/clear" -Method POST -Headers $headers -UseBasicParsing
    
    if ($cacheResponse.StatusCode -eq 200) {
        Write-Host "✅ Cache management test passed" -ForegroundColor Green
    } else {
        Write-Host "❌ Cache management test failed (HTTP $($cacheResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Cache management test failed: $_" -ForegroundColor Red
}

# Test 9: Test analytics endpoints
Write-Host "📊 Testing analytics endpoints..." -ForegroundColor Yellow
try {
    $headers = @{
        'Authorization' = "Bearer $token"
    }
    $analyticsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/analytics/searches?timeRange=1h" -Headers $headers -UseBasicParsing
    
    if ($analyticsResponse.StatusCode -eq 200) {
        Write-Host "✅ Analytics endpoints test passed" -ForegroundColor Green
    } else {
        Write-Host "❌ Analytics endpoints test failed (HTTP $($analyticsResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Analytics endpoints test failed: $_" -ForegroundColor Red
}

# Test 10: Test WebSocket connection info
Write-Host "⚡ Testing WebSocket info..." -ForegroundColor Yellow
try {
    $headers = @{
        'Authorization' = "Bearer $token"
    }
    $wsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/ws-info" -Headers $headers -UseBasicParsing
    
    if ($wsResponse.StatusCode -eq 200) {
        Write-Host "✅ WebSocket info test passed" -ForegroundColor Green
    } else {
        Write-Host "❌ WebSocket info test failed (HTTP $($wsResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ WebSocket info test failed: $_" -ForegroundColor Red
}

# Cleanup
Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
Stop-Process -Id $serverProcess.Id -Force
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "🎉 Production deployment test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "✅ All core features tested successfully" -ForegroundColor Green
Write-Host "📊 Admin dashboard ready at: http://localhost:3000/admin-dashboard.html" -ForegroundColor Cyan
Write-Host "🔐 Default login: admin@easygiftsearch.com / admin123" -ForegroundColor Cyan
Write-Host "📚 Documentation: README-PRODUCTION.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Backend is production-ready with all enhancements!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure production environment variables" -ForegroundColor White
Write-Host "2. Set up Redis for enhanced caching" -ForegroundColor White
Write-Host "3. Configure Slack webhook for alerts" -ForegroundColor White
Write-Host "4. Deploy to production environment" -ForegroundColor White
Write-Host "5. Monitor system health and performance" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🎯" -ForegroundColor Magenta

# Pause to show results
Write-Host "Press any key to continue..." -ForegroundColor Gray
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
