import React from 'react';

interface SneakerCardProps {
  name: string;
  brand: string;
  price: number;
  image: string;
  rating: string;
  reviews: number;
  store: string;
}

const SneakerCard: React.FC<SneakerCardProps> = ({ name, brand, price, image, rating, reviews, store }) => {
  return (
    <div className="rounded-xl shadow-md border p-4 w-full max-w-sm">
      <img src={image} alt={name} className="w-full h-48 object-cover rounded-md" />
      <h2 className="text-lg font-semibold mt-2">{name}</h2>
      <p className="text-sm text-gray-500">{brand}</p>
      <p className="text-blue-600 font-bold">${price}</p>
      <p className="text-sm text-gray-700">⭐ {rating} ({reviews} reviews)</p>
      <p className="text-xs text-gray-400">Source: {store}</p>
    </div>
  );
};

export default SneakerCard;
