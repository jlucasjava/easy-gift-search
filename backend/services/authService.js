/**
 * 🚀 ADVANCED AUTHENTICATION SERVICE
 * Easy Gift Search - JWT Authentication & User Management
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { advancedLogger } = require('./advancedLogger');
const { alertSystem } = require('./alertSystem');

class AuthenticationService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
    this.jwtExpiry = process.env.JWT_EXPIRY || '24h';
    this.refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
    
    // In-memory user store (replace with database in production)
    this.users = new Map();
    this.refreshTokens = new Map();
    
    // Initialize admin user
    this.initializeAdminUser();
  }

  async initializeAdminUser() {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@easygiftsearch.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      this.users.set(adminEmail, {
        id: 'admin-001',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'admin'],
        createdAt: new Date(),
        lastLogin: null,
        isActive: true
      });
      
      advancedLogger.info('Admin user initialized successfully');
    } catch (error) {
      advancedLogger.error('Failed to initialize admin user', { error: error.message });
    }
  }

  async authenticateUser(email, password) {
    try {
      const user = this.users.get(email);
      
      if (!user || !user.isActive) {
        await alertSystem.sendSecurityAlert('Login attempt with invalid user', { email });
        return { success: false, message: 'Invalid credentials' };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        await alertSystem.sendSecurityAlert('Login attempt with invalid password', { email });
        return { success: false, message: 'Invalid credentials' };
      }

      // Update last login
      user.lastLogin = new Date();
      
      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);
      
      // Store refresh token
      this.refreshTokens.set(refreshToken, {
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      advancedLogger.info('User authenticated successfully', { 
        userId: user.id, 
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        },
        accessToken,
        refreshToken
      };

    } catch (error) {
      advancedLogger.error('Authentication error', { error: error.message, email });
      return { success: false, message: 'Authentication failed' };
    }
  }

  generateAccessToken(user) {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        permissions: user.permissions
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpiry }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { userId: user.id, type: 'refresh' },
      this.jwtSecret,
      { expiresIn: this.refreshTokenExpiry }
    );
  }

  async refreshAccessToken(refreshToken) {
    try {
      const tokenData = this.refreshTokens.get(refreshToken);
      
      if (!tokenData || tokenData.expiresAt < new Date()) {
        this.refreshTokens.delete(refreshToken);
        return { success: false, message: 'Invalid or expired refresh token' };
      }

      const decoded = jwt.verify(refreshToken, this.jwtSecret);
      const user = Array.from(this.users.values()).find(u => u.id === decoded.userId);
      
      if (!user || !user.isActive) {
        this.refreshTokens.delete(refreshToken);
        return { success: false, message: 'User not found or inactive' };
      }

      const newAccessToken = this.generateAccessToken(user);
      
      return {
        success: true,
        accessToken: newAccessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        }
      };

    } catch (error) {
      advancedLogger.error('Token refresh error', { error: error.message });
      return { success: false, message: 'Token refresh failed' };
    }
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  // Middleware para autenticação
  authMiddleware(requiredPermissions = []) {
    return (req, res, next) => {
      try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = this.verifyToken(token);
        
        if (!decoded) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        // Check if user is still active
        const user = Array.from(this.users.values()).find(u => u.id === decoded.userId);
        if (!user || !user.isActive) {
          return res.status(401).json({ error: 'User not found or inactive' });
        }

        // Check permissions
        if (requiredPermissions.length > 0) {
          const hasPermission = requiredPermissions.some(permission => 
            decoded.permissions.includes(permission)
          );
          
          if (!hasPermission) {
            return res.status(403).json({ error: 'Insufficient permissions' });
          }
        }

        req.user = decoded;
        next();

      } catch (error) {
        advancedLogger.error('Auth middleware error', { error: error.message });
        return res.status(500).json({ error: 'Authentication error' });
      }
    };
  }

  // Admin middleware
  adminMiddleware() {
    return this.authMiddleware(['admin']);
  }

  // Get user statistics
  getUserStats() {
    return {
      totalUsers: this.users.size,
      activeUsers: Array.from(this.users.values()).filter(u => u.isActive).length,
      adminUsers: Array.from(this.users.values()).filter(u => u.role === 'admin').length,
      activeRefreshTokens: this.refreshTokens.size
    };
  }

  // Revoke refresh token
  revokeRefreshToken(refreshToken) {
    return this.refreshTokens.delete(refreshToken);
  }

  // Revoke all user tokens
  revokeAllUserTokens(userId) {
    let revokedCount = 0;
    for (const [token, data] of this.refreshTokens.entries()) {
      if (data.userId === userId) {
        this.refreshTokens.delete(token);
        revokedCount++;
      }
    }
    return revokedCount;
  }

  // Create new user (admin only)
  async createUser(userData) {
    try {
      const { email, password, role = 'user', permissions = ['read'] } = userData;
      
      if (this.users.has(email)) {
        return { success: false, message: 'User already exists' };
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      
      const user = {
        id: `user-${Date.now()}`,
        email,
        password: hashedPassword,
        role,
        permissions,
        createdAt: new Date(),
        lastLogin: null,
        isActive: true
      };

      this.users.set(email, user);
      
      advancedLogger.info('New user created', { userId: user.id, email, role });
      
      return { success: true, userId: user.id };

    } catch (error) {
      advancedLogger.error('User creation error', { error: error.message });
      return { success: false, message: 'User creation failed' };
    }
  }

  // Update user
  async updateUser(userId, updates) {
    try {
      const user = Array.from(this.users.values()).find(u => u.id === userId);
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 12);
      }

      Object.assign(user, updates);
      
      advancedLogger.info('User updated', { userId, updates: Object.keys(updates) });
      
      return { success: true };

    } catch (error) {
      advancedLogger.error('User update error', { error: error.message });
      return { success: false, message: 'User update failed' };
    }
  }

  // Delete user
  deleteUser(userId) {
    try {
      const user = Array.from(this.users.values()).find(u => u.id === userId);
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Remove user
      this.users.delete(user.email);
      
      // Revoke all tokens
      this.revokeAllUserTokens(userId);
      
      advancedLogger.info('User deleted', { userId });
      
      return { success: true };

    } catch (error) {
      advancedLogger.error('User deletion error', { error: error.message });
      return { success: false, message: 'User deletion failed' };
    }
  }

  // Get all users (admin only)
  getAllUsers() {
    return Array.from(this.users.values()).map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      isActive: user.isActive
    }));
  }
}

// Export singleton instance
const authService = new AuthenticationService();
module.exports = { authService };
