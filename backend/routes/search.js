import express from 'express';
import { fetchRealSneakerData } from '../utils/sneakerApi.js';

const router = express.Router();
if (!process.env.RAPIDAPI_KEY) {
  return res.status(500).json({
    success: false,
    error: 'RapidAPI key is missing. Please set RAPIDAPI_KEY in your backend .env file.'
  });
}

// GET /api/search - Advanced search with filters
router.get('/', async (req, res) => {
  try {
    const { 
      query, 
      search, // Add support for 'search' parameter
      brand, 
      priceMin, 
      priceMax, 
      sortBy, 
      limit = 20,
      page = 1 
    } = req.query;
    
    // Use either 'query' or 'search' parameter
    const searchTerm = query || search || 'nike';
    
    // Get real sneaker data
    const searchResults = await fetchRealSneakerData(searchTerm);
    
    if (searchResults.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          totalPages: 0
        },
        filters: {
          query: searchTerm,
          brand,
          priceMin,
          priceMax,
          sortBy
        },
        message: 'No sneakers found. Please check your API key configuration.'
      });
    }

    let filteredResults = [...searchResults];

    // Apply filters
    if (searchTerm) {
      filteredResults = filteredResults.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (brand) {
      filteredResults = filteredResults.filter(item => item.brand === brand);
    }

    if (priceMin) {
      filteredResults = filteredResults.filter(item => item.price >= parseInt(priceMin));
    }

    if (priceMax) {
      filteredResults = filteredResults.filter(item => item.price <= parseInt(priceMax));
    }

    // Apply sorting
    if (sortBy) {
      filteredResults.sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'price':
            return a.price - b.price;
          case 'rating':
            return b.rating - a.rating;
          case 'reviews':
            return b.reviews - a.reviews;
          case 'name':
          default:
            return a.name.localeCompare(b.name);
        }
      });
    }

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredResults.length,
        totalPages: Math.ceil(filteredResults.length / parseInt(limit))
      },
      filters: {
        query: searchTerm,
        brand,
        priceMin,
        priceMax,
        sortBy
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    });
  }
});

// GET /api/search/price-comparison/:sneakerId - Get price comparison for a sneaker
router.get('/price-comparison/:sneakerId', async (req, res) => {
  try {
    const sneakerId = parseInt(req.params.sneakerId);
    
    // Get real sneaker data
    const sneakers = await fetchRealSneakerData();
    const sneaker = sneakers.find(s => s.id === sneakerId);
    
    if (!sneaker) {
      return res.status(404).json({
        success: false,
        error: 'Sneaker not found'
      });
    }
    
    // Mock price comparison data based on real sneaker
    const priceComparison = {
      sneakerId: sneakerId,
      sneakerName: sneaker.name,
      prices: [
        {
          store: "StockX",
          price: sneaker.price,
          originalPrice: sneaker.retailPrice || sneaker.price,
          discount: sneaker.retailPrice && sneaker.price < sneaker.retailPrice ? `${Math.round(((sneaker.retailPrice - sneaker.price) / sneaker.retailPrice) * 100)}% off` : null,
          inStock: true,
          shipping: "Free",
          deliveryTime: "3-5 days",
          rating: sneaker.rating
        },
        {
          store: "GOAT",
          price: Math.round(sneaker.price * 1.05),
          originalPrice: Math.round(sneaker.price * 1.05),
          discount: null,
          inStock: true,
          shipping: "Free",
          deliveryTime: "2-4 days",
          rating: (sneaker.rating - 0.1).toFixed(1)
        }
      ],
      bestPrice: {
        store: "StockX",
        price: sneaker.price,
        savings: sneaker.retailPrice ? sneaker.retailPrice - sneaker.price : 0
      },
      averagePrice: Math.round((sneaker.price + Math.round(sneaker.price * 1.05)) / 2),
      priceRange: {
        min: sneaker.price,
        max: Math.round(sneaker.price * 1.05)
      }
    };

    res.json({
      success: true,
      data: priceComparison
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get price comparison',
      message: error.message
    });
  }
});

// GET /api/search/retailers - Get all available retailers
router.get('/retailers', (req, res) => {
  try {
    const retailers = [
      {
        name: "StockX",
        logo: "https://via.placeholder.com/100x50?text=StockX",
        rating: 4.3,
        shipping: "Free shipping on orders over $100"
      },
      {
        name: "GOAT",
        logo: "https://via.placeholder.com/100x50?text=GOAT", 
        rating: 4.5,
        shipping: "Free shipping on all orders"
      }
    ];
    
    res.json({
      success: true,
      data: retailers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch retailers',
      message: error.message
    });
  }
});

// GET /api/search/trending - Get trending sneakers
router.get('/trending', async (req, res) => {
  try {
    // Get real sneaker data
    const sneakers = await fetchRealSneakerData('nike');
    
    const trendingSneakers = sneakers.slice(0, 3).map((sneaker, index) => ({
      id: sneaker.id,
      name: sneaker.name,
      brand: sneaker.brand,
      image: sneaker.image,
      price: sneaker.price,
      trend: index % 2 === 0 ? "up" : "down",
      trendPercentage: Math.floor(Math.random() * 20) + 1,
      searchVolume: index === 0 ? "Very High" : index === 1 ? "High" : "Medium"
    }));

    res.json({
      success: true,
      data: trendingSneakers
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending sneakers',
      message: error.message
    });
  }
});

export default router;

