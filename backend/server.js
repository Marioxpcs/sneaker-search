import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import sneakerRoutes from './routes/sneakers.js';
import searchRoutes from './routes/search.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/sneakers', sneakerRoutes);
app.use('/api/search', searchRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy', timestamp: new Date().toISOString() });
});

app.get('/api/brands', async (req, res) => {
  try {
    // Check if API key is available
    if (!process.env.RAPIDAPI_KEY) {
      console.log('No API key found, returning empty brands array');
      return res.json({ results: [] });
    }

    // Fetch brands from the sneaker API
    const { fetchRealSneakerData } = await import('./utils/sneakerApi.js');
    const sneakers = await fetchRealSneakerData();
    const brands = [...new Set(sneakers.map(sneaker => sneaker.brand))];
    
    res.json({ results: brands });
  } catch (error) {
    console.error('Brands API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch brands',
      results: []
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(error.status || 500).json({ error: error.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server with error handling
try {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API Key configured: ${process.env.RAPIDAPI_KEY ? 'Yes' : 'No'}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}