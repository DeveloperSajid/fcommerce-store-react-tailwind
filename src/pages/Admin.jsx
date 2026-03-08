import { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase'; 
import { collection, addDoc, getDocs, doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth'; 
import toast from 'react-hot-toast';

// PDF এর জন্য প্রয়োজনীয় ইম্পোর্ট
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FaDownload } from 'react-icons/fa';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('orders'); 
  const categoriesList = ['Electronics', 'Gadgets', 'Fashion', 'Home Appliances', 'Others'];

  // --- ১. প্রোডাক্ট যোগ করার স্টেট (৩টি ছবির অপশনসহ) ---
  const [product, setProduct] = useState({ name: '', price: '', stock: '', description: '', category: 'Electronics', image: '', image2: '', image3: '' });
  const [imageFile, setImageFile] = useState(null); 
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const handleAddInputChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });
  const handleImageChange = (e) => { if (e.target.files[0]) setImageFile(e.target.files[0]); };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!product.image && !imageFile) return toast.error("প্রধান ছবির লিংক দিন অথবা আপলোড করুন!");
    setIsAddingProduct(true);
    try {
      let imageUrl = product.image; 
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
        image2: product.image2 || '',
        image3: product.image3 || ''
      });

      toast.success("🎉 প্রোডাক্ট সফলভাবে যোগ করা হয়েছে!");
      setProduct({ name: '', price: '', stock: '', description: '', category: 'Electronics', image: '', image2: '', image3: '' });
      setImageFile(null); 
      document.getElementById('imageInput').value = ''; 
    } catch (error) {
      console.error(error); toast.error("প্রোডাক্ট যোগ করতে সমস্যা হয়েছে।");
    } finally { setIsAddingProduct(false); }
  };

  // --- ২. অর্ডার ম্যানেজমেন্ট ---
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      let ordersArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      ordersArray.sort((a, b) => (b.orderDate?.toDate() || 0) - (a.orderDate?.toDate() || 0));
      setOrders(ordersArray);
    } catch (error) { console.error(error); } finally { setIsLoadingOrders(false); }
  };

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
    if (newStatus === 'Cancelled' && !window.confirm("অর্ডারটি ক্যানসেল করতে চান? ক্যানসেল করলে স্টক ফেরত যাবে।")) return;
    try {
      await updateDoc(doc(db, "orders", order.id), { status: newStatus });
      if (newStatus === 'Cancelled' && order.status !== 'Cancelled') {
        for (const item of order.orderItems) {
          await updateDoc(doc(db, "products", item.id), { stock: increment(item.quantity) });
        }
      }
      toast.success(`স্ট্যাটাস '${newStatus}'-এ আপডেট হয়েছে!`);
      fetchOrders(); 
    } catch (error) { console.error(error); toast.error("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।"); }
  };

  // --- ৩. ইনভয়েস জেনারেটর ফাংশন (PDF) ---
  const downloadInvoice = (order) => {
    const doc = new jsPDF();
    
    // হেডার
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text(storeSettings.storePickupName, 105, 15, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(storeSettings.storePickupAddress, 105, 22, { align: "center" });
    doc.line(20, 25, 190, 25);

    // অর্ডার ইনফো
    doc.setFontSize(12);
    doc.text(`Invoice ID: ${order.id.slice(-6).toUpperCase()}`, 20, 35);
    doc.text(`Date: ${order.orderDate?.toDate().toLocaleDateString('bn-BD')}`, 20, 42);
    doc.text(`Status: ${order.status}`, 20, 49);

    // বিলিং ডিটেইলস
    doc.text("Bill To:", 20, 60);
    doc.setFont(undefined, 'bold');
    doc.text(order.customerInfo.name, 20, 67);
    doc.setFont(undefined, 'normal');
    doc.text(`Phone: ${order.customerInfo.phone}`, 20, 74);
    doc.text(`Address: ${order.customerInfo.address}`, 20, 81, { maxWidth: 80 });

    // টেবিল তৈরি
    const tableColumn = ["Product Name", "Price", "Qty", "Total"];
    const tableRows = [];

    order.orderItems.forEach(item => {
      const rowData = [
        item.name,
        `${item.price} TK`,
        item.quantity,
        `${item.price * item.quantity} TK`
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      startY: 90,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillGray: [41, 128, 185], textColor: 255 }
    });

    // বিল সামারি
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Sub-Total: ${order.totalAmount} TK`, 140, finalY);
    doc.text(`Delivery Fee: ${order.deliveryFee || 0} TK`, 140, finalY + 7);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Grand Total: ${order.grandTotal || order.totalAmount} TK`, 140, finalY + 15);

    // ফুটার
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text("Thank you for shopping with us!", 105, 280, { align: "center" });

    doc.save(`Invoice_${order.id.slice(-6)}.pdf`);
    toast.success("ইনভয়েস ডাউনলোড হচ্ছে...");
  };

  // --- ৪. প্রোডাক্ট ম্যানেজমেন্ট (এডিট) ---
  const [allProducts, setAllProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null); 
  const [editImageFile, setEditImageFile] = useState(null); 
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAllProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      setAllProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.error(error); }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct.image && !editImageFile) return toast.error("প্রধান ছবির লিংক দিন!");
    setIsUpdating(true);
    try {
      let imageUrl = editingProduct.image; 
      if (editImageFile) {
        const imageRef = ref(storage, `products/${Date.now()}_${editImageFile.name}`);
        await uploadBytes(imageRef, editImageFile);
        imageUrl = await getDownloadURL(imageRef);
      }
      
      await updateDoc(doc(db, "products", editingProduct.id), {
        name: editingProduct.name, 
        price: Number(editingProduct.price), 
        stock: Number(editingProduct.stock),
        description: editingProduct.description || '', 
        category: editingProduct.category || 'Others',
        image: imageUrl,
        image2: editingProduct.image2 || '',
        image3: editingProduct.image3 || ''
      });

      toast.success("প্রোডাক্ট আপডেট হয়েছে!");
      setEditingProduct(null); setEditImageFile(null); fetchAllProducts(); 
    } catch (error) { console.error(error); toast.error("আপডেট করতে সমস্যা হয়েছে।"); } finally { setIsUpdating(false); }
  };

  // --- ৫. সেটিংস (ডেলিভারি ও স্টোর পিকআপ) ---
  const [storeSettings, setStoreSettings] = useState({ 
    bogura: 60, 
    dhaka: 120, 
    others: 150,
    storePickupName: 'Sajid Tech & Finance',
    storePickupAddress: 'বগুড়া সদর, বগুড়া।'
  });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const fetchSettings = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "delivery"));
      if (docSnap.exists()) {
        setStoreSettings({ ...storeSettings, ...docSnap.data() });
      }
    } catch (error) { console.error("Error fetching settings:", error); }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    try {
      await setDoc(doc(db, "settings", "delivery"), {
        bogura: Number(storeSettings.bogura),
        dhaka: Number(storeSettings.dhaka),
        others: Number(storeSettings.others),
        storePickupName: storeSettings.storePickupName,
        storePickupAddress: storeSettings.storePickupAddress
      }, { merge: true });
      toast.success("✅ সেটিংস সফলভাবে আপডেট হয়েছে!");
    } catch (error) {
      console.error("Error updating settings:", error); toast.error("সমস্যা হয়েছে!");
    } finally { setIsUpdatingSettings(false); }
  };

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'manageProducts') fetchAllProducts();
    if (activeTab === 'settings') fetchSettings();
  }, [activeTab]);


  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">অ্যাডমিন ড্যাশবোর্ড</h1>
        <button onClick={() => signOut(auth)} className="bg-red-500 text-white px-5 py-2 rounded-md font-bold shadow-md">লগআউট</button>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button onClick={() => setActiveTab('orders')} className={`px-6 py-2 rounded-md font-bold ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border'}`}>অর্ডারসমূহ</button>
        <button onClick={() => setActiveTab('addProduct')} className={`px-6 py-2 rounded-md font-bold ${activeTab === 'addProduct' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border'}`}>নতুন প্রোডাক্ট</button>
        <button onClick={() => { setActiveTab('manageProducts'); setEditingProduct(null); }} className={`px-6 py-2 rounded-md font-bold ${activeTab === 'manageProducts' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border'}`}>প্রোডাক্ট ম্যানেজমেন্ট</button>
        <button onClick={() => setActiveTab('settings')} className={`px-6 py-2 rounded-md font-bold ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border'}`}>সেটিংস</button>
      </div>

      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold border-b pb-4 mb-6">সর্বশেষ অর্ডারসমূহ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map(order => (
              <div key={order.id} className="border rounded-lg p-5 mb-4 shadow-sm hover:shadow-md transition bg-white">
                <div className="flex justify-between items-start mb-4 border-b pb-3">
                  <div>
                    <span className="text-xs text-gray-500 uppercase">ID: {order.id.slice(-6)}</span>
                    <p className="font-bold text-gray-800">{order.customerInfo?.name}</p>
                    <p className="text-sm">{order.customerInfo?.phone}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${getAdminStatusColor(order.status || 'Pending')}`}>{order.status || 'Pending'}</span>
                </div>
                <div className="text-sm mb-4 h-20 overflow-y-auto">
                  <p><span className="font-semibold">ঠিকানা:</span> {order.customerInfo?.address}</p>
                  {order.customerInfo?.paymentMethod === 'bkash' && (
                    <div className="bg-pink-50 p-2 mt-2 rounded text-xs border border-pink-100 text-pink-600 font-bold">
                      bKash | {order.customerInfo?.bkashNumber} | ID: {order.customerInfo?.trxId}
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 p-3 rounded mb-4 text-xs">
                  {order.orderItems?.map(item => (
                    <div key={item.id} className="flex justify-between mb-1 text-gray-600">
                      <span>{item.name} (x{item.quantity})</span><span>৳{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2 text-gray-600 flex justify-between">
                    <span>ডেলিভারি চার্জ:</span> <span>৳{order.deliveryFee || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm mt-1 text-blue-600">
                    <span>সর্বমোট বিল:</span><span>৳{order.grandTotal || order.totalAmount}</span>
                  </div>
                </div>
                
                {/* স্ট্যাটাস ড্রপডাউন এবং ইনভয়েস বাটন */}
                <div className="flex flex-col gap-2 mt-4 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">স্ট্যাটাস:</span>
                    <select value={order.status || 'Pending'} onChange={(e) => updateOrderStatus(order, e.target.value)} className={`border p-2 rounded flex-grow font-semibold text-xs ${getAdminStatusColor(order.status || 'Pending')}`}>
                      <option value="Pending">Pending</option>
                      <option value="Hold">Hold</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <button 
                    onClick={() => downloadInvoice(order)}
                    className="w-full bg-gray-800 text-white py-2 rounded-md font-bold flex justify-center items-center gap-2 hover:bg-black transition text-sm shadow-sm"
                  >
                    <FaDownload size={14} /> Download Invoice (PDF)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto border-t-4 border-blue-600">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b pb-4">ওয়েবসাইট সেটিংস</h2>
          <form onSubmit={handleUpdateSettings} className="space-y-6">
            <div className="bg-gray-50 p-5 rounded-lg border">
              <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">🚚 ডেলিভারি চার্জ সেটিংস</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">বগুড়া (৳)</label>
                  <input type="number" value={storeSettings.bogura} required onChange={(e) => setStoreSettings({...storeSettings, bogura: e.target.value})} className="w-full border p-3 rounded font-bold text-blue-600" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">ঢাকা (৳)</label>
                  <input type="number" value={storeSettings.dhaka} required onChange={(e) => setStoreSettings({...storeSettings, dhaka: e.target.value})} className="w-full border p-3 rounded font-bold text-blue-600" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">অন্যান্য (৳)</label>
                  <input type="number" value={storeSettings.others} required onChange={(e) => setStoreSettings({...storeSettings, others: e.target.value})} className="w-full border p-3 rounded font-bold text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
              <h3 className="font-bold text-lg mb-4 text-indigo-900 border-b pb-2">🏬 স্টোর পিকআপ সেটিংস</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-indigo-800 font-bold mb-2">দোকানের নাম</label>
                  <input type="text" value={storeSettings.storePickupName} required onChange={(e) => setStoreSettings({...storeSettings, storePickupName: e.target.value})} className="w-full border p-3 rounded font-semibold text-gray-800" />
                </div>
                <div>
                  <label className="block text-indigo-800 font-bold mb-2">ঠিকানা</label>
                  <input type="text" value={storeSettings.storePickupAddress} required onChange={(e) => setStoreSettings({...storeSettings, storePickupAddress: e.target.value})} className="w-full border p-3 rounded font-semibold text-gray-800" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isUpdatingSettings} className={`w-full text-white font-bold py-4 rounded-lg text-lg transition ${isUpdatingSettings ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}>
              {isUpdatingSettings ? 'সেভ হচ্ছে...' : 'সেটিংস আপডেট করুন'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'addProduct' && (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold border-b pb-4 mb-6 text-center">নতুন প্রোডাক্ট আপলোড</h2>
          <form onSubmit={handleAddProduct} className="space-y-5">
            <div><label className="block font-bold mb-2">প্রোডাক্টের নাম *</label><input type="text" name="name" value={product.name} required onChange={handleAddInputChange} className="w-full border p-3 rounded" /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div><label className="block font-bold mb-2">দাম *</label><input type="number" name="price" value={product.price} required onChange={handleAddInputChange} className="w-full border p-3 rounded" /></div>
              <div><label className="block font-bold mb-2">স্টক *</label><input type="number" name="stock" value={product.stock} required onChange={handleAddInputChange} className="w-full border p-3 rounded" /></div>
              <div><label className="block font-bold mb-2">ক্যাটাগরি *</label><select name="category" value={product.category} onChange={handleAddInputChange} className="w-full border p-3 rounded bg-white">{categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
            </div>
            
            <div className="space-y-4">
              <div className="border border-blue-200 p-5 rounded-lg bg-blue-50 bg-opacity-30">
                <h3 className="font-bold mb-3 border-b pb-2">প্রধান ছবি (আবশ্যক) *</h3>
                <input type="url" name="image" value={product.image} onChange={handleAddInputChange} className="w-full border p-2 rounded mb-2 bg-white" placeholder="URL দিন" />
                <input type="file" id="imageInput" accept="image/*" onChange={handleImageChange} className="w-full text-sm" />
              </div>
              
              <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                <h3 className="font-bold text-gray-600 mb-2 border-b pb-2">২য় ছবি (ঐচ্ছিক)</h3>
                <input type="url" name="image2" value={product.image2} onChange={handleAddInputChange} className="w-full border p-2 rounded focus:outline-none bg-white" placeholder="২য় ছবির লিংক (URL) দিন" />
              </div>

              <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                <h3 className="font-bold text-gray-600 mb-2 border-b pb-2">৩য় ছবি (ঐচ্ছিক)</h3>
                <input type="url" name="image3" value={product.image3} onChange={handleAddInputChange} className="w-full border p-2 rounded focus:outline-none bg-white" placeholder="৩য় ছবির লিংক (URL) দিন" />
              </div>
            </div>

            <div><label className="block font-bold mb-2">বিবরণ *</label><textarea name="description" value={product.description} required onChange={handleAddInputChange} rows="3" className="w-full border p-3 rounded"></textarea></div>
            <button type="submit" disabled={isAddingProduct} className={`w-full text-white font-bold py-3 rounded mt-4 ${isAddingProduct ? 'bg-gray-400' : 'bg-blue-600'}`}>{isAddingProduct ? 'আপলোড হচ্ছে...' : 'আপলোড করুন'}</button>
          </form>
        </div>
      )}

      {activeTab === 'manageProducts' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold border-b pb-4 mb-6">{editingProduct ? 'এডিট করুন' : 'সকল প্রোডাক্ট'}</h2>
          {editingProduct ? (
            <div className="max-w-2xl mx-auto">
              <button onClick={() => setEditingProduct(null)} className="mb-4 text-blue-600 font-bold">← ফিরে যান</button>
              <form onSubmit={handleUpdateProduct} className="space-y-5 border p-5 rounded bg-gray-50">
                <div><label className="block font-bold mb-2">নাম</label><input type="text" name="name" value={editingProduct.name} required onChange={(e)=>setEditingProduct({...editingProduct, name: e.target.value})} className="w-full border p-3 rounded" /></div>
                <div className="grid grid-cols-2 gap-5">
                  <div><label className="block font-bold mb-2">দাম</label><input type="number" name="price" value={editingProduct.price} required onChange={(e)=>setEditingProduct({...editingProduct, price: e.target.value})} className="w-full border p-3 rounded" /></div>
                  <div><label className="block font-bold mb-2">স্টক</label><input type="number" name="stock" value={editingProduct.stock} required onChange={(e)=>setEditingProduct({...editingProduct, stock: e.target.value})} className="w-full border p-3 rounded" /></div>
                </div>
                
                <div className="space-y-4">
                  <div className="border p-4 rounded bg-white">
                    <h3 className="font-bold mb-2">প্রধান ছবি এডিট</h3>
                    <input type="url" value={editingProduct.image} onChange={(e)=>setEditingProduct({...editingProduct, image: e.target.value})} className="w-full border p-2 rounded mb-2" />
                    <input type="file" accept="image/*" onChange={(e) => setEditImageFile(e.target.files[0])} className="w-full text-sm" />
                  </div>
                  <input type="url" name="image2" value={editingProduct.image2 || ''} onChange={(e)=>setEditingProduct({...editingProduct, image2: e.target.value})} className="w-full border p-2 rounded" placeholder="২য় ছবির লিংক" />
                  <input type="url" name="image3" value={editingProduct.image3 || ''} onChange={(e)=>setEditingProduct({...editingProduct, image3: e.target.value})} className="w-full border p-2 rounded" placeholder="৩য় ছবির লিংক" />
                </div>

                <div><label className="block font-bold mb-2">বিবরণ</label><textarea value={editingProduct.description || ''} onChange={(e)=>setEditingProduct({...editingProduct, description: e.target.value})} rows="3" className="w-full border p-3 rounded"></textarea></div>
                <button type="submit" disabled={isUpdating} className={`w-full text-white font-bold py-3 rounded mt-4 ${isUpdating ? 'bg-gray-400' : 'bg-green-600'}`}>পরিবর্তন সেভ করুন</button>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {allProducts.map(prod => (
                <div key={prod.id} className="border p-3 rounded flex flex-col items-center text-center">
                  <img src={prod.image} alt="img" className="h-24 object-cover mb-2 rounded" />
                  <p className="font-bold text-sm line-clamp-1">{prod.name}</p>
                  <p className="text-xs text-blue-600 font-bold mb-2">৳{prod.price}</p>
                  <button onClick={() => setEditingProduct(prod)} className="bg-blue-100 text-blue-700 w-full py-1 rounded text-sm font-bold">এডিট</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default Admin;