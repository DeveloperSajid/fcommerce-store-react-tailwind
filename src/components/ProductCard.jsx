import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      
      {/* প্রোডাক্টের ছবি */}
      <img 
        src={product.image} 
        alt={product.name} 
        className="w-full h-48 object-cover"
      />
      
      {/* প্রোডাক্টের বিস্তারিত তথ্য */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex justify-between items-center mb-4 mt-auto">
          {/* দাম */}
          <span className="text-xl font-bold text-blue-600">৳{product.price}</span>
          
          {/* স্টকের পরিমাণ (স্টক থাকলে সবুজ, না থাকলে লাল) */}
          <span className={`text-xs font-bold px-2 py-1 rounded ${
            product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
          </span>
        </div>
        
        {/* Add to Cart বাটন */}
        <button 
          disabled={product.stock === 0}
          className={`w-full py-2 rounded-md font-semibold text-white transition-colors duration-300 ${
            product.stock > 0 
              ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>

    </div>
  );
};

export default ProductCard;