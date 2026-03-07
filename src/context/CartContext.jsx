import { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  
  // কার্ট ওপেন/ক্লোজ করার জন্য নতুন স্টেট
  const [isCartOpen, setIsCartOpen] = useState(false); 

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    // প্রোডাক্ট কার্টে যোগ হওয়ার সাথে সাথেই কার্ট ড্রয়ারটি ওপেন হয়ে যাবে
    setIsCartOpen(true); 
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, type) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        if (type === 'increase' && item.quantity < item.stock) {
          return { ...item, quantity: item.quantity + 1 };
        } else if (type === 'decrease' && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal,
      isCartOpen, setIsCartOpen // নতুন স্টেটগুলো এখানে পাস করা হলো
    }}>
      {children}
    </CartContext.Provider>
  );
};