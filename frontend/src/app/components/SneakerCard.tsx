import React from 'react';
import { Sneaker } from '../types/sneaker';

interface SneakerCardProps extends Sneaker {}

const SneakerCard: React.FC<SneakerCardProps> = ({ 
  id, name, brand, colorway, price, image, rating, reviews, store, isRealData 
}) => {
  return (
    <div className="rounded-xl shadow-md border p-4 w-full max-w-sm hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-48 object-cover rounded-md"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Sneaker';
          }}
        />
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
          {brand}
        </div>
        {isRealData && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Real Data
          </div>
        )}
      </div>
      <h2 className="text-lg font-semibold mt-2">{name}</h2>
      <p className="text-sm text-gray-500">{brand}</p>
      <p className="text-sm text-gray-600 mb-2">{colorway}</p>
      <p className="text-blue-600 font-bold">${price}</p>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-sm text-gray-600">({reviews})</span>
      </div>
      <p className="text-xs text-gray-400">Source: {store}</p>
    </div>
  );
};

export default SneakerCard;
