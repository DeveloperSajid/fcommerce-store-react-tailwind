import { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase'; 
import { collection, addDoc, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth'; 

const Admin = () => {
  const [activeTab, setActiveTab] = useState('orders'); 
  const categoriesList = ['Electronics', 'Gadgets', 'Fashion', 'Home Appliances', 'Others'];

  // ==========================================
  // ১. নতুন প্রোডাক্ট যোগ করার স্টেট ও ফাংশন
  // ==========================================
  const [product, setProduct] = useState({ 
    name: '', price: '', stock: '', description: '', category: 'Electronics', 
    image: '', image2: '', image3: '' 
  });
  const [imageFile, setImageFile] = useState(null); 
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const handleAddInputChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });
  
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // ভ্যালিডেশন: প্রধান ছবি থাকতেই হবে
    if (!product.image && !imageFile) {
      return alert("অনুগ্রহ করে অন্তত প্রধান ছবি (Image 1) এর লিংক দিন অথবা আপলোড করুন!");
    }
    
    setIsAddingProduct(true);
    try {
      let imageUrl = product.image; 

      // যদি ডিভাইস থেকে ছবি সিলেক্ট করা থাকে, সেটি আপলোড করে লিংক নেবে
      if (imageFile) {
        const imageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "products"), {
        name: product.name,
        price: Number(product.price),
        stock: Number(product.stock),
        description: product.description,
        category: product.category,
        image: imageUrl,          
        image2: product.image2,   
        image3: product.image3    
      });

      alert("🎉 প্রোডাক্ট সফলভাবে ডেটাবেসে যোগ করা হয়েছে!");
      setProduct({ name: '', price: '', stock: '', description: '', category: 'Electronics', image: '', image2: '', image3: '' });
      setImageFile(null); 
      document.getElementById('imageInput').value = ''; 
    } catch (error) {
      console.error(error);
      alert("দুঃখিত, প্রোডাক্ট যোগ করতে সমস্যা হয়েছে।");
    } finally {
      setIsAddingProduct(false);
    }
  };

  // ==========================================
  // ২. কাস্টমার অর্ডার ম্যানেজমেন্ট (৬টি স্ট্যাটাসসহ)
  // ==========================================
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

  // স্ট্যাটাস অনুযায়ী ব্যাজের রং ঠিক করার হেল্পার
  const getAdminStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Hold': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const updateOrderStatus = async (order, newStatus) => {
    if (order.status === newStatus) return;

    if (newStatus === 'Cancelled') {
      const isConfirm = window.confirm("আপনি কি নিশ্চিত যে এই অর্ডারটি ক্যানসেল করতে চান? ক্যানসেল করলে প্রোডাক্টের স্টক আবার ডেটাবেসে ফেরত যাবে।");
      if (!isConfirm) return;
    }

    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, { status: newStatus });

      // যদি অর্ডার ক্যানসেল করা হয় (এবং আগে ক্যানসেল না থেকে থাকে), তবে স্টক ফেরত যাবে
      if (newStatus === 'Cancelled' && order.status !== 'Cancelled') {
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

  // ==========================================
  // ৩. প্রোডাক্ট ম্যানেজমেন্ট ও এডিট
  // ==========================================
  const [allProducts, setAllProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); 
  const [editImageFile, setEditImageFile] = useState(null); 
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

  const handleEditImageChange = (e) => {
    if (e.target.files[0]) {
      setEditImageFile(e.target.files[0]);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    if (!editingProduct.image && !editImageFile) {
      return alert("অনুগ্রহ করে প্রধান ছবির লিংক দিন অথবা একটি ছবি আপলোড করুন!");
    }

    setIsUpdating(true);
    try {
      let imageUrl = editingProduct.image; 

      if (editImageFile) {
        const imageRef = ref(storage, `products/${Date.now()}_${editImageFile.name}`);
        await uploadBytes(imageRef, editImageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const productRef = doc(db, "products", editingProduct.id);
      await updateDoc(productRef, {
        name: editingProduct.name,
        price: Number(editingProduct.price),
        stock: Number(editingProduct.stock),
        description: editingProduct.description || '',
        category: editingProduct.category || 'Others',
        image: imageUrl,
        image2: editingProduct.image2 || '',
        image3: editingProduct.image3 || ''
      });
      alert("প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে!");
      setEditingProduct(null); 
      setEditImageFile(null);
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
      
      {/* হেডার */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">অ্যাডমিন ড্যাশবোর্ড</h1>
        <button onClick={() => signOut(auth)} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md font-bold transition duration-300 shadow-md">
          লগআউট করুন
        </button>
      </div>

      {/* ট্যাব নেভিগেশন */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button onClick={() => setActiveTab('orders')} className={`px-6 py-2 rounded-md font-bold transition duration-300 ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border hover:bg-gray-100'}`}>কাস্টমার অর্ডার</button>
        <button onClick={() => setActiveTab('addProduct')} className={`px-6 py-2 rounded-md font-bold transition duration-300 ${activeTab === 'addProduct' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border hover:bg-gray-100'}`}>নতুন প্রোডাক্ট যোগ</button>
        <button onClick={() => { setActiveTab('manageProducts'); setEditingProduct(null); }} className={`px-6 py-2 rounded-md font-bold transition duration-300 ${activeTab === 'manageProducts' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border hover:bg-gray-100'}`}>প্রোডাক্ট ম্যানেজমেন্ট (এডিট)</button>
      </div>

      {/* ========================================== */}
      {/* ট্যাব ১: কাস্টমার অর্ডারসমূহ */}
      {/* ========================================== */}
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
                    {/* ডায়নামিক কালার ব্যাজ */}
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getAdminStatusColor(order.status || 'Pending')}`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-4">
                    <p><span className="font-semibold">ঠিকানা:</span> {order.customerInfo?.address}</p>
                    {order.customerInfo?.paymentMethod === 'bkash' && (
                      <div className="bg-pink-50 p-2 mt-2 rounded text-xs border border-pink-100">
                        <p className="font-bold text-pink-600 mb-1">bKash Payment</p>
                        <p>নম্বর: {order.customerInfo?.bkashNumber}</p>
                        <p>TrxID: <span className="font-mono">{order.customerInfo?.trxId}</span></p>
                      </div>
                    )}
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
                  
                  {/* নতুন ড্রপডাউন (Select) মেনু স্ট্যাটাস আপডেটের জন্য */}
                  <div className="flex items-center gap-3 mt-4 border-t pt-4 bg-gray-50 p-3 rounded-md">
                    <span className="font-bold text-gray-700 text-sm">স্ট্যাটাস পরিবর্তন:</span>
                    <select
                      value={order.status || 'Pending'}
                      onChange={(e) => updateOrderStatus(order, e.target.value)}
                      className={`border-2 p-2 rounded focus:outline-none font-semibold text-sm flex-grow cursor-pointer ${getAdminStatusColor(order.status || 'Pending')}`}
                    >
                      <option value="Pending" className="text-yellow-700 bg-white">Pending (পেন্ডিং)</option>
                      <option value="Hold" className="text-orange-700 bg-white">Hold (হোল্ড)</option>
                      <option value="Processing" className="text-blue-700 bg-white">Processing (প্রসেসিং)</option>
                      <option value="Shipped" className="text-purple-700 bg-white">Shipped (শিপিং)</option>
                      <option value="Delivered" className="text-green-700 bg-white">Delivered (ডেলিভারি সম্পন্ন)</option>
                      <option value="Cancelled" className="text-red-700 bg-white">Cancelled (বাতিল)</option>
                    </select>
                  </div>

                </div>
              ))}
             </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* ট্যাব ২: নতুন প্রোডাক্ট আপলোড */}
      {/* ========================================== */}
      {activeTab === 'addProduct' && (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-4">নতুন প্রোডাক্ট আপলোড করুন</h2>
          <form onSubmit={handleAddProduct} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-bold mb-2">প্রোডাক্টের নাম *</label>
              <input type="text" name="name" value={product.name} required onChange={handleAddInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-gray-700 font-bold mb-2">দাম (টাকা) *</label>
                <input type="number" name="price" value={product.price} required onChange={handleAddInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">স্টক (পরিমাণ) *</label>
                <input type="number" name="stock" value={product.stock} required onChange={handleAddInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">ক্যাটাগরি *</label>
                <select name="category" value={product.category} onChange={handleAddInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {/* প্রধান ছবি */}
              <div className="border border-blue-200 p-5 rounded-lg bg-blue-50 bg-opacity-30">
                <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">প্রধান ছবি (আবশ্যক) *</h3>
                <div className="mb-3">
                  <label className="block text-gray-600 text-sm font-bold mb-1">লিংক (URL) দিন:</label>
                  <input type="url" name="image" value={product.image} onChange={handleAddInputChange} className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="https://example.com/image.jpg" />
                </div>
                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-gray-300"></div><span className="flex-shrink-0 mx-4 text-gray-400 font-bold text-xs">অথবা</span><div className="flex-grow border-t border-gray-300"></div>
                </div>
                <div className="mt-2">
                  <label className="block text-gray-600 text-sm font-bold mb-1">ডিভাইস থেকে আপলোড করুন:</label>
                  <input id="imageInput" type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-blue-100 file:text-blue-700 cursor-pointer" />
                </div>
                {/* প্রধান ছবির প্রিভিউ */}
                <div className="mt-3">
                  {imageFile ? (
                    <img src={URL.createObjectURL(imageFile)} alt="Preview File" className="h-24 object-cover rounded border shadow-sm" />
                  ) : product.image ? (
                    <img src={product.image} alt="Preview URL" className="h-24 object-cover rounded border shadow-sm" />
                  ) : null}
                </div>
              </div>

              {/* ২য় ছবি */}
              <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                <h3 className="font-bold text-gray-600 mb-2 border-b pb-2">২য় ছবি (ঐচ্ছিক)</h3>
                <input type="url" name="image2" value={product.image2} onChange={handleAddInputChange} className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="২য় ছবির লিংক (URL) দিন" />
                {product.image2 && <img src={product.image2} alt="Preview 2" className="h-16 mt-2 rounded border" />}
              </div>

              {/* ৩য় ছবি */}
              <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                <h3 className="font-bold text-gray-600 mb-2 border-b pb-2">৩য় ছবি (ঐচ্ছিক)</h3>
                <input type="url" name="image3" value={product.image3} onChange={handleAddInputChange} className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="৩য় ছবির লিংক (URL) দিন" />
                {product.image3 && <img src={product.image3} alt="Preview 3" className="h-16 mt-2 rounded border" />}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 font-bold mb-2">প্রোডাক্টের বিবরণ *</label>
              <textarea name="description" value={product.description} required onChange={handleAddInputChange} rows="4" className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <button type="submit" disabled={isAddingProduct} className={`w-full text-white font-bold py-3 rounded-md mt-4 transition ${isAddingProduct ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isAddingProduct ? 'আপলোড হচ্ছে (অপেক্ষা করুন)...' : 'প্রোডাক্ট আপলোড করুন'}
            </button>
          </form>
        </div>
      )}

      {/* ========================================== */}
      {/* ট্যাব ৩: প্রোডাক্ট ম্যানেজমেন্ট (এডিট) */}
      {/* ========================================== */}
      {activeTab === 'manageProducts' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">{editingProduct ? 'প্রোডাক্ট এডিট করুন' : 'সকল প্রোডাক্ট'}</h2>
          
          {editingProduct ? (
            <div className="max-w-2xl mx-auto">
              <button onClick={() => setEditingProduct(null)} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2">← ফিরে যান</button>
              <form onSubmit={handleUpdateProduct} className="space-y-5 bg-gray-50 p-6 rounded-lg border">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">প্রোডাক্টের নাম *</label>
                  <input type="text" name="name" value={editingProduct.name} required onChange={handleEditInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">দাম (টাকা) *</label>
                    <input type="number" name="price" value={editingProduct.price} required onChange={handleEditInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">বর্তমান স্টক *</label>
                    <input type="number" name="stock" value={editingProduct.stock} required onChange={handleEditInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">ক্যাটাগরি *</label>
                    <select name="category" value={editingProduct.category || 'Others'} onChange={handleEditInputChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      {categoriesList.map(cat => (
                         <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* এডিট ফর্মে ছবি আপডেটের অপশন */}
                <div className="space-y-4">
                  <div className="border border-blue-200 p-4 rounded-lg bg-white">
                    <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">প্রধান ছবি এডিট</h3>
                    <div className="mb-3">
                      <label className="block text-gray-600 text-sm font-bold mb-1">লিংক (URL) পরিবর্তন করুন:</label>
                      <input type="url" name="image" value={editingProduct.image} onChange={handleEditInputChange} className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="relative flex items-center py-1">
                      <div className="flex-grow border-t border-gray-200"></div><span className="flex-shrink-0 mx-4 text-gray-400 font-bold text-xs">অথবা</span><div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    <div className="mt-2">
                      <label className="block text-gray-600 text-sm font-bold mb-1">নতুন ছবি আপলোড করুন:</label>
                      <input type="file" accept="image/*" onChange={handleEditImageChange} className="w-full text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer" />
                    </div>
                    <div className="mt-3 pt-2 border-t">
                      <p className="text-xs font-bold text-gray-500 mb-1">প্রিভিউ:</p>
                      {editImageFile ? (
                        <img src={URL.createObjectURL(editImageFile)} alt="New Preview" className="h-20 object-cover rounded border shadow-sm" />
                      ) : editingProduct.image ? (
                        <img src={editingProduct.image} alt="Current Preview" className="h-20 object-cover rounded border shadow-sm" />
                      ) : null}
                    </div>
                  </div>

                  <div className="border border-gray-200 p-4 rounded-lg bg-white">
                    <h3 className="font-bold text-gray-600 mb-2 border-b pb-2">২য় ছবি এডিট (ঐচ্ছিক)</h3>
                    <input type="url" name="image2" value={editingProduct.image2 || ''} onChange={handleEditInputChange} className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="২য় ছবির লিংক (URL)" />
                    {editingProduct.image2 && <img src={editingProduct.image2} alt="Preview 2" className="h-16 mt-2 rounded border" />}
                  </div>

                  <div className="border border-gray-200 p-4 rounded-lg bg-white">
                    <h3 className="font-bold text-gray-600 mb-2 border-b pb-2">৩য় ছবি এডিট (ঐচ্ছিক)</h3>
                    <input type="url" name="image3" value={editingProduct.image3 || ''} onChange={handleEditInputChange} className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="৩য় ছবির লিংক (URL)" />
                    {editingProduct.image3 && <img src={editingProduct.image3} alt="Preview 3" className="h-16 mt-2 rounded border" />}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">প্রোডাক্টের বিবরণ *</label>
                  <textarea name="description" value={editingProduct.description || ''} required onChange={handleEditInputChange} rows="4" className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <button type="submit" disabled={isUpdating} className={`w-full text-white font-bold py-3 rounded-md mt-4 transition ${isUpdating ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
                  {isUpdating ? 'আপডেট হচ্ছে...' : 'পরিবর্তন সেভ করুন'}
                </button>
              </form>
            </div>
          ) : (
            /* সব প্রোডাক্টের লিস্ট দেখানোর অংশ */
            isLoadingProducts ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
            ) : allProducts.length === 0 ? (
              <div className="text-center text-gray-500 py-10">কোনো প্রোডাক্ট পাওয়া যায়নি।</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {allProducts.map(prod => (
                  <div key={prod.id} className="border p-4 rounded-lg flex flex-col hover:shadow-md transition bg-gray-50 relative">
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