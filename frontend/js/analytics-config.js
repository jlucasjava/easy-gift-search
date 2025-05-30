// Analytics Configuration - Easy Gift Search
// Este arquivo contém configurações específicas para Google Analytics

const ANALYTICS_CONFIG = {
  // Configurações de ambiente
  development: {
    measurementId: 'GA_MEASUREMENT_ID', // Placeholder para desenvolvimento
    debugMode: true,
    enableConsoleLogs: true
  },
  
  production: {
    measurementId: 'G-XXXXXXXXXX', // Substitua pelo seu ID real do GA4
    debugMode: false,
    enableConsoleLogs: false
  },
  
  // Eventos personalizados mapeados
  customEvents: {
    // Eventos de e-commerce
    PRODUCT_VIEW: 'view_item',
    PRODUCT_CLICK: 'select_item',
    PURCHASE_INTENT: 'purchase_intent',
    
    // Eventos de recomendação IA
    AI_RECOMMENDATION_REQUEST: 'recommendation_request',
    AI_RECOMMENDATION_RESPONSE: 'recommendation_response',
    
    // Eventos de UX
    LANGUAGE_CHANGE: 'language_change',
    DARK_MODE_TOGGLE: 'dark_mode_toggle',
    FILTER_USAGE: 'filter_usage',
    
    // Eventos de busca
    SEARCH: 'search',
    
    // Eventos de erro e performance
    ERROR: 'exception',
    PERFORMANCE: 'timing_complete'
  },
  
  // Dimensões customizadas
  customDimensions: {
    USER_LANGUAGE: 'user_language',
    DEVICE_TYPE: 'device_type',
    MARKETPLACE: 'marketplace',
    SEARCH_FILTERS: 'search_filters',
    AI_QUERY_TYPE: 'ai_query_type'
  },
  
  // Métricas customizadas
  customMetrics: {
    RESPONSE_TIME: 'response_time_ms',
    PRODUCTS_RETURNED: 'products_count',
    CONVERSION_VALUE: 'conversion_value'
  },
  
  // Enhanced ecommerce settings
  ecommerce: {
    currency: 'BRL',
    trackImpressions: true,
    trackClicks: true,
    trackPurchaseIntent: true
  },
  
  // GDPR/Privacy settings
  privacy: {
    anonymizeIp: true,
    respectDnt: true, // Respect Do Not Track
    cookieConsent: false, // Set to true when cookie consent is implemented
    dataRetention: '26_months'
  },
  
  // Performance monitoring
  performance: {
    trackPageLoadTime: true,
    trackApiResponseTime: true,
    trackUserInteractionTime: true,
    sampleRate: 100 // 100% for development, consider reducing for production
  }
};

// Função para obter configuração baseada no ambiente
function getAnalyticsConfig() {
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('localhost');
  
  const baseConfig = isDevelopment ? ANALYTICS_CONFIG.development : ANALYTICS_CONFIG.production;
  
  return {
    ...baseConfig,
    ...ANALYTICS_CONFIG.customEvents,
    ...ANALYTICS_CONFIG.customDimensions,
    ...ANALYTICS_CONFIG.customMetrics,
    ...ANALYTICS_CONFIG.ecommerce,
    ...ANALYTICS_CONFIG.privacy,
    ...ANALYTICS_CONFIG.performance
  };
}

// Exportar configuração
if (typeof window !== 'undefined') {
  window.ANALYTICS_CONFIG = ANALYTICS_CONFIG;
  window.getAnalyticsConfig = getAnalyticsConfig;
}

// Para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ANALYTICS_CONFIG, getAnalyticsConfig };
}
