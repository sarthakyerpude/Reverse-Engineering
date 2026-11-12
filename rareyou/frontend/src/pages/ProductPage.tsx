import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Truck,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import type { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';

export const ProductPage: React.FC = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { addToCart, isLoading } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsSummary, setReviewsSummary] = useState<{
    avg: number;
    total: number;
  }>({ avg: 5.0, total: 0 });

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [customMeasurements, setCustomMeasurements] = useState<string>('');
  const [showBespokeInput, setShowBespokeInput] = useState<boolean>(false);
  const [quantity, setQuantity] = useState(1);
  const [pageLoading, setPageLoading] = useState(true);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHeadline, setReviewHeadline] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setPageLoading(true);
      try {
        const res = await fetch(`/api/products/${handle}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          setRelated(data.related || []);
          if (data.product.variants && data.product.variants.length > 0) {
            setSelectedVariantId(data.product.variants[0].id);
          } else {
            setSelectedVariantId(data.product.variantId || data.product.id);
          }

          // Fetch reviews
          const revRes = await fetch(`/api/reviews/${data.product.id}`).catch(() => null);
          if (revRes) {
            const revData = await revRes.json();
            if (revData?.success) {
              setReviews(revData.reviews || []);
              setReviewsSummary(revData.summary || { avg: data.product.rating || 5.0, total: revData.reviews?.length || 0 });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load product page details', err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchProduct();
  }, [handle]);

  if (pageLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-16 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 w-1/4 rounded" />
            <div className="h-8 bg-gray-100 w-3/4 rounded" />
            <div className="h-6 bg-gray-100 w-1/3 rounded" />
            <div className="h-24 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-normal text-gray-900">Product Not Found</h2>
        <p className="text-sm text-gray-500">The handcrafted piece you are looking for may have been moved or updated.</p>
        <Link
          to="/collections/forever-flower"
          className="inline-block bg-black text-white text-xs font-medium px-6 py-3 rounded-full hover:bg-gray-800 transition-colors uppercase tracking-wider"
        >
          Explore Forever Flowers
        </Link>
      </div>
    );
  }

  const allImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.localImage || product.image || '/images/prod-bumble-in-blue.png'];

  const title = product.title || product.name;
  const isSale = product.badge === 'Sale' || (product.compare_at_price && product.compare_at_price > product.price);
  const reviewCount = reviewsSummary.total || product.reviews_count || product.review_count || 0;

  const handleAddToCart = async () => {
    const res = await addToCart(
      product.id,
      selectedVariantId || product.variantId || product.id,
      quantity,
      product.category === 'clothing' ? selectedSize : undefined,
      showBespokeInput ? customMeasurements : undefined
    );
    if (res.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3000);
    }
  };

  const handleBuyNow = async () => {
    setBuyingNow(true);
    await addToCart(
      product.id,
      selectedVariantId || product.variantId || product.id,
      quantity,
      product.category === 'clothing' ? selectedSize : undefined,
      showBespokeInput ? customMeasurements : undefined
    );
    setBuyingNow(false);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    try {
      const res = await fetch(`/api/reviews/${product.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          headline: reviewHeadline,
          review_text: reviewComment,
          user_name: reviewAuthor || 'Artisan Admirer'
        })
      });
      const data = await res.json();
      if (data.success && data.review) {
        setReviews([data.review, ...reviews]);
        setReviewSubmitted(true);
        setReviewHeadline('');
        setReviewComment('');
      }
    } catch (err) {
      console.error('Failed to submit review', err);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 font-sans text-[#121212]">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8 select-none">
        <Link to="/" className="hover:text-black transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/collections/forever-flower" className="hover:text-black transition-colors">Collections</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-black font-normal truncate max-w-sm">{title}</span>
      </nav>

      {/* Main Product Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left Column: Product Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F6F4F0] border border-gray-100 shadow-xs">
            <img
              src={allImages[selectedImgIndex] || allImages[0]}
              alt={title}
              className="w-full h-full object-cover"
            />
            {isSale && (
              <span className="absolute bottom-4 left-4 bg-[#262626] text-white text-xs font-medium px-3.5 py-1 rounded-full shadow-sm">
                Sale
              </span>
            )}
          </div>

          {/* Thumbnails if multiple images exist */}
          {allImages.length > 1 && (
            <div className="flex gap-3">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImgIndex === idx
                      ? 'border-black'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${title} view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="space-y-6 text-left">
          {/* Brand & Collection header */}
          <div>
            <span className="text-xs uppercase tracking-widest text-gray-500 font-medium block mb-1">
              RARE YOU • HANDCRAFTED
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-[#121212]">
              {title}
            </h1>

            {/* Price matching Rare You format */}
            <div className="mt-3 flex items-baseline gap-3 text-xl sm:text-2xl font-normal text-[#121212]">
              <span>Rs. {product.price.toLocaleString('en-IN')}.00</span>
              {product.compare_at_price > product.price && (
                <span className="text-gray-400 line-through text-base font-light">
                  Rs. {product.compare_at_price.toLocaleString('en-IN')}.00
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-1">Tax included. Shipping calculated at checkout.</p>
          </div>

          {/* Star Rating summary */}
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <div className="flex text-[#E6A046]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-[#E6A046] text-[#E6A046]"
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 font-normal">
              {product.rating || 5.0} ({reviewCount} reviews)
            </span>
          </div>

          {/* Blinkit Delivery Note */}
          <div className="bg-[#FCEAE6] p-3 rounded-xl flex items-center gap-3 text-xs text-black">
            <Truck className="w-4 h-4 text-gray-800 shrink-0" />
            <span>
              <strong>Fast Dispatch:</strong> Also available on <strong>Blinkit</strong> in Delhi NCR. Free express shipping on orders above Rs. 1,499.
            </span>
          </div>

          {/* Size Selector (If apparel) */}
          {product.category === 'clothing' && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider">
                Select Size:
              </label>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSelectedSize(s);
                      setShowBespokeInput(false);
                    }}
                    className={`px-4 py-2 text-xs rounded-lg border font-medium transition-all ${
                      selectedSize === s && !showBespokeInput
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowBespokeInput(!showBespokeInput)}
                  className={`px-4 py-2 text-xs rounded-lg border font-medium transition-all ${
                    showBespokeInput
                      ? 'border-black bg-black text-white'
                      : 'border-dashed border-gray-300 bg-white text-gray-700 hover:border-black'
                  }`}
                >
                  Custom Sizing
                </button>
              </div>

              {showBespokeInput && (
                <div className="pt-2">
                  <input
                    type="text"
                    placeholder="Enter custom measurements (e.g. Bust 36, Waist 30, Length 44 inches)"
                    value={customMeasurements}
                    onChange={(e) => setCustomMeasurements(e.target.value)}
                    className="w-full text-xs bg-[#FAF8F5] border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-black text-black"
                  />
                </div>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider">
              Quantity:
            </label>
            <div className="inline-flex items-center border border-gray-300 rounded-full bg-white">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-sm text-gray-600 hover:text-black font-medium"
              >
                -
              </button>
              <span className="px-4 py-2 text-xs font-semibold text-black min-w-8 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-black font-medium"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons: Add to Bag & Buy Now */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className={`w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-medium tracking-wide uppercase flex items-center justify-center gap-2 transition-all shadow-sm ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border-2 border-black text-black hover:bg-black hover:text-white'
              }`}
            >
              {addedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Added to Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={buyingNow}
              className="w-full bg-black hover:bg-gray-800 text-white py-3.5 px-6 rounded-full text-xs sm:text-sm font-medium tracking-wide uppercase transition-all shadow-md"
            >
              {buyingNow ? 'Proceeding...' : 'Buy It Now'}
            </button>
          </div>

          {/* Collapsible Details */}
          <div className="pt-6 border-t border-gray-100 space-y-3">
            <details className="group border-b border-gray-100 pb-3" open>
              <summary className="font-medium text-sm text-[#121212] flex justify-between items-center cursor-pointer list-none select-none">
                <span>Description &amp; Craftsmanship</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">â–¾</span>
              </summary>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                {product.description || 'Handcrafted with immense love and precision by women artisans using eco-friendly milk cotton yarn. Each flower petal and macrame knot reflects generations of traditional artistry.'}
              </p>
            </details>

            <details className="group border-b border-gray-100 pb-3">
              <summary className="font-medium text-sm text-[#121212] flex justify-between items-center cursor-pointer list-none select-none">
                <span>Care &amp; Longevity Instructions</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">â–¾</span>
              </summary>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Keep away from direct excessive moisture. Gently blow off dust or use a soft dry brush. No watering, pruning, or sunlight required. Built to last a lifetime!
              </p>
            </details>

            <details className="group border-b border-gray-100 pb-3">
              <summary className="font-medium text-sm text-[#121212] flex justify-between items-center cursor-pointer list-none select-none">
                <span>Shipping &amp; Transit Replacement</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">â–¾</span>
              </summary>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Dispatches within 24-48 hours. Secure multi-layer gift packaging ensures damage-free arrival. In the unlikely event of transit damage, we provide immediate free replacement.
              </p>
            </details>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="mt-20 pt-12 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#121212]">
              Customer Reviews
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="flex text-[#E6A046]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#E6A046] text-[#E6A046]" />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">
                Based on {reviewCount || 12} reviews
              </span>
            </div>
          </div>

          {/* Write Review Form */}
          <div className="bg-[#FAF8F5] p-6 rounded-2xl mb-12 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
              Share Your Experience
            </h3>
            {reviewSubmitted ? (
              <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-3 rounded-lg">
                Thank you! Your review has been submitted successfully.
              </p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Rating:</span>
                  <div className="flex text-[#E6A046]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setReviewRating(s)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            s <= reviewRating
                              ? 'fill-[#E6A046] text-[#E6A046]'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your Name (e.g. Priya M.)"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    className="text-xs bg-white border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-black"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Review Headline"
                    value={reviewHeadline}
                    onChange={(e) => setReviewHeadline(e.target.value)}
                    className="text-xs bg-white border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-black"
                  />
                </div>
                <textarea
                  placeholder="What did you love about this handcrafted piece?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-black min-h-[80px]"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white text-xs font-medium rounded-full hover:bg-gray-800 transition-colors"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {(reviews.length > 0 ? reviews : [
              {
                id: 'rev-1',
                product_id: product.id,
                user_name: 'Ananya Sharma',
                rating: 5,
                headline: 'Exceeded all expectations!',
                review_text: 'The colors are so vibrant and the knitting work is flawless. My best friend was teary-eyed when she received this forever bouquet for her birthday.',
                verified_purchase: 1,
                created_at: '2026-11-01'
              },
              {
                id: 'rev-2',
                product_id: product.id,
                user_name: 'Rohan Mehra',
                rating: 5,
                headline: 'Blinkit delivery in Delhi was super fast',
                review_text: 'Ordered in the morning and arrived impeccably packaged in pristine condition. Highly recommended!',
                verified_purchase: 1,
                created_at: '2026-11-05'
              }
            ]).map((rev) => (
              <div key={rev.id} className="border-b border-gray-100 pb-6 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex text-[#E6A046]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating
                            ? 'fill-[#E6A046] text-[#E6A046]'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-gray-900">{rev.user_name}</span>
                  {rev.verified_purchase === 1 && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      Verified Buyer
                    </span>
                  )}
                </div>
                {rev.headline && (
                  <h4 className="text-xs font-semibold text-gray-800 mb-1">{rev.headline}</h4>
                )}
                <p className="text-xs text-gray-600 leading-relaxed">{rev.review_text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Products Carousel/Grid */}
      {related.length > 0 && (
        <section className="mt-24 pt-12 border-t border-gray-100">
          <div className="text-left mb-8">
            <span className="text-xs uppercase tracking-widest text-gray-400 font-medium block mb-1">
              YOU MAY ALSO LIKE
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#121212]">
              Related Artisanal Blooms
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {related.map(p => (
              <ProductCard key={p.id || p.handle} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
export default ProductPage;
