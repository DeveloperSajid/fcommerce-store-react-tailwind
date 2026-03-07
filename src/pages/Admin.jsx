import { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; 
import { collection, addDoc, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { signOut } from 'firebase/auth'; 

const Admin = () => {
  const [activeTab, setActiveTab] = useState('orders'); 

  const [product, setProduct] = useState({ name: '', price: '', stock: '', image: '' });
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const handleInputChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsAddingProduct(true);
    try {
      await addDoc(collection(db, "products"), {
        name: product.name,
        price: Number(product.price),
        stock: Number(product.stock),
        image: product.image
      });
      alert("🎉 প্রোডাক্ট সফলভাবে ডেটাবেসে যোগ করা হয়েছে!");
      setProduct({ name: '', price: '', stock: '', image: '' });
    } catch (error) {
      console.error(error);
      alert("দুঃখিত, প্রোডাক্ট যোগ করতে সমস্যা হয়েছে।");
    } finally {
      setIsAddingProduct(false);
    }
  };

  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      let ordersArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      ordersArray.sort((a, b) => {
        const dateA = a.orderDate?.toDate() || 0;
        const dateB = b.orderDate?.toDate() || 0;
        return dateB - dateA;
      });

      setOrders(ordersArray);
    } catch (error) {
      console.error("Error fetching orders: ", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const updateOrderStatus = async (order, newStatus) => {
    // সিকিউরিটি অ্যালার্ট (ভুল করে ক্যানসেল বাটন চাপলে আটকাতে)
    if (newStatus === 'Cancelled') {
      const isConfirm = window.confirm("আপনি কি নিশ্চিত যে এই অর্ডারটি ক্যানসেল করতে চান? ক্যানসেল করলে প্রোডাক্টের স্টক আবার ডেটাবেসে ফেরত যাবে।");
      if (!isConfirm) return;
    }

    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, { status: newStatus });

      // যদি অর্ডার 'Cancelled' করা হয়, তবে স্টক আবার ডেটাবেসে যোগ (Increment) হয়ে যাবে!
      if (newStatus === 'Cancelled') {
        for (const item of order.orderItems) {
          const productRef = doc(db, "products", item.id);
          await updateDoc(productRef, {
            stock: increment(item.quantity) // পজিটিভ ভ্যালু = স্টক ফেরত আসলো
          });
        }
      }

      alert(`অর্ডারের স্ট্যাটাস '${newStatus}'-এ আপডেট করা হয়েছে!`);
      fetchOrders(); 
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">অ্যাডমিন ড্যাশবোর্ড</h1>
        <button 
          onClick={() => signOut(auth)}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md font-bold transition duration-300 shadow-md"
        >
          লগআউট করুন
        </button>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2 rounded-md font-bold transition duration-300 ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border hover:bg-gray-100'}`}
        >
          কাস্টমার অর্ডার
        </button>
        <button 
          onClick={() => setActiveTab('addProduct')}
          className={`px-6 py-2 rounded-md font-bold transition duration-300 ${activeTab === 'addProduct' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border hover:bg-gray-100'}`}
        >
          নতুন প্রোডাক্ট যোগ
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">সর্বশেষ অর্ডারসমূহ</h2>
          
          {isLoadingOrders ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-500 py-10">এখনো কোনো অর্ডার আসেনি।</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map(order => (
                <div key={order.id} className="border rounded-lg p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4 border-b pb-3">
                    <div>
                      <span className="text-xs text-gray-500">Order ID: {order.id.slice(-6).toUpperCase()}</span>
                      <p className="font-bold text-gray-800">{order.customerInfo?.name}</p>
                      <p className="text-sm text-gray-600">{order.customerInfo?.phone}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 mb-4">
                    <p><span className="font-semibold">ঠিকানা:</span> {order.customerInfo?.address}</p>
                    <p className="mt-1">
                      <span className="font-semibold">পেমেন্ট:</span> 
                      <span className={order.customerInfo?.paymentMethod === 'bkash' ? 'text-pink-600 font-bold ml-1' : 'ml-1'}>
                        {order.customerInfo?.paymentMethod === 'bkash' ? 'bKash' : 'Cash on Delivery'}
                      </span>
                    </p>
                    {order.customerInfo?.paymentMethod === 'bkash' && (
                      <div className="bg-pink-50 p-2 mt-2 rounded text-xs border border-pink-100">
                        <p>নম্বর: {order.customerInfo?.bkashNumber}</p>
                        <p>TrxID: <span className="font-mono">{order.customerInfo?.trxId}</span></p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-3 rounded mb-4">
                    <p className="font-bold text-sm mb-2 border-b pb-1">অর্ডার করা প্রোডাক্ট:</p>
                    {order.orderItems?.map(item => (
                      <div key={item.id} className="flex justify-between text-xs mb-1 text-gray-600">
                        <span>{item.name} (x{item.quantity})</span>
                        <span>৳{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t">
                      <span>মোট বিল:</span>
                      <span className="text-blue-600">৳{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* বাটন গ্রুপ: Pending অবস্থায় থাকলে Delivered এবং Cancelled করার অপশন দেখাবে */}
                  {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => updateOrderStatus(order, 'Delivered')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 rounded transition"
                      >
                        Delivered
                      </button>
                      <button 
                        onClick={() => updateOrderStatus(order, 'Cancelled')}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2 rounded transition"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'addProduct' && (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-4">নতুন প্রোডাক্ট আপলোড করুন</h2>
          <form onSubmit={handleAddProduct} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-bold mb-2">প্রোডাক্টের নাম</label>
              <input type="text" name="name" value={product.name} required onChange={handleInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="যেমন: স্মার্ট ফিটনেস ওয়াচ" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-700 font-bold mb-2">দাম (টাকা)</label>
                <input type="number" name="price" value={product.price} required onChange={handleInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="যেমন: 1250" />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">স্টক (পরিমাণ)</label>
                <input type="number" name="stock" value={product.stock} required onChange={handleInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="যেমন: 10" />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">ছবির লিংক (URL)</label>
              <input type="url" name="image" value={product.image} required onChange={handleInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com/image.jpg" />
              {product.image && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-1">ছবির প্রিভিউ:</p>
                  <img src={product.image} alt="Preview" className="h-32 object-cover rounded border" />
                </div>
              )}
            </div>
            <button type="submit" disabled={isAddingProduct} className={`w-full text-white font-bold py-3 rounded-md mt-4 transition ${isAddingProduct ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isAddingProduct ? 'আপলোড হচ্ছে...' : 'প্রোডাক্ট আপলোড করুন'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default Admin;