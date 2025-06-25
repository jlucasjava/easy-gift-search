# Instruções para Commit e Push das Alterações

## Passos para Executar Manualmente

1. Abra o Explorador de Arquivos do Windows
2. Navegue até a pasta do projeto: `c:\Users\ROSARJOS\OneDrive - Mars Inc\2025\Easy\easy-gift-search`
3. Dê um duplo clique no arquivo `commit-e-push-google-api.bat`
4. Siga as instruções exibidas na janela do prompt de comando

## Verificação Após o Commit e Push

Após concluir o commit e push, verifique se as alterações foram enviadas corretamente:

1. Acesse o repositório Git online (GitHub, GitLab, etc.)
2. Verifique se os novos arquivos estão presentes:
   - `verificar-google-search-render.js`
   - `corrigir-deteccao-google-search.js`
   - `testar-google-search-api.js`
   - `GUIA_COMPLETO_ATIVACAO_GOOGLE_RENDER.md`
   - `GUIA_RAPIDO_CORRECAO_GOOGLE_API.md`
   - etc.

## Conteúdo do Commit

O commit será realizado com a seguinte mensagem:

```
fix: Correcao da configuracao da Google Custom Search API
```

E a seguinte descrição:

```
- Melhorada a deteccao da variavel USE_GOOGLE_SEARCH_API
- Adicionados scripts para verificacao e correcao
- Criada documentacao atualizada para configuracao no Render
```

## Alternativa: Comandos Git Manuais

Se preferir, você pode executar os comandos Git manualmente:

```bash
# Abra um prompt de comando ou PowerShell
cd "c:\Users\ROSARJOS\OneDrive - Mars Inc\2025\Easy\easy-gift-search"
git add .
git commit -m "fix: Correcao da configuracao da Google Custom Search API" -m "- Melhorada a deteccao da variavel USE_GOOGLE_SEARCH_API\n- Adicionados scripts para verificacao e correcao\n- Criada documentacao atualizada para configuracao no Render"
git push
```
