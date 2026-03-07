import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider'; // স্লাইডার ইম্পোর্ট করা হলো
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* ম্যাজিক স্লাইডার এখানে বসানো হলো */}
      <HeroSlider />
      
      <div className="text-center mb-10 mt-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">আমাদের কালেকশন</h1>
        <p className="text-gray-600">সেরা প্রোডাক্টগুলো এখন সরাসরি ওয়েবসাইটে!</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p className="text-xl">দুঃখিত, বর্তমানে কোনো প্রোডাক্ট স্টকে নেই!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};

export default Home;