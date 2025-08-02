# Real Sneaker API Integration Guide

This guide explains how to integrate real sneaker data APIs into your application.

## 🔗 Available APIs

### 1. **StockX API**
- **Endpoint**: `https://stockx.com/api`
- **Features**: Real-time pricing, product details, market data
- **Authentication**: Requires partnership/API key
- **Rate Limits**: Varies by partnership level

### 2. **GOAT API**
- **Endpoint**: `https://www.goat.com/api`
- **Features**: Product catalog, pricing, availability
- **Authentication**: Limited public access
- **Rate Limits**: Strict limits

### 3. **Sneaker Database API**
- **Endpoint**: `https://api.thesneakerdatabase.com`
- **Features**: Product info, pricing, images
- **Authentication**: Free tier available
- **Rate Limits**: Generous free tier

### 4. **RapidAPI Sneaker APIs**
- **Platform**: RapidAPI marketplace
- **Features**: Various sneaker data providers
- **Authentication**: API key required
- **Rate Limits**: Varies by provider

## 🚀 Implementation Steps

### Step 1: Get API Keys

1. **Sneaker Database API** (Recommended for testing):
   - Visit: https://thesneakerdatabase.com/api
   - Sign up for free API key
   - Add to `.env` file: `SNEAKER_API_KEY=your_key_here`

2. **StockX API** (Production):
   - Requires partnership application
   - Contact: https://stockx.com/partnerships
   - Add to `.env` file:
     ```
     STOCKX_API_KEY=your_key_here
     STOCKX_API_SECRET=your_secret_here
     ```

3. **RapidAPI** (Alternative):
   - Visit: https://rapidapi.com
   - Search for "sneaker" APIs
   - Subscribe to preferred API
   - Add to `.env` file: `RAPIDAPI_KEY=your_key_here`

### Step 2: Update Backend Configuration

1. **Install additional dependencies**:
   ```bash
   npm install axios node-cache
   ```

2. **Create API service files**:
   - `services/stockxApi.js`
   - `services/goatApi.js`
   - `services/sneakerDatabaseApi.js`

3. **Update environment variables**:
   ```env
   SNEAKER_API_KEY=your_key_here
   STOCKX_API_KEY=your_key_here
   GOAT_API_KEY=your_key_here
   ```

### Step 3: Implement API Services

Example StockX API integration:

```javascript
// services/stockxApi.js
const axios = require('axios');

class StockXAPI {
  constructor() {
    this.baseURL = 'https://stockx.com/api';
    this.apiKey = process.env.STOCKX_API_KEY;
  }

  async searchSneakers(query) {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: { q: query }
      });
      return this.formatResponse(response.data);
    } catch (error) {
      console.error('StockX API error:', error);
      return null;
    }
  }

  formatResponse(data) {
    return data.products.map(product => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.retailPrice,
      image: product.image,
      isRealData: true
    }));
  }
}

module.exports = StockXAPI;
```

### Step 4: Update Frontend

The frontend already includes:
- ✅ Toggle for real API data
- ✅ Real data indicators
- ✅ Error handling for API failures
- ✅ Fallback to mock data

## 🔧 Advanced Features

### 1. **Price Comparison Across Platforms**
```javascript
async function getPriceComparison(sneakerId) {
  const [stockxPrice, goatPrice, databasePrice] = await Promise.all([
    stockxApi.getPrice(sneakerId),
    goatApi.getPrice(sneakerId),
    sneakerDatabaseApi.getPrice(sneakerId)
  ]);
  
  return {
    stockx: stockxPrice,
    goat: goatPrice,
    database: databasePrice,
    bestPrice: Math.min(stockxPrice, goatPrice, databasePrice)
  };
}
```

### 2. **Real-time Price Updates**
```javascript
// Set up WebSocket connections for real-time updates
const stockxSocket = new WebSocket('wss://stockx.com/ws');
stockxSocket.onmessage = (event) => {
  const priceUpdate = JSON.parse(event.data);
  updateSneakerPrice(priceUpdate);
};
```

### 3. **Image Recognition Integration**
```javascript
// Google Vision API for sneaker identification
async function identifySneaker(imageBuffer) {
  const vision = require('@google-cloud/vision');
  const client = new vision.ImageAnnotatorClient();
  
  const [result] = await client.labelDetection(imageBuffer);
  const labels = result.labelAnnotations;
  
  // Match labels to sneaker database
  return matchLabelsToSneakers(labels);
}
```

## 📊 API Response Examples

### StockX API Response:
```json
{
  "success": true,
  "data": {
    "id": "12345",
    "name": "Nike Air Max 97",
    "brand": "Nike",
    "retailPrice": 180,
    "marketPrice": 220,
    "lastSale": 215,
    "image": "https://stockx-assets.imgix.net/media/New-Product-Placeholder-Default.jpg"
  }
}
```

### GOAT API Response:
```json
{
  "success": true,
  "data": {
    "id": "67890",
    "name": "Adidas Yeezy Boost 350",
    "brand": "Adidas",
    "price": 220,
    "availability": "in_stock",
    "image": "https://image.goat.com/750/attachments/product_template_pictures/images/000/000/000/original/0000000000.jpg"
  }
}
```

## 🚨 Important Notes

1. **Rate Limiting**: Most APIs have strict rate limits
2. **Authentication**: Keep API keys secure in environment variables
3. **Error Handling**: Always implement fallback to mock data
4. **Caching**: Cache API responses to reduce API calls
5. **Legal Compliance**: Ensure compliance with API terms of service

## 🔄 Next Steps

1. **Get API keys** from preferred providers
2. **Implement API services** in the backend
3. **Test with real data** using the toggle in the frontend
4. **Add caching** for better performance
5. **Implement real-time updates** for live pricing

Your application is now ready to integrate with real sneaker APIs! 