// API service for connecting to backend
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

import { Sneaker, SearchFilters, ApiResponse, UploadResponse } from './types/sneaker';

// Generic API call function
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Get all sneakers with optional filters (using search endpoint for consistency)
export async function getSneakers(filters?: SearchFilters): Promise<ApiResponse<Sneaker[]>> {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.brand) params.append('brand', filters.brand);
  if (filters?.priceRange) params.append('priceRange', filters.priceRange);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);

  const queryString = params.toString();
  const endpoint = `/search${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiCall<ApiResponse<any[]>>(endpoint);
  
  // Transform data to match Sneaker interface
  const transformedData = response.data?.map((sneaker: any) => ({
    id: sneaker.id,
    name: sneaker.name,
    brand: sneaker.brand,
    colorway: sneaker.colorway || "Default Colorway",
    price: sneaker.price,
    image: sneaker.image,
    rating: typeof sneaker.rating === 'string' ? parseFloat(sneaker.rating) : sneaker.rating || 0,
    reviews: sneaker.reviews || 0,
    store: sneaker.store || "Unknown Store",
    description: sneaker.description,
    isRealData: sneaker.isRealData || false
  })) || [];
  
  return {
    ...response,
    data: transformedData
  };
}

// Get real sneaker data from external APIs
export async function getRealSneakerData(query: string): Promise<ApiResponse<Sneaker[]>> {
  const params = new URLSearchParams();
  params.append('query', query);
  
  const endpoint = `/sneakers/real-data/search?${params.toString()}`;
  const response = await apiCall<ApiResponse<any[]>>(endpoint);
  
  // Transform data to match Sneaker interface
  const transformedData = response.data?.map((sneaker: any) => ({
    id: sneaker.id,
    name: sneaker.name,
    brand: sneaker.brand,
    colorway: sneaker.colorway || "Default Colorway",
    price: sneaker.price,
    image: sneaker.image,
    rating: typeof sneaker.rating === 'string' ? parseFloat(sneaker.rating) : sneaker.rating || 0,
    reviews: sneaker.reviews || 0,
    store: sneaker.store || "Unknown Store",
    description: sneaker.description,
    isRealData: true
  })) || [];
  
  return {
    ...response,
    data: transformedData
  };
}

// Get specific sneaker by ID
export async function getSneaker(id: number): Promise<ApiResponse<Sneaker>> {
  const response = await apiCall<ApiResponse<any>>(`/sneakers/${id}`);
  
  // Transform data to match Sneaker interface
  const transformedData = {
    id: response.data.id,
    name: response.data.name,
    brand: response.data.brand,
    colorway: response.data.colorway || "Default Colorway",
    price: response.data.price,
    image: response.data.image,
    rating: typeof response.data.rating === 'string' ? parseFloat(response.data.rating) : response.data.rating || 0,
    reviews: response.data.reviews || 0,
    store: response.data.store || "Unknown Store",
    description: response.data.description,
    isRealData: response.data.isRealData || false
  };
  
  return {
    ...response,
    data: transformedData
  };
}

// Upload image for analysis
export async function uploadImage(description: string): Promise<UploadResponse> {
  return apiCall<UploadResponse>('/sneakers/upload', {
    method: 'POST',
    body: JSON.stringify({ description }),
  });
}

// Get all brands
export async function getBrands() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/brands`);
    const data = await res.json();

    // The backend returns { results: ["Nike", "Adidas", ...] }
    const brandNames = data.results ?? [];

    return {
      success: true,
      data: brandNames,
    };
  } catch (err) {
    console.error("Error fetching brands:", err);
    return {
      success: false,
      error: "Unable to fetch brands",
    };
  }
}

// Get price comparison for a sneaker
export async function getPriceComparison(sneakerId: number): Promise<ApiResponse<any>> {
  return apiCall<ApiResponse<any>>(`/search/price-comparison/${sneakerId}`);
}

// Health check
export async function healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
  return apiCall<{ status: string; message: string; timestamp: string }>('/health');
} 