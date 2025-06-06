# 🔧 GUIA PASSO-A-PASSO VERCEL - CONFIGURAÇÃO URGENTE
**Baseado na análise dos logs de produção**

## 🎯 PROBLEMA CONFIRMADO
**Sua aplicação está funcionando 100% em modo DEMO porque as variáveis de ambiente não estão configuradas no Vercel.**

## 📋 SOLUÇÃO PASSO-A-PASSO

### **PASSO 1: Acessar Vercel Dashboard**
1. Vá para: **https://vercel.com/dashboard**
2. Faça login na sua conta
3. Encontre o projeto: **`easy-gift-search`**
4. Clique no nome do projeto

### **PASSO 2: Ir para Environment Variables**
1. Clique na aba **"Settings"** (no topo)
2. No menu lateral esquerdo, clique em **"Environment Variables"**
3. Você verá uma lista das variáveis atuais (provavelmente só `RAPIDAPI_KEY_NEW`)

### **PASSO 3: Adicionar Variáveis Faltantes**
**Clique em "Add New" para cada variável:**

#### **Variáveis de Controle (5 variáveis):**
```
Name: USE_REAL_AMAZON_API
Value: true
Environment: Production, Preview, Development
```

```
Name: USE_REAL_SHOPEE_API  
Value: true
Environment: Production, Preview, Development
```

```
Name: USE_REAL_ALIEXPRESS_API
Value: true
Environment: Production, Preview, Development
```

```
Name: USE_REAL_MERCADOLIVRE_API
Value: true
Environment: Production, Preview, Development
```

```
Name: USE_REAL_REALTIME_API
Value: true
Environment: Production, Preview, Development
```

#### **Chaves de API (4 variáveis):**
```
Name: RAPIDAPI_KEY
Value: [sua_chave_rapidapi_real]
Environment: Production, Preview, Development
```

```
Name: RAPIDAPI_KEY_NEW
Value: [sua_chave_rapidapi_real]  # MESMO valor que acima
Environment: Production, Preview, Development
```

```
Name: SHOPEE_SCRAPER_API_KEY
Value: [sua_chave_shopee_real]
Environment: Production, Preview, Development
```

```
Name: OPENAI_API_KEY
Value: [sua_chave_openai_real]
Environment: Production, Preview, Development
```

#### **Ambiente:**
```
Name: NODE_ENV
Value: production
Environment: Production
```

### **PASSO 4: Aguardar Redeploy Automático**
- Vercel iniciará redeploy automaticamente
- Aguarde 2-3 minutos para conclusão
- Você verá a notificação de deploy bem-sucedido

### **PASSO 5: Validar Funcionamento**
1. Acesse: **https://easy-gift-search.vercel.app/api/status**
2. Deve mostrar: **"5/5 APIs ativas"**
3. Teste uma busca real na aplicação

## ⚠️ PONTOS IMPORTANTES

### **CHAVES REAIS NECESSÁRIAS:**
- **RAPIDAPI_KEY:** Sua chave do RapidAPI (mesmo valor para ambas)
- **SHOPEE_SCRAPER_API_KEY:** Chave específica do Shopee
- **OPENAI_API_KEY:** Sua chave da OpenAI

### **NÃO USE PLACEHOLDERS:**
❌ `your_rapidapi_key_here`  
✅ `abc123def456ghi789...` (chave real)

## 📊 RESULTADO ESPERADO

### **Logs APÓS configuração:**
```
📋 USE_REAL_AMAZON_API: true ✅
📋 USE_REAL_SHOPEE_API: true ✅
📋 USE_REAL_ALIEXPRESS_API: true ✅
📋 USE_REAL_MERCADOLIVRE_API: true ✅
📋 USE_REAL_REALTIME_API: true ✅

🔑 RAPIDAPI_KEY: ✅ Configurada
🔑 RAPIDAPI_KEY_NEW: ✅ Configurada  
🔑 SHOPEE_SCRAPER_API_KEY: ✅ Configurada
🔑 OPENAI_API_KEY: ✅ Configurada

🔧 STATUS GERAL: PRODUÇÃO ATIVA (5/5 APIs reais)
```

## 🚀 TEMPO TOTAL: 5-10 MINUTOS

**Sua aplicação sairá do modo DEMO e terá acesso real a todos os marketplaces!**

---
✅ **Configure agora para ativar todas as funcionalidades em produção.**
