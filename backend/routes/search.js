import express from 'express';
const router = express.Router();

// Mock retailer data (in real app, this would come from external APIs)
const mockRetailers = {
  "Foot Locker": {
    name: "Foot Locker",
    logo: "https://example.com/footlocker-logo.png",
    rating: 4.2,
    shipping: "Free shipping on orders over $50"
  },
  "GOAT": {
    name: "GOAT",
    logo: "https://example.com/goat-logo.png", 
    rating: 4.5,
    shipping: "Free shipping on all orders"
  },
  "StockX": {
    name: "StockX",
    logo: "https://example.com/stockx-logo.png",
    rating: 4.3,
    shipping: "Free shipping on orders over $100"
  },
  "Nike": {
    name: "Nike",
    logo: "https://example.com/nike-logo.png",
    rating: 4.6,
    shipping: "Free shipping on all orders"
  },
  "Converse": {
    name: "Converse",
    logo: "https://example.com/converse-logo.png",
    rating: 4.1,
    shipping: "Free shipping on orders over $75"
  },
  "Vans": {
    name: "Vans",
    logo: "https://example.com/vans-logo.png",
    rating: 4.0,
    shipping: "Free shipping on orders over $60"
  }
};

// Mock price comparison data
const mockPriceComparison = {
  "Nike Air Max 97": [
    { store: "Foot Locker", price: 180, inStock: true, shipping: "Free" },
    { store: "Nike", price: 175, inStock: true, shipping: "Free" },
    { store: "StockX", price: 190, inStock: true, shipping: "Free" }
  ],
  "Adidas Yeezy Boost 350": [
    { store: "GOAT", price: 220, inStock: true, shipping: "Free" },
    { store: "StockX", price: 225, inStock: true, shipping: "Free" },
    { store: "Foot Locker", price: 230, inStock: false, shipping: "N/A" }
  ],
  "New Balance 550": [
    { store: "StockX", price: 110, inStock: true, shipping: "Free" },
    { store: "Foot Locker", price: 115, inStock: true, shipping: "Free" },
    { store: "Nike", price: 120, inStock: false, shipping: "N/A" }
  ]
};

// GET /api/search - Advanced search with filters
router.get('/', (req, res) => {
  try {
    const { 
      query, 
      brand, 
      priceMin, 
      priceMax, 
      sortBy, 
      limit = 20,
      page = 1 
    } = req.query;

    // Mock search results
    let searchResults = [
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
      }
    ];

    // Apply filters
    if (query) {
      searchResults = searchResults.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.brand.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (brand) {
      searchResults = searchResults.filter(item => item.brand === brand);
    }

    if (priceMin) {
      searchResults = searchResults.filter(item => item.price >= parseInt(priceMin));
    }

    if (priceMax) {
      searchResults = searchResults.filter(item => item.price <= parseInt(priceMax));
    }

    // Apply sorting
    if (sortBy) {
      searchResults.sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
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
    const paginatedResults = searchResults.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: searchResults.length,
        totalPages: Math.ceil(searchResults.length / parseInt(limit))
      },
      filters: {
        query,
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
router.get('/price-comparison/:sneakerId', (req, res) => {
  try {
    const sneakerId = parseInt(req.params.sneakerId);
    
    // Mock price comparison data
    const priceComparison = {
      sneakerId: sneakerId,
      sneakerName: "Nike Air Max 97",
      prices: [
        {
          store: "Foot Locker",
          price: 180,
          originalPrice: 200,
          discount: "10% off",
          inStock: true,
          shipping: "Free",
          deliveryTime: "2-4 days",
          rating: 4.2
        },
        {
          store: "Nike",
          price: 175,
          originalPrice: 175,
          discount: null,
          inStock: true,
          shipping: "Free",
          deliveryTime: "1-3 days",
          rating: 4.6
        },
        {
          store: "StockX",
          price: 190,
          originalPrice: 190,
          discount: null,
          inStock: true,
          shipping: "Free",
          deliveryTime: "3-5 days",
          rating: 4.3
        }
      ],
      bestPrice: {
        store: "Nike",
        price: 175,
        savings: 25
      },
      averagePrice: 181.67,
      priceRange: {
        min: 175,
        max: 190
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
    res.json({
      success: true,
      data: Object.values(mockRetailers)
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
router.get('/trending', (req, res) => {
  try {
    const trendingSneakers = [
      {
        id: 1,
        name: "Nike Air Max 97",
        brand: "Nike",
        image: "/sneakers/airmax97.jpg",
        price: 180,
        trend: "up",
        trendPercentage: 15,
        searchVolume: "High"
      },
      {
        id: 2,
        name: "Adidas Yeezy Boost 350",
        brand: "Adidas",
        image: "/sneakers/yeezy350.jpg",
        price: 220,
        trend: "up",
        trendPercentage: 8,
        searchVolume: "Very High"
      },
      {
        id: 3,
        name: "New Balance 550",
        brand: "New Balance",
        image: "/sneakers/nb550.jpg",
        price: 110,
        trend: "down",
        trendPercentage: 5,
        searchVolume: "Medium"
      }
    ];

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

