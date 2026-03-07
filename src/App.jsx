import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Login from './pages/Login'; // Login ইম্পোর্ট
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './context/CartContext';
import { AuthProvider, AuthContext } from './context/AuthContext'; // Auth যুক্ত করা হলো

// সিকিউরিটি গার্ড (প্রাইভেট রাউট)
const PrivateRoute = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  return currentUser ? children : <Navigate to="/login" />;
};

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
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                
                {/* অ্যাডমিন পেজটিকে PrivateRoute দিয়ে লক করে দেওয়া হলো */}
                <Route 
                  path="/admin" 
                  element={
                    <PrivateRoute>
                      <Admin />
                    </PrivateRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;