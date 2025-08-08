// Shared types for the sneaker application
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
