import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import CartDrawer from './components/CartDrawer';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Admin from './pages/Admin';
import TrackOrder from './pages/TrackOrder';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
// নতুন যুক্ত হলো: Toaster
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen relative">
            {/* স্ক্রিনের উপরে মাঝে নোটিফিকেশন দেখানোর জন্য Toaster */}
            <Toaster position="top-center" reverseOrder={false} />
            
            <Navbar />
            <CartDrawer />
            <main className="flex-grow bg-gray-50 pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/track-order" element={<TrackOrder />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;