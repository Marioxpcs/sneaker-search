# Sneaker Search Backend API

A Node.js/Express backend API for the sneaker search and identification platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
cd backend
npm install
```

### Running the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📊 API Endpoints

### Health Check
- **GET** `/api/health` - Check if the API is running

### Sneakers
- **GET** `/api/sneakers` - Get all sneakers with filters
- **GET** `/api/sneakers/:id` - Get specific sneaker by ID
- **POST** `/api/sneakers/upload` - Upload image for analysis (mock)
- **GET** `/api/sneakers/brands/list` - Get all available brands

### Search
- **GET** `/api/search` - Advanced search with filters
- **GET** `/api/search/price-comparison/:sneakerId` - Get price comparison
- **GET** `/api/search/retailers` - Get all retailers
- **GET** `/api/search/trending` - Get trending sneakers

## 🔍 API Usage Examples

### Get All Sneakers
```bash
curl http://localhost:5000/api/sneakers
```

### Search with Filters
```bash
curl "http://localhost:5000/api/sneakers?search=nike&brand=Nike&priceRange=100-200&sortBy=price-low"
```

### Get Price Comparison
```bash
curl http://localhost:5000/api/search/price-comparison/1
```

### Upload Image for Analysis
```bash
curl -X POST http://localhost:5000/api/sneakers/upload \
  -H "Content-Type: application/json" \
  -d '{"description": "Nike Air Max 97 Silver Bullet"}'
```

## 📁 Project Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── routes/
│   ├── sneakers.js       # Sneaker-related endpoints
│   └── search.js         # Search and comparison endpoints
├── uploads/              # Uploaded images (auto-created)
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
```

### CORS Configuration
The API is configured to allow requests from your frontend (typically running on `http://localhost:3000`).

## 🎯 Key Features

### ✅ Implemented
- **RESTful API** with Express.js
- **File upload handling** with Multer
- **CORS support** for frontend integration
- **Error handling** middleware
- **Mock data** for testing
- **Search and filtering** functionality
- **Price comparison** endpoints
- **Health check** endpoint

### 🚧 Future Enhancements
- **Database integration** (MongoDB/PostgreSQL)
- **Real AI/ML integration** for image recognition
- **External retailer APIs** (StockX, GOAT, etc.)
- **User authentication** and accounts
- **Image processing** and optimization
- **Caching** with Redis
- **Rate limiting** for API protection

## 🔌 Frontend Integration

Your React frontend can now connect to this backend by making HTTP requests to these endpoints. The API returns JSON responses that your frontend can use to display data.

### Example Frontend Request
```javascript
// Get all sneakers
const response = await fetch('http://localhost:5000/api/sneakers');
const data = await response.json();

// Search with filters
const searchResponse = await fetch('http://localhost:5000/api/search?query=nike&brand=Nike');
const searchData = await searchResponse.json();
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 5000
   npx kill-port 5000
   ```

2. **CORS errors**
   - Ensure your frontend is running on the correct port
   - Check that CORS is properly configured in `server.js`

3. **File upload issues**
   - Ensure the `uploads/` directory exists
   - Check file size limits (10MB max)

### Debug Mode
```bash
# Run with debug logging
DEBUG=* npm run dev
```

## 📝 API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": [...],
  "count": 6,
  "total": 6
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the API endpoints
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License. 