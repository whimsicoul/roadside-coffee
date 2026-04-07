import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from frontend/public
app.use(express.static(path.join(__dirname, 'frontend', 'public')));

// Serve the frontend build if it exists
app.use(express.static(path.join(__dirname, 'frontend', '.next', 'static')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// For development: proxy Next.js routes
// In production, Next.js should handle this
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'public', 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ error: 'Not found' });
    }
  });
});

const server = app.listen(PORT, () => {
  console.log(`\n✓ Server running at http://localhost:${PORT}`);
  console.log(`✓ Press Ctrl+C to stop\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✓ Server stopped');
  server.close();
  process.exit(0);
});
