/**
 * 🚀 ADVANCED ALERT SYSTEM
 * Easy Gift Search - Real-time Monitoring & Alerts
 */

const { advancedLogger } = require('./advancedLogger');

class AlertSystem {
  constructor() {
    this.alerts = {
      apiFailures: new Map(),
      slowRequests: [],
      systemMetrics: {
        lastCpuAlert: 0,
        lastMemoryAlert: 0,
        lastErrorAlert: 0
      }
    };

    // Configurar Slack webhook (se disponível)
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || null;

    // Thresholds configuráveis
    this.thresholds = {
      apiFailures: 5,           // Falhas consecutivas
      slowRequestTime: 3000,    // 3 segundos
      slowRequestCount: 10,     // 10 requests lentas em 5 min
      cpuUsage: 80,             // 80% CPU
      memoryUsage: 85,          // 85% memória
      errorRate: 5,             // 5% de erro
      diskSpace: 90,            // 90% disco
      responseTime: 2000        // 2 segundos
    };

    // Iniciar monitoramento
    this.startMonitoring();
  }

  // Configurar email transporter (simplificado)
  setupEmailTransporter() {
    // Email será implementado posteriormente
    return null;
  }

  // Iniciar monitoramento periódico
  startMonitoring() {
    // Monitorar sistema a cada 30 segundos
    setInterval(() => {
      this.checkSystemHealth();
    }, 30000);

    // Limpar alertas antigos a cada 5 minutos
    setInterval(() => {
      this.cleanupOldAlerts();
    }, 300000);

    advancedLogger.logSystem('Alert system initialized');
  }

  // Verificar saúde do sistema
  async checkSystemHealth() {
    try {
      // Verificar uso de CPU e memória
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      // Calcular percentuais
      const memoryPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds

      // Alertas de memória
      if (memoryPercent > this.thresholds.memoryUsage) {
        await this.sendAlert('high_memory', {
          type: 'system',
          severity: 'warning',
          message: `High memory usage: ${memoryPercent.toFixed(2)}%`,
          details: {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
            threshold: this.thresholds.memoryUsage + '%'
          }
        });
      }

      // Alertas de CPU (se muito alto)
      if (cpuPercent > this.thresholds.cpuUsage) {
        await this.sendAlert('high_cpu', {
          type: 'system',
          severity: 'warning',
          message: `High CPU usage: ${cpuPercent.toFixed(2)}%`,
          details: {
            cpuUsage: cpuPercent.toFixed(2) + '%',
            threshold: this.thresholds.cpuUsage + '%'
          }
        });
      }

    } catch (error) {
      advancedLogger.logError(error, { context: 'checkSystemHealth' });
    }
  }

  // Registrar falha de API
  async recordApiFailure(apiName, error, endpoint = null) {
    const key = `${apiName}_${endpoint || 'default'}`;
    
    if (!this.alerts.apiFailures.has(key)) {
      this.alerts.apiFailures.set(key, {
        count: 0,
        firstFailure: Date.now(),
        lastFailure: Date.now(),
        errors: []
      });
    }

    const failure = this.alerts.apiFailures.get(key);
    failure.count++;
    failure.lastFailure = Date.now();
    failure.errors.push({
      message: error.message,
      timestamp: new Date().toISOString()
    });

    // Manter apenas últimos 10 erros
    if (failure.errors.length > 10) {
      failure.errors.shift();
    }

    // Enviar alerta se atingir threshold
    if (failure.count >= this.thresholds.apiFailures) {
      await this.sendAlert('api_failure', {
        type: 'api',
        severity: 'critical',
        message: `API ${apiName} failed ${failure.count} times`,
        details: {
          api: apiName,
          endpoint,
          failureCount: failure.count,
          firstFailure: new Date(failure.firstFailure).toISOString(),
          lastError: failure.errors[failure.errors.length - 1],
          threshold: this.thresholds.apiFailures
        }
      });
    }

    advancedLogger.logApiCall(apiName, endpoint, false, 0, 0, error);
  }

  // Registrar sucesso de API (para reset)
  recordApiSuccess(apiName, endpoint = null) {
    const key = `${apiName}_${endpoint || 'default'}`;
    
    if (this.alerts.apiFailures.has(key)) {
      const failure = this.alerts.apiFailures.get(key);
      
      // Se tinha muitas falhas, enviar alerta de recuperação
      if (failure.count >= this.thresholds.apiFailures) {
        this.sendAlert('api_recovery', {
          type: 'api',
          severity: 'info',
          message: `API ${apiName} recovered after ${failure.count} failures`,
          details: {
            api: apiName,
            endpoint,
            failureCount: failure.count,
            downtime: Date.now() - failure.firstFailure
          }
        });
      }
      
      // Reset contador
      this.alerts.apiFailures.delete(key);
    }
  }

  // Registrar request lenta
  async recordSlowRequest(req, responseTime) {
    if (responseTime > this.thresholds.slowRequestTime) {
      this.alerts.slowRequests.push({
        url: req.url,
        method: req.method,
        responseTime,
        timestamp: Date.now(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });

      // Manter apenas últimos 50 requests lentas
      if (this.alerts.slowRequests.length > 50) {
        this.alerts.slowRequests.shift();
      }

      // Verificar se há muitas requests lentas recentes
      const recentSlow = this.alerts.slowRequests.filter(
        r => Date.now() - r.timestamp < 300000 // 5 minutos
      );

      if (recentSlow.length >= this.thresholds.slowRequestCount) {
        await this.sendAlert('slow_requests', {
          type: 'performance',
          severity: 'warning',
          message: `${recentSlow.length} slow requests in last 5 minutes`,
          details: {
            slowRequestsCount: recentSlow.length,
            threshold: this.thresholds.slowRequestCount,
            averageTime: recentSlow.reduce((a, b) => a + b.responseTime, 0) / recentSlow.length,
            slowestRequest: recentSlow.sort((a, b) => b.responseTime - a.responseTime)[0]
          }
        });
      }
    }
  }

  // Registrar erro de aplicação
  async recordError(error, context = {}) {
    await this.sendAlert('application_error', {
      type: 'error',
      severity: 'error',
      message: `Application error: ${error.message}`,
      details: {
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Enviar alerta
  async sendAlert(alertType, alertData) {
    const alert = {
      id: `${alertType}_${Date.now()}`,
      type: alertType,
      ...alertData,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };

    try {
      // Enviar para Slack (webhook simples)
      if (this.slackWebhookUrl) {
        await this.sendSlackAlert(alert);
      }

      // Log do alerta
      advancedLogger.logSystem(`Alert sent: ${alertType}`, alert);

    } catch (error) {
      advancedLogger.logError(error, { context: 'sendAlert', alertType });
    }
  }

  // Enviar alerta para Slack (webhook simples)
  async sendSlackAlert(alert) {
    if (!this.slackWebhookUrl) return;
    
    const axios = require('axios');
    const emoji = this.getSeverityEmoji(alert.severity);
    
    const message = {
      text: `${emoji} *${alert.type.toUpperCase()}* - ${alert.message}`,
      attachments: [
        {
          color: this.getSeverityColor(alert.severity),
          fields: [
            {
              title: 'Severity',
              value: alert.severity,
              short: true
            },
            {
              title: 'Environment',
              value: alert.environment,
              short: true
            },
            {
              title: 'Time',
              value: alert.timestamp,
              short: true
            }
          ]
        }
      ]
    };

    await axios.post(this.slackWebhookUrl, message);
  }

  // Enviar alerta por email
  async sendEmailAlert(alert) {
    const subject = `[${alert.severity.toUpperCase()}] ${alert.type} - Easy Gift Search`;
    
    const html = `
      <h2>🚨 Alert: ${alert.type}</h2>
      <p><strong>Message:</strong> ${alert.message}</p>
      <p><strong>Severity:</strong> ${alert.severity}</p>
      <p><strong>Environment:</strong> ${alert.environment}</p>
      <p><strong>Time:</strong> ${alert.timestamp}</p>
      
      <h3>Details:</h3>
      <pre>${JSON.stringify(alert.details, null, 2)}</pre>
    `;

    await this.emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'alerts@easygiftsearch.com',
      to: process.env.ALERT_EMAIL,
      subject,
      html
    });
  }

  // Obter cor por severidade
  getSeverityColor(severity) {
    const colors = {
      info: 'good',
      warning: 'warning',
      error: 'danger',
      critical: 'danger'
    };
    return colors[severity] || 'warning';
  }

  // Obter emoji por severidade
  getSeverityEmoji(severity) {
    const emojis = {
      info: '💡',
      warning: '⚠️',
      error: '🚨',
      critical: '🔥'
    };
    return emojis[severity] || '⚠️';
  }

  // Limpar alertas antigos
  cleanupOldAlerts() {
    const now = Date.now();
    const oneHour = 3600000; // 1 hora em ms

    // Limpar falhas de API antigas
    for (const [key, failure] of this.alerts.apiFailures.entries()) {
      if (now - failure.lastFailure > oneHour) {
        this.alerts.apiFailures.delete(key);
      }
    }

    // Limpar requests lentas antigas
    this.alerts.slowRequests = this.alerts.slowRequests.filter(
      r => now - r.timestamp < oneHour
    );
  }

  // Obter estatísticas de alertas
  getAlertStats() {
    return {
      apiFailures: Array.from(this.alerts.apiFailures.entries()).map(([key, failure]) => ({
        api: key,
        count: failure.count,
        firstFailure: new Date(failure.firstFailure).toISOString(),
        lastFailure: new Date(failure.lastFailure).toISOString()
      })),
      slowRequestsCount: this.alerts.slowRequests.length,
      recentSlowRequests: this.alerts.slowRequests.filter(
        r => Date.now() - r.timestamp < 300000
      ).length,
      thresholds: this.thresholds
    };
  }

  // Middleware para Express
  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        
        // Registrar request lenta
        if (responseTime > this.thresholds.slowRequestTime) {
          this.recordSlowRequest(req, responseTime);
        }
      });

      next();
    };
  }
}

// Exportar instância única
const alertSystem = new AlertSystem();

module.exports = {
  alertSystem,
  AlertSystem
};
