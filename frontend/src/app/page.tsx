"use client";
import { useState, useEffect } from "react";
import { getSneakers, uploadImage, getBrands, getRealSneakerData, type Sneaker, type SearchFilters } from "./api";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("name");
  
  // New state for API integration
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [useRealApi, setUseRealApi] = useState(false);
  const [dataSource, setDataSource] = useState<string>("Mock Data");

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load sneakers when filters change
  useEffect(() => {
    loadSneakers();
  }, [searchQuery, selectedBrand, priceRange, sortBy, useRealApi]);

  const loadInitialData = async () => {
    try {
      setApiLoading(true);
      setError(null);
      
      // Load brands
      const brandsResponse = await getBrands();
      if (brandsResponse.success) {
        setBrands(brandsResponse.data);
      }
      
      // Load sneakers
      await loadSneakers();
    } catch (err) {
      setError('Failed to load data. Please check if the backend is running.');
      console.error('Error loading initial data:', err);
    } finally {
      setApiLoading(false);
    }
  };

  const loadSneakers = async () => {
    try {
      setError(null);
      const filters: SearchFilters = {
        search: searchQuery || undefined,
        brand: selectedBrand || undefined,
        priceRange: priceRange || undefined,
        sortBy: sortBy || undefined,
        useRealApi: useRealApi,
      };
      
      const response = await getSneakers(filters);
      if (response.success) {
        setSneakers(response.data);
        setDataSource(response.hasRealData ? 'Real API' : 'Mock Data');
      } else {
        setError(response.error || 'Failed to load sneakers');
      }
    } catch (err) {
      setError('Failed to load sneakers. Please check if the backend is running.');
      console.error('Error loading sneakers:', err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      // Create a local URL for preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) return;

    setLoading(true);
    setError(null);
    setUploadResult(null);

    try {
      const response = await uploadImage(description);
      
      if (response.success) {
        setUploadResult(response);
        // Reload sneakers to show any new data
        await loadSneakers();
      } else {
        setError('Failed to analyze image');
      }
    } catch (err) {
      setError('Failed to upload image. Please check if the backend is running.');
      console.error('Error uploading image:', err);
    } finally {
      setLoading(false);
      
      // Clear inputs after submit
      setImage(null);
      setImagePreview(null);
      setDescription("");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sneaker Search</h1>
          <p className="text-gray-600">Find, identify, and compare sneaker prices</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Analysis Complete!</h3>
                {uploadResult.identifiedSneaker && (
                  <p className="text-sm text-green-700 mt-1">
                    Identified: {uploadResult.identifiedSneaker.name} ({uploadResult.identifiedSneaker.brand})
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Upload Sneaker Image</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Describe the sneaker, color, or any details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {imagePreview && (
              <div className="flex items-center gap-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg shadow-md"
                />
                <div>
                  <p className="text-sm text-gray-600">Image preview ready</p>
                  <p className="text-xs text-gray-500">Click submit to analyze</p>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || !image}
              className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                loading || !image 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Analyze Sneaker"
              )}
            </button>
          </form>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Sneakers
              </label>
              <input
                type="text"
                placeholder="Search by name, brand, or store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand, idx) => (
                    <option key={idx} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Prices</option>
                  <option value="0-100">$0 - $100</option>
                  <option value="100-200">$100 - $200</option>
                  <option value="200+">$200+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Real API Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useRealApi}
                  onChange={(e) => setUseRealApi(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Use Real API Data</span>
              </label>
            </div>
            <div className="text-sm text-gray-600">
              Data Source: <span className="font-medium">{dataSource}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{sneakers.length} sneakers found</span>
            {searchQuery && (
              <span>Results for "{searchQuery}"</span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {apiLoading && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span className="ml-3 text-gray-600">Loading sneakers...</span>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!apiLoading && sneakers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sneakers.map((sneaker) => (
              <div key={sneaker.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden">
                <div className="relative">
                  <img
                    src={sneaker.image}
                    alt={sneaker.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                    {sneaker.brand}
                  </div>
                  {sneaker.isRealData && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Real Data
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{sneaker.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{sneaker.colorway}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(sneaker.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({sneaker.reviews})</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">${sneaker.price}</p>
                      <p className="text-sm text-gray-600">{sneaker.store}</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!apiLoading && sneakers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sneakers found</h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No results for "${searchQuery}". Try adjusting your search or filters.`
                : "Try uploading an image or adjusting your search criteria."
              }
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
