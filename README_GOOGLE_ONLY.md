# Easy Gift Search - Google Custom Search Edition

Uma aplicação para busca de presentes utilizando exclusivamente a API do Google Custom Search.

## Visão Geral

Easy Gift Search é uma ferramenta que ajuda os usuários a encontrar ideias de presentes com base em critérios como gênero, idade, interesses e faixa de preço. Esta versão foi simplificada para utilizar apenas a API do Google Custom Search, oferecendo:

- Pesquisa de produtos com filtros
- Recomendações personalizadas
- Interface amigável e responsiva

## Tecnologias

- **Backend**: Node.js, Express
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **API Externa**: Google Custom Search API

## Configuração

### Pré-requisitos

- Node.js (v14 ou superior)
- Conta Google com acesso ao Google Cloud Platform
- Chave de API do Google e ID do mecanismo de pesquisa personalizado (CSE ID)

### Configuração da API do Google

1. Crie uma conta no [Google Cloud Platform](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative a API do Google Custom Search
4. Crie uma chave de API
5. Crie um mecanismo de pesquisa personalizado em [Programmable Search Engine](https://programmablesearchengine.google.com/)
6. Anote a chave de API e o CSE ID

Para instruções detalhadas, consulte o guia [GOOGLE_SEARCH_API_SETUP_GUIDE.md](GOOGLE_SEARCH_API_SETUP_GUIDE.md).

### Instalação

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/easy-gift-search.git
   cd easy-gift-search
   ```

2. Instale as dependências:
   ```
   npm install
   cd backend
   npm install
   ```

3. Configure as variáveis de ambiente:
   
   Crie um arquivo `.env` na pasta raiz e outro na pasta `backend`, com base nos exemplos `.env.example`:
   
   ```
   GOOGLE_API_KEY=sua_chave_api_do_google
   GOOGLE_CSE_ID=seu_id_cse
   ```

4. Inicie o servidor:
   ```
   cd backend
   npm start
   ```

5. Abra a aplicação no navegador:
   ```
   http://localhost:3000
   ```

## Estrutura do Projeto

```
easy-gift-search/
├── backend/             # API Node.js/Express
│   ├── controllers/     # Controladores de rotas
│   ├── routes/          # Definições de rotas
│   ├── services/        # Serviços para APIs externas
│   ├── config/          # Configurações
│   ├── server.js        # Ponto de entrada do servidor
│   └── package.json     # Dependências do backend
├── public/              # Frontend
│   ├── css/             # Estilos
│   ├── js/              # JavaScript do cliente
│   └── images/          # Imagens e ícones
├── index.html           # Página principal
└── package.json         # Dependências do projeto
```

## API Endpoints

### Pesquisa de Produtos

```
GET /api/products/search
```

Parâmetros:
- `query`: Termo de pesquisa
- `precoMin`: Preço mínimo (opcional)
- `precoMax`: Preço máximo (opcional)
- `genero`: masculino/feminino (opcional)
- `idade`: Faixa etária (opcional)
- `page`: Número da página (opcional, padrão: 1)

### Recomendações

```
POST /api/recommend
```

Body:
```json
{
  "idade": 30,
  "genero": "masculino",
  "interesses": "tecnologia, esportes",
  "precoMax": 200
}
```

## Testes

Execute o script de teste consolidado para verificar a integração com a API do Google:

```
cd backend
node test-google-only-consolidated.js
```

## Validação Final

Para verificar se a migração para a versão Google-only foi completada com sucesso, use o checklist de validação:

```
final-validation-google-only.html
```

## Manutenção

### Logs e Monitoramento

A aplicação registra logs detalhados para facilitar a depuração:

- Sucesso/falha nas chamadas de API
- Erros de integração
- Comportamento do usuário

### Solução de Problemas Comuns

- **Erro "API Key não configurada"**: Verifique se as variáveis GOOGLE_API_KEY e GOOGLE_CSE_ID estão definidas no arquivo .env
- **Erro "Limite de quota excedido"**: A API gratuita do Google tem limites diários. Considere atualizar para um plano pago.
- **Resultados inadequados**: Ajuste as configurações do seu mecanismo de pesquisa personalizado no site do Google.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
