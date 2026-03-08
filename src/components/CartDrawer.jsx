import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

const CartDrawer = () => {
  // Context থেকে ফাংশনগুলো আনা হলো
  const { 
    cart, 
    cartTotal, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    increaseQuantity, 
    decreaseQuantity 
  } = useContext(CartContext);
  
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold">আপনার কার্ট ({cart.length})</h2>
            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <FaTimes />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">আপনার কার্ট খালি!</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-blue-600 font-bold">৳{item.price}</p>
                    
                    <div className="flex items-center gap-3 mt-2">
                      {/* মাইনাস বাটন */}
                      <button 
                        onClick={() => decreaseQuantity(item.id)}
                        className="p-1 border rounded hover:bg-gray-100"
                      >
                        <FaMinus size={12} />
                      </button>
                      
                      <span className="font-bold">{item.quantity}</span>
                      
                      {/* প্লাস বাটন - এখানে item.stock পাঠানো জরুরি */}
                      <button 
                        onClick={() => increaseQuantity(item.id, item.stock)}
                        className="p-1 border rounded hover:bg-gray-100"
                      >
                        <FaPlus size={12} />
                      </button>

                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto text-red-500 p-1"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-4 border-t space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>মোট বিল:</span>
                <span className="text-blue-600">৳{cartTotal}</span>
              </div>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                চেকআউট করুন
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;