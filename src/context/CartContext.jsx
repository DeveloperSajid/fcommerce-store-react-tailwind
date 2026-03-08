import { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // ১. কার্টে প্রোডাক্ট যোগ করার ফাংশন (ফিক্সড - এক ক্লিকে একবারই মেসেজ আসবে)
  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.dismiss(); // আগের সব টোস্ট মুছে ফেলবে
      toast.error("দুঃখিত, এই প্রোডাক্টের স্টক শেষ!");
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast.dismiss();
          toast.error("স্টকে আর পর্যাপ্ত প্রোডাক্ট নেই!");
          return prevCart;
        }
        
        toast.dismiss(); // ডুপ্লিকেট মেসেজ রোধ করতে dismiss ব্যবহার করা হয়েছে
        toast.success("প্রোডাক্টের পরিমাণ বাড়ানো হয়েছে!");
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      
      toast.dismiss();
      toast.success("কার্টে যোগ করা হয়েছে! 🛒");
      return [...prevCart, { ...product, quantity: 1 }];
    });
    
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    toast.dismiss();
    toast.error("কার্ট থেকে রিমুভ করা হয়েছে!");
  };

  // ২. প্লাস বাটন (কার্ট ড্রয়ারের জন্য - ফিক্সড)
  const increaseQuantity = (productId, stock) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
        if (item.id === productId) {
          if (item.quantity < stock) {
            toast.dismiss();
            toast.success("পরিমাণ বাড়ানো হয়েছে!");
            return { ...item, quantity: item.quantity + 1 };
          } else {
            toast.dismiss();
            toast.error("স্টকে আর পর্যাপ্ত প্রোডাক্ট নেই!");
            return item;
          }
        }
        return item;
      });
      return updatedCart;
    });
  };

  // ৩. মাইনাস বাটন (কার্ট ড্রয়ারের জন্য - ফিক্সড)
  const decreaseQuantity = (productId) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
        if (item.id === productId && item.quantity > 1) {
          toast.dismiss();
          toast.success("পরিমাণ কমানো হয়েছে!");
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, 
      cartTotal, cartItemCount, isCartOpen, setIsCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
};