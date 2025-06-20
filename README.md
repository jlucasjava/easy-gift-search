# Easy Gift Search

Plataforma web para busca e recomendação de presentes, integrada exclusivamente com Google Custom Search API.

## Funcionalidades
- Busca de produtos com filtros: preço, idade e gênero
- Recomendações baseadas em Google Custom Search
- Grid responsivo 3x3 com paginação
- Favoritos armazenados apenas no frontend/localStorage
- Fallback para resultados simulados quando a API não está disponível
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
- Fallback para resultados simulados quando a API não está disponível ou não configurada

## Resultados Simulados
Quando a API do Google não está disponível ou não está configurada corretamente, o sistema utiliza um mecanismo de fallback que:

1. Gera resultados simulados com dados realistas
2. Utiliza links reais para produtos em marketplaces brasileiros conhecidos (Amazon, Magazine Luiza, Americanas, etc.)
3. Mantém a consistência da experiência do usuário mesmo sem acesso à API
4. Permite testar a interface e a funcionalidade sem consumir quota da API

Para testar os resultados simulados:
1. Configure `USE_GOOGLE_SEARCH_API=false` no arquivo .env
2. Ou deixe a API key inválida/vazia

## Scripts de Teste e Validação
O projeto inclui scripts para testar diferentes aspectos do sistema:
- `testar-links-simulados.bat` - Verifica se os links simulados apontam para marketplaces reais
- `testar-integracao-frontend.bat` - Testa a integração dos dados formatados com o frontend

---
Desenvolvido por Easy Gift Search Team.
