import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { FaSearch } from 'react-icons/fa';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  
  // নতুন স্টেট: কোন ক্যাটাগরিটি সিলেক্ট করা আছে
  const [activeCategory, setActiveCategory] = useState('All');

  // ক্যাটাগরির লিস্ট (All সহ)
  const categories = ['All', 'Electronics', 'Gadgets', 'Fashion', 'Home Appliances', 'Others'];

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

  // --- ক্যাটাগরি, সার্চ এবং সর্ট করার লজিক একসাথে ---
  const filteredProducts = products
    .filter((product) => {
      // যদি 'All' সিলেক্ট থাকে, তবে সব দেখাবে। নাহলে শুধু নির্দিষ্ট ক্যাটাগরির প্রোডাক্ট দেখাবে।
      if (activeCategory === 'All') return true;
      const productCat = product.category || 'Others'; // পুরনো প্রোডাক্টে ক্যাটাগরি না থাকলে 'Others' ধরবে
      return productCat === activeCategory;
    })
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'price-low') return a.price - b.price;
      if (sortOrder === 'price-high') return b.price - a.price;
      return 0; 
    });

  return (
    <div className="container mx-auto px-4 py-8">
      
      <HeroSlider />
      
      <div className="text-center mb-8 mt-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">আমাদের কালেকশন</h1>
        <p className="text-gray-600">সেরা প্রোডাক্টগুলো এখন সরাসরি ওয়েবসাইটে!</p>
      </div>

      {/* --- Category Buttons --- */}
      <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-4xl mx-auto">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 shadow-sm ${
              activeCategory === cat 
                ? 'bg-blue-600 text-white scale-105' 
                : 'bg-white text-gray-600 border hover:bg-gray-100 hover:text-blue-600'
            }`}
          >
            {cat === 'All' ? 'সবগুলো (All)' : cat}
          </button>
        ))}
      </div>

      {/* --- Search & Filter Section --- */}
      <div className="max-w-4xl mx-auto mb-10 bg-white p-4 rounded-lg shadow-sm border flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-2/3">
          <input
            type="text"
            placeholder="প্রোডাক্ট খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all"
          />
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
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
          <p className="text-lg text-red-500">এই ক্যাটাগরিতে বা নামে কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
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