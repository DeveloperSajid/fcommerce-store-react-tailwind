import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // ফর্মের ডেটা ধরে রাখার স্টেট
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'cod', // ডিফল্ট: Cash on Delivery
    bkashNumber: '',
    trxId: ''
  });

  // ইনপুট পরিবর্তনের ফাংশন
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // অর্ডার সাবমিট করার ফাংশন
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    
    // পরবর্তীতে এখানে আমরা ডেটাবেসে (Firebase) ডেটা পাঠানোর কোড লিখব
    console.log("Order Details:", { items: cart, total: cartTotal, customer: formData });
    
    // ডেমো সাকসেস মেসেজ
    alert("ধন্যবাদ! আপনার অর্ডারটি সফলভাবে প্লেস হয়েছে।");
    
    // কার্ট খালি করে হোমপেজে পাঠিয়ে দেওয়া
    clearCart();
    navigate('/');
  };

  // যদি কার্ট খালি থাকে, তবে চেকআউটে আসতে দেবে না
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">আপনার কার্টে কোনো প্রোডাক্ট নেই!</h2>
        <Link to="/" className="text-blue-600 hover:underline font-semibold">কেনাকাটা করুন</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">চেকআউট</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* বাম পাশ: কাস্টমার ইনফো ফর্ম */}
        <div className="lg:w-2/3 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold border-b pb-4 mb-4">ডেলিভারি ঠিকানা ও পেমেন্ট</h2>
          
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">আপনার নাম *</label>
              <input type="text" name="name" required onChange={handleInputChange} className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="সম্পূর্ণ নাম লিখুন" />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">মোবাইল নম্বর *</label>
              <input type="tel" name="phone" required onChange={handleInputChange} className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="01XXX-XXXXXX" />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">পূর্ণাঙ্গ ঠিকানা *</label>
              <textarea name="address" required onChange={handleInputChange} rows="3" className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="বাসা নং, রাস্তা, এলাকা, জেলা"></textarea>
            </div>

            {/* পেমেন্ট মেথড সিলেকশন */}
            <div className="pt-4 border-t mt-4">
              <label className="block text-gray-700 font-bold mb-3">পেমেন্ট মেথড সিলেক্ট করুন *</label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Cash on Delivery (ক্যাশ অন ডেলিভারি)</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="paymentMethod" value="bkash" checked={formData.paymentMethod === 'bkash'} onChange={handleInputChange} className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-pink-600">bKash (বিকাশ পেমেন্ট)</span>
                </label>
              </div>
            </div>

            {/* যদি বিকাশ সিলেক্ট করে, তবে এই অংশটি দেখাবে */}
            {formData.paymentMethod === 'bkash' && (
              <div className="bg-pink-50 p-4 rounded-md border border-pink-200 mt-3">
                <p className="text-sm text-gray-700 mb-3">অনুগ্রহ করে আমাদের পার্সোনাল নম্বরে (01XXXXXXXXX) টাকা Send Money করুন এবং নিচের তথ্যগুলো দিন।</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="bkashNumber" required={formData.paymentMethod === 'bkash'} onChange={handleInputChange} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন" />
                  <input type="text" name="trxId" required={formData.paymentMethod === 'bkash'} onChange={handleInputChange} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Transaction ID (TrxID)" />
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md mt-6 transition duration-300">
              অর্ডার কনফার্ম করুন (৳{cartTotal})
            </button>
          </form>
        </div>

        {/* ডান পাশ: অর্ডার সামারি */}
        <div className="lg:w-1/3 bg-gray-50 rounded-lg shadow-md p-6 h-fit sticky top-24 border">
          <h2 className="text-xl font-bold border-b pb-4 mb-4">আপনার অর্ডার</h2>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700 line-clamp-1 pr-2">{item.name} <span className="font-bold text-gray-500">x{item.quantity}</span></span>
                <span className="font-semibold">৳{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between items-center font-bold text-lg">
            <span>সর্বমোট:</span>
            <span className="text-blue-600">৳{cartTotal}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;