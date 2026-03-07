import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  // Context থেকে cartCount (কার্টের মোট সংখ্যা) নিয়ে আসা হলো
  const { cartCount } = useContext(CartContext);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* লোগো বা ওয়েবসাইটের নাম */}
        <Link to="/" className="text-2xl font-bold text-blue-600 tracking-wide">
          F-Commerce
        </Link>

        {/* কার্ট আইকন ও ব্যাজ */}
        <Link to="/cart" className="relative flex items-center text-gray-700 hover:text-blue-600 transition duration-300">
          <FaShoppingCart className="text-2xl" />
          
          {/* কার্টে কয়টি প্রোডাক্ট আছে তার ডায়নামিক সংখ্যা */}
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cartCount}
          </span>
        </Link>

      </div>
    </nav>
  );
};

export default Navbar;