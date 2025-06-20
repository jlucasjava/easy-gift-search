@echo off
echo ==========================================================
echo GUIA DE DEPLOY FINAL DO EASY GIFT SEARCH - VERSAO GOOGLE ONLY
echo ==========================================================
echo.
echo Este script fornece instruções para completar o deploy na Vercel
echo ou outro serviço de hospedagem.
echo.
echo ETAPA 1: VERIFICAR VARIÁVEIS DE AMBIENTE DE PRODUÇÃO
echo ----------------------------------------------------
echo As seguintes variáveis de ambiente devem ser configuradas no painel
echo do serviço de hospedagem:
echo.
echo   GOOGLE_SEARCH_API_KEY = [sua_chave_de_api_do_google]
echo   GOOGLE_SEARCH_CX = [seu_id_cx_do_google]
echo   USE_GOOGLE_SEARCH_API = true
echo   NODE_ENV = production
echo   PORT = 3000 (ou conforme recomendado pelo serviço)
echo.
echo ETAPA 2: INICIAR O DEPLOY NO SERVIÇO
echo ------------------------------------
echo 1. Acesse o painel da Vercel (https://vercel.com/dashboard)
echo 2. Selecione o projeto ou crie um novo importando o repositório
echo 3. Configure as variáveis de ambiente listadas acima
echo 4. Inicie o deploy manual ou aguarde o deploy automático se configurado
echo.
echo ETAPA 3: VERIFICAR O DEPLOY
echo --------------------------
echo Após o deploy, execute os seguintes testes:
echo 1. Acesse o site e verifique se a página inicial carrega
echo 2. Realize uma busca e confirme que resultados são exibidos
echo 3. Teste a paginação e os filtros
echo 4. Verifique se os skeleton loaders estão funcionando
echo 5. Acesse [URL_DO_SITE]/api/test para verificar o status da API
echo 6. Acesse [URL_DO_SITE]/api/monitor/quota para verificar a quota da API do Google
echo.
echo ETAPA 4: MONITORAMENTO PÓS-DEPLOY
echo --------------------------------
echo Após o deploy bem-sucedido, monitore:
echo 1. O uso da API do Google em [URL_DO_SITE]/api/monitor/quota
echo 2. O status e estatísticas do cache em [URL_DO_SITE]/api/monitor/cache
echo 3. Os logs de erros no painel do serviço de hospedagem
echo.
echo LEMBRETES IMPORTANTES:
echo ---------------------
echo - O plano gratuito da API Google Custom Search permite apenas 100 consultas por dia
echo - Utilize o cache eficientemente para economizar chamadas à API
echo - Configure alertas de quota se possível
echo.
echo Para ajuda adicional, consulte:
echo - MELHORIAS_UX_E_MONITORAMENTO.md
echo - IMPLEMENTACAO_GOOGLE_CUSTOM_SEARCH.md
echo - GOOGLE_SEARCH_API_SETUP_GUIDE.md
echo.
echo ==========================================================
echo CHECKLIST FINAL DE DEPLOY:
echo.
echo [_] Variáveis de ambiente configuradas
echo [_] Deploy iniciado/concluído
echo [_] Testes pós-deploy realizados
echo [_] Monitoramento configurado
echo ==========================================================
echo.
echo Pressione qualquer tecla para sair...
