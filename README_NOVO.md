# 🎁 Easy Gift Search

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jlucasjava/easy-gift-search)
[![GitHub](https://img.shields.io/github/license/jlucasjava/easy-gift-search)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](package.json)

> 🤖 **AI-powered gift finder with marketplace integration and responsive design**

Um sistema inteligente de busca de presentes que utiliza IA para encontrar produtos perfeitos em diversos marketplaces, com design responsivo e experiência de usuário otimizada.

## 🌟 Características Principais

### 🔍 **Busca Inteligente**
- **Busca tradicional** por palavras-chave
- **Busca com IA** para recomendações personalizadas
- **Filtros avançados** (preço, idade, gênero)
- **Localização de lojas** próximas

### 🎨 **Interface Moderna**
- **Design responsivo** (mobile-first)
- **Modo dark/light** com transições suaves
- **Glassmorphism** e elementos modernos
- **Acessibilidade WCAG AA** compliant

### ⚡ **Performance**
- **CSS/JS minificados** para carregamento rápido
- **Cache otimizado** com Vercel
- **PWA ready** com Service Workers
- **Analytics integrado** para insights

### 🤖 **Integração com IA**
- **OpenAI GPT** para recomendações
- **Processamento de linguagem natural**
- **Análise de preferências** do usuário
- **Sugestões contextuais**

## 🚀 Demo Online

🌐 **Site em Produção:** [https://easy-gift-search.vercel.app](https://easy-gift-search.vercel.app)

### 📱 **Páginas de Teste:**
- [Demo Completo](https://easy-gift-search.vercel.app/demo-funcionalidades-completas.html)
- [Teste de Integração](https://easy-gift-search.vercel.app/test-comprehensive-integration.html)
- [Analytics Test](https://easy-gift-search.vercel.app/test-analytics.html)

## 📦 Instalação e Uso

### 🔧 **Pré-requisitos**
- Node.js 16+
- Python 3.6+
- Git

### 🏠 **Teste Local**

1. **Clone o repositório:**
```bash
git clone https://github.com/jlucasjava/easy-gift-search.git
cd easy-gift-search
```

2. **Inicie o backend:**
```bash
cd backend
node server.js
```

3. **Inicie o frontend (novo terminal):**
```bash
cd frontend
python -m http.server 5500
```

4. **Acesse:** http://localhost:5500

### 📋 **Guia Completo de Teste**
Consulte: [GUIA_TESTE_LOCAL.md](GUIA_TESTE_LOCAL.md)

## 🏗️ Arquitetura

### 📁 **Estrutura do Projeto**
```
easy-gift-search/
├── 📄 README.md
├── ⚙️ vercel.json (configuração Vercel)
├── 🌐 public/ (produção - 26 arquivos)
│   ├── 📱 index.html (footer implementado)
│   ├── 🎨 css/ (estilos responsivos)
│   ├── ⚡ js/ (funcionalidades + IA)
│   └── 🖼️ assets/
├── 🔧 backend/ (APIs Node.js)
│   ├── server.js
│   ├── routes/ (endpoints)
│   └── services/ (integrações)
├── 🚧 frontend/ (desenvolvimento)
├── 📚 docs/ (documentação)
└── 🧪 testes/
```

### 🔌 **APIs Integradas**
- **OpenAI API** - Recomendações IA
- **Amazon Product API** - Busca de produtos
- **Bing Maps API** - Localização de lojas
- **Analytics API** - Tracking de eventos

## 🎯 Funcionalidades Detalhadas

### 🔍 **Sistema de Busca**
```javascript
// Busca tradicional
/api/products?query=presente&precoMin=10&precoMax=100

// Busca com IA
/api/ai-search
{
  "query": "presente para mãe",
  "budget": "50-100",
  "preferences": ["tecnologia", "casa"]
}
```

### 🤖 **Recomendação IA**
```javascript
// Endpoint de recomendação
/api/recommend
{
  "idade": 25,
  "genero": "feminino",
  "ocasiao": "aniversario",
  "budget": "100-200"
}
```

### 📍 **Localização**
```javascript
// Busca lojas próximas
/api/nearby-stores?city=São Paulo&radius=10
```

## 🦶 Footer Implementado

### ✅ **Informações Incluídas:**
- **Nome do Site:** Easy Gift Search
- **Versão:** 2.1.0
- **Email de Suporte:** contato@easygift.com
- **Copyright:** © 2025 Easy Gift Search. Todos os direitos reservados
- **Links Legais:** Política de Privacidade | Termos de Uso

### 🎨 **Design:**
- **Glassmorphism** com blur e transparência
- **Responsivo** para todos os dispositivos
- **Modais interativos** para Política/Termos
- **Acessibilidade** completa

## ⚙️ Deploy no Vercel

### 🔧 **Configuração Vercel:**
```json
{
  "version": 2,
  "builds": [{"src": "public/**/*", "use": "@vercel/static"}],
  "routes": [
    {"src": "/", "dest": "/public/index.html"},
    {"src": "/(.*)", "dest": "/public/$1"}
  ]
}
```

### 📋 **Configurações Dashboard:**
```
Framework Preset: Other
Root Directory: [vazio]
Output Directory: public
Build Command: [vazio]
```

## 🧪 Testes

### 🔍 **Teste Local:**
```bash
# Backend
cd backend && node server.js

# Frontend
cd frontend && python -m http.server 5500
```

### ✅ **Checklist de Teste:**
- [ ] Site carrega sem erros
- [ ] Footer aparece com todas as informações
- [ ] Busca por produtos funciona
- [ ] Filtros funcionam
- [ ] Busca IA responde
- [ ] Design responsivo OK
- [ ] Modo dark/light funciona
- [ ] Modais de Política/Termos funcionam

## 📊 Analytics

### 📈 **Métricas Trackadas:**
- Buscas realizadas
- Filtros utilizados
- Produtos visualizados
- Conversões
- Tempo de sessão
- Dispositivos utilizados

## 🔒 Segurança

### 🛡️ **Medidas Implementadas:**
- **CORS** configurado
- **Rate limiting** nas APIs
- **Sanitização** de inputs
- **Headers de segurança**
- **HTTPS** obrigatório

## 🤝 Contribuição

### 📝 **Como Contribuir:**
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### 🐛 **Reportar Bugs:**
Abra uma [issue](https://github.com/jlucasjava/easy-gift-search/issues) com:
- Descrição do problema
- Passos para reproduzir
- Screenshots (se aplicável)
- Informações do ambiente

## 📚 Documentação

### 📖 **Guias Disponíveis:**
- [Guia de Teste Local](GUIA_TESTE_LOCAL.md)
- [Configuração Vercel](docs/VERCEL_SETUP.md)
- [APIs Documentation](docs/API_DOCS.md)
- [Frontend Guide](docs/FRONTEND_GUIDE.md)

### 🔗 **Links Úteis:**
- [Vercel Dashboard](https://vercel.com/dashboard)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [GitHub Repository](https://github.com/jlucasjava/easy-gift-search)

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Autor

**Lucas Java** - [@jlucasjava](https://github.com/jlucasjava)

## 🙏 Agradecimentos

- OpenAI pela API de IA
- Vercel pelo hosting
- Comunidade open source
- Todos os contributors

---

<div align="center">

### 🎁 **Easy Gift Search - Encontre o presente perfeito com IA!**

[![Stars](https://img.shields.io/github/stars/jlucasjava/easy-gift-search?style=social)](https://github.com/jlucasjava/easy-gift-search/stargazers)
[![Forks](https://img.shields.io/github/forks/jlucasjava/easy-gift-search?style=social)](https://github.com/jlucasjava/easy-gift-search/network/members)
[![Issues](https://img.shields.io/github/issues/jlucasjava/easy-gift-search)](https://github.com/jlucasjava/easy-gift-search/issues)

**Desenvolvido com ❤️ para facilitar a busca por presentes perfeitos**

</div>
