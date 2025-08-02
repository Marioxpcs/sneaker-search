import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

const router = express.Router();

// Mock sneaker database (in real app, this would be a database)
const mockSneakers = [
  {
    id: 1,
    name: "Nike Air Max 97",
    brand: "Nike",
    colorway: "Silver Bullet",
    image: "/sneakers/airmax97.jpg",
    price: 180,
    store: "Foot Locker",
    rating: 4.5,
    reviews: 1247,
    description: "Classic Nike Air Max 97 in Silver Bullet colorway"
  },
  {
    id: 2,
    name: "Adidas Yeezy Boost 350",
    brand: "Adidas",
    colorway: "Zebra",
    image: "/sneakers/yeezy350.jpg",
    price: 220,
    store: "GOAT",
    rating: 4.8,
    reviews: 2156,
    description: "Kanye West's iconic Yeezy Boost 350 in Zebra pattern"
  },
  {
    id: 3,
    name: "New Balance 550",
    brand: "New Balance",
    colorway: "White/Green",
    image: "/sneakers/nb550.jpg",
    price: 110,
    store: "StockX",
    rating: 4.2,
    reviews: 892,
    description: "Retro-inspired New Balance 550 in White/Green"
  },
  {
    id: 4,
    name: "Nike Air Jordan 1",
    brand: "Nike",
    colorway: "Chicago",
    image: "/sneakers/airmax97.jpg",
    price: 170,
    store: "Nike",
    rating: 4.7,
    reviews: 1893,
    description: "Michael Jordan's signature shoe in Chicago colorway"
  },
  {
    id: 5,
    name: "Converse Chuck Taylor",
    brand: "Converse",
    colorway: "White",
    image: "/sneakers/nb550.jpg",
    price: 65,
    store: "Converse",
    rating: 4.3,
    reviews: 3421,
    description: "Timeless Converse Chuck Taylor in classic white"
  },
  {
    id: 6,
    name: "Vans Old Skool",
    brand: "Vans",
    colorway: "Black/White",
    image: "/sneakers/yeezy350.jpg",
    price: 60,
    store: "Vans",
    rating: 4.4,
    reviews: 1567,
    description: "Iconic Vans Old Skool with side stripe in Black/White"
  }
];

// Real API integration function
// ...existing imports...

// Real API integration function (KicksCrew)
async function fetchRealSneakerData(searchTerm = '') {
  try {
    const options = {
      method: 'GET',
      url: 'https://kickscrew-sneakers-data.p.rapidapi.com/product/bycollection/v2/filters',
      params: { collection: searchTerm || 'nike' },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'kickscrew-sneakers-data.p.rapidapi.com'
      },
      timeout: 10000
    };

    const response = await axios.request(options);

    // Map response to your sneaker format
    if (response.data && Array.isArray(response.data.products)) {
      return response.data.products.map((product, index) => ({
        id: index + 1000,
        name: product.name || 'Unknown Sneaker',
        brand: product.brand || 'Unknown Brand',
        colorway: product.colorway || 'Unknown Colorway',
        image: product.imageUrl || '/sneakers/airmax97.jpg',
        price: product.price || Math.floor(Math.random() * 200) + 50,
        store: 'KicksCrew',
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviews: Math.floor(Math.random() * 2000) + 100,
        description: product.description || 'Real sneaker data from KicksCrew API',
        isRealData: true
      }));
    }
  } catch (error) {
    console.error('KicksCrew API failed:', error.message);
    console.error('Error details:', error.response?.data || error.message);
  }
  return null;
}
// ...rest of your code remains unchanged...

// GET /api/sneakers - Get all sneakers
router.get('/', async (req, res) => {
  try {
    const { search, brand, priceRange, sortBy, useRealApi = 'false' } = req.query;
    
    let sneakers = [...mockSneakers];
    
    // Try to fetch real data if requested
    if (useRealApi === 'true' && search) {
      const realData = await fetchRealSneakerData(search);
      if (realData && realData.length > 0) {
        sneakers = [...realData, ...mockSneakers]; // Combine real and mock data
      }
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
      hasRealData: filteredSneakers.some(s => s.isRealData)
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
router.get('/:id', (req, res) => {
  try {
    const sneakerId = parseInt(req.params.id);
    const sneaker = mockSneakers.find(s => s.id === sneakerId);
    
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
    // This is a mock endpoint - in real app, you'd integrate with AI/ML service
    const { description } = req.body;
    
    // Simulate AI analysis delay
    setTimeout(() => {
      // Mock AI analysis result
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
        similarSneakers: mockSneakers.slice(0, 3),
        analysis: {
          brand: "Nike",
          model: "Air Max 97",
          colorway: "Silver Bullet",
          confidence: 0.89,
          processingTime: "2.3s"
        }
      };
      
      res.json(analysisResult);
    }, 2000); // Simulate 2 second processing time
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to analyze image',
      message: error.message
    });
  }
});

// GET /api/sneakers/brands - Get all available brands
router.get('/brands/list', (req, res) => {
  try {
    const brands = [...new Set(mockSneakers.map(sneaker => sneaker.brand))];
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

// NEW: GET /api/sneakers/real-data - Fetch real sneaker data
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
    
    if (realData) {
      res.json({
        success: true,
        data: realData,
        count: realData.length,
        source: 'Real API'
      });
    } else {
      res.json({
        success: false,
        error: 'No real data available',
        data: [],
        count: 0,
        source: 'Mock data'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real sneaker data',
      message: error.message
    });
  }
});

export default router;