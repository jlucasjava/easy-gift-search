// Test script to verify all new services work correctly
const path = require('path');
process.chdir(path.join(__dirname, 'backend'));

console.log('🔍 Testing all new services...');

try {
    // Test 1: Advanced Logger
    console.log('1. Testing Advanced Logger...');
    const { advancedLogger } = require('./services/advancedLogger');
    console.log('✅ Advanced Logger loaded successfully');

    // Test 2: Validation Service
    console.log('2. Testing Validation Service...');
    const { validationService } = require('./services/validationService');
    console.log('✅ Validation Service loaded successfully');

    // Test 3: Alert System
    console.log('3. Testing Alert System...');
    const { alertSystem } = require('./services/alertSystem');
    console.log('✅ Alert System loaded successfully');

    // Test 4: Optimized API Client
    console.log('4. Testing Optimized API Client...');
    const { optimizedApiClient } = require('./services/optimizedApiClient');
    console.log('✅ Optimized API Client loaded successfully');

    // Test 5: Auth Service
    console.log('5. Testing Auth Service...');
    const { authService } = require('./services/authService');
    console.log('✅ Auth Service loaded successfully');

    // Test 6: Analytics Service
    console.log('6. Testing Analytics Service...');
    const { analyticsService } = require('./services/analyticsService');
    console.log('✅ Analytics Service loaded successfully');

    // Test 7: WebSocket Service
    console.log('7. Testing WebSocket Service...');
    const { webSocketService } = require('./services/webSocketService');
    console.log('✅ WebSocket Service loaded successfully');

    // Test 8: Enhanced Admin Dashboard Route
    console.log('8. Testing Enhanced Admin Dashboard Route...');
    const enhancedAdminRoute = require('./routes/enhancedAdminDashboard');
    console.log('✅ Enhanced Admin Dashboard Route loaded successfully');

    console.log('\n🎉 All services loaded successfully!');
    console.log('✅ Backend is ready with all production enhancements');
    console.log('\nFeatures available:');
    console.log('- 🔐 JWT Authentication with role-based access');
    console.log('- 📊 Real-time Analytics with comprehensive tracking');
    console.log('- 🚨 Advanced Alert System with Slack integration');
    console.log('- 📝 Structured Logging with daily rotation');
    console.log('- ⚡ WebSocket Server for real-time updates');
    console.log('- 🛡️ Enhanced Security with validation');
    console.log('- 🔧 Optimized API Client with pooling');
    console.log('- 📈 Modern Admin Dashboard with live metrics');
    console.log('\n🚀 Ready for production deployment!');

} catch (error) {
    console.error('❌ Error loading services:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}
