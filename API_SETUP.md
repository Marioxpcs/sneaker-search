# API Integration Setup Guide

## 🔧 **Environment Configuration**

Create a `.env` file in the `backend` directory with the following content:

```env
# KicksCrew API Configuration
RAPIDAPI_KEY=61df2913afmshd59204fce82c3b2p1c53ffjsncafec37d4ee7

# Server Configuration
NODE_ENV=development
PORT=5000
```

## 🚀 **Starting the Application**

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📊 **API Health Monitoring**

Check the API status at:
- **General Health**: `http://localhost:5000/api/health`
- **KicksCrew API Health**: `http://localhost:5000/api/health/kickscrew`

## 🔍 **Testing the Integration**

1. **Start both servers** (backend on port 5000, frontend on port 3000)
2. **Visit the frontend**: `http://localhost:3000`
3. **Test search functionality** with terms like "nike", "adidas", "jordan"
4. **Check browser console** for API call logs
5. **Monitor backend logs** for detailed API interaction

## ⚠️ **Common Issues & Solutions**

### Issue: "No API key found"
**Solution**: Ensure `.env` file exists in backend directory with correct API key

### Issue: "Rate limit exceeded"
**Solution**: The app automatically falls back to sample data when rate limited

### Issue: "API call timeout"
**Solution**: Increased timeout to 15 seconds, with retry logic implemented

### Issue: "No sneakers found"
**Solution**: Check if the search term maps to a valid collection (nike, adidas, jordan, etc.)

## 📈 **Performance Features**

- **Caching**: 5-minute cache for API responses
- **Retry Logic**: 3 attempts with exponential backoff
- **Fallback Data**: Sample data when API fails
- **Error Handling**: Comprehensive error logging and recovery

## 🔐 **Security Notes**

- API key is stored in environment variables (not in code)
- Input validation prevents malicious requests
- Rate limiting protection through retry logic
- Secure error handling (no sensitive data in logs)

## 📝 **API Response Structure**

The API returns data in this format:
```javascript
{
  id: number,
  name: string,
  brand: string,
  colorway: string,
  image: string,
  price: number,
  store: string,
  rating: number,
  reviews: number,
  description: string,
  isRealData: boolean
}
```

## 🎯 **Supported Search Terms**

- nike
- adidas
- jordan
- yeezy
- new balance
- converse
- vans
- puma
- reebok
- asics

*Note: Other terms will default to "nike" collection*
