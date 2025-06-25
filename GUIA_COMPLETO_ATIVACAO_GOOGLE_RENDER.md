# GUIA COMPLETO: ATIVAÇÃO DA GOOGLE CUSTOM SEARCH API NO RENDER

## 📌 PROBLEMA ATUAL

A Google Custom Search API está configurada corretamente nos arquivos locais, mas não está sendo reconhecida como ativa no ambiente de produção (Render). Isso impede o retorno de produtos reais nas buscas.

## 🔍 CAUSA IDENTIFICADA

O problema está relacionado à leitura da variável de ambiente `USE_GOOGLE_SEARCH_API` no Render. Embora ela esteja definida como `true` nos arquivos locais, o servidor Render pode estar:

1. Não recebendo corretamente a variável de ambiente
2. Armazenando-a com um formato diferente (ex: booleano vs string)
3. Tendo problemas de cache que impedem a atualização das variáveis

## ✅ SOLUÇÃO PASSO A PASSO

### 1️⃣ VERIFICAÇÃO DO AMBIENTE LOCAL

Primeiro, vamos verificar se as variáveis estão configuradas corretamente no ambiente local:

```bash
# Execute o script de verificação
node verificar-google-search-render.js
```

Este script irá:
- Verificar todas as variáveis de ambiente relacionadas à Google API
- Validar se elas estão sendo reconhecidas corretamente
- Gerar instruções detalhadas para configuração no Render

### 2️⃣ CONFIGURAÇÃO DO AMBIENTE RENDER

Acesse o dashboard do Render e siga estas etapas:

1. **Faça login no Render Dashboard**
   - URL: https://dashboard.render.com/

2. **Selecione o serviço**
   - Procure e selecione o serviço "easy-gift-search"

3. **Acesse as configurações de ambiente**
   - Clique na aba "Environment"

4. **Remova as variáveis existentes relacionadas ao Google**
   - Encontre e **REMOVA** as seguintes variáveis:
     - USE_GOOGLE_SEARCH_API
     - GOOGLE_SEARCH_API_KEY
     - GOOGLE_SEARCH_CX
   - Isso é importante para garantir que não haja conflitos ou valores antigos em cache

5. **Adicione novamente as variáveis**
   - Clique em "Add Environment Variable"
   - Adicione cada uma das seguintes variáveis:
   
   ```
   USE_GOOGLE_SEARCH_API=true
   GOOGLE_SEARCH_API_KEY=AIzaSyBs07nRYL0fYREou8gwDkS7fruBydwXfvI
   GOOGLE_SEARCH_CX=e17d0e713876e4dca
   ```
   
   - Atenção: Certifique-se de que não há espaços extras antes ou depois dos valores
   - Marque a opção "Secret" para as chaves de API

6. **Salve as alterações**
   - Clique em "Save Changes"
   - Aguarde a mensagem de confirmação

### 3️⃣ FORCE UM DEPLOY COM CACHE LIMPO

Após configurar as variáveis, é essencial forçar um novo deploy com cache limpo:

1. **Inicie um deploy manual**
   - Clique em "Manual Deploy" no menu à direita
   - Selecione a opção "Clear Build Cache & Deploy"
   - Isso garantirá que todas as configurações anteriores sejam removidas

2. **Aguarde a conclusão do deploy**
   - Observe a barra de progresso
   - O processo geralmente leva de 3 a 5 minutos

### 4️⃣ VERIFICAÇÃO APÓS O DEPLOY

Depois que o deploy for concluído, verifique se a API está funcionando:

1. **Verifique os logs**
   - Clique na aba "Logs"
   - Procure pelas mensagens de inicialização do servidor
   - Confirme que aparece: `🎉 STATUS GERAL: GOOGLE CUSTOM SEARCH API ATIVA`

2. **Teste a API diretamente**
   - Execute o script de teste de configuração:
   ```bash
   node testar-configuracao-render.js
   ```
   - Este script irá validar se a API está respondendo corretamente

3. **Verifique a aplicação no navegador**
   - Acesse a URL da aplicação
   - Faça uma busca por produtos
   - Confirme que os resultados mostrados são reais (não simulados)
   - Verifique se as imagens e links dos produtos funcionam corretamente

## 🔄 SOLUÇÃO ALTERNATIVA (SE NECESSÁRIO)

Se após seguir todos os passos acima a API ainda não estiver funcionando, considere estas alternativas:

1. **Modificar o código para aceitar outros formatos**
   - Edite o arquivo `backend/config/apiStatus.js` para aceitar mais formatos para a variável:
   ```javascript
   const googleSearchEnabled = process.env.USE_GOOGLE_SEARCH_API === 'true' || 
                              process.env.USE_GOOGLE_SEARCH_API === true || 
                              process.env.USE_GOOGLE_SEARCH_API === '1' ||
                              process.env.USE_GOOGLE_SEARCH_API == true;
   ```

2. **Forçar a ativação por código**
   - Se necessário, crie uma versão especial para produção que force a ativação da API:
   ```javascript
   // No início do arquivo apiStatus.js
   if (process.env.NODE_ENV === 'production') {
     process.env.USE_GOOGLE_SEARCH_API = 'true';
   }
   ```

## 📋 VERIFICAÇÃO FINAL

Para confirmar que tudo está funcionando corretamente, acesse:

```
https://easy-gift-search.onrender.com/api/status
```

Você deve ver uma resposta JSON contendo:
```json
{
  "status": "online",
  "apis": {
    "google": {
      "enabled": true,
      "apiKeyConfigured": true,
      "cxConfigured": true
    }
  }
}
```

## 📞 SUPORTE

Se você continuar enfrentando problemas após seguir todas estas etapas, verifique:

1. A documentação do Render sobre variáveis de ambiente
2. Os logs detalhados da aplicação para identificar erros específicos
3. Se há restrições de acesso à API do Google no ambiente Render

---

Data de atualização: 21/06/2023
