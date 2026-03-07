import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Login from './pages/Login';
import TrackOrder from './pages/TrackOrder';
// ProductDetails ইম্পোর্ট করা হলো
import ProductDetails from './pages/ProductDetails'; 
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './context/CartContext';
import { AuthProvider, AuthContext } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  return currentUser ? children : <Navigate to="/login" />;
};

// ... আপনার PrivateRoute ফাংশন ...

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
            <Navbar />
            <CartDrawer />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                
                {/* নতুন যুক্ত করা ট্র্যাক অর্ডার রাউট */}
                <Route path="/track-order" element={<TrackOrder />} />
                
                <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;