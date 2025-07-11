/**
 * 🚀 RENDER.COM DEPLOYMENT FIX
 * Easy Gift Search - Production Environment Fixes
 */

// Fix 1: Ensure server binds to correct host and port
process.env.HOST = process.env.HOST || '0.0.0.0';
process.env.PORT = process.env.PORT || '3000';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Fix 2: Memory optimization for Render's environment
process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || '--max-old-space-size=256 --optimize-for-size';

// Fix 3: Disable verbose logging in production to save memory
if (process.env.NODE_ENV === 'production') {
  process.env.LOG_LEVEL = 'warn'; // Only warnings and errors
}

console.log('🔧 Render.com fixes applied:');
console.log(`   HOST: ${process.env.HOST}`);
console.log(`   PORT: ${process.env.PORT}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   Memory optimization: Active`);

// Start the actual server
require('./server.js');
