import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="bg-gray-50 min-h-screen font-sans">
        {/* Navbar সব পেজেই দেখাবে */}
        <Navbar />
        
        {/* পেজ রাউটিং */}
        <Routes>
          <Route path="/" element={<Home />} />
          {/* পরবর্তীতে আমরা এখানে Cart এবং Checkout পেজ যুক্ত করব */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;