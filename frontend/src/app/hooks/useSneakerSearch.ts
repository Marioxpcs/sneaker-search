import { useEffect, useState } from 'react';
import { Sneaker, SearchFilters } from '../types/sneaker';

interface SearchOptions extends SearchFilters {
  page?: number;
  limit?: number;
}

export function useSneakerSearch(options: SearchOptions) {
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });

      try {
        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();
        
        // Transform data to match Sneaker interface
        const transformedSneakers = data.data?.map((sneaker: any) => ({
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
        
        setSneakers(transformedSneakers);
        setTotal(data.total || transformedSneakers.length);
      } catch (err) {
        console.error('Error fetching sneakers:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [JSON.stringify(options)]); // ensure refetch on option change

  return { sneakers, loading, total };
}
