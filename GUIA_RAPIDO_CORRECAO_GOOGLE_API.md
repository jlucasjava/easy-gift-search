# GUIA RÁPIDO: CORRIGIR GOOGLE SEARCH API NO RENDER

## 📋 PASSO A PASSO EXATO PARA CORREÇÃO

1. **Execute o script de verificação**
   ```
   executar-verificacao.bat
   ```
   Este script instalará as dependências necessárias e verificará a configuração atual.

2. **Execute o script para corrigir o código**
   ```
   node corrigir-deteccao-google-search.js
   ```
   Este script modifica os arquivos para melhorar a detecção da variável USE_GOOGLE_SEARCH_API.

3. **Configure o Render (ambiente de produção)**
   - Acesse o dashboard do Render (https://dashboard.render.com/)
   - Selecione o serviço "easy-gift-search"
   - Clique na aba "Environment"
   - **REMOVA** as variáveis antigas: USE_GOOGLE_SEARCH_API, GOOGLE_SEARCH_API_KEY, GOOGLE_SEARCH_CX
   - Adicione novamente as variáveis (exatamente como mostrado abaixo):
   ```
   USE_GOOGLE_SEARCH_API=true
   GOOGLE_SEARCH_API_KEY=AIzaSyBs07nRYL0fYREou8gwDkS7fruBydwXfvI
   GOOGLE_SEARCH_CX=e17d0e713876e4dca
   ```
   - Marque "Secret" para as chaves de API
   - Clique em "Save Changes"

4. **Force um novo deploy com cache limpo**
   - Clique em "Manual Deploy"
   - Selecione "Clear Build Cache & Deploy"
   - Aguarde a conclusão do deploy

5. **Verifique se a API está funcionando**
   - Acesse os logs no Render após o deploy
   - Procure pela mensagem: `🎉 STATUS GERAL: GOOGLE CUSTOM SEARCH API ATIVA`
   - Acesse a aplicação e faça uma busca para confirmar que está retornando produtos reais

## ⚠️ SE AINDA TIVER PROBLEMAS

Se após seguir todos os passos acima a API ainda não estiver funcionando, execute:

```
node testar-google-search-api.js
```

Este script fará testes específicos e mostrará sugestões detalhadas para correção.

## 📞 VERIFICAÇÃO FINAL

Para confirmar que tudo está funcionando, acesse:

```
https://easy-gift-search.onrender.com/api/status
```

Você deve ver uma resposta JSON com `googleSearchEnabled: true`.
