import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaTimes, FaTrash } from 'react-icons/fa';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useContext(CartContext);

  return (
    <>
      {/* কালো রঙের ওভারলে (পেছনের অংশ) */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsCartOpen(false)} // বাইরে ক্লিক করলে বন্ধ হয়ে যাবে
        ></div>
      )}

      {/* স্লাইড আউট কার্ট ড্রয়ার */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* হেডার ও ক্লোজ বাটন */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">আপনার কার্ট</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-gray-500 hover:text-red-500 transition-colors p-2"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* কার্টের প্রোডাক্ট লিস্ট */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>আপনার কার্ট খালি!</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 border-b pb-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded border" />
                <div className="flex-grow">
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{item.name}</h3>
                  <p className="text-blue-600 font-bold mt-1">৳{item.price}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border rounded">
                      <button onClick={() => updateQuantity(item.id, 'decrease')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200">-</button>
                      <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 'increase')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ফুটার এবং চেকআউট বাটন */}
        {cart.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4 text-lg font-bold">
              <span>সর্বমোট:</span>
              <span className="text-blue-600">৳{cartTotal}</span>
            </div>
            <Link 
              to="/checkout" 
              onClick={() => setIsCartOpen(false)} // চেকআউটে গেলে ড্রয়ারটি বন্ধ হয়ে যাবে
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition duration-300"
            >
              চেকআউট করুন
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;