import { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // ডেটাবেস থেকে পাওয়া সেটিংস (ডেলিভারি চার্জ এবং স্টোর পিকআপ অ্যাড্রেস)
  const [storeSettings, setStoreSettings] = useState({ 
    bogura: 60, 
    dhaka: 120, 
    others: 150,
    storePickupName: 'Sajid Tech & Finance',
    storePickupAddress: 'বগুড়া সদর, বগুড়া'
  });

  const [formData, setFormData] = useState({
    name: '', phone: '01', address: '', paymentMethod: 'cod', bkashNumber: '01', trxId: '', 
    deliveryMethod: 'homeDelivery', deliveryLocation: 'bogura'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "delivery"));
        if (docSnap.exists()) {
          setStoreSettings({
            ...storeSettings,
            ...docSnap.data()
          });
        }
      } catch (error) { console.error("Error fetching settings:", error); }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNameChange = (e) => {
    let val = e.target.value.replace(/[^a-zA-Z\u0980-\u09FF\s.]/g, ''); 
    if (val.length <= 30) setFormData({ ...formData, name: val });
  };

  const handlePhoneNumberChange = (e, field) => {
    let onlyNums = e.target.value.replace(/[^0-9]/g, '');
    if (!onlyNums.startsWith('01')) onlyNums = '01'; 
    if (onlyNums.length <= 11) setFormData({ ...formData, [field]: onlyNums });
  };

  const handleTrxIdChange = (e) => {
    let val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
    if (val.length <= 30) setFormData({ ...formData, trxId: val });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 11) return alert("১১ ডিজিটের সঠিক মোবাইল নম্বর দিন।");
    if (formData.paymentMethod === 'bkash') {
      if (formData.bkashNumber.length !== 11) return alert("১১ ডিজিটের সঠিক বিকাশ নম্বর দিন।");
      if (formData.trxId.length === 0) return alert("Transaction ID দিন।");
    }
    
    setIsLoading(true);

    const deliveryFee = formData.deliveryMethod === 'storePickup' ? 0 : storeSettings[formData.deliveryLocation];
    const grandTotal = cartTotal + deliveryFee;

    // ডায়নামিক স্টোর পিকআপের ঠিকানা
    const finalAddress = formData.deliveryMethod === 'storePickup' 
      ? `স্টোর পিকআপ: ${storeSettings.storePickupName}, ${storeSettings.storePickupAddress}` 
      : formData.address;

    try {
      await addDoc(collection(db, "orders"), {
        customerInfo: {
          ...formData,
          address: finalAddress 
        },
        orderItems: cart,
        totalAmount: cartTotal,
        deliveryFee: deliveryFee,
        grandTotal: grandTotal,
        status: "Pending",
        orderDate: serverTimestamp()
      });

      for (const item of cart) {
        const productRef = doc(db, "products", item.id);
        await updateDoc(productRef, {
          stock: increment(-item.quantity)
        });
      }

      try {
        const templateParams = {
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: finalAddress,
          payment_method: formData.paymentMethod,
          total_amount: grandTotal,
        };
        
        await emailjs.send(
          'service_foi8w12',     // আপনার Service ID
          'template_sav7hna',    // আপনার Template ID
          templateParams, 
          'A5tzlb51wbGgiSFRI'    // আপনার Public Key
        );
      } catch (emailError) {
        console.error("Email error: ", emailError);
      }

      alert("ধন্যবাদ! আপনার অর্ডারটি সফলভাবে প্লেস হয়েছে।");
      clearCart();
      navigate('/');
      
    } catch (error) {
      console.error(error);
      alert("দুঃখিত, অর্ডার প্লেস হয়নি। ইন্টারনেট কানেকশন চেক করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">আপনার কার্টে কোনো প্রোডাক্ট নেই!</h2>
        <Link to="/" className="text-blue-600 hover:underline font-semibold">কেনাকাটা করুন</Link>
      </div>
    );
  }

  const isFormValid = formData.phone.length === 11 && 
    (formData.deliveryMethod === 'storePickup' || formData.address.length > 0) &&
    (formData.paymentMethod === 'cod' || (formData.paymentMethod === 'bkash' && formData.bkashNumber.length === 11 && formData.trxId.length > 0));

  const currentDeliveryFee = formData.deliveryMethod === 'storePickup' ? 0 : storeSettings[formData.deliveryLocation];
  const currentGrandTotal = cartTotal + currentDeliveryFee;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">চেকআউট</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        
        <div className="lg:w-2/3 bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">আপনার নাম *</label>
              <input type="text" name="name" value={formData.name} required onChange={handleNameChange} className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="সম্পূর্ণ নাম লিখুন" />
            </div>
            <div>
              <label className="block font-semibold mb-2">মোবাইল নম্বর *</label>
              <input type="tel" name="phone" value={formData.phone} required onChange={(e) => handlePhoneNumberChange(e, 'phone')} className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="01XXXXXXXXX" />
            </div>

            <div className="pt-2">
              <label className="block font-bold mb-3 text-gray-800">ডেলিভারি মেথড সিলেক্ট করুন *</label>
              <div className="flex flex-col sm:flex-row gap-4 mb-2">
                <label className={`flex-1 border-2 p-3 rounded-lg cursor-pointer flex items-center gap-2 transition-all ${formData.deliveryMethod === 'homeDelivery' ? 'border-blue-600 bg-blue-50' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                  <input type="radio" name="deliveryMethod" value="homeDelivery" checked={formData.deliveryMethod === 'homeDelivery'} onChange={handleInputChange} className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-700">হোম ডেলিভারি</span>
                </label>
                <label className={`flex-1 border-2 p-3 rounded-lg cursor-pointer flex items-center gap-2 transition-all ${formData.deliveryMethod === 'storePickup' ? 'border-blue-600 bg-blue-50' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                  <input type="radio" name="deliveryMethod" value="storePickup" checked={formData.deliveryMethod === 'storePickup'} onChange={handleInputChange} className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-700">স্টোর পিকআপ</span>
                </label>
              </div>
            </div>

            {formData.deliveryMethod === 'storePickup' && (
              <div className="bg-indigo-50 p-4 rounded-md mb-4 border border-indigo-100">
                <p className="font-bold text-indigo-800 mb-1">পিকআপ এড্রেস:</p>
                <p className="text-sm text-indigo-700 font-bold text-lg">{storeSettings.storePickupName}</p>
                <p className="text-sm text-indigo-700 font-semibold">{storeSettings.storePickupAddress}</p>
                <p className="text-xs text-indigo-600 mt-2">অর্ডার কনফার্ম করার পর আপনি সরাসরি আমাদের শপ থেকে প্রোডাক্টটি সংগ্রহ করতে পারবেন।</p>
              </div>
            )}

            {formData.deliveryMethod === 'homeDelivery' && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <label className="block font-bold text-blue-800 mb-3">আপনার জেলা/এলাকা সিলেক্ট করুন *</label>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border">
                    <input type="radio" name="deliveryLocation" value="bogura" checked={formData.deliveryLocation === 'bogura'} onChange={handleInputChange} className="w-4 h-4" />
                    <span className="font-bold text-gray-700 flex-grow">বগুড়া সদর</span>
                    <span className="font-bold text-blue-600">৳{storeSettings.bogura}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border">
                    <input type="radio" name="deliveryLocation" value="dhaka" checked={formData.deliveryLocation === 'dhaka'} onChange={handleInputChange} className="w-4 h-4" />
                    <span className="font-bold text-gray-700 flex-grow">ঢাকা সিটি</span>
                    <span className="font-bold text-blue-600">৳{storeSettings.dhaka}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border">
                    <input type="radio" name="deliveryLocation" value="others" checked={formData.deliveryLocation === 'others'} onChange={handleInputChange} className="w-4 h-4" />
                    <span className="font-bold text-gray-700 flex-grow">অন্যান্য জেলা</span>
                    <span className="font-bold text-blue-600">৳{storeSettings.others}</span>
                  </label>
                </div>
                
                <div className="mt-4">
                  <label className="block font-semibold mb-2 text-sm text-gray-700">পূর্ণাঙ্গ ঠিকানা *</label>
                  <textarea name="address" value={formData.address} required maxLength="200" onChange={handleInputChange} rows="2" className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="বাসা নং, রাস্তা, এলাকা, জেলা"></textarea>
                </div>
              </div>
            )}

            <div className="pt-4 border-t mt-4">
              <label className="block font-bold mb-3 text-gray-800">পেমেন্ট মেথড সিলেক্ট করুন *</label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-700">Cash on Delivery</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="paymentMethod" value="bkash" checked={formData.paymentMethod === 'bkash'} onChange={handleInputChange} className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-pink-600">bKash Payment</span>
                </label>
              </div>
            </div>

            {formData.paymentMethod === 'bkash' && (
              <div className="bg-pink-50 p-4 rounded-md mt-3 border border-pink-100">
                <p className="text-sm mb-3 text-pink-800">আমাদের পার্সোনাল নম্বরে (01XXXXXXXXX) Send Money করুন।</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="bkashNumber" value={formData.bkashNumber} required onChange={(e) => handlePhoneNumberChange(e, 'bkashNumber')} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-400" placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন" />
                  <input type="text" name="trxId" value={formData.trxId} required onChange={handleTrxIdChange} className="border p-2 rounded uppercase focus:outline-none focus:ring-2 focus:ring-pink-400" placeholder="Transaction ID" />
                </div>
              </div>
            )}

            <button type="submit" disabled={!isFormValid || isLoading} className={`w-full text-white font-bold py-4 rounded-lg mt-6 text-lg ${(!isFormValid || isLoading) ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}>
              {isLoading ? 'অর্ডার প্রসেস হচ্ছে...' : `অর্ডার কনফার্ম করুন (৳${currentGrandTotal})`}
            </button>
          </form>
        </div>

        <div className="lg:w-1/3 bg-gray-50 rounded-lg shadow-md p-6 h-fit sticky top-24 border">
          <h2 className="text-xl font-bold border-b pb-4 mb-4 text-gray-800">অর্ডার সামারি</h2>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto text-sm text-gray-700 border-b pb-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} <span className="text-blue-600 font-bold">x{item.quantity}</span></span>
                <span className="font-semibold">৳{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>সাব-টোটাল:</span><span>৳{cartTotal}</span>
            </div>
            <div className="flex justify-between text-gray-600 pb-2 border-b">
              <span>ডেলিভারি চার্জ:</span>
              <span>{currentDeliveryFee === 0 ? 'ফ্রি' : `৳${currentDeliveryFee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-xl pt-2 text-gray-800">
              <span>সর্বমোট বিল:</span>
              <span className="text-blue-600">৳{currentGrandTotal}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;