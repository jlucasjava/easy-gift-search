/**
 * 🚀 REAL-TIME ANALYTICS SERVICE
 * Easy Gift Search - Advanced Analytics & Business Intelligence
 */

const EventEmitter = require('events');
const { advancedLogger } = require('./advancedLogger');
const moment = require('moment');

class AnalyticsService extends EventEmitter {
  constructor() {
    super();
    
    // Analytics data storage
    this.analytics = {
      searches: new Map(),
      users: new Map(),
      performance: new Map(),
      business: new Map(),
      errors: new Map(),
      realTime: {
        activeUsers: new Set(),
        currentSearches: 0,
        serverLoad: 0,
        errorRate: 0
      }
    };

    // Time series data
    this.timeSeries = {
      searches: [],
      performance: [],
      errors: [],
      users: []
    };

    // Initialize cleanup interval
    this.setupCleanupInterval();
    
    advancedLogger.info('Analytics Service initialized');
  }

  // Track search event
  trackSearch(data) {
    const timestamp = new Date();
    const searchId = `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const searchData = {
      id: searchId,
      query: data.query,
      userId: data.userId || 'anonymous',
      userAgent: data.userAgent,
      ip: data.ip,
      resultsCount: data.resultsCount || 0,
      responseTime: data.responseTime || 0,
      timestamp,
      success: data.success || false,
      source: data.source || 'google',
      category: data.category || 'general',
      filters: data.filters || {},
      location: data.location || null
    };

    // Store search data
    this.analytics.searches.set(searchId, searchData);
    
    // Update time series
    this.timeSeries.searches.push({
      timestamp,
      query: data.query,
      responseTime: data.responseTime,
      success: data.success,
      resultsCount: data.resultsCount
    });

    // Update real-time metrics
    this.analytics.realTime.currentSearches++;
    
    // Track user
    if (data.userId) {
      this.trackUser(data.userId, { lastSearch: timestamp, query: data.query });
    }

    // Emit event for real-time updates
    this.emit('search', searchData);
    
    advancedLogger.info('Search tracked', { 
      searchId, 
      query: data.query, 
      userId: data.userId,
      responseTime: data.responseTime
    });

    return searchId;
  }

  // Track user activity
  trackUser(userId, data) {
    const timestamp = new Date();
    
    let userData = this.analytics.users.get(userId) || {
      id: userId,
      firstSeen: timestamp,
      lastSeen: timestamp,
      searchCount: 0,
      totalTime: 0,
      searches: [],
      preferences: {},
      location: null
    };

    // Update user data
    userData.lastSeen = timestamp;
    userData.searchCount++;
    
    if (data.query) {
      userData.searches.push({
        query: data.query,
        timestamp,
        responseTime: data.responseTime || 0
      });
    }

    if (data.location) {
      userData.location = data.location;
    }

    // Update preferences based on search patterns
    if (data.category) {
      userData.preferences[data.category] = (userData.preferences[data.category] || 0) + 1;
    }

    this.analytics.users.set(userId, userData);
    
    // Update real-time active users
    this.analytics.realTime.activeUsers.add(userId);

    // Emit user event
    this.emit('user', userData);
  }

  // Track performance metrics
  trackPerformance(data) {
    const timestamp = new Date();
    const performanceId = `perf-${Date.now()}`;
    
    const performanceData = {
      id: performanceId,
      timestamp,
      responseTime: data.responseTime || 0,
      memoryUsage: data.memoryUsage || process.memoryUsage(),
      cpuUsage: data.cpuUsage || process.cpuUsage(),
      endpoint: data.endpoint || 'unknown',
      method: data.method || 'GET',
      statusCode: data.statusCode || 200,
      contentLength: data.contentLength || 0,
      cacheHit: data.cacheHit || false
    };

    this.analytics.performance.set(performanceId, performanceData);
    
    // Update time series
    this.timeSeries.performance.push({
      timestamp,
      responseTime: data.responseTime,
      memoryUsage: data.memoryUsage?.heapUsed || 0,
      cpuUsage: data.cpuUsage?.user || 0
    });

    // Update real-time server load
    this.analytics.realTime.serverLoad = data.responseTime || 0;

    this.emit('performance', performanceData);
  }

  // Track error
  trackError(error, context = {}) {
    const timestamp = new Date();
    const errorId = `error-${Date.now()}`;
    
    const errorData = {
      id: errorId,
      timestamp,
      message: error.message || error,
      stack: error.stack || null,
      type: error.constructor?.name || 'Error',
      endpoint: context.endpoint || 'unknown',
      userId: context.userId || 'anonymous',
      userAgent: context.userAgent || null,
      ip: context.ip || null,
      severity: context.severity || 'error'
    };

    this.analytics.errors.set(errorId, errorData);
    
    // Update time series
    this.timeSeries.errors.push({
      timestamp,
      type: errorData.type,
      severity: errorData.severity,
      endpoint: errorData.endpoint
    });

    // Update real-time error rate
    this.updateErrorRate();

    this.emit('error', errorData);
    
    advancedLogger.error('Error tracked', { errorId, message: error.message });
  }

  // Update real-time error rate
  updateErrorRate() {
    const now = new Date();
    const oneMinuteAgo = new Date(now - 60000);
    
    const recentErrors = this.timeSeries.errors.filter(
      error => error.timestamp > oneMinuteAgo
    );
    
    this.analytics.realTime.errorRate = recentErrors.length;
  }

  // Get search analytics
  getSearchAnalytics(timeRange = '24h') {
    const now = new Date();
    const startTime = this.getStartTime(timeRange);
    
    const searches = Array.from(this.analytics.searches.values())
      .filter(search => search.timestamp >= startTime);

    return {
      total: searches.length,
      successful: searches.filter(s => s.success).length,
      failed: searches.filter(s => !s.success).length,
      averageResponseTime: this.calculateAverage(searches, 'responseTime'),
      averageResults: this.calculateAverage(searches, 'resultsCount'),
      topQueries: this.getTopQueries(searches),
      searchesByHour: this.groupByHour(searches),
      sourceDistribution: this.getSourceDistribution(searches)
    };
  }

  // Get user analytics
  getUserAnalytics(timeRange = '24h') {
    const now = new Date();
    const startTime = this.getStartTime(timeRange);
    
    const users = Array.from(this.analytics.users.values())
      .filter(user => user.lastSeen >= startTime);

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.lastSeen >= new Date(now - 3600000)).length, // 1 hour
      averageSearchesPerUser: this.calculateAverage(users, 'searchCount'),
      topUsers: users.sort((a, b) => b.searchCount - a.searchCount).slice(0, 10),
      usersByHour: this.groupUsersByHour(users),
      topPreferences: this.getTopPreferences(users)
    };
  }

  // Get performance analytics
  getPerformanceAnalytics(timeRange = '24h') {
    const startTime = this.getStartTime(timeRange);
    
    const performance = Array.from(this.analytics.performance.values())
      .filter(perf => perf.timestamp >= startTime);

    return {
      totalRequests: performance.length,
      averageResponseTime: this.calculateAverage(performance, 'responseTime'),
      slowestEndpoints: this.getSlowestEndpoints(performance),
      performanceByHour: this.groupByHour(performance, 'responseTime'),
      cacheHitRate: this.calculateCacheHitRate(performance),
      statusCodeDistribution: this.getStatusCodeDistribution(performance)
    };
  }

  // Get error analytics
  getErrorAnalytics(timeRange = '24h') {
    const startTime = this.getStartTime(timeRange);
    
    const errors = Array.from(this.analytics.errors.values())
      .filter(error => error.timestamp >= startTime);

    return {
      totalErrors: errors.length,
      errorsByType: this.groupErrorsByType(errors),
      errorsByEndpoint: this.groupErrorsByEndpoint(errors),
      errorsByHour: this.groupByHour(errors),
      criticalErrors: errors.filter(e => e.severity === 'critical').length,
      errorTrends: this.getErrorTrends(errors)
    };
  }

  // Get real-time dashboard data
  getRealTimeData() {
    return {
      ...this.analytics.realTime,
      activeUsers: this.analytics.realTime.activeUsers.size,
      timestamp: new Date()
    };
  }

  // Get business intelligence
  getBusinessIntelligence(timeRange = '7d') {
    const searches = this.getSearchAnalytics(timeRange);
    const users = this.getUserAnalytics(timeRange);
    const performance = this.getPerformanceAnalytics(timeRange);
    
    return {
      summary: {
        totalSearches: searches.total,
        totalUsers: users.totalUsers,
        successRate: (searches.successful / searches.total * 100).toFixed(2),
        averageResponseTime: searches.averageResponseTime,
        userEngagement: (searches.total / users.totalUsers).toFixed(2)
      },
      trends: {
        searchTrend: this.calculateTrend(this.timeSeries.searches, 'timestamp'),
        userTrend: this.calculateTrend(this.timeSeries.users, 'timestamp'),
        performanceTrend: this.calculateTrend(this.timeSeries.performance, 'responseTime')
      },
      insights: this.generateInsights(searches, users, performance)
    };
  }

  // Helper methods
  getStartTime(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case '1h': return new Date(now - 3600000);
      case '24h': return new Date(now - 86400000);
      case '7d': return new Date(now - 604800000);
      case '30d': return new Date(now - 2592000000);
      default: return new Date(now - 86400000);
    }
  }

  calculateAverage(array, field) {
    if (array.length === 0) return 0;
    return array.reduce((sum, item) => sum + (item[field] || 0), 0) / array.length;
  }

  getTopQueries(searches) {
    const queryCount = {};
    searches.forEach(search => {
      queryCount[search.query] = (queryCount[search.query] || 0) + 1;
    });
    
    return Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));
  }

  groupByHour(items, valueField = null) {
    const groups = {};
    items.forEach(item => {
      const hour = moment(item.timestamp).format('YYYY-MM-DD HH:00');
      if (!groups[hour]) {
        groups[hour] = { hour, count: 0, value: 0 };
      }
      groups[hour].count++;
      if (valueField) {
        groups[hour].value += item[valueField] || 0;
      }
    });
    
    return Object.values(groups).sort((a, b) => a.hour.localeCompare(b.hour));
  }

  generateInsights(searches, users, performance) {
    const insights = [];
    
    // Search insights
    if (searches.successRate < 95) {
      insights.push({
        type: 'warning',
        message: `Search success rate is ${searches.successRate}%, below optimal threshold`,
        action: 'Investigate search failures and improve API reliability'
      });
    }

    // Performance insights
    if (performance.averageResponseTime > 1000) {
      insights.push({
        type: 'warning',
        message: `Average response time is ${performance.averageResponseTime}ms, above optimal threshold`,
        action: 'Optimize API calls and implement better caching'
      });
    }

    // User engagement insights
    const engagementRate = searches.total / users.totalUsers;
    if (engagementRate > 5) {
      insights.push({
        type: 'success',
        message: `High user engagement with ${engagementRate.toFixed(1)} searches per user`,
        action: 'Consider implementing user accounts and personalization'
      });
    }

    return insights;
  }

  // Cleanup old data
  setupCleanupInterval() {
    setInterval(() => {
      this.cleanupOldData();
    }, 3600000); // Run every hour
  }

  cleanupOldData() {
    const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    // Clean searches
    for (const [id, search] of this.analytics.searches.entries()) {
      if (search.timestamp < cutoffTime) {
        this.analytics.searches.delete(id);
      }
    }

    // Clean performance data
    for (const [id, perf] of this.analytics.performance.entries()) {
      if (perf.timestamp < cutoffTime) {
        this.analytics.performance.delete(id);
      }
    }

    // Clean time series data
    this.timeSeries.searches = this.timeSeries.searches.filter(
      item => item.timestamp >= cutoffTime
    );
    
    advancedLogger.info('Analytics cleanup completed');
  }

  // Additional helper methods
  getSourceDistribution(searches) {
    const sources = {};
    searches.forEach(search => {
      sources[search.source] = (sources[search.source] || 0) + 1;
    });
    return sources;
  }

  getSlowestEndpoints(performance) {
    const endpoints = {};
    performance.forEach(perf => {
      if (!endpoints[perf.endpoint]) {
        endpoints[perf.endpoint] = { count: 0, totalTime: 0 };
      }
      endpoints[perf.endpoint].count++;
      endpoints[perf.endpoint].totalTime += perf.responseTime;
    });

    return Object.entries(endpoints)
      .map(([endpoint, data]) => ({
        endpoint,
        averageTime: data.totalTime / data.count,
        count: data.count
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 10);
  }

  calculateCacheHitRate(performance) {
    const cacheHits = performance.filter(p => p.cacheHit).length;
    return performance.length > 0 ? (cacheHits / performance.length * 100).toFixed(2) : 0;
  }

  getStatusCodeDistribution(performance) {
    const codes = {};
    performance.forEach(perf => {
      codes[perf.statusCode] = (codes[perf.statusCode] || 0) + 1;
    });
    return codes;
  }

  groupErrorsByType(errors) {
    const types = {};
    errors.forEach(error => {
      types[error.type] = (types[error.type] || 0) + 1;
    });
    return types;
  }

  groupErrorsByEndpoint(errors) {
    const endpoints = {};
    errors.forEach(error => {
      endpoints[error.endpoint] = (endpoints[error.endpoint] || 0) + 1;
    });
    return endpoints;
  }

  getErrorTrends(errors) {
    return this.groupByHour(errors);
  }

  calculateTrend(timeSeries, field) {
    if (timeSeries.length < 2) return 0;
    
    const recent = timeSeries.slice(-10);
    const older = timeSeries.slice(-20, -10);
    
    const recentAvg = recent.reduce((sum, item) => sum + (item[field] || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + (item[field] || 0), 0) / older.length;
    
    return ((recentAvg - olderAvg) / olderAvg * 100).toFixed(2);
  }
}

// Export singleton instance
const analyticsService = new AnalyticsService();
module.exports = { analyticsService };
