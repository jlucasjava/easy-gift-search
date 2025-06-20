# 🚀 TUTORIAL COMPLETO - Configurar Variáveis no Vercel Dashboard

## 📋 **PASSO A PASSO DETALHADO**

### **PASSO 1: ACESSAR O VERCEL DASHBOARD**

1. **Abra o navegador** e vá para: https://vercel.com/dashboard
2. **Faça login** com sua conta (GitHub, GitLab, Bitbucket ou email)
3. **Você verá uma lista dos seus projetos**

### **PASSO 2: ENCONTRAR SEU PROJETO**

1. **Procure pelo projeto:** `easy-gift-search`
2. **Clique no nome do projeto** (não nos botões ao lado)
3. **Você será direcionado para a página do projeto**

### **PASSO 3: ACESSAR AS CONFIGURAÇÕES**

1. **No menu lateral esquerdo**, procure por **"Settings"** (Configurações)
2. **Clique em "Settings"**
3. **Você verá várias opções no submenu**

### **PASSO 4: IR PARA ENVIRONMENT VARIABLES**

1. **No submenu de Settings**, procure por **"Environment Variables"**
2. **Clique em "Environment Variables"**
3. **Você verá a página de variáveis de ambiente**

## 🔧 **CONFIGURANDO AS VARIÁVEIS**

### **PASSO 5: ADICIONAR CADA VARIÁVEL**

Para **CADA variável** abaixo, você vai repetir este processo:

1. **Clique no botão "Add New"** (ou "New Variable")
2. **Preencha os campos:**
   - **Name:** (nome da variável)
   - **Value:** (valor da variável)
   - **Environment:** Selecione **"Production"** ✅

3. **Clique em "Save"**

### **📝 LISTA COMPLETA DAS 9 VARIÁVEIS**

#### **🎛️ VARIÁVEIS DE CONTROLE (5 variáveis)**

**Variável 1:**
```
Name: USE_REAL_AMAZON_API
Value: true
Environment: Production ✅
```

**Variável 2:**
```
Name: USE_REAL_SHOPEE_API
Value: true
Environment: Production ✅
```

**Variável 3:**
```
Name: USE_REAL_ALIEXPRESS_API
Value: true
Environment: Production ✅
```

**Variável 4:**
```
Name: USE_REAL_MERCADOLIVRE_API
Value: true
Environment: Production ✅
```

**Variável 5:**
```
Name: USE_REAL_REALTIME_API
Value: true
Environment: Production ✅
```

#### **🔑 CHAVES DE API (4 variáveis)**

**Variável 6:**
```
Name: RAPIDAPI_KEY
Value: [SUA_CHAVE_RAPIDAPI_AQUI]
Environment: Production ✅
```

**Variável 7:**
```
Name: SHOPEE_SCRAPER_API_KEY
Value: [SUA_CHAVE_SHOPEE_AQUI]
Environment: Production ✅
```

**Variável 8:**
```
Name: OPENAI_API_KEY
Value: [SUA_CHAVE_OPENAI_AQUI]
Environment: Production ✅
```

**Variável 9:**
```
Name: NODE_ENV
Value: production
Environment: Production ✅
```

## 🔑 **ONDE ENCONTRAR SUAS CHAVES DE API**

### **RAPIDAPI_KEY**
1. Vá para: https://rapidapi.com/
2. Faça login na sua conta
3. Clique em seu perfil → **"My Apps"**
4. Clique em **"Security"** 
5. Copie a **"Application Key"**

### **SHOPEE_SCRAPER_API_KEY**
1. Vá para: https://rapidapi.com/
2. Procure por **"Shopee Scraper"** 
3. Ou use a mesma chave do RapidAPI se for a mesma plataforma

### **OPENAI_API_KEY**
1. Vá para: https://platform.openai.com/
2. Faça login na sua conta
3. Clique em **"API Keys"** no menu lateral
4. Clique em **"Create new secret key"**
5. Copie a chave gerada

## ⚠️ **PONTOS IMPORTANTES**

### **✅ CERTIFIQUE-SE DE:**
- [ ] Todas as 9 variáveis foram adicionadas
- [ ] Environment está marcado como **"Production"**
- [ ] Os valores estão corretos (sem espaços extras)
- [ ] As chaves de API são válidas e ativas

### **🚫 EVITE:**
- ❌ Deixar campos em branco
- ❌ Usar valores de teste/desenvolvimento
- ❌ Esquecer de selecionar "Production"
- ❌ Copiar chaves com espaços extras

## 🚀 **APÓS CONFIGURAR TODAS AS VARIÁVEIS**

### **PASSO 6: AGUARDAR REDEPLOY**
1. **O Vercel fará redeploy automático** (2-3 minutos)
2. **Você verá na aba "Deployments"** o progresso
3. **Aguarde aparecer "Ready"** ✅

### **PASSO 7: VALIDAR A CORREÇÃO**
1. **Abra uma nova aba** e vá para:
   ```
   https://easy-gift-search.vercel.app/api/status
   ```
2. **Você deve ver:**
   ```json
   {
     "status": "success",
     "message": "APIs reais ativas: 5/5",
     ...
   }
   ```

## 🎯 **VERIFICAÇÃO FINAL**

### **✅ CHECKLIST DE SUCESSO:**
- [ ] 9 variáveis configuradas no Vercel
- [ ] Redeploy concluído com sucesso
- [ ] /api/status mostra "5/5 APIs ativas"
- [ ] Teste de busca retorna produtos reais

### **❌ SE ALGO DEU ERRADO:**
1. **Verifique os logs** na aba "Functions" do Vercel
2. **Confirme as variáveis** em Settings → Environment Variables
3. **Tente redeploy manual** na aba "Deployments"

## 📞 **PRECISA DE AJUDA?**

Se você tiver dificuldades em qualquer passo:

1. **Tire uma screenshot** da tela onde está com dúvida
2. **Verifique se está logado** na conta certa do Vercel
3. **Confirme se o projeto** easy-gift-search está visível
4. **Tente atualizar a página** se não vir as opções

---

## 🎉 **RESULTADO FINAL**

Após seguir todos os passos, sua aplicação estará com **TODAS as 5 APIs ativas** em produção, oferecendo dados reais dos marketplaces para seus usuários!

**Tempo total:** ~10-15 minutos
**Dificuldade:** Fácil (apenas configuração)
**Resultado:** Aplicação 100% funcional em produção ✅
