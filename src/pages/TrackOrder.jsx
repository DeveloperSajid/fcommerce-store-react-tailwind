import { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FaSearch, FaBoxOpen } from 'react-icons/fa';

const TrackOrder = () => {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (phone.length !== 11) {
      alert("অনুগ্রহ করে ১১ ডিজিটের সঠিক মোবাইল নম্বর দিন।");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setOrders([]);

    try {
      const q = query(collection(db, "orders"), where("customerInfo.phone", "==", phone));
      const querySnapshot = await getDocs(q);
      
      let foundOrders = [];
      querySnapshot.forEach((doc) => {
        foundOrders.push({ id: doc.id, ...doc.data() });
      });

      foundOrders.sort((a, b) => (b.orderDate?.toDate() || 0) - (a.orderDate?.toDate() || 0));
      setOrders(foundOrders);
    } catch (error) {
      console.error("Error tracking order: ", error);
      alert("অর্ডার খুঁজতে সমস্যা হয়েছে। ইন্টারনেট কানেকশন চেক করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  // স্ট্যাটাস অনুযায়ী রং এবং টেক্সট ঠিক করার ফাংশন
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'Pending': return { bg: 'bg-yellow-100 text-yellow-700', text: 'নতুন অর্ডার (Pending)' };
      case 'Hold': return { bg: 'bg-orange-100 text-orange-700', text: 'হোল্ড করা হয়েছে (Hold)' };
      case 'Processing': return { bg: 'bg-blue-100 text-blue-700', text: 'প্যাকেজিং হচ্ছে (Processing)' };
      case 'Shipped': return { bg: 'bg-purple-100 text-purple-700', text: 'কুরিয়ারে আছে (Shipped)' };
      case 'Delivered': return { bg: 'bg-green-100 text-green-700', text: 'ডেলিভারি সম্পন্ন (Delivered)' };
      case 'Cancelled': return { bg: 'bg-red-100 text-red-700', text: 'অর্ডার বাতিল (Cancelled)' };
      default: return { bg: 'bg-yellow-100 text-yellow-700', text: 'পেন্ডিং (Pending)' };
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[70vh]">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 flex justify-center items-center gap-3">
          <FaBoxOpen className="text-blue-600" /> অর্ডার ট্র্যাকিং
        </h1>
        <p className="text-gray-600">আপনার অর্ডার করা প্রোডাক্টের বর্তমান অবস্থা জানুন</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border mb-10 max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input 
              type="tel" 
              placeholder="আপনার মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)" 
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full pl-4 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
              maxLength="11"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className={`px-8 py-3 rounded-lg font-bold text-white transition flex justify-center items-center gap-2 ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? 'খুঁজছি...' : <><FaSearch /> ট্র্যাক করুন</>}
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div></div>
      ) : hasSearched && orders.length === 0 ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center border border-red-100">
          <h3 className="text-xl font-bold mb-2">কোনো অর্ডার পাওয়া যায়নি!</h3>
          <p>এই মোবাইল নম্বর দিয়ে কোনো অর্ডার করা হয়নি। অনুগ্রহ করে সঠিক নম্বর দিয়ে আবার চেষ্টা করুন।</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusDisplay(order.status || 'Pending');
            
            return (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 border-b pb-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">অর্ডার আইডি: <span className="font-mono font-bold text-gray-700">{order.id.slice(-6).toUpperCase()}</span></p>
                    <p className="text-sm text-gray-500">অর্ডারের তারিখ: {order.orderDate?.toDate().toLocaleDateString('bn-BD')} {order.orderDate?.toDate().toLocaleTimeString('bn-BD')}</p>
                  </div>
                  
                  {/* ডায়নামিক স্ট্যাটাস ব্যাজ */}
                  <div className={`px-4 py-2 rounded-full text-sm font-bold text-center ${statusInfo.bg}`}>
                    {statusInfo.text}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="font-bold text-gray-700 mb-2 border-b pb-2">প্রোডাক্টের বিবরণ:</p>
                  {order.orderItems?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm mb-2 text-gray-600">
                      <span>{item.name} (x{item.quantity})</span>
                      <span className="font-semibold">৳{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t text-gray-800">
                    <span>সর্বমোট বিল:</span>
                    <span className="text-blue-600">৳{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrackOrder;