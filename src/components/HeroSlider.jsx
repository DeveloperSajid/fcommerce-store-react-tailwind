import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const HeroSlider = () => {
  // স্লাইডারের ছবি ও টেক্সটের লিস্ট
  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200",
      title: "স্পেশাল উইন্টার অফার!",
      subtitle: "যেকোনো গ্যাজেটে পাচ্ছেন ২০% পর্যন্ত নিশ্চিত ছাড়।"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200",
      title: "প্রিমিয়াম হেডফোন কালেকশন",
      subtitle: "গান শোনার দারুণ অভিজ্ঞতা, এখন আপনার হাতের নাগালে।"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200",
      title: "স্মার্ট ফিটনেস গ্যাজেট",
      subtitle: "নিজেকে ফিট রাখুন আমাদের লেটেস্ট স্মার্টওয়াচের সাথে।"
    }
  ];

  const [current, setCurrent] = useState(0);

  // অটোমেটিক স্লাইড চেঞ্জ হওয়ার লজিক (প্রতি ৩ সেকেন্ড পর পর)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 3000); // 3000ms = 3 seconds
    return () => clearInterval(timer); // ক্লিনআপ ফাংশন
  }, [slides.length]);

  // ম্যানুয়ালি স্লাইড চেঞ্জ করার ফাংশন
  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };
  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  };

  return (
    <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden rounded-lg shadow-lg mb-10 group">
      
      {/* স্লাইডগুলো */}
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full h-full relative">
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="w-full h-full object-cover"
            />
            {/* ছবির ওপর কালো রঙের হালকা শ্যাডো (টেক্সট ক্লিয়ার দেখার জন্য) */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center px-4">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 animate-fade-in-down drop-shadow-lg">
                {slide.title}
              </h2>
              <p className="text-sm md:text-xl text-gray-200 animate-fade-in-up drop-shadow-md max-w-2xl">
                {slide.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* বাম ও ডান পাশের বাটন (মাউস হোভার করলে দেখাবে) */}
      <button 
        onClick={prevSlide}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-100 text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
      >
        <FaChevronLeft size={20} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-100 text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
      >
        <FaChevronRight size={20} />
      </button>

      {/* নিচের ছোট ডট (Indicators) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button 
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${current === index ? 'bg-blue-600 w-6' : 'bg-white bg-opacity-50 hover:bg-opacity-100'}`}
          ></button>
        ))}
      </div>

    </div>
  );
};

export default HeroSlider;