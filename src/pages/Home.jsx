import ProductCard from '../components/ProductCard';

// ডামি প্রোডাক্ট ডেটা (পরে এগুলো ডেটাবেস থেকে আসবে)
const dummyProducts = [
  {
    id: 1,
    name: "স্মার্ট ফিটনেস ওয়াচ",
    price: 1250,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400",
    stock: 5,
  },
  {
    id: 2,
    name: "প্রিমিয়াম ওয়্যারলেস হেডফোন",
    price: 2500,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400",
    stock: 10,
  },
  {
    id: 3,
    name: "ফাস্ট চার্জিং পাওয়ার ব্যাংক - ১০০০০mAh",
    price: 1800,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&q=80&w=400",
    stock: 0, // এটি Out of stock দেখাবে
  },
  {
    id: 4,
    name: "ডিজাইনার ব্লুটুথ স্পিকার",
    price: 1500,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=400",
    stock: 3,
  }
];

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* হেডার সেকশন */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">আমাদের কালেকশন</h1>
        <p className="text-gray-600">ফেসবুক পেজের সেরা প্রোডাক্টগুলো এখন সরাসরি ওয়েবসাইটে!</p>
      </div>

      {/* প্রোডাক্ট গ্রিড (Responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {dummyProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </div>
  );
};

export default Home;