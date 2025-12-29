const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());

// Import API handlers
const airportsHandler = require('./api/airports/index.ts');
const suggestHandler = require('./api/airports/suggest.ts');
const pendingHandler = require('./api/airports/pending.ts');
const approveHandler = require('./api/airports/approve.ts');
const createHandler = require('./api/airports/create.ts');

// Helper to convert Vercel handler to Express middleware
const wrapHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
};

// Routes
app.get('/api/airports', wrapHandler(airportsHandler.default));
app.post('/api/airports/suggest', wrapHandler(suggestHandler.default));
app.get('/api/airports/pending', wrapHandler(pendingHandler.default));
app.post('/api/airports/approve', wrapHandler(approveHandler.default));
app.post('/api/airports/create', wrapHandler(createHandler.default));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Airport API running on http://0.0.0.0:${PORT}`);
  console.log(`📍 Endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/airports`);
  console.log(`   POST http://localhost:${PORT}/api/airports/suggest`);
  console.log(`   GET  http://localhost:${PORT}/api/airports/pending (admin)`);
  console.log(`   POST http://localhost:${PORT}/api/airports/approve (admin)`);
  console.log(`   POST http://localhost:${PORT}/api/airports/create (admin)`);
});
