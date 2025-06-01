# 🚀 GUIA COMPLETO: Como Testar o Projeto Easy Gift Search Localmente

## 📋 PRÉ-REQUISITOS

Antes de começar, certifique-se de que você tem:
- ✅ **Node.js** instalado (versão 16+)
- ✅ **Python** instalado (versão 3.6+)
- ✅ **PowerShell** (já disponível no Windows)

---

## 🖥️ PASSO 1: INICIAR O SERVIDOR BACKEND

### Opção A - Manual (Recomendado):
1. **Abra um novo PowerShell como Administrador**
2. **Execute os comandos**:
```powershell
cd "c:\Users\ROSARJOS\OneDrive - Mars Inc\2025\Easy\easy-gift-search\backend"
node server.js
```

### Opção B - Automático:
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\ROSARJOS\OneDrive - Mars Inc\2025\Easy\easy-gift-search\backend'; node server.js"
```

**✅ Confirmação de Sucesso:**
```
🚀 Servidor rodando na porta 3000
📡 APIs configuradas e prontas!
🔗 CORS habilitado para localhost:5500
```

---

## 🌐 PASSO 2: INICIAR O SERVIDOR FRONTEND

### Opção A - Manual (Recomendado):
1. **Abra outro PowerShell**
2. **Execute os comandos**:
```powershell
cd "c:\Users\ROSARJOS\OneDrive - Mars Inc\2025\Easy\easy-gift-search\frontend"
python -m http.server 5500
```

### Opção B - Automático:
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\ROSARJOS\OneDrive - Mars Inc\2025\Easy\easy-gift-search\frontend'; python -m http.server 5500"
```

**✅ Confirmação de Sucesso:**
```
Serving HTTP on :: port 5500 (http://[::]:5500/) ...
```

---

## 🌍 PASSO 3: ACESSAR NO BROWSER

### **🎯 SITE PRINCIPAL:**
```
🔗 URL: http://localhost:5500
📱 Mobile: http://localhost:5500 (teste responsividade)
```

### **🧪 PÁGINAS DE TESTE:**

#### 1. **Teste de Integração Completa:**
```
🔗 URL: http://localhost:5500/test-comprehensive-integration.html
📋 Função: Testa todas as APIs e funcionalidades
```

#### 2. **Demo de Funcionalidades:**
```
🔗 URL: http://localhost:5500/demo-funcionalidades-completas.html
📋 Função: Demonstração interativa de recursos
```

#### 3. **Teste Final de Integração:**
```
🔗 URL: http://localhost:5500/final-integration-test.html
📋 Função: Validação final de todas as integrações
```

#### 4. **Teste de Analytics:**
```
🔗 URL: http://localhost:5500/test-analytics.html
📋 Função: Teste do sistema de analytics
```

---

## 🔧 PASSO 4: TESTAR FUNCIONALIDADES

### **✅ TESTE DO FOOTER (NOVA IMPLEMENTAÇÃO):**
1. **Acesse**: http://localhost:5500
2. **Role até o final da página**
3. **Verifique**:
   - ✅ Site name: "Easy Gift Search"
   - ✅ Versão: "2.1.0"
   - ✅ Email: contato@easygift.com
   - ✅ Copyright: "© 2025 Easy Gift Search..."
   - ✅ Links: Política de Privacidade | Termos de Uso

4. **Clique nos links** para testar os modais

### **🤖 TESTE DAS APIS:**
1. **Busca Normal**: Digite "presente" e clique em "Buscar"
2. **Busca com IA**: Clique no botão "🤖 IA"
3. **Filtros**: Teste preço, idade, gênero
4. **Localização**: Digite uma cidade no campo opcional

### **📱 TESTE RESPONSIVO:**
1. **Redimensione a janela** do browser
2. **Use F12** → Device Toolbar
3. **Teste em**:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1024px+)

### **🌙 TESTE MODO DARK:**
1. **Clique no botão** 🌙/☀️ no header
2. **Verifique** se o tema muda corretamente
3. **Teste** se o footer fica bonito no modo dark

---

## 🔍 PASSO 5: VERIFICAR LOGS

### **Backend Logs (Terminal 1):**
```
✅ Servidor iniciado
✅ Conexões de API
✅ Requisições recebidas
❌ Erros (se houver)
```

### **Frontend Logs (Browser F12):**
```javascript
// Console do navegador deve mostrar:
✅ Analytics configurado
✅ APIs conectadas
✅ Eventos trackeados
❌ Erros JavaScript (se houver)
```

---

## 🚨 TROUBLESHOOTING

### **❌ Backend não inicia:**
```powershell
# Verificar Node.js
node --version

# Reinstalar dependências
cd "c:\Users\ROSARJOS\OneDrive - Mars Inc\2025\Easy\easy-gift-search\backend"
npm install
```

### **❌ Frontend não carrega:**
```powershell
# Verificar Python
python --version

# Alternativa com Node.js
npx http-server -p 5500 -c-1
```

### **❌ CORS Error:**
- ✅ Certifique-se que o backend está rodando na porta 3000
- ✅ Frontend deve estar na porta 5500
- ✅ Verifique se ambos estão funcionando

### **❌ APIs não respondem:**
- ✅ Verifique arquivo `.env` no backend
- ✅ Confirme se as chaves de API estão configuradas
- ✅ Teste conectividade com internet

---

## 📊 ENDPOINTS PARA TESTE DIRETO

### **🔗 API Backend (http://localhost:3000):**

#### Busca de Produtos:
```
GET http://localhost:3000/api/products?query=presente&precoMin=10&precoMax=100
```

#### Recomendação IA:
```
POST http://localhost:3000/api/recommend
Content-Type: application/json
{
  "idade": 25,
  "genero": "feminino"
}
```

#### Busca com IA:
```
POST http://localhost:3000/api/ai-search
Content-Type: application/json
{
  "query": "presente para mãe",
  "budget": "50-100"
}
```

#### Lojas Próximas:
```
GET http://localhost:3000/api/nearby-stores?city=São Paulo
```

---

## 🎯 CHECKLIST DE TESTE

### **Frontend:**
- [ ] Página principal carrega corretamente
- [ ] Footer com todas as informações aparece
- [ ] Modais de Política/Termos funcionam
- [ ] Formulário de busca responsivo
- [ ] Botão IA visível e funcional
- [ ] Modo dark funciona
- [ ] Responsividade em mobile

### **Backend:**
- [ ] Servidor inicia na porta 3000
- [ ] APIs respondem sem erro
- [ ] CORS configurado corretamente
- [ ] Logs aparecem no terminal

### **Integração:**
- [ ] Busca normal retorna produtos
- [ ] Busca IA funciona
- [ ] Filtros são aplicados
- [ ] Localização funciona
- [ ] Analytics tracking ativo

---

## 🏁 URLS FINAIS PARA TESTE

### **✅ PRINCIPAIS:**
- **Site**: http://localhost:5500
- **Backend**: http://localhost:3000
- **Teste Completo**: http://localhost:5500/test-comprehensive-integration.html

### **🧪 TESTES:**
- **Demo**: http://localhost:5500/demo-funcionalidades-completas.html
- **Integração**: http://localhost:5500/final-integration-test.html
- **Analytics**: http://localhost:5500/test-analytics.html

**🎊 Agora você pode testar o projeto completo localmente!**
