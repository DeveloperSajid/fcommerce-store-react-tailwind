import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import CartDrawer from './components/CartDrawer'; // CartDrawer ইম্পোর্ট করা হলো
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
          <Navbar />
          <CartDrawer /> {/* ওয়েবসাইটের সব জায়গায় ড্রয়ারটি থাকবে */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/checkout" element={<Checkout />} />
              {/* নোট: এখন আর আলাদা Cart পেজ (Cart.jsx) এর দরকার নেই, তাই রিমুভ করে দেওয়া হলো */}
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;