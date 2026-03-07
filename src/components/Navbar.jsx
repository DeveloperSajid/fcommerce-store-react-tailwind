import { Link } from 'react-router-dom';
import { FaShoppingCart, FaUserShield } from 'react-icons/fa';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const { cartCount, setIsCartOpen } = useContext(CartContext);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        
        <Link to="/" className="text-2xl font-bold text-blue-600 tracking-wide">
          F-Commerce
        </Link>

        <div className="flex items-center gap-6">
          {/* অ্যাডমিন পেজে যাওয়ার লিংক */}
          <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-semibold flex items-center gap-2 transition duration-300">
            <FaUserShield /> <span className="hidden sm:inline">Admin</span>
          </Link>

          <button 
            onClick={() => setIsCartOpen(true)} 
            className="relative flex items-center text-gray-700 hover:text-blue-600 transition duration-300"
          >
            <FaShoppingCart className="text-2xl" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;