import { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; 
import { collection, addDoc, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { signOut } from 'firebase/auth'; 

const Admin = () => {
  const [activeTab, setActiveTab] = useState('orders'); 

  // ক্যাটাগরির লিস্ট
  const categoriesList = ['Electronics', 'Gadgets', 'Fashion', 'Home Appliances', 'Others'];

  // --- ১. প্রোডাক্ট অ্যাড করার স্টেট (category যুক্ত করা হলো) ---
  const [product, setProduct] = useState({ name: '', price: '', stock: '', image: '', description: '', category: 'Electronics' });
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const handleAddInputChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsAddingProduct(true);
    try {
      await addDoc(collection(db, "products"), {
        name: product.name,
        price: Number(product.price),
        stock: Number(product.stock),
        image: product.image,
        description: product.description,
        category: product.category // ক্যাটাগরি ডেটাবেসে যাচ্ছে
      });
      alert("🎉 প্রোডাক্ট সফলভাবে ডেটাবেসে যোগ করা হয়েছে!");
      setProduct({ name: '', price: '', stock: '', image: '', description: '', category: 'Electronics' });
    } catch (error) {
      console.error(error);
      alert("দুঃখিত, প্রোডাক্ট যোগ করতে সমস্যা হয়েছে।");
    } finally {
      setIsAddingProduct(false);
    }
  };

  // --- ২. অর্ডার দেখার স্টেট ---
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      let ordersArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      ordersArray.sort((a, b) => (b.orderDate?.toDate() || 0) - (a.orderDate?.toDate() || 0));
      setOrders(ordersArray);
    } catch (error) {
      console.error("Error fetching orders: ", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const updateOrderStatus = async (order, newStatus) => {
    if (newStatus === 'Cancelled') {
      const isConfirm = window.confirm("আপনি কি নিশ্চিত যে এই অর্ডারটি ক্যানসেল করতে চান?");
      if (!isConfirm) return;
    }
    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, { status: newStatus });

      if (newStatus === 'Cancelled') {
        for (const item of order.orderItems) {
          const productRef = doc(db, "products", item.id);
          await updateDoc(productRef, { stock: increment(item.quantity) });
        }
      }
      alert(`অর্ডারের স্ট্যাটাস '${newStatus}'-এ আপডেট করা হয়েছে!`);
      fetchOrders(); 
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
    }
  };

  // --- ৩. প্রোডাক্ট ম্যানেজমেন্ট (এডিট/স্টক আপডেট) ---
  const [allProducts, setAllProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); 
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAllProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllProducts(productsArray);
    } catch (error) {
      console.error("Error fetching products: ", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleEditInputChange = (e) => {
    setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const productRef = doc(db, "products", editingProduct.id);
      await updateDoc(productRef, {
        name: editingProduct.name,
        price: Number(editingProduct.price),
        stock: Number(editingProduct.stock),
        image: editingProduct.image,
        description: editingProduct.description || '',
        category: editingProduct.category || 'Others' // আপডেট করার সময় ক্যাটাগরি পাঠানো হচ্ছে
      });
      alert("প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে!");
      setEditingProduct(null); 
      fetchAllProducts(); 
    } catch (error) {
      console.error(error);
      alert("আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'manageProducts') fetchAllProducts();
  }, [activeTab]);


  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">অ্যাডমিন ড্যাশবোর্ড</h1>
        <button onClick={() => signOut(auth)} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md font-bold transition duration-300 shadow-md">
          লগআউট করুন
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button onClick={() => setActiveTab('orders')} className={`px-6 py-2 rounded-md font-bold transition duration-300 ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border hover:bg-gray-100'}`}>কাস্টমার অর্ডার</button>
        <button onClick={() => setActiveTab('addProduct')} className={`px-6 py-2 rounded-md font-bold transition duration-300 ${activeTab === 'addProduct' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border hover:bg-gray-100'}`}>নতুন প্রোডাক্ট যোগ</button>
        <button onClick={() => { setActiveTab('manageProducts'); setEditingProduct(null); }} className={`px-6 py-2 rounded-md font-bold transition duration-300 ${activeTab === 'manageProducts' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border hover:bg-gray-100'}`}>প্রোডাক্ট ম্যানেজমেন্ট (এডিট)</button>
      </div>

      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* ... অর্ডার লিস্টের কোড আগের মতোই আছে ... */}
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
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status || 'Pending'}</span>
                  </div>
                  <div className="text-sm text-gray-700 mb-4">
                    <p><span className="font-semibold">ঠিকানা:</span> {order.customerInfo?.address}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded mb-4">
                    <p className="font-bold text-sm mb-2 border-b pb-1">অর্ডার করা প্রোডাক্ট:</p>
                    {order.orderItems?.map(item => (
                      <div key={item.id} className="flex justify-between text-xs mb-1 text-gray-600">
                        <span>{item.name} (x{item.quantity})</span><span>৳{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t">
                      <span>মোট বিল:</span><span className="text-blue-600">৳{order.totalAmount}</span>
                    </div>
                  </div>
                  {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => updateOrderStatus(order, 'Delivered')} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 rounded transition">Delivered</button>
                      <button onClick={() => updateOrderStatus(order, 'Cancelled')} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2 rounded transition">Cancel</button>
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
              <input type="text" name="name" value={product.name} required onChange={handleAddInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-gray-700 font-bold mb-2">দাম (টাকা)</label>
                <input type="number" name="price" value={product.price} required onChange={handleAddInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">স্টক (পরিমাণ)</label>
                <input type="number" name="stock" value={product.stock} required onChange={handleAddInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {/* ক্যাটাগরি অপশন */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">ক্যাটাগরি</label>
                <select name="category" value={product.category} onChange={handleAddInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">ছবির লিংক (URL)</label>
              <input type="url" name="image" value={product.image} required onChange={handleAddInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
              <label className="block text-gray-700 font-bold mb-2">প্রোডাক্টের বিবরণ</label>
              <textarea name="description" value={product.description} required onChange={handleAddInputChange} rows="4" className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <button type="submit" disabled={isAddingProduct} className={`w-full text-white font-bold py-3 rounded-md mt-4 transition ${isAddingProduct ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isAddingProduct ? 'আপলোড হচ্ছে...' : 'প্রোডাক্ট আপলোড করুন'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'manageProducts' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">{editingProduct ? 'প্রোডাক্ট এডিট করুন' : 'সকল প্রোডাক্ট'}</h2>
          {editingProduct ? (
            <div className="max-w-2xl mx-auto">
              <button onClick={() => setEditingProduct(null)} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2">← ফিরে যান</button>
              <form onSubmit={handleUpdateProduct} className="space-y-5 bg-gray-50 p-6 rounded-lg border">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">প্রোডাক্টের নাম</label>
                  <input type="text" name="name" value={editingProduct.name} required onChange={handleEditInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">দাম (টাকা)</label>
                    <input type="number" name="price" value={editingProduct.price} required onChange={handleEditInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">বর্তমান স্টক</label>
                    <input type="number" name="stock" value={editingProduct.stock} required onChange={handleEditInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  {/* এডিট ফর্মে ক্যাটাগরি অপশন */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">ক্যাটাগরি</label>
                    <select name="category" value={editingProduct.category || 'Others'} onChange={handleEditInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">ছবির লিংক (URL)</label>
                  <input type="url" name="image" value={editingProduct.image} required onChange={handleEditInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">প্রোডাক্টের বিবরণ</label>
                  <textarea name="description" value={editingProduct.description || ''} onChange={handleEditInputChange} rows="4" className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <button type="submit" disabled={isUpdating} className={`w-full text-white font-bold py-3 rounded-md mt-4 transition ${isUpdating ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
                  {isUpdating ? 'আপডেট হচ্ছে...' : 'পরিবর্তন সেভ করুন'}
                </button>
              </form>
            </div>
          ) : (
            isLoadingProducts ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
            ) : allProducts.length === 0 ? (
              <div className="text-center text-gray-500 py-10">কোনো প্রোডাক্ট পাওয়া যায়নি।</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {allProducts.map(prod => (
                  <div key={prod.id} className="border p-4 rounded-lg flex flex-col hover:shadow-md transition bg-gray-50 relative">
                    {/* কার্ডের উপরে ক্যাটাগরি ব্যাজ */}
                    <span className="absolute top-2 right-2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded-full z-10">
                      {prod.category || 'Others'}
                    </span>
                    <img src={prod.image} alt={prod.name} className="h-40 w-full object-cover rounded mb-3 border" />
                    <h3 className="font-bold text-gray-800 line-clamp-2 h-12">{prod.name}</h3>
                    <div className="mt-2 text-sm">
                      <p><span className="font-semibold">দাম:</span> ৳{prod.price}</p>
                      <p><span className="font-semibold">স্টক:</span> <span className={prod.stock > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{prod.stock} টি</span></p>
                    </div>
                    <button onClick={() => setEditingProduct(prod)} className="mt-auto pt-3 pb-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded w-full font-bold transition">
                      এডিট করুন
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

    </div>
  );
};

export default Admin;