import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fetchRealSneakerData } from '../utils/sneakerApi.js';

const router = express.Router();

// GET /api/sneakers - Get all sneakers
router.get('/', async (req, res) => {
  try {
    const { search, brand, priceRange, sortBy } = req.query;
    
    // Fetch real data from API
    const sneakers = await fetchRealSneakerData(search || 'nike');
    
    if (sneakers.length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        total: 0,
        hasRealData: false,
        message: 'No sneakers found. Please check your API key configuration or try a different search term.'
      });
    }
    
    let filteredSneakers = [...sneakers];
    
    // Search filter
    if (search) {
      filteredSneakers = filteredSneakers.filter(sneaker =>
        sneaker.name.toLowerCase().includes(search.toLowerCase()) ||
        sneaker.brand.toLowerCase().includes(search.toLowerCase()) ||
        sneaker.store.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Brand filter
    if (brand) {
      filteredSneakers = filteredSneakers.filter(sneaker => 
        sneaker.brand === brand
      );
    }
    
    // Price range filter
    if (priceRange) {
      filteredSneakers = filteredSneakers.filter(sneaker => {
        switch (priceRange) {
          case '0-100':
            return sneaker.price <= 100;
          case '100-200':
            return sneaker.price > 100 && sneaker.price <= 200;
          case '200+':
            return sneaker.price > 200;
          default:
            return true;
        }
      });
    }
    
    // Sorting
    if (sortBy) {
      filteredSneakers.sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'rating':
            return b.rating - a.rating;
          case 'name':
          default:
            return a.name.localeCompare(b.name);
        }
      });
    }
    
    res.json({
      success: true,
      data: filteredSneakers,
      count: filteredSneakers.length,
      total: sneakers.length,
      hasRealData: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sneakers',
      message: error.message
    });
  }
});

// GET /api/sneakers/:id - Get specific sneaker
router.get('/:id', async (req, res) => {
  try {
    const sneakerId = parseInt(req.params.id);
    
    // Fetch real data and find the specific sneaker
    const sneakers = await fetchRealSneakerData();
    const sneaker = sneakers.find(s => s.id === sneakerId);
    
    if (!sneaker) {
      return res.status(404).json({
        success: false,
        error: 'Sneaker not found'
      });
    }
    
    res.json({
      success: true,
      data: sneaker
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sneaker',
      message: error.message
    });
  }
});

// POST /api/sneakers/upload - Upload image for analysis
router.post('/upload', (req, res) => {
  try {
    const { description } = req.body;
    
    // Simulate AI analysis delay
    setTimeout(() => {
      // Mock AI analysis result - in real app, integrate with computer vision API
      const analysisResult = {
        success: true,
        identifiedSneaker: {
          id: 1,
          name: "Nike Air Max 97",
          brand: "Nike",
          colorway: "Silver Bullet",
          confidence: 0.89,
          description: "Classic Nike Air Max 97 in Silver Bullet colorway"
        },
        analysis: {
          brand: "Nike",
          model: "Air Max 97",
          colorway: "Silver Bullet",
          confidence: 0.89,
          processingTime: "2.3s"
        }
      };
      
      res.json(analysisResult);
    }, 2000);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to analyze image',
      message: error.message
    });
  }
});

// GET /api/sneakers/brands - Get all available brands
router.get('/brands/list', async (req, res) => {
  try {
    const sneakers = await fetchRealSneakerData();
    const brands = [...new Set(sneakers.map(sneaker => sneaker.brand))];
    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch brands',
      message: error.message
    });
  }
});

// GET /api/sneakers/real-data/search - Fetch real sneaker data
router.get('/real-data/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const realData = await fetchRealSneakerData(query);
    
    res.json({
      success: true,
      data: realData,
      count: realData.length,
      source: 'Real API'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real sneaker data',
      message: error.message
    });
  }
});

export default router;