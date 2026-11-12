import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import type { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);

  const heroSlides = [
    {
      image: '/images/banner-slide-1.jpg',
      title: 'Forever Flowers',
      subtitle: 'Never Fade • 100% Handcrafted with Milk Cotton Yarn',
      cta: 'Explore Bouquets',
      link: '/collections/forever-flower'
    },
    {
      image: '/images/banner-slide-2.jpg',
      title: 'Handcrafted With Love',
      subtitle: 'Because Handmade is Rare. And Rare is You.',
      cta: 'Shop Collections',
      link: '/collections/forever-flower'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodData = await fetch('/api/products').then(r => r.json()).catch(() => ({ success: false }));
        if (prodData?.success && prodData.products) {
          setProducts(prodData.products);
        }
      } catch (err) {
        console.error('Home page data fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Top featured bouquets matching real Rare You
  const topBouquets = products.filter(p => {
    const pCol = (p.collection_id || '').toLowerCase();
    const pCat = (p.category || '').toLowerCase();
    return pCol.includes('flower') || pCat.includes('flower');
  }).slice(0, 8);

  // Budget buys under 1500
  const budgetBuys = products.filter(p => p.price <= 1500).slice(0, 4);

  // Kids & nursery
  const kidsItems = products.filter(p => {
    const pCol = (p.collection_id || '').toLowerCase();
    const pCat = (p.category || '').toLowerCase();
    return pCol === 'kids' || pCol === 'swings' || pCat === 'kids' || pCat === 'swings';
  }).slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 font-sans text-[#121212]">
      {/* 1. Hero Slideshow Banner */}
      <section className="relative w-full overflow-hidden bg-[#FAF8F5]">
        <div className="relative aspect-[16/9] sm:aspect-[21/9] max-h-[640px] w-full">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).src = '/images/banner-slide-1.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end">
                <div className="max-w-7xl mx-auto px-6 sm:px-12 pb-8 sm:pb-16 w-full text-white">
                  <span className="text-xs sm:text-sm font-light tracking-widest uppercase block mb-2 drop-shadow-md">
                    {slide.subtitle}
                  </span>
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-normal tracking-tight mb-4 drop-shadow-lg">
                    {slide.title}
                  </h2>
                  <Link
                    to={slide.link}
                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium hover:bg-black hover:text-white transition-all shadow-md"
                  >
                    {slide.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Slideshow Navigation Buttons */}
          <button
            onClick={() => setCurrentSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center shadow-md transition-all cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((currentSlide + 1) % heroSlides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center shadow-md transition-all cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Collection Tiles Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#121212]">
            Shop by Collection
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Artisanal creations lovingly handcrafted for your everyday joy
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {[
            { name: 'Forever Flowers', to: '/collections/forever-flower', image: '/images/prod-bumble-in-blue.png', count: '36 designs' },
            { name: 'Home Decor', to: '/collections/home-decor', image: '/images/prod-pink-sunflower-curtain-tie.png', count: '36 designs' },
            { name: 'Accessories', to: '/collections/accessories', image: '/images/prod-convertible-sunflower-doll.png', count: '21 designs' },
            { name: 'Clothing', to: '/collections/clothing', image: '/images/prod-delicate-tulips.jpg', count: '14 designs' },
            { name: 'Kids & Swings', to: '/collections/swings', image: '/images/prod-sunshine-in-a-bouquet.jpg', count: '14 designs' }
          ].map((col) => (
            <Link
              key={col.name}
              to={col.to}
              className="group block text-center"
            >
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#F6F4F0] mb-3 relative">
                <img
                  src={col.image}
                  alt={col.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/prod-bumble-in-blue.png';
                  }}
                />
              </div>
              <h3 className="text-sm font-medium text-[#121212] group-hover:underline">
                {col.name}
              </h3>
              <span className="text-[11px] text-gray-400 font-light block">
                {col.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Forever Flowers Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-gray-100">
          <div>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 block mb-1">
              BESTSELLERS
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#121212]">
              Forever Blooming Bouquets
            </h2>
          </div>
          <Link
            to="/collections/forever-flower"
            className="text-xs sm:text-sm font-normal text-black hover:underline flex items-center gap-1"
          >
            View all 36 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse aspect-square bg-gray-100 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12">
            {topBouquets.map(product => (
              <ProductCard key={product.id || product.handle} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Single Product Spotlight: Always Glowing */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="bg-[#FAF6F2] rounded-3xl p-6 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="w-full lg:w-1/2 aspect-square rounded-2xl overflow-hidden bg-white shadow-sm">
            <img
              src="/images/prod-always-glowing.jpg"
              alt="Always Glowing Bouquet"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full lg:w-1/2 space-y-4 text-left">
            <span className="bg-[#262626] text-white text-[11px] font-medium px-3 py-0.5 rounded-full">
              Sale • 14 Reviews
            </span>
            <h3 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#121212]">
              Always Glowing Bouquet
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Our signature hand-knitted lavender and lilac blossom bouquet woven with fairy LED lights that illuminate warm memories. Eco-friendly milk cotton yarn that never withers or fades.
            </p>
            <div className="text-xl font-normal text-[#121212] flex items-center gap-3">
              <span>Rs. 2,990.00</span>
              <span className="line-through text-gray-400 text-sm">Rs. 3,738.00</span>
            </div>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/products/always-glowing"
                className="bg-black text-white hover:bg-gray-800 px-7 py-3 rounded-full text-xs font-medium tracking-wide uppercase transition-colors"
              >
                View Product Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Budget Buys (Under ₹1,500) */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-gray-100">
          <div>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 block mb-1">
              AFFORDABLE LUXURY
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#121212]">
              Budget Buys Under Rs. 1,500
            </h2>
          </div>
          <Link
            to="/collections/forever-flower"
            className="text-xs sm:text-sm font-normal text-black hover:underline flex items-center gap-1"
          >
            Explore <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8">
          {budgetBuys.map(product => (
            <ProductCard key={product.id || product.handle} product={product} />
          ))}
        </div>
      </section>

      {/* Kids & Nursery */}
      {kidsItems.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-end justify-between mb-8 pb-3 border-b border-gray-100">
            <div>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 block mb-1">
                HANDMADE FOR LITTLE ONES
              </span>
              <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#121212]">
                Kids &amp; Nursery Companions
              </h2>
            </div>
            <Link
              to="/collections/swings"
              className="text-xs sm:text-sm font-normal text-black hover:underline flex items-center gap-1"
            >
              Explore Swings &amp; Cribs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8">
            {kidsItems.map(product => (
              <ProductCard key={product.id || product.handle} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Brand Commitment Strip */}
      <section className="border-y border-gray-100 bg-[#FAF8F5] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-black mb-1">
              <Sparkles className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h4 className="text-sm font-medium text-[#121212]">100% Handcrafted Devotion</h4>
            <p className="text-xs text-gray-500 max-w-xs">
              Every single petal and macrame knot is handcrafted with unhurried care by women artisans.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-black mb-1">
              <Truck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h4 className="text-sm font-medium text-[#121212]">Free Express Delivery</h4>
            <p className="text-xs text-gray-500 max-w-xs">
              Complimentary expedited transit across India on all orders above Rs. 1,499.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-black mb-1">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h4 className="text-sm font-medium text-[#121212]">Damage-Free Guarantee</h4>
            <p className="text-xs text-gray-500 max-w-xs">
              Reinforced protective gift-ready packaging ensures your blooms arrive pristine.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FAQ Accordion */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-center text-[#121212] mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: 'What are Forever Flowers made of?',
              a: 'Our forever flowers are handcrafted using 100% premium eco-friendly milk cotton yarn and flexible wire stems. Unlike natural cut flowers that wilt in 3-5 days, these blooms never fade, never wither, and require zero watering.'
            },
            {
              q: 'How long does delivery take?',
              a: 'Standard orders dispatch within 24-48 business hours. Deliveries within Delhi NCR typically arrive in 1-2 days (also available on Blinkit), and 3-5 business days across the rest of India.'
            },
            {
              q: 'Can I add custom lights or a handwritten greeting note?',
              a: 'Yes! All bouquet orders include a complimentary artisan gift card with your custom handwritten message. Select bouquets also feature built-in warm LED fairy lights.'
            },
            {
              q: 'Are dresses custom-tailored to my measurements?',
              a: 'Yes, our artisanal dresses are tailored upon order. You can select standard sizes (XS - XL) or provide custom bespoke bust, waist, and length measurements during checkout.'
            }
          ].map((faq, i) => (
            <details key={i} className="group border-b border-gray-200 pb-4 cursor-pointer">
              <summary className="font-medium text-sm sm:text-base text-[#121212] flex justify-between items-center list-none select-none">
                <span>{faq.q}</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">â–¾</span>
              </summary>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed pl-1">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
};
export default HomePage;
