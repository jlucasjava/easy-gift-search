# 🚨 SCRIPT DE DIAGNÓSTICO VERCEL - Execute e cole os resultados

Write-Host "🔧 DIAGNÓSTICO VERCEL - EASY GIFT SEARCH" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# TESTE 1: Estrutura de Arquivos
Write-Host "📁 TESTE 1: Estrutura de Arquivos" -ForegroundColor Yellow
Write-Host "Root directory files:" -ForegroundColor White
Get-ChildItem -Path . -Name | Where-Object { $_ -like "*.json" -or $_ -like ".*" -or $_ -eq "public" -or $_ -eq "backend" -or $_ -eq "frontend" }
Write-Host ""

# TESTE 2: Verificar public/
Write-Host "📂 TESTE 2: Verificação do Diretório public/" -ForegroundColor Yellow
Write-Host "Index.html exists: $(Test-Path .\public\index.html)" -ForegroundColor White
Write-Host "CSS directory exists: $(Test-Path .\public\css)" -ForegroundColor White
Write-Host "JS directory exists: $(Test-Path .\public\js)" -ForegroundColor White
Write-Host "Total files in public/: $((Get-ChildItem -Path .\public -Recurse | Measure-Object).Count)" -ForegroundColor White
Write-Host ""

# TESTE 3: Arquivos Problemáticos
Write-Host "🚫 TESTE 3: Verificar Arquivos Problemáticos" -ForegroundColor Yellow
Write-Host "package.json in root: $(Test-Path .\package.json)" -ForegroundColor White
Write-Host "node_modules in root: $(Test-Path .\node_modules)" -ForegroundColor White
Write-Host "Package files in public/:"
Get-ChildItem -Path .\public -Name "package*" | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }
Write-Host ""

# TESTE 4: Configurações Vercel
Write-Host "⚙️ TESTE 4: Configurações Vercel" -ForegroundColor Yellow
Write-Host "vercel.json exists: $(Test-Path .\vercel.json)" -ForegroundColor White
Write-Host ".vercelignore exists: $(Test-Path .\.vercelignore)" -ForegroundColor White
if (Test-Path .\vercel.json) {
    Write-Host "vercel.json content preview:" -ForegroundColor White
    Get-Content .\vercel.json | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
}
Write-Host ""

# TESTE 5: Git Status
Write-Host "📝 TESTE 5: Status do Git" -ForegroundColor Yellow
Write-Host "Current branch: $(git branch --show-current)" -ForegroundColor White
Write-Host "Recent commits:" -ForegroundColor White
git log --oneline -3 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
Write-Host ""

# TESTE 6: Verificar Footer no index.html
Write-Host "🦶 TESTE 6: Verificar Footer no index.html" -ForegroundColor Yellow
if (Test-Path .\public\index.html) {
    $footerContent = Get-Content .\public\index.html | Select-String -Pattern "footer|Easy Gift Search|2.1.0" -SimpleMatch
    if ($footerContent) {
        Write-Host "Footer found in index.html: ✅" -ForegroundColor Green
        Write-Host "Footer lines found: $($footerContent.Count)" -ForegroundColor White
    } else {
        Write-Host "Footer NOT found in index.html: ❌" -ForegroundColor Red
    }
} else {
    Write-Host "index.html NOT found: ❌" -ForegroundColor Red
}
Write-Host ""

# TESTE 7: Verificar CSS e JS
Write-Host "🎨 TESTE 7: Verificar CSS e JS" -ForegroundColor Yellow
Write-Host "style.css exists: $(Test-Path .\public\css\style.css)" -ForegroundColor White
Write-Host "style.min.css exists: $(Test-Path .\public\css\style.min.css)" -ForegroundColor White
Write-Host "app.js exists: $(Test-Path .\public\js\app.js)" -ForegroundColor White
Write-Host "app.min.js exists: $(Test-Path .\public\js\app.min.js)" -ForegroundColor White
Write-Host ""

# RESULTADO FINAL
Write-Host "🎯 RESUMO DO DIAGNÓSTICO" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

$issues = @()
if (!(Test-Path .\public\index.html)) { $issues += "❌ index.html missing" }
if (!(Test-Path .\vercel.json)) { $issues += "❌ vercel.json missing" }
if (Test-Path .\package.json) { $issues += "❌ package.json in root (problematic)" }
if (!(Test-Path .\public\css\style.min.css)) { $issues += "❌ CSS minified missing" }
if (!(Test-Path .\public\js\app.min.js)) { $issues += "❌ JS minified missing" }

if ($issues.Count -eq 0) {
    Write-Host "✅ CONFIGURAÇÃO PARECE CORRETA!" -ForegroundColor Green
    Write-Host "✅ Todos os arquivos necessários estão presentes" -ForegroundColor Green
    Write-Host "✅ Estrutura public/ está adequada" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 PRÓXIMO PASSO: Verificar logs de build do Vercel" -ForegroundColor Yellow
} else {
    Write-Host "❌ PROBLEMAS ENCONTRADOS:" -ForegroundColor Red
    $issues | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
}

Write-Host ""
Write-Host "📋 COLE ESTE RESULTADO E OS LOGS DE BUILD DO VERCEL" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
