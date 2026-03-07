import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaTrash, FaArrowLeft } from 'react-icons/fa';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useContext(CartContext);

  // যদি কার্ট খালি থাকে
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">আপনার কার্ট একদম খালি!</h2>
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors">
          <FaArrowLeft className="mr-2" /> কেনাকাটা চালিয়ে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">শপিং কার্ট</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* বাম পাশ: কার্টের আইটেম লিস্ট */}
        <div className="md:w-2/3 bg-white rounded-lg shadow-md p-6">
          {cart.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between border-b pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
              
              {/* ছবি ও নাম */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md border" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{item.name}</h3>
                  <p className="text-blue-600 font-bold">৳{item.price}</p>
                </div>
              </div>
              
              {/* পরিমাণ কমানো-বাড়ানো ও ডিলিট বাটন */}
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <div className="flex items-center border rounded-md">
                  <button 
                    onClick={() => updateQuantity(item.id, 'decrease')}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
                  >-</button>
                  <span className="px-4 font-semibold text-gray-800">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 'increase')}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
                  >+</button>
                </div>
                
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 p-2 transition-colors"
                  title="Remove Item"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ডান পাশ: অর্ডার সামারি ও মোট দাম */}
        <div className="md:w-1/3 bg-white rounded-lg shadow-md p-6 h-fit sticky top-24">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">অর্ডার সামারি</h2>
          
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">মোট আইটেম:</span>
            <span className="font-semibold text-gray-800">
              {cart.reduce((total, item) => total + item.quantity, 0)} টি
            </span>
          </div>
          
          <div className="flex justify-between mb-6 text-lg font-bold border-t pt-2 mt-2">
            <span className="text-gray-800">সর্বমোট:</span>
            <span className="text-blue-600">৳{cartTotal}</span>
          </div>
          
          <Link 
            to="/checkout" 
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 rounded-md transition duration-300"
          >
            চেকআউট করুন
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;