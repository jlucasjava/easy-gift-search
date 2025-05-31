// Test script to check route registration
const express = require('express');
const newApisRoutes = require('./routes/newApis');

const app = express();
const PORT = 3001;

// Basic middleware
app.use(express.json());

// Register the new APIs routes
app.use('/api/new-apis', newApisRoutes);

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Test server running', routes: 'new-apis routes loaded' });
});

// List all routes
app.get('/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        method: Object.keys(middleware.route.methods)[0].toUpperCase(),
        path: middleware.route.path
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            method: Object.keys(handler.route.methods)[0].toUpperCase(),
            path: handler.route.path
          });
        }
      });
    }
  });
  res.json({ routes });
});

app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`📋 Check routes at: http://localhost:${PORT}/routes`);
  console.log(`🔍 Test new APIs at: http://localhost:${PORT}/api/new-apis/info`);
});
