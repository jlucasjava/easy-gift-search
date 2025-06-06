# 🔧 GUIA COMPLETO DE CONFIGURAÇÃO DE PRODUÇÃO
**Data:** 06/06/2025 - 17:35  
**Prioridade:** CRÍTICA

## 🚨 PROBLEMA IDENTIFICADO: INCONSISTÊNCIA DE VARIÁVEIS

### **INCONSISTÊNCIA DETECTADA:**
```javascript
// ❌ PROBLEMA: Alguns serviços usam RAPIDAPI_KEY, outros RAPIDAPI_KEY_NEW
// Amazon Service: process.env.RAPIDAPI_KEY
// AliExpress Service: process.env.RAPIDAPI_KEY_NEW  
// NewApis Controller: process.env.RAPIDAPI_KEY_NEW || process.env.RAPIDAPI_KEY
```

## 📋 CONFIGURAÇÃO OBRIGATÓRIA NA PLATAFORMA DE DEPLOY

### **PASSO 1: ACESSAR DASHBOARD**
- **Render:** Dashboard → Seu App → Environment
- **Vercel:** Dashboard → Projeto → Settings → Environment Variables

### **PASSO 2: ADICIONAR TODAS AS VARIÁVEIS**

```bash
# ========== CONTROLE DE APIs ==========
USE_REAL_AMAZON_API=true
USE_REAL_SHOPEE_API=true
USE_REAL_ALIEXPRESS_API=true
USE_REAL_MERCADOLIVRE_API=true
USE_REAL_REALTIME_API=true

# ========== CHAVES DE API ==========
# IMPORTANTE: Adicionar AMBAS as versões para compatibilidade
RAPIDAPI_KEY=[sua_chave_rapidapi_real]
RAPIDAPI_KEY_NEW=[sua_chave_rapidapi_real]

SHOPEE_SCRAPER_API_KEY=[sua_chave_shopee_real]
OPENAI_API_KEY=[sua_chave_openai_real]

# ========== CONFIGURAÇÕES DE AMBIENTE ==========
NODE_ENV=production
```

### **PASSO 3: VALIDAR CONFIGURAÇÃO**

#### **Valores Reais Necessários:**
- **RAPIDAPI_KEY:** Sua chave do RapidAPI (mesmo valor para ambas)
- **RAPIDAPI_KEY_NEW:** Mesma chave do RapidAPI
- **SHOPEE_SCRAPER_API_KEY:** Chave específica do Shopee Scraper
- **OPENAI_API_KEY:** Sua chave da OpenAI

## 🎯 RESULTADO ESPERADO APÓS CONFIGURAÇÃO

### **ANTES (ATUAL):**
```
🔧 STATUS GERAL: MODO DEMO (0/5 APIs reais)
📦 AMAZON: ❌ MOCK (RAPIDAPI_KEY undefined)
🛍️ SHOPEE: ❌ MOCK (USE_REAL_SHOPEE_API undefined)
🛒 ALIEXPRESS: ❌ MOCK (RAPIDAPI_KEY_NEW undefined)
🏪 MERCADO LIVRE: ❌ MOCK (USE_REAL_MERCADOLIVRE_API undefined)
🕒 REAL-TIME: ❌ MOCK (USE_REAL_REALTIME_API false)
```

### **DEPOIS (OBJETIVO):**
```
🔧 STATUS GERAL: PRODUÇÃO ATIVA (5/5 APIs reais)
📦 AMAZON: ✅ API REAL (RAPIDAPI_KEY configurada)
🛍️ SHOPEE: ✅ API REAL (SHOPEE_SCRAPER_API_KEY configurada)
🛒 ALIEXPRESS: ✅ API REAL (RAPIDAPI_KEY_NEW configurada)
🏪 MERCADO LIVRE: ✅ API REAL (configuração ativa)
🕒 REAL-TIME: ✅ API REAL (RAPIDAPI_KEY configurada)
```

## 🛠️ COMANDOS PARA TESTAR APÓS DEPLOY

### **1. Verificar Status das APIs:**
```bash
curl https://[seu-app].render.com/api/status
```

### **2. Testar Busca Real:**
```bash
curl -X POST https://[seu-app].render.com/api/products/search \
  -H "Content-Type: application/json" \
  -d '{"query": "smartphone"}'
```

## ⚠️ CHECKLIST CRÍTICO

### **ANTES DO REDEPLOY:**
- [ ] ✅ Todas as 8 variáveis configuradas
- [ ] ✅ RAPIDAPI_KEY e RAPIDAPI_KEY_NEW com mesmo valor
- [ ] ✅ Chaves reais (não placeholders como [SUA_CHAVE])
- [ ] ✅ USE_REAL_* definidas como 'true' (string)

### **APÓS REDEPLOY:**
- [ ] ✅ Acessar `/api/status` e verificar 5/5 APIs ativas
- [ ] ✅ Testar busca real retornando dados reais
- [ ] ✅ Verificar logs sem mensagens de "MOCK" ou "undefined"

## 🚀 AÇÃO IMEDIATA NECESSÁRIA

**PRIORIDADE MÁXIMA:** Configure as variáveis de ambiente agora para ativar todas as funcionalidades da aplicação em produção.

**Tempo estimado:** 5-10 minutos + tempo de redeploy da plataforma.
