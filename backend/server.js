import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import sneakerRoutes from './routes/sneakers.js';
import searchRoutes from './routes/search.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json()); // <-- Add this

app.use('/api/sneakers', sneakerRoutes);
app.use('/api/search', searchRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy', timestamp: new Date().toISOString() });
});

app.get('/api/brands', async (req, res) => {
  const options = {
    method: 'GET',
    url: 'https://the-sneaker-database.p.rapidapi.com/brands',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'the-sneaker-database.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({ error: error.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});