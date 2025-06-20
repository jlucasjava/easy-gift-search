# 🚀 GUIA DE CORREÇÃO URGENTE - VERCEL CONFIGURAÇÃO

## ⚡ AÇÃO IMEDIATA NECESSÁRIA

### 🎯 **OBJETIVO**
Ativar **TODAS as 5 APIs** em produção configurando as variáveis de ambiente ausentes no Vercel Dashboard.

## 📋 **PASSO A PASSO**

### **PASSO 1: ACESSAR VERCEL DASHBOARD**
1. 🌐 Ir para: https://vercel.com/dashboard
2. 🔐 Fazer login na sua conta
3. 📁 Selecionar o projeto: **easy-gift-search**
4. ⚙️ Clicar em **Settings** (menu lateral)
5. 🔧 Clicar em **Environment Variables**

### **PASSO 2: ADICIONAR VARIÁVEIS FALTANTES**

#### 🔑 **CHAVES DE API (4 variáveis)**
```bash
Nome: RAPIDAPI_KEY
Valor: [SUA_CHAVE_RAPIDAPI_AQUI]
Environment: Production ✅

Nome: SHOPEE_SCRAPER_API_KEY  
Valor: [SUA_CHAVE_SHOPEE_AQUI]
Environment: Production ✅

Nome: OPENAI_API_KEY
Valor: [SUA_CHAVE_OPENAI_AQUI]
Environment: Production ✅

Nome: NODE_ENV
Valor: production
Environment: Production ✅
```

#### 🎛️ **CONTROLES DE API (5 variáveis)**
```bash
Nome: USE_REAL_AMAZON_API
Valor: true
Environment: Production ✅

Nome: USE_REAL_SHOPEE_API
Valor: true
Environment: Production ✅

Nome: USE_REAL_ALIEXPRESS_API
Valor: true
Environment: Production ✅

Nome: USE_REAL_MERCADOLIVRE_API
Valor: true
Environment: Production ✅

Nome: USE_REAL_REALTIME_API
Valor: true
Environment: Production ✅
```

### **PASSO 3: VALIDAR CONFIGURAÇÃO**
Após adicionar todas as variáveis, você deve ter:

#### ✅ **VARIÁVEIS CONFIGURADAS (10 total)**
- [x] RAPIDAPI_KEY_NEW *(já existe)*
- [x] RAPIDAPI_KEY *(nova)*
- [x] SHOPEE_SCRAPER_API_KEY *(nova)*
- [x] OPENAI_API_KEY *(nova)*
- [x] NODE_ENV *(nova)*
- [x] USE_REAL_AMAZON_API *(nova)*
- [x] USE_REAL_SHOPEE_API *(nova)*
- [x] USE_REAL_ALIEXPRESS_API *(nova)*
- [x] USE_REAL_MERCADOLIVRE_API *(nova)*
- [x] USE_REAL_REALTIME_API *(nova)*

### **PASSO 4: AGUARDAR REDEPLOY**
1. ⏱️ O Vercel fará redeploy automático (2-3 minutos)
2. 🔔 Você receberá notificação de deploy completo
3. 📱 Ou acesse a aba **Deployments** para acompanhar

### **PASSO 5: TESTAR CORREÇÃO**
#### 🧪 **Teste 1: Status das APIs**
```bash
URL: https://easy-gift-search.vercel.app/api/status
Resultado esperado: "APIs reais ativas: 5/5"
```

#### 🛒 **Teste 2: Busca Real**
```bash
URL: https://easy-gift-search.vercel.app
1. Digite: "notebook gamer"
2. Clique em "Buscar"
3. Verificar se produtos são REAIS (não mock)
```

## 🚨 **ONDE ENCONTRAR AS CHAVES DE API**

### 🔑 **RAPIDAPI_KEY**
- Site: https://rapidapi.com/
- Painel: My Apps → Security
- Mesmo valor que RAPIDAPI_KEY_NEW

### 🛍️ **SHOPEE_SCRAPER_API_KEY**
- Site: RapidAPI → Shopee Scraper
- Ou: Painel do provedor da API Shopee

### 🤖 **OPENAI_API_KEY**
- Site: https://platform.openai.com/
- Painel: API Keys → Create new secret key

## ⚠️ **PONTOS IMPORTANTES**

### ✅ **CERTIFIQUE-SE**
- [ ] Todas as 9 variáveis foram adicionadas
- [ ] Environment está marcado como "Production"
- [ ] Valores das chaves estão corretos
- [ ] Não há espaços extras nos valores

### 🚫 **EVITAR**
- ❌ Deixar variáveis em branco
- ❌ Usar valores de desenvolvimento
- ❌ Esquecer de marcar "Production"
- ❌ Usar chaves expiradas

## 🕒 **TEMPO ESTIMADO**
- Configuração: 5-10 minutos
- Redeploy: 2-3 minutos
- Teste: 1-2 minutos
- **Total: ~15 minutos**

## 📞 **EM CASO DE DÚVIDA**
Se algo não funcionar:
1. 🔍 Verificar logs em: Vercel → Functions → Logs
2. 🧪 Testar novamente: /api/status
3. 🔄 Tentar redeploy manual se necessário

---
**STATUS APÓS CORREÇÃO:** 5/5 APIs ATIVAS em produção ✅
