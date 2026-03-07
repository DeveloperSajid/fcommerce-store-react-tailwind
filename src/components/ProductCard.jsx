import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col group">
      
      {/* ছবির ওপর ক্লিক করলে ডিটেইলস পেজে যাবে */}
      <Link to={`/product/${product.id}`} className="block overflow-hidden relative cursor-pointer">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        {/* স্টক আউট ব্যাজ */}
        {product.stock <= 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            Stock Out
          </div>
        )}
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        {/* নামের ওপর ক্লিক করলেও ডিটেইলস পেজে যাবে */}
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto flex justify-between items-center pt-2">
          <span className="text-xl font-bold text-blue-600">৳{product.price}</span>
          
          <button 
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              product.stock > 0 
                ? 'bg-gray-800 hover:bg-black text-white active:scale-95' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Stock Out'}
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default ProductCard;