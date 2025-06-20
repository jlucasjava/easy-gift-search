# Easy Gift Search

Plataforma web para busca e recomendação de presentes, integrada exclusivamente com Google Custom Search API.

## Funcionalidades
- Busca de produtos com filtros: preço, idade e gênero
- Recomendações baseadas em Google Custom Search
- Grid responsivo 3x3 com paginação
- Favoritos armazenados apenas no frontend/localStorage
- **Sem persistência local ou banco de dados**

## Arquitetura
- Backend: Node.js + Express
- Frontend: HTML5, CSS3, JavaScript puro
- Integrações: Google Custom Search API

## Estrutura de Pastas
```
/easy-gift-search
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── config/
│   └── server.js
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── index.html
├── docs/
├── README.md
└── .gitignore
```

## Configuração
1. Configure as seguintes variáveis de ambiente:
   ```
   GOOGLE_SEARCH_API_KEY=sua-chave-google-api-aqui
   GOOGLE_SEARCH_CX=seu-cx-id-aqui
   USE_GOOGLE_SEARCH_API=true
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
3. Acesse `http://localhost:3000` no navegador.

## Integração com Google Custom Search
Esta aplicação foi refatorada para utilizar exclusivamente a API Google Custom Search para todas as buscas e recomendações de produtos. A integração permite:

- Busca de produtos em toda a web
- Resultados formatados e apresentados em um grid amigável
- Filtragem por termos específicos

---
Desenvolvido por Easy Gift Search Team.
