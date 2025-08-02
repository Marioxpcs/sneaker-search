const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Simple server is working!' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Simple server is running!',
    timestamp: new Date().toISOString()
  });
});

// Sneakers endpoint (simplified)
app.get('/api/sneakers', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: "Nike Air Max 97",
        brand: "Nike",
        price: 180,
        store: "Foot Locker",
        rating: 4.5,
        reviews: 1247
      }
    ],
    count: 1,
    total: 1
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
}); 