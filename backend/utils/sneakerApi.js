import axios from 'axios';

// In-memory cache for API responses
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Collection mapping for search terms
const collectionMapping = {
  'nike': 'nike',
  'adidas': 'adidas', 
  'jordan': 'jordan',
  'yeezy': 'yeezy',
  'new balance': 'new-balance',
  'converse': 'converse',
  'vans': 'vans',
  'puma': 'puma',
  'reebok': 'reebok',
  'asics': 'asics'
};

// Input validation
const validateSearchTerm = (searchTerm) => {
  if (!searchTerm || typeof searchTerm !== 'string') {
    throw new Error('Invalid search term');
  }
  if (searchTerm.length > 50) {
    throw new Error('Search term too long');
  }
  return searchTerm.toLowerCase().trim();
};

// Enhanced error logging
const logApiError = (error, searchTerm) => {
  console.error({
    timestamp: new Date().toISOString(),
    searchTerm,
    error: error.message,
    status: error.response?.status,
    data: error.response?.data
  });
};

// Retry logic for API calls
const retryApiCall = async (options, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await axios.request(options);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`API call failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Real API integration function (KicksCrew)
export async function fetchRealSneakerData(searchTerm = 'nike') {
  // Check if API key is available
  if (!process.env.RAPIDAPI_KEY) {
    console.log('No API key found, returning empty array');
    return [];
  }

  try {
    // Validate search term
    const validatedSearchTerm = validateSearchTerm(searchTerm);
    
    // Check cache first
    const cacheKey = `sneakers:${validatedSearchTerm}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`Returning cached data for: "${validatedSearchTerm}"`);
      return cached.data;
    }

    console.log(`Making KicksCrew API call for search term: "${validatedSearchTerm}"`);
    console.log(`API Key configured: ${!!process.env.RAPIDAPI_KEY}`);
    
    // Map search term to collection
    const collection = collectionMapping[validatedSearchTerm] || 'nike';
    
    const options = {
      method: 'GET',
      url: 'https://kickscrew-sneakers-data.p.rapidapi.com/product/bycollection/v2/filters',
      params: { collection },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'kickscrew-sneakers-data.p.rapidapi.com'
      },
      timeout: 15000 // Increased timeout for better reliability
    };

    console.log('API Request URL:', options.url);
    console.log('API Request Params:', options.params);
    
    const response = await retryApiCall(options);
    
    console.log('API Response Status:', response.status);
    console.log('API Response Data Type:', typeof response.data);
    console.log('API Response Data Length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
    
    if (response.data && Array.isArray(response.data)) {
      console.log('First item in response:', response.data[0]);
      
      const transformedData = response.data.map((product, index) => ({
        id: product.id || index + 1000,
        name: product.name || 'Unknown Sneaker',
        brand: product.brand_name || 'Unknown Brand',
        colorway: product.color || product.details || 'Unknown Colorway',
        image: product.main_picture_url || product.grid_picture_url || product.main_display_picture_url || 'https://via.placeholder.com/300x200?text=Sneaker',
        price: Math.round((product.lowest_price_cents || product.retail_price_cents || 6000) / 100),
        store: 'KicksCrew',
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviews: Math.floor(Math.random() * 2000) + 100,
        description: product.story_html ? product.story_html.replace(/<[^>]*>/g, '') : `Real sneaker data from KicksCrew API - ${product.name || 'Unknown'}`,
        isRealData: true,
        retailPrice: Math.round((product.retail_price_cents || 6000) / 100),
        releaseDate: product.release_date,
        designer: product.designer,
        silhouette: product.silhouette
      }));

      // Cache the successful response
      cache.set(cacheKey, { data: transformedData, timestamp: Date.now() });
      
      return transformedData;
    } else {
      console.log('Response data is not an array:', response.data);
      return getSampleSneakerData(validatedSearchTerm);
    }
  } catch (error) {
    logApiError(error, searchTerm);
    
    // Handle specific API errors
    if (error.response?.status === 401) {
      console.error('API Key authentication failed');
    } else if (error.response?.status === 429) {
      console.error('Rate limit exceeded');
    } else if (error.response?.status === 500) {
      console.error('Server error from KicksCrew API');
    }
    
    // If API fails, return sample data for testing
    console.log('Returning sample data due to API failure');
    return getSampleSneakerData(searchTerm);
  }
}

// Enhanced sample data function for when API fails
function getSampleSneakerData(searchTerm = 'nike') {
  const sampleSneakers = [
    {
      id: 1001,
      name: "Nike Air Max 97",
      brand: "Nike",
      colorway: "Silver Bullet",
      image: "https://via.placeholder.com/300x200?text=Nike+Air+Max+97",
      price: 180,
      store: "KicksCrew",
      rating: 4.5,
      reviews: 1247,
      description: "Classic Nike Air Max 97 in Silver Bullet colorway with full-length Air unit",
      isRealData: false,
      retailPrice: 160,
      releaseDate: "2017-03-26",
      designer: "Christian Tresser",
      silhouette: "Air Max 97"
    },
    {
      id: 1002,
      name: "Adidas Ultraboost 21",
      brand: "Adidas",
      colorway: "Core Black",
      image: "https://via.placeholder.com/300x200?text=Adidas+Ultraboost+21",
      price: 190,
      store: "KicksCrew",
      rating: 4.3,
      reviews: 892,
      description: "Premium running shoe with responsive Boost midsole and Primeknit upper",
      isRealData: false,
      retailPrice: 180,
      releaseDate: "2021-01-01",
      designer: "Adidas",
      silhouette: "Ultraboost"
    },
    {
      id: 1003,
      name: "New Balance 990v5",
      brand: "New Balance",
      colorway: "Grey",
      image: "https://via.placeholder.com/300x200?text=New+Balance+990v5",
      price: 185,
      store: "KicksCrew",
      rating: 4.7,
      reviews: 1563,
      description: "Made in USA premium sneaker with ENCAP midsole technology",
      isRealData: false,
      retailPrice: 185,
      releaseDate: "2019-02-01",
      designer: "New Balance",
      silhouette: "990"
    },
    {
      id: 1004,
      name: "Converse Chuck Taylor All Star",
      brand: "Converse",
      colorway: "White",
      image: "https://via.placeholder.com/300x200?text=Converse+Chuck+Taylor",
      price: 65,
      store: "KicksCrew",
      rating: 4.2,
      reviews: 2341,
      description: "Iconic canvas sneaker with vulcanized rubber sole",
      isRealData: false,
      retailPrice: 65,
      releaseDate: "1917-01-01",
      designer: "Chuck Taylor",
      silhouette: "Chuck Taylor All Star"
    },
    {
      id: 1005,
      name: "Vans Old Skool",
      brand: "Vans",
      colorway: "Black/White",
      image: "https://via.placeholder.com/300x200?text=Vans+Old+Skool",
      price: 60,
      store: "KicksCrew",
      rating: 4.4,
      reviews: 1876,
      description: "Classic skate shoe with side stripe and durable construction",
      isRealData: false,
      retailPrice: 60,
      releaseDate: "1977-01-01",
      designer: "Vans",
      silhouette: "Old Skool"
    },
    {
      id: 1006,
      name: "Puma RS-X",
      brand: "Puma",
      colorway: "Blue",
      image: "https://via.placeholder.com/300x200?text=Puma+RS-X",
      price: 110,
      store: "KicksCrew",
      rating: 4.1,
      reviews: 654,
      description: "Retro-inspired sneaker with bold design and comfortable cushioning",
      isRealData: false,
      retailPrice: 110,
      releaseDate: "2018-01-01",
      designer: "Puma",
      silhouette: "RS-X"
    }
  ];

  // Filter by search term if provided
  if (searchTerm && searchTerm.toLowerCase() !== 'nike') {
    return sampleSneakers.filter(sneaker => 
      sneaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sneaker.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return sampleSneakers;
}

// Export cache for monitoring
export { cache };