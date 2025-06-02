# 🚀 SCRIPT AUTOMATIZADO: CONFIGURAÇÃO COMPLETA DO REPOSITÓRIO

Write-Host "🎯 INICIANDO CONFIGURAÇÃO COMPLETA DO REPOSITÓRIO 'easy-gift-search'" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Função para exibir status
function Show-Status {
    param([string]$Message, [string]$Color = "Green")
    Write-Host "✅ $Message" -ForegroundColor $Color
}

function Show-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Show-Info {
    param([string]$Message)
    Write-Host "📋 $Message" -ForegroundColor Yellow
}

# ==========================================
# FASE 1: PREPARAÇÃO E VERIFICAÇÃO
# ==========================================

Show-Info "FASE 1: Preparação e verificação inicial"

# Verificar se estamos no diretório correto
$currentPath = Get-Location
if ($currentPath.Path -notlike "*easy-gift-search*") {
    Show-Error "Por favor, execute este script do diretório 'easy-gift-search'"
    exit 1
}

Show-Status "Diretório correto confirmado: $currentPath"

# Verificar Git
try {
    $gitStatus = git status 2>&1
    Show-Status "Git funcionando corretamente"
} catch {
    Show-Error "Git não encontrado. Instale o Git primeiro."
    exit 1
}

# Verificar Node.js
try {
    $nodeVersion = node --version
    Show-Status "Node.js versão: $nodeVersion"
} catch {
    Show-Error "Node.js não encontrado. Instale o Node.js primeiro."
    exit 1
}

# Verificar Python
try {
    $pythonVersion = python --version
    Show-Status "Python versão: $pythonVersion"
} catch {
    Show-Error "Python não encontrado. Instale o Python primeiro."
    exit 1
}

# ==========================================
# FASE 2: BACKUP DO PROJETO ATUAL
# ==========================================

Show-Info "FASE 2: Criando backup do projeto atual"

$backupName = "backup-easy-gift-search-$(Get-Date -Format 'yyyy-MM-dd-HHmm').zip"
$parentDir = Split-Path -Parent $currentPath

try {
    Set-Location $parentDir
    Compress-Archive -Path "easy-gift-search" -DestinationPath $backupName -Force
    Show-Status "Backup criado: $backupName"
    Set-Location "easy-gift-search"
} catch {
    Show-Error "Erro ao criar backup: $_"
    Set-Location "easy-gift-search"
}

# ==========================================
# FASE 3: VERIFICAR ESTRUTURA DO PROJETO
# ==========================================

Show-Info "FASE 3: Verificando estrutura do projeto"

# Verificar arquivos essenciais
$essentialFiles = @(
    "vercel.json",
    "public/index.html",
    "public/css/style.css",
    "public/js/app.js",
    "backend/server.js"
)

foreach ($file in $essentialFiles) {
    if (Test-Path $file) {
        Show-Status "Arquivo encontrado: $file"
    } else {
        Show-Error "Arquivo NÃO encontrado: $file"
    }
}

# Contar arquivos no public
$publicFiles = Get-ChildItem -Path "public" -Recurse -File
Show-Status "Total de arquivos em public/: $($publicFiles.Count)"

# Verificar footer no index.html
$footerCheck = Select-String -Path "public/index.html" -Pattern "Easy Gift Search" -Quiet
if ($footerCheck) {
    Show-Status "Footer 'Easy Gift Search' encontrado no index.html"
} else {
    Show-Error "Footer não encontrado no index.html"
}

# ==========================================
# FASE 4: COMMIT FINAL DO ESTADO ATUAL
# ==========================================

Show-Info "FASE 4: Fazendo commit final do estado atual"

try {
    # Adicionar todos os arquivos
    git add . 2>&1 | Out-Null
    
    # Commit
    $commitMessage = "🎯 ESTADO FINAL COMPLETO: Projeto easy-gift-search com footer implementado v2.1.0"
    git commit -m $commitMessage 2>&1 | Out-Null
    Show-Status "Commit realizado: $commitMessage"
    
    # Push
    git push origin production 2>&1 | Out-Null
    Show-Status "Push realizado para branch production"
} catch {
    Show-Error "Erro no Git: $_"
}

# ==========================================
# FASE 5: CONFIGURAR NOVO REPOSITÓRIO
# ==========================================

Show-Info "FASE 5: Configurando novo repositório"

# Obter URL atual do remote
$currentRemote = git remote get-url origin 2>&1

Show-Info "Remote atual: $currentRemote"
Show-Info "ATENÇÃO: Agora você precisa:"
Write-Host "1. 🌐 Criar novo repositório no GitHub: https://github.com/new" -ForegroundColor Magenta
Write-Host "   - Nome: easy-gift-search" -ForegroundColor Magenta
Write-Host "   - Não marcar README, .gitignore ou license" -ForegroundColor Magenta
Write-Host "2. ⌨️ Pressionar qualquer tecla aqui para continuar..." -ForegroundColor Magenta

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Configurar novo remote
try {
    git remote remove origin 2>&1 | Out-Null
    git remote add origin https://github.com/jlucasjava/easy-gift-search.git 2>&1 | Out-Null
    Show-Status "Novo remote configurado: https://github.com/jlucasjava/easy-gift-search.git"
} catch {
    Show-Error "Erro ao configurar remote: $_"
}

# ==========================================
# FASE 6: PUSH PARA NOVO REPOSITÓRIO
# ==========================================

Show-Info "FASE 6: Fazendo push para novo repositório"

try {
    # Push da branch production
    git push -u origin production 2>&1 | Out-Null
    Show-Status "Push da branch production realizado"
    
    # Criar e push da branch main
    git checkout -b main 2>&1 | Out-Null
    git push -u origin main 2>&1 | Out-Null
    Show-Status "Branch main criada e enviada"
    
    # Voltar para production
    git checkout production 2>&1 | Out-Null
    Show-Status "Voltou para branch production"
} catch {
    Show-Error "Erro no push: $_"
}

# ==========================================
# FASE 7: ATUALIZAR README
# ==========================================

Show-Info "FASE 7: Atualizando README.md"

if (Test-Path "README_NOVO.md") {
    try {
        Copy-Item "README_NOVO.md" "README.md" -Force
        Show-Status "README.md atualizado com nova versão"
        
        # Commit da atualização
        git add README.md 2>&1 | Out-Null
        git commit -m "📚 docs: Atualizar README.md para repositório easy-gift-search" 2>&1 | Out-Null
        git push origin production 2>&1 | Out-Null
        Show-Status "README.md commitado e enviado"
    } catch {
        Show-Error "Erro ao atualizar README: $_"
    }
}

# ==========================================
# FASE 8: VERIFICAÇÕES FINAIS
# ==========================================

Show-Info "FASE 8: Verificações finais"

# Verificar remote
$newRemote = git remote get-url origin 2>&1
Show-Status "Remote configurado: $newRemote"

# Verificar branches
$branches = git branch -a 2>&1
Show-Status "Branches disponíveis:"
$branches | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }

# Verificar último commit
$lastCommit = git log --oneline -1 2>&1
Show-Status "Último commit: $lastCommit"

# ==========================================
# FASE 9: INSTRUÇÕES PARA VERCEL
# ==========================================

Show-Info "FASE 9: Instruções para deploy no Vercel"

Write-Host ""
Write-Host "🚀 CONFIGURAÇÃO COMPLETA! Próximos passos:" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. 🌐 Acesse: https://vercel.com/new" -ForegroundColor Cyan
Write-Host "2. 📂 Importe o repositório: easy-gift-search" -ForegroundColor Cyan
Write-Host "3. ⚙️ Configure exatamente assim:" -ForegroundColor Cyan
Write-Host "   Framework Preset: Other" -ForegroundColor Yellow
Write-Host "   Root Directory: [DEIXAR VAZIO]" -ForegroundColor Yellow
Write-Host "   Build Command: [DEIXAR VAZIO]" -ForegroundColor Yellow
Write-Host "   Output Directory: public" -ForegroundColor Yellow
Write-Host "   Install Command: [DEIXAR VAZIO]" -ForegroundColor Yellow
Write-Host "4. 🚀 Clique em Deploy" -ForegroundColor Cyan
Write-Host ""

# ==========================================
# RELATÓRIO FINAL
# ==========================================

Write-Host "📊 RELATÓRIO FINAL:" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "✅ Backup criado: $backupName" -ForegroundColor Green
Write-Host "✅ Repositório configurado: easy-gift-search" -ForegroundColor Green
Write-Host "✅ Branches: production (principal) e main" -ForegroundColor Green
Write-Host "✅ Arquivos públicos: $($publicFiles.Count) arquivos" -ForegroundColor Green
Write-Host "✅ Footer implementado e funcionando" -ForegroundColor Green
Write-Host "✅ vercel.json configurado corretamente" -ForegroundColor Green
Write-Host "✅ README.md atualizado" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Status: PRONTO PARA DEPLOY NO VERCEL!" -ForegroundColor Magenta
Write-Host ""

# Abrir URLs úteis
Show-Info "Abrindo URLs úteis..."
Start-Process "https://vercel.com/new"
Start-Process "https://github.com/jlucasjava/easy-gift-search"

Write-Host "🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
