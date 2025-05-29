# Easy Gift Search

Plataforma web para busca e recomendação inteligente de presentes, integrando APIs de marketplaces e OpenAI.

## Funcionalidades
- Busca de produtos com filtros: preço, idade, gênero e categoria
- Recomendações inteligentes via OpenAI
- Integração com Mercado Livre, Shopee, Amazon e AliExpress
- Busca rápida com Elasticsearch
- Grid responsivo 3x3 com paginação
- Favoritos e histórico apenas no frontend/localStorage
- **Sem persistência local ou banco de dados**

## Arquitetura
- Backend: Node.js + Express
- Frontend: HTML5, CSS3, JavaScript puro
- Integrações: OpenAI, Marketplaces, Elasticsearch

## Estrutura de Pastas
```
/easy-gift-search
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── config/
│   └── server.js
├── frontend/
│   ├── css/
│   ├── js/
│   ├── index.html
│   └── assets/
├── docs/
├── README.md
└── .gitignore
```

## Como rodar
1. Instale as dependências do backend:
   ```
   cd backend
   npm install
   ```
2. Inicie o backend:
   ```
   node server.js
   ```
3. Abra o arquivo `frontend/index.html` no navegador.

## Roadmap
1. Backend com integração OpenAI, Mercado Livre e Elasticsearch
2. Frontend responsivo com grid, filtros e paginação
3. (Removido) Sistema de feedback persistente do usuário
4. Testes de performance
5. Publicação beta
6. Coleta de feedback (apenas mock, sem persistência)

---
Desenvolvido por [Seu Nome].
