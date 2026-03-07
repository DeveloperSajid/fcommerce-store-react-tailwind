import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin'); // লগইন সফল হলে অ্যাডমিন পেজে যাবে
    } catch (err) {
      setError("ভুল ইমেইল বা পাসওয়ার্ড। আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">অ্যাডমিন লগইন</h2>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm font-semibold">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">ইমেইল</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="admin@example.com" 
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">পাসওয়ার্ড</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="******" 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-white font-bold py-3 rounded-md transition ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;