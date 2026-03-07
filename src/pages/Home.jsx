import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
// সার্চ আইকন ইম্পোর্ট করা হলো
import { FaSearch } from 'react-icons/fa';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- সার্চ এবং ফিল্টার এর জন্য নতুন স্টেট ---
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('default');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsArray = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsArray);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products: ", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // --- সার্চ এবং সর্ট করার লজিক ---
  const filteredProducts = products
    .filter((product) =>
      // প্রোডাক্টের নামের সাথে সার্চের লেখা মিলছে কি না চেক করা (case-insensitive)
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // দাম অনুযায়ী সাজানো (Filter)
      if (sortOrder === 'price-low') return a.price - b.price;
      if (sortOrder === 'price-high') return b.price - a.price;
      return 0; // default (যেমন ছিল তেমন)
    });

  return (
    <div className="container mx-auto px-4 py-8">
      
      <HeroSlider />
      
      <div className="text-center mb-8 mt-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">আমাদের কালেকশন</h1>
        <p className="text-gray-600">সেরা প্রোডাক্টগুলো এখন সরাসরি ওয়েবসাইটে!</p>
      </div>

      {/* --- Search & Filter Section --- */}
      <div className="max-w-4xl mx-auto mb-10 bg-white p-4 rounded-lg shadow-sm border flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-2/3">
          <input
            type="text"
            placeholder="প্রোডাক্ট খুঁজুন... (যেমন: স্মার্ট ওয়াচ)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all"
          />
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Sort Dropdown (Filter) */}
        <div className="w-full md:w-1/3">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-gray-50 font-semibold text-gray-700"
          >
            <option value="default">সাজান (Default)</option>
            <option value="price-low">দাম: কম থেকে বেশি</option>
            <option value="price-high">দাম: বেশি থেকে কম</option>
          </select>
        </div>

      </div>

      {/* --- Product Grid --- */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-16 bg-white rounded-lg shadow-sm border mt-4">
          <h2 className="text-2xl font-bold mb-2">দুঃখিত!</h2>
          <p className="text-lg text-red-500">"{searchTerm}" নামের কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};

export default Home;