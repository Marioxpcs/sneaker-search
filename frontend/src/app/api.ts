// API service for connecting to backend
const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;

export interface Sneaker {
  id: number;
  name: string;
  brand: string;
  colorway: string;
  image: string;
  price: number;
  store: string;
  rating: number;
  reviews: number;
  description?: string;
  isRealData?: boolean;
}

export interface SearchFilters {
  search?: string;
  brand?: string;
  priceRange?: string;
  sortBy?: string;
  useRealApi?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  total?: number;
  error?: string;
  message?: string;
  hasRealData?: boolean;
  source?: string;
}

export interface UploadResponse {
  success: boolean;
  identifiedSneaker?: Sneaker;
  similarSneakers?: Sneaker[];
  analysis?: {
    brand: string;
    model: string;
    colorway: string;
    confidence: number;
    processingTime: string;
  };
}

// Generic API call function
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

// Get all sneakers with optional filters
export async function getSneakers(filters?: SearchFilters): Promise<ApiResponse<Sneaker[]>> {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.brand) params.append('brand', filters.brand);
  if (filters?.priceRange) params.append('priceRange', filters.priceRange);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.useRealApi) params.append('useRealApi', filters.useRealApi.toString());

  const queryString = params.toString();
  const endpoint = `/sneakers${queryString ? `?${queryString}` : ''}`;
  
  return apiCall<ApiResponse<Sneaker[]>>(endpoint);
}

// Get real sneaker data from external APIs
export async function getRealSneakerData(query: string): Promise<ApiResponse<Sneaker[]>> {
  const params = new URLSearchParams();
  params.append('query', query);
  
  const endpoint = `/sneakers/real-data/search?${params.toString()}`;
  return apiCall<ApiResponse<Sneaker[]>>(endpoint);
}

// Get specific sneaker by ID
export async function getSneaker(id: number): Promise<ApiResponse<Sneaker>> {
  return apiCall<ApiResponse<Sneaker>>(`/sneakers/${id}`);
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
    const res = await fetch(`${API_BASE_URL}/brands`);
    const data = await res.json();

    const brandNames = data.results?.map((b: any) => b.name) ?? [];

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