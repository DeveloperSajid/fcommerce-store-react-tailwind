import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const Admin = () => {
  const [product, setProduct] = useState({
    name: '',
    price: '',
    stock: '',
    image: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 'products' কালেকশনে নতুন প্রোডাক্ট সেভ করা হচ্ছে
      await addDoc(collection(db, "products"), {
        name: product.name,
        price: Number(product.price), // দামকে Number এ কনভার্ট করা হচ্ছে
        stock: Number(product.stock), // স্টককেও Number এ কনভার্ট করা হচ্ছে
        image: product.image
      });

      alert("🎉 প্রোডাক্ট সফলভাবে ডেটাবেসে যোগ করা হয়েছে!");
      // ফর্মটি আবার খালি করে দেওয়া হচ্ছে
      setProduct({ name: '', price: '', stock: '', image: '' });
    } catch (error) {
      console.error("Error adding product: ", error);
      alert("দুঃখিত, প্রোডাক্ট যোগ করতে সমস্যা হয়েছে।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
          নতুন প্রোডাক্ট যোগ করুন (Admin)
        </h1>

        <form onSubmit={handleAddProduct} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-bold mb-2">প্রোডাক্টের নাম</label>
            <input 
              type="text" 
              name="name" 
              value={product.name} 
              required 
              onChange={handleInputChange} 
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="যেমন: স্মার্ট ফিটনেস ওয়াচ" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-700 font-bold mb-2">দাম (টাকা)</label>
              <input 
                type="number" 
                name="price" 
                value={product.price} 
                required 
                onChange={handleInputChange} 
                className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="যেমন: 1250" 
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-bold mb-2">স্টক (পরিমাণ)</label>
              <input 
                type="number" 
                name="stock" 
                value={product.stock} 
                required 
                onChange={handleInputChange} 
                className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="যেমন: 10" 
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">ছবির লিংক (URL)</label>
            <input 
              type="url" 
              name="image" 
              value={product.image} 
              required 
              onChange={handleInputChange} 
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="https://example.com/image.jpg" 
            />
            {product.image && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-1">ছবির প্রিভিউ:</p>
                <img src={product.image} alt="Preview" className="h-32 object-cover rounded border" />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-white font-bold py-3 rounded-md mt-4 transition duration-300 ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'আপলোড হচ্ছে...' : 'প্রোডাক্ট আপলোড করুন'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;