// Analytics Service - Google Analytics 4 (GA4) integration
// Gerencia tracking de eventos e conversões no Easy Gift Search

class AnalyticsService {
  constructor() {
    this.isEnabled = false;
    this.config = null;
    this.measurementId = 'GA_MEASUREMENT_ID'; // Default fallback
    this.debugMode = false;
    
    this.init();
  }

  init() {
    // Load configuration if available
    if (typeof window !== 'undefined' && window.getAnalyticsConfig) {
      this.config = window.getAnalyticsConfig();
      this.measurementId = this.config.measurementId;
      this.debugMode = this.config.debugMode;
    }
    
    // Verifica se GA4 está carregado
    if (typeof gtag !== 'undefined') {
      this.isEnabled = true;
      
      if (this.debugMode) {
        console.log('🔍 Analytics: Modo debug ativado');
        console.log('🔍 Analytics: Configuração carregada:', this.config);
        // Em modo debug, habilita measurement protocol debug
        gtag('config', this.measurementId, {
          debug_mode: true,
          send_page_view: true
        });
      }
    } else {
      console.warn('⚠️ Analytics: Google Analytics não encontrado');
    }
  }

  // Eventos de busca e descoberta
  trackSearch(query, filters = {}) {
    if (!this.isEnabled) return;
    
    const eventData = {
      search_term: query,
      ...filters
    };
    
    gtag('event', 'search', eventData);
    
    if (this.debugMode) {
      console.log('📊 Analytics: Busca realizada', eventData);
    }
  }

  // Eventos de interação com produtos
  trackProductView(productId, productName, price, marketplace) {
    if (!this.isEnabled) return;
    
    const eventData = {
      currency: 'BRL',
      value: price,
      items: [{
        item_id: productId,
        item_name: productName,
        price: price,
        item_category: marketplace,
        quantity: 1
      }]
    };
    
    gtag('event', 'view_item', eventData);
    
    if (this.debugMode) {
      console.log('📊 Analytics: Produto visualizado', eventData);
    }
  }

  trackProductClick(productId, productName, price, marketplace, position) {
    if (!this.isEnabled) return;
    
    const eventData = {
      currency: 'BRL',
      value: price,
      items: [{
        item_id: productId,
        item_name: productName,
        price: price,
        item_category: marketplace,
        index: position,
        quantity: 1
      }]
    };
    
    gtag('event', 'select_item', eventData);
    
    if (this.debugMode) {
      console.log('📊 Analytics: Produto clicado', eventData);
    }
  }

  // Eventos de recomendação IA
  trackRecommendationRequest(query, budget) {
    if (!this.isEnabled) return;
    
    const eventData = {
      event_category: 'AI_Recommendation',
      event_label: query,
      value: budget || 0,
      custom_parameters: {
        recommendation_query: query,
        budget_range: budget
      }
    };
    
    gtag('event', 'recommendation_request', eventData);
    
    if (this.debugMode) {
      console.log('📊 Analytics: Recomendação IA solicitada', eventData);
    }
  }

  trackRecommendationResponse(query, productsCount, responseTime) {
    if (!this.isEnabled) return;
    
    const eventData = {
      event_category: 'AI_Recommendation',
      event_label: 'response_received',
      value: productsCount,
      custom_parameters: {
        query: query,
        products_returned: productsCount,
        response_time_ms: responseTime
      }
    };
    
    gtag('event', 'recommendation_response', eventData);
    
    if (this.debugMode) {
      console.log('📊 Analytics: Resposta IA recebida', eventData);
    }
  }

  // Eventos de conversão (cliques externos)
  trackConversion(productId, productName, price, marketplace, url) {
    if (!this.isEnabled) return;
    
    const eventData = {
      currency: 'BRL',
      value: price,
      transaction_id: `${Date.now()}_${productId}`,
      items: [{
        item_id: productId,
        item_name: productName,
        price: price,
        item_category: marketplace,
        quantity: 1
      }],
      custom_parameters: {
        external_url: url,
        marketplace: marketplace
      }
    };
    
    gtag('event', 'purchase_intent', eventData);
    
    if (this.debugMode) {
      console.log('📊 Analytics: Conversão (clique externo)', eventData);
    }
  }

  // Eventos de experiência do usuário
  trackLanguageChange(newLanguage, previousLanguage) {
    if (!this.isEnabled) return;
    
    const eventData = {
      event_category: 'UX',
      event_label: 'language_change',
      custom_parameters: {
        new_language: newLanguage,
        previous_language: previousLanguage
      }
    };
    
    gtag('event', 'language_change', eventData);
    
    if (this.debugMode) {
      console.log('📊 Analytics: Idioma alterado', eventData);
    }
  }

  trackDarkModeToggle(isDarkMode) {
    if (!this.isEnabled) return;
    
    const eventData = {
      event_category: 'UX',
      event_label: 'dark_mode_toggle',
      custom_parameters: {
        dark_mode_enabled: isDarkMode
      }
    };
    
    gtag('event', 'dark_mode_toggle', eventData);
    
    if (this.debugMode) {
      console.log('📊 Analytics: Modo escuro alternado', eventData);
    }
  }

  trackFilterUsage(filterType, filterValue) {
    if (!this.isEnabled) return;
    
    const eventData = {
      event_category: 'Search',
      event_label: 'filter_used',
      custom_parameters: {
        filter_type: filterType,
        filter_value: filterValue
      }
    };
    
    gtag('event', 'filter_usage', eventData);
    
    if (this.debugMode) {
      console.log('📊 Analytics: Filtro utilizado', eventData);
    }
  }

  // Eventos de erro e performance
  trackError(errorType, errorMessage, context) {
    if (!this.isEnabled) return;
    
    const eventData = {
      event_category: 'Error',
      event_label: errorType,
      custom_parameters: {
        error_message: errorMessage,
        error_context: context,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    };
    
    gtag('event', 'exception', {
      description: errorMessage,
      fatal: false,
      ...eventData
    });
    
    if (this.debugMode) {
      console.log('📊 Analytics: Erro registrado', eventData);
    }
  }

  trackPerformance(metricName, value, unit = 'ms') {
    if (!this.isEnabled) return;
    
    const eventData = {
      event_category: 'Performance',
      event_label: metricName,
      value: value,
      custom_parameters: {
        metric_unit: unit,
        timestamp: new Date().toISOString()
      }
    };
    
    gtag('event', 'timing_complete', eventData);
    
    if (this.debugMode) {
      console.log('📊 Analytics: Métrica de performance', eventData);
    }
  }

  // Configuração de usuário e sessão
  setUserProperties(properties) {
    if (!this.isEnabled) return;
    
    gtag('set', 'user_properties', properties);
    
    if (this.debugMode) {
      console.log('📊 Analytics: Propriedades do usuário definidas', properties);
    }
  }

  // Método para atualizar measurement ID em produção
  updateMeasurementId(newId) {
    this.measurementId = newId;
    
    if (this.isEnabled) {
      gtag('config', newId);
    }
  }

  // Método genérico para trackear eventos customizados
  trackEvent(eventName, eventCategory, eventLabel, eventValue) {
    if (!this.isEnabled) return;
    
    const eventData = {
      event_category: eventCategory,
      event_label: eventLabel
    };
    
    if (eventValue !== undefined) {
      eventData.value = eventValue;
    }
    
    gtag('event', eventName, eventData);
    
    if (this.debugMode) {
      console.log('📊 Analytics: Evento customizado', eventName, eventData);
    }
  }
}

// Instância global do serviço de analytics
window.analyticsService = new AnalyticsService();

// Export para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsService;
}
