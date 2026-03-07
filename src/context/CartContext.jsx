import { createContext, useState } from 'react';

// Context তৈরি করা হলো
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // কার্টে প্রোডাক্ট যোগ করার ফাংশন
  const addToCart = (product) => {
    // চেক করা হচ্ছে প্রোডাক্টটি আগে থেকেই কার্টে আছে কি না
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      // থাকলে শুধু পরিমাণ (quantity) ১ বাড়িয়ে দেওয়া হবে
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      // না থাকলে নতুন করে কার্টে যোগ করা হবে
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // কার্টে মোট কয়টি প্রোডাক্ট আছে তার হিসাব
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};