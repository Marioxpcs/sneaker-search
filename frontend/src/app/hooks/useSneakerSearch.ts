import { useEffect, useState } from 'react';

interface Sneaker {
  id: number;
  name: string;
  brand: string;
  colorway: string;
  image: string;
  price: number;
  store: string;
  rating: string;
  reviews: number;
  description: string;
}

interface SearchOptions {
  query?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
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
        setSneakers(data.data);
        setTotal(data.total);
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
