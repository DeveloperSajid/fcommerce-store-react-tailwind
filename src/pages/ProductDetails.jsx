import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CartContext } from '../context/CartContext';
import { FaArrowLeft } from 'react-icons/fa';

const ProductDetails = () => {
  const { id } = useParams(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // নতুন স্টেট: বর্তমানে কোন বড় ছবিটি দেখানো হচ্ছে
  const [mainImage, setMainImage] = useState(''); 
  
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({ id: docSnap.id, ...data });
          setMainImage(data.image); // ডিফল্টভাবে প্রথম ছবিটিকে মেইন ছবি হিসেবে সেট করা
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">প্রোডাক্টটি পাওয়া যায়নি!</h2>
        <Link to="/" className="text-blue-600 hover:underline font-semibold flex justify-center items-center gap-2">
          <FaArrowLeft /> ফিরে যান
        </Link>
      </div>
    );
  }

  // ডেটাবেস থেকে পাওয়া ৩টি ছবিকে একটি লিস্টে রাখা (যেগুলো ফাঁকা নয়, সেগুলোই শুধু নেবে)
  const allImages = [product.image, product.image2, product.image3].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition font-semibold"
      >
        <FaArrowLeft /> ফিরে যান
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        
        {/* ইমেইজ গ্যালারি সেকশন */}
        <div className="md:w-1/2 p-4">
          {/* বড় মেইন ছবি */}
          <img 
            src={mainImage} 
            alt={product.name} 
            className="w-full h-[400px] md:h-[500px] object-cover rounded-lg border mb-4 transition-all duration-300" 
          />
          
          {/* ছোট থাম্বনেইল ছবিগুলো (একের বেশি ছবি থাকলেই শুধু দেখাবে) */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img, index) => (
                <img 
                  key={index} 
                  src={img} 
                  alt={`Thumbnail ${index + 1}`} 
                  onClick={() => setMainImage(img)} // ক্লিক করলেই মেইন ছবি চেঞ্জ হবে
                  className={`h-20 w-20 object-cover rounded-md border-2 cursor-pointer transition-all ${
                    mainImage === img ? 'border-blue-600 scale-105 shadow-md' : 'border-gray-300 hover:border-blue-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* প্রোডাক্ট ডিটেইলস সেকশন */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">{product.name}</h1>
          <p className="text-3xl font-bold text-blue-600 mb-6">৳{product.price}</p>
          
          <div className="mb-6 border-b pb-6">
            <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {product.stock > 0 ? `স্টকে আছে: ${product.stock} টি` : 'স্টক শেষ (Out of Stock)'}
            </span>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-2">প্রোডাক্টের বিবরণ:</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {product.description ? product.description : 'এই প্রোডাক্টের কোনো বিস্তারিত বিবরণ দেওয়া নেই।'}
            </p>
          </div>

          <button 
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
            className={`w-full py-4 rounded-lg font-bold text-lg transition duration-300 flex justify-center items-center gap-2 ${
              product.stock > 0 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-95' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {product.stock > 0 ? 'কার্টে যোগ করুন' : 'স্টক শেষ'}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default ProductDetails;