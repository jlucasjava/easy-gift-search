#!/bin/bash

# 🚀 RENDER.COM DEPLOYMENT SCRIPT
# Optimized for Render's environment

echo "🚀 Starting Easy Gift Search on Render..."

# Set production environment
export NODE_ENV=production

# Memory optimization for Render's free tier
export NODE_OPTIONS="--max-old-space-size=128 --optimize-for-size"

# Ensure port binding
export HOST=0.0.0.0
export PORT=${PORT:-3000}

# Start server
echo "📡 Starting server on ${HOST}:${PORT}"
cd backend && node server.js
