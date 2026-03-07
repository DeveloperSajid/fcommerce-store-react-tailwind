import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '01',
    address: '',
    paymentMethod: 'cod',
    bkashNumber: '01', // বিকাশের জন্যও ডিফল্ট '01'
    trxId: ''
  });

  // সাধারণ ইনপুট পরিবর্তন (Address, Payment Method)
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // নামের জন্য ভ্যালিডেশন (শুধু লেটার, স্পেস, ডট এবং সর্বোচ্চ ৩০ ক্যারেক্টার)
  const handleNameChange = (e) => {
    // বাংলা ও ইংরেজি বর্ণমালা, স্পেস এবং ডট ছাড়া সব বাদ দেওয়া হচ্ছে
    let val = e.target.value.replace(/[^a-zA-Z\u0980-\u09FF\s.]/g, ''); 
    if (val.length <= 30) {
      setFormData({ ...formData, name: val });
    }
  };

  // ফোন এবং বিকাশ নম্বরের জন্য কমন ভ্যালিডেশন
  const handlePhoneNumberChange = (e, field) => {
    let inputValue = e.target.value;
    let onlyNums = inputValue.replace(/[^0-9]/g, '');

    if (!onlyNums.startsWith('01')) {
      onlyNums = '01'; 
    }

    if (onlyNums.length <= 11) {
      setFormData({ ...formData, [field]: onlyNums });
    }
  };

  // TrxID এর জন্য ভ্যালিডেশন (শুধু লেটার, নাম্বার এবং সর্বোচ্চ ৩০ ক্যারেক্টার)
  const handleTrxIdChange = (e) => {
    let val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
    if (val.length <= 30) {
      setFormData({ ...formData, trxId: val });
    }
  };

  // ফর্ম সাবমিট
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    
    if (formData.phone.length !== 11) {
      alert("অনুগ্রহ করে আপনার ১১ ডিজিটের সঠিক মোবাইল নম্বর দিন।");
      return;
    }

    if (formData.paymentMethod === 'bkash') {
      if (formData.bkashNumber.length !== 11) {
        alert("অনুগ্রহ করে ১১ ডিজিটের সঠিক বিকাশ নম্বর দিন।");
        return;
      }
      if (formData.trxId.length === 0) {
        alert("অনুগ্রহ করে Transaction ID (TrxID) দিন।");
        return;
      }
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

  // বাটন ডিজেবল করার লজিক
  const isFormValid = formData.phone.length === 11 && 
                      (formData.paymentMethod === 'cod' || 
                      (formData.paymentMethod === 'bkash' && formData.bkashNumber.length === 11 && formData.trxId.length > 0));

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
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                required 
                onChange={handleNameChange} 
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="সম্পূর্ণ নাম লিখুন" 
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{formData.name.length}/30</p>
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">মোবাইল নম্বর *</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                required 
                onChange={(e) => handlePhoneNumberChange(e, 'phone')} 
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
                placeholder="01XXXXXXXXX" 
              />
              {formData.phone.length > 2 && formData.phone.length < 11 && (
                <p className="text-sm text-red-500 mt-1 font-medium">আর {11 - formData.phone.length} টি সংখ্যা দিতে হবে</p>
              )}
              {formData.phone.length === 11 && (
                <p className="text-sm text-green-600 mt-1 font-bold">✓ সঠিক ফোন নম্বর</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">পূর্ণাঙ্গ ঠিকানা *</label>
              <textarea 
                name="address" 
                value={formData.address} 
                required 
                maxLength="200"
                onChange={handleInputChange} 
                rows="3" 
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="বাসা নং, রাস্তা, এলাকা, জেলা"
              ></textarea>
              <p className="text-xs text-gray-500 mt-1 text-right">{formData.address.length}/200</p>
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
                  <div>
                    <input 
                      type="text" 
                      name="bkashNumber" 
                      value={formData.bkashNumber} 
                      required={formData.paymentMethod === 'bkash'} 
                      onChange={(e) => handlePhoneNumberChange(e, 'bkashNumber')} 
                      className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium" 
                      placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন" 
                    />
                    {formData.bkashNumber.length > 2 && formData.bkashNumber.length < 11 && (
                      <p className="text-sm text-red-500 mt-1 font-medium">আর {11 - formData.bkashNumber.length} টি সংখ্যা দিতে হবে</p>
                    )}
                    {formData.bkashNumber.length === 11 && (
                      <p className="text-sm text-green-600 mt-1 font-bold">✓ সঠিক বিকাশ নম্বর</p>
                    )}
                  </div>
                  <div>
                    <input 
                      type="text" 
                      name="trxId" 
                      value={formData.trxId} 
                      required={formData.paymentMethod === 'bkash'} 
                      onChange={handleTrxIdChange} 
                      className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 uppercase" 
                      placeholder="Transaction ID (TrxID)" 
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">{formData.trxId.length}/30</p>
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={!isFormValid}
              className={`w-full text-white font-bold py-3 rounded-md mt-6 transition duration-300 ${
                !isFormValid 
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