/**
 * 🚀 WEBSOCKET SERVICE
 * Easy Gift Search - Real-time Dashboard Updates
 */

const WebSocket = require('ws');
const { Server } = require('socket.io');
const { advancedLogger } = require('./advancedLogger');
const { analyticsService } = require('./analyticsService');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.io = null;
    this.clients = new Map();
    this.rooms = new Map();
    
    // Subscribe to analytics events
    this.setupAnalyticsListeners();
  }

  // Initialize WebSocket server
  initialize(server) {
    try {
      // Initialize Socket.IO
      this.io = new Server(server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        },
        transports: ['websocket', 'polling']
      });

      // Setup Socket.IO handlers
      this.setupSocketHandlers();

      // Initialize native WebSocket server
      this.wss = new WebSocket.Server({ 
        server,
        path: '/ws'
      });

      // Setup WebSocket handlers
      this.setupWebSocketHandlers();

      // Start real-time data broadcasting
      this.startRealTimeUpdates();

      advancedLogger.info('WebSocket service initialized successfully');
      
    } catch (error) {
      advancedLogger.error('WebSocket initialization failed', { error: error.message });
      throw error;
    }
  }

  // Setup Socket.IO event handlers
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      advancedLogger.info('Socket.IO client connected', { socketId: socket.id });

      // Handle authentication
      socket.on('authenticate', (data) => {
        this.handleAuthentication(socket, data);
      });

      // Handle room joining
      socket.on('join-room', (room) => {
        this.handleRoomJoin(socket, room);
      });

      // Handle admin dashboard subscription
      socket.on('subscribe-dashboard', () => {
        this.handleDashboardSubscription(socket);
      });

      // Handle analytics requests
      socket.on('request-analytics', (params) => {
        this.handleAnalyticsRequest(socket, params);
      });

      // Handle real-time search updates
      socket.on('subscribe-searches', () => {
        socket.join('searches');
        advancedLogger.info('Client subscribed to search updates', { socketId: socket.id });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        advancedLogger.info('Socket.IO client disconnected', { socketId: socket.id });
        this.clients.delete(socket.id);
      });

      // Handle errors
      socket.on('error', (error) => {
        advancedLogger.error('Socket.IO error', { error: error.message, socketId: socket.id });
      });
    });
  }

  // Setup native WebSocket handlers
  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      
      advancedLogger.info('WebSocket client connected', { clientId });

      // Store client info
      this.clients.set(clientId, {
        ws,
        authenticated: false,
        subscriptions: new Set(),
        connectedAt: new Date()
      });

      // Handle messages
      ws.on('message', (message) => {
        this.handleWebSocketMessage(clientId, message);
      });

      // Handle close
      ws.on('close', () => {
        advancedLogger.info('WebSocket client disconnected', { clientId });
        this.clients.delete(clientId);
      });

      // Handle errors
      ws.on('error', (error) => {
        advancedLogger.error('WebSocket error', { error: error.message, clientId });
      });

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'welcome',
        clientId,
        timestamp: new Date()
      });
    });
  }

  // Handle WebSocket messages
  handleWebSocketMessage(clientId, message) {
    try {
      const data = JSON.parse(message);
      const client = this.clients.get(clientId);

      if (!client) return;

      switch (data.type) {
        case 'authenticate':
          this.handleWebSocketAuth(clientId, data);
          break;

        case 'subscribe':
          this.handleWebSocketSubscription(clientId, data);
          break;

        case 'ping':
          this.sendToClient(clientId, { type: 'pong', timestamp: new Date() });
          break;

        default:
          advancedLogger.warn('Unknown WebSocket message type', { 
            type: data.type, 
            clientId 
          });
      }

    } catch (error) {
      advancedLogger.error('WebSocket message handling error', { 
        error: error.message, 
        clientId 
      });
    }
  }

  // Handle authentication for Socket.IO
  handleAuthentication(socket, data) {
    // Simple token-based authentication
    const validToken = process.env.ADMIN_TOKEN || 'admin123';
    
    if (data.token === validToken) {
      socket.authenticated = true;
      socket.emit('authenticated', { success: true });
      advancedLogger.info('Socket.IO client authenticated', { socketId: socket.id });
    } else {
      socket.emit('authenticated', { success: false, message: 'Invalid token' });
      advancedLogger.warn('Socket.IO authentication failed', { socketId: socket.id });
    }
  }

  // Handle WebSocket authentication
  handleWebSocketAuth(clientId, data) {
    const client = this.clients.get(clientId);
    const validToken = process.env.ADMIN_TOKEN || 'admin123';
    
    if (data.token === validToken) {
      client.authenticated = true;
      this.sendToClient(clientId, { 
        type: 'authenticated', 
        success: true 
      });
      advancedLogger.info('WebSocket client authenticated', { clientId });
    } else {
      this.sendToClient(clientId, { 
        type: 'authenticated', 
        success: false, 
        message: 'Invalid token' 
      });
      advancedLogger.warn('WebSocket authentication failed', { clientId });
    }
  }

  // Handle room joining
  handleRoomJoin(socket, room) {
    socket.join(room);
    socket.emit('room-joined', { room });
    advancedLogger.info('Client joined room', { socketId: socket.id, room });
  }

  // Handle dashboard subscription
  handleDashboardSubscription(socket) {
    if (!socket.authenticated) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    socket.join('dashboard');
    
    // Send initial dashboard data
    const dashboardData = {
      realTime: analyticsService.getRealTimeData(),
      searches: analyticsService.getSearchAnalytics('1h'),
      performance: analyticsService.getPerformanceAnalytics('1h'),
      errors: analyticsService.getErrorAnalytics('1h')
    };

    socket.emit('dashboard-data', dashboardData);
    
    advancedLogger.info('Client subscribed to dashboard', { socketId: socket.id });
  }

  // Handle analytics requests
  handleAnalyticsRequest(socket, params) {
    if (!socket.authenticated) {
      socket.emit('error', { message: 'Authentication required' });
      return;
    }

    try {
      const { type, timeRange = '24h' } = params;
      let data = {};

      switch (type) {
        case 'searches':
          data = analyticsService.getSearchAnalytics(timeRange);
          break;
        case 'users':
          data = analyticsService.getUserAnalytics(timeRange);
          break;
        case 'performance':
          data = analyticsService.getPerformanceAnalytics(timeRange);
          break;
        case 'errors':
          data = analyticsService.getErrorAnalytics(timeRange);
          break;
        case 'business':
          data = analyticsService.getBusinessIntelligence(timeRange);
          break;
        default:
          socket.emit('error', { message: 'Invalid analytics type' });
          return;
      }

      socket.emit('analytics-data', { type, data, timeRange });
      
    } catch (error) {
      advancedLogger.error('Analytics request error', { 
        error: error.message, 
        socketId: socket.id 
      });
      socket.emit('error', { message: 'Analytics request failed' });
    }
  }

  // Handle WebSocket subscription
  handleWebSocketSubscription(clientId, data) {
    const client = this.clients.get(clientId);
    
    if (!client || !client.authenticated) {
      this.sendToClient(clientId, { 
        type: 'error', 
        message: 'Authentication required' 
      });
      return;
    }

    client.subscriptions.add(data.channel);
    
    this.sendToClient(clientId, { 
      type: 'subscribed', 
      channel: data.channel 
    });
    
    advancedLogger.info('WebSocket client subscribed', { 
      clientId, 
      channel: data.channel 
    });
  }

  // Setup analytics event listeners
  setupAnalyticsListeners() {
    analyticsService.on('search', (searchData) => {
      this.broadcastToRoom('searches', 'search-update', searchData);
      this.broadcastToSubscribers('searches', {
        type: 'search',
        data: searchData
      });
    });

    analyticsService.on('user', (userData) => {
      this.broadcastToRoom('dashboard', 'user-update', userData);
      this.broadcastToSubscribers('users', {
        type: 'user',
        data: userData
      });
    });

    analyticsService.on('performance', (performanceData) => {
      this.broadcastToRoom('dashboard', 'performance-update', performanceData);
      this.broadcastToSubscribers('performance', {
        type: 'performance',
        data: performanceData
      });
    });

    analyticsService.on('error', (errorData) => {
      this.broadcastToRoom('dashboard', 'error-update', errorData);
      this.broadcastToSubscribers('errors', {
        type: 'error',
        data: errorData
      });
    });
  }

  // Start real-time updates
  startRealTimeUpdates() {
    setInterval(() => {
      const realTimeData = analyticsService.getRealTimeData();
      
      // Broadcast to Socket.IO clients
      this.io.to('dashboard').emit('realtime-update', realTimeData);
      
      // Broadcast to WebSocket clients
      this.broadcastToSubscribers('realtime', {
        type: 'realtime',
        data: realTimeData
      });
      
    }, 5000); // Update every 5 seconds
  }

  // Broadcast to Socket.IO room
  broadcastToRoom(room, event, data) {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }

  // Broadcast to WebSocket subscribers
  broadcastToSubscribers(channel, message) {
    for (const [clientId, client] of this.clients.entries()) {
      if (client.authenticated && client.subscriptions.has(channel)) {
        this.sendToClient(clientId, message);
      }
    }
  }

  // Send message to specific WebSocket client
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  // Generate unique client ID
  generateClientId() {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get connection statistics
  getConnectionStats() {
    return {
      socketIO: {
        connected: this.io ? this.io.engine.clientsCount : 0
      },
      webSocket: {
        connected: this.clients.size,
        authenticated: Array.from(this.clients.values()).filter(c => c.authenticated).length
      },
      totalConnections: (this.io ? this.io.engine.clientsCount : 0) + this.clients.size
    };
  }

  // Broadcast system notification
  broadcastSystemNotification(message, level = 'info') {
    const notification = {
      type: 'system-notification',
      message,
      level,
      timestamp: new Date()
    };

    // Broadcast to all authenticated clients
    this.io.emit('system-notification', notification);
    
    for (const [clientId, client] of this.clients.entries()) {
      if (client.authenticated) {
        this.sendToClient(clientId, notification);
      }
    }
  }

  // Send alert to dashboard
  sendAlert(alert) {
    const alertMessage = {
      type: 'alert',
      data: alert,
      timestamp: new Date()
    };

    this.broadcastToRoom('dashboard', 'alert', alertMessage);
    this.broadcastToSubscribers('alerts', alertMessage);
  }
}

// Export singleton instance
const webSocketService = new WebSocketService();
module.exports = { webSocketService };
