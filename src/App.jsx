import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { CartProvider } from './context/CartContext'; // Provider ইম্পোর্ট করা হলো

function App() {
  return (
    // পুরো অ্যাপকে CartProvider দিয়ে মুড়িয়ে দেওয়া হলো
    <CartProvider>
      <Router>
        <div className="bg-gray-50 min-h-screen font-sans">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;