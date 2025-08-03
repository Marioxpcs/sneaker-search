import React from 'react';
import SneakerCard from './SneakerCard';

interface Sneaker {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  rating: string;
  reviews: number;
  store: string;
}

interface SneakerGridProps {
  sneakers: Sneaker[];
}

const SneakerGrid: React.FC<SneakerGridProps> = ({ sneakers }) => {
  if (!sneakers.length) return <p className="text-center mt-10">No sneakers found.</p>;

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4">
      {sneakers.map((sneaker) => (
        <SneakerCard key={sneaker.id} {...sneaker} />
      ))}
    </div>
  );
};

export default SneakerGrid;
