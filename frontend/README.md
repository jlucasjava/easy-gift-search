# Easy Gift Search – Frontend

Frontend estático para o Easy Gift Search, uma aplicação de busca e recomendação inteligente de presentes, integrando marketplaces e IA.

## Deploy rápido na Vercel

1. Faça login em [https://vercel.com/](https://vercel.com/)
2. Clique em **Add New > Project** e selecione o repositório.
3. Em "Root Directory", selecione `frontend`.
4. Framework: **Other** (ou Static)
5. Clique em **Deploy**.

## Configuração do Backend (API)
- O frontend já está configurado para usar automaticamente a API de produção Render:
  - `https://easy-gift-35cs.onrender.com/api`
- Para rodar localmente, basta rodar o backend em `localhost:3000`.

## Domínio customizado
- No painel da Vercel, acesse o projeto e clique em **Settings > Domains**.
- Adicione seu domínio (ex: `presentesinteligentes.com.br`).
- Siga as instruções para configurar o DNS.
- Após propagação, o frontend estará disponível no domínio customizado.

## Funcionalidades
- Busca e recomendação inteligente de presentes
- Integração com Mercado Livre, Shopee, Amazon, AliExpress e OpenAI
- Favoritos (localStorage), dark mode, internacionalização (PT/EN), acessibilidade
- SEO otimizado, performance (minificação, lazy loading)

## Estrutura
- `index.html` – página principal
- `css/` – estilos (minificados para produção)
- `js/` – scripts (minificados para produção)
- `assets/` – imagens e ícones

---

**Dúvidas?**
Abra uma issue ou entre em contato pelo repositório principal.
