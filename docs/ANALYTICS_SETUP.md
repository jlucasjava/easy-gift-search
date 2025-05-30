# 🚀 Setup do Google Analytics - Easy Gift Search

## 📋 Passo a Passo para Ativação

### 1. **Criar Conta Google Analytics 4**

1. Acesse: https://analytics.google.com
2. Clique em "Começar a medir"
3. Configure sua conta:
   - Nome da conta: "Easy Gift Search"
   - Nome da propriedade: "Easy Gift Search - Produção"
   - Fuso horário: "Brasil"
   - Moeda: "Real brasileiro (BRL)"

### 2. **Configurar Fluxo de Dados**

1. Selecione "Web"
2. Configure:
   - URL do website: `https://seudominio.com`
   - Nome do fluxo: "Website Principal"
3. **COPIE O MEASUREMENT ID** (formato: G-XXXXXXXXXX)

### 3. **Atualizar o Código**

Substitua `GA_MEASUREMENT_ID` pelo seu ID real em 2 arquivos:

#### **frontend/index.html**
```html
<!-- Linha 22: Substitua GA_MEASUREMENT_ID -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-SEU-ID-AQUI"></script>
<script>
  gtag('config', 'G-SEU-ID-AQUI', {
```

#### **frontend/js/analytics-config.js**
```javascript
// Linha 14: Substitua na seção production
production: {
  measurementId: 'G-SEU-ID-AQUI', // Seu ID real
  debugMode: false
}
```

### 4. **Testar Implementação**

1. Deploy do projeto
2. Abra o site em uma aba anônima
3. No GA4, vá em "Relatórios > Tempo real"
4. Você deve ver sua visita aparecendo

### 5. **Configurar Eventos Personalizados no GA4**

No painel do GA4:
1. Vá em "Configurar > Eventos"
2. Clique em "Criar evento"
3. Configure eventos importantes:

```
Evento: purchase_intent
Descrição: Clique para marketplace externo
Valor: Sim (para conversões)

Evento: recommendation_request  
Descrição: Solicitação de recomendação IA
Valor: Não

Evento: search
Descrição: Busca realizada
Valor: Não
```

### 6. **Configurar Conversões**

1. Vá em "Configurar > Conversões"
2. Marque como conversão:
   - `purchase_intent` (principal)
   - `select_item` (secundária)

### 7. **Criar Dashboards Personalizados**

#### **Dashboard 1: Visão Geral**
- Usuários ativos
- Sessões
- Visualizações de página
- Taxa de rejeição

#### **Dashboard 2: E-commerce**
- Eventos de produto por marketplace
- Produtos mais clicados
- Conversões por faixa de preço
- Funil: view_item → select_item → purchase_intent

#### **Dashboard 3: IA e Recomendações**
- Solicitações de recomendação por hora
- Tempo médio de resposta
- Taxa de clique em produtos recomendados

#### **Dashboard 4: UX e Preferências**
- Distribuição de idiomas
- Uso do modo escuro
- Dispositivos mais utilizados
- Erros mais frequentes

## 📊 Métricas Importantes para Acompanhar

### **KPIs Principais**
1. **Taxa de Conversão**: (purchase_intent / view_item) × 100
2. **Efetividade da IA**: (cliques em recomendados / total recomendações) × 100
3. **Engajamento**: Tempo médio na página
4. **Qualidade da Busca**: (buscas com resultados / total buscas) × 100

### **Métricas Secundárias**
- Produtos mais populares
- Marketplace preferido
- Faixa de preço mais buscada
- Preferências de idioma

## 🔍 Monitoramento Diário

### **Checklist Diário (5 minutos)**
- [ ] Verificar usuários ativos (Tempo Real)
- [ ] Conferir eventos principais funcionando
- [ ] Monitorar erros (Eventos > exception)
- [ ] Verificar conversões do dia

### **Análise Semanal (30 minutos)**
- [ ] Revisar produtos mais populares
- [ ] Analisar performance por marketplace
- [ ] Avaliar efetividade da IA
- [ ] Identificar padrões de comportamento

### **Relatório Mensal (2 horas)**
- [ ] Criar relatório de conversões
- [ ] Analisar tendências de crescimento
- [ ] Avaliar ROI por marketplace
- [ ] Planejar otimizações baseadas em dados

## 🎯 Insights Acionáveis

Com os dados coletados, você poderá:

1. **Otimizar Catálogo**: Focar nos produtos mais visualizados
2. **Melhorar IA**: Ajustar recomendações com base na aceitação
3. **Parcerias Estratégicas**: Priorizar marketplaces com melhor conversão
4. **UX Personalizada**: Adaptar interface às preferências dos usuários
5. **Marketing Direcionado**: Segmentar por comportamento e preferências

## 🚀 Próximos Passos

1. **Semana 1**: Configurar GA4 e verificar coleta de dados
2. **Semana 2**: Criar dashboards principais
3. **Semana 3**: Configurar alertas automáticos
4. **Semana 4**: Primeira análise completa e otimizações

---

**📧 Suporte**: Se precisar de ajuda, consulte a documentação em `docs/ANALYTICS.md`
