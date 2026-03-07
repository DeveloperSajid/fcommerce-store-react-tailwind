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
    paymentMethod: 'cod',
    bkashNumber: '',
    trxId: ''
  });

  // সাধারণ ইনপুট পরিবর্তনের ফাংশন
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ফোন নম্বরের জন্য বিশেষ ফাংশন (শুধুমাত্র সংখ্যা এবং সর্বোচ্চ ১১ ডিজিট)
  const handlePhoneChange = (e) => {
    // যেকোনো অক্ষর বা স্পেস বাদ দিয়ে শুধু সংখ্যা (0-9) ফিল্টার করা হচ্ছে
    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
    
    // ১১ ডিজিটের বেশি টাইপ করতে দেবে না
    if (onlyNums.length <= 11) {
      setFormData({ ...formData, phone: onlyNums });
    }
  };

  // অর্ডার সাবমিট করার ফাংশন
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    
    // ফাইনাল চেকিং: ১১ ডিজিট না হলে সাবমিট হবে না
    if (formData.phone.length !== 11) {
      alert("অনুগ্রহ করে ১১ ডিজিটের সঠিক মোবাইল নম্বর দিন।");
      return;
    }
    
    console.log("Order Details:", { items: cart, total: cartTotal, customer: formData });
    
    alert("ধন্যবাদ! আপনার অর্ডারটি সফলভাবে প্লেস হয়েছে।");
    clearCart();
    navigate('/');
  };

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
              <input type="text" name="name" value={formData.name} required onChange={handleInputChange} className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="সম্পূর্ণ নাম লিখুন" />
            </div>
            
            {/* ফোন নম্বর ইনপুট এবং ভ্যালিডেশন মেসেজ */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">মোবাইল নম্বর *</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                required 
                onChange={handlePhoneChange} 
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="01XXXXXXXXX" 
              />
              
              {/* রিয়েল-টাইম ফিডব্যাক মেসেজ */}
              {formData.phone.length > 0 && formData.phone.length < 11 && (
                <p className="text-sm text-red-500 mt-1 font-medium">
                  আর {11 - formData.phone.length} টি সংখ্যা দিতে হবে
                </p>
              )}
              {formData.phone.length === 11 && (
                <p className="text-sm text-green-600 mt-1 font-bold">
                  ✓ সঠিক ফোন নম্বর
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">পূর্ণাঙ্গ ঠিকানা *</label>
              <textarea name="address" value={formData.address} required onChange={handleInputChange} rows="3" className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="বাসা নং, রাস্তা, এলাকা, জেলা"></textarea>
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

            {/* বিকাশ কন্ডিশনাল ইনপুট */}
            {formData.paymentMethod === 'bkash' && (
              <div className="bg-pink-50 p-4 rounded-md border border-pink-200 mt-3 animate-fade-in">
                <p className="text-sm text-gray-700 mb-3">অনুগ্রহ করে আমাদের পার্সোনাল নম্বরে (01XXXXXXXXX) টাকা Send Money করুন এবং নিচের তথ্যগুলো দিন।</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="bkashNumber" value={formData.bkashNumber} required={formData.paymentMethod === 'bkash'} onChange={handleInputChange} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন" />
                  <input type="text" name="trxId" value={formData.trxId} required={formData.paymentMethod === 'bkash'} onChange={handleInputChange} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Transaction ID (TrxID)" />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={formData.phone.length > 0 && formData.phone.length < 11}
              className={`w-full text-white font-bold py-3 rounded-md mt-6 transition duration-300 ${
                formData.phone.length > 0 && formData.phone.length < 11 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
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