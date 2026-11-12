import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Check } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Determine image source: localImage, images[0], image, or fallback
  const imgSrc = !imgError 
    ? (product.localImage || (product.images && product.images[0]) || product.image || '/images/prod-bumble-in-blue.png')
    : (product.image || '/images/prod-bumble-in-blue.png');

  const title = product.title || product.name;
  const isSale = product.badge === 'Sale' || (product.compare_at_price && product.compare_at_price > product.price);
  const reviewCount = product.reviews_count || product.review_count || 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    try {
      const variantId = product.variants?.[0]?.id || product.variantId || product.id;
      await addToCart(product.id, variantId, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Quick add failed', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group relative flex flex-col font-sans">
      {/* Product Image Container */}
      <Link
        to={`/products/${product.handle}`}
        className="relative block aspect-square w-full rounded-2xl overflow-hidden bg-[#F6F4F0] cursor-pointer"
      >
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setImgError(true)}
        />

        {/* Sale Pill Badge on bottom-left of image */}
        {isSale && (
          <span className="absolute bottom-3 left-3 bg-[#262626] text-white text-[11px] font-medium px-3 py-0.5 rounded-full z-10 shadow-sm">
            Sale
          </span>
        )}

        {/* Hover Quick Add Overlay Button */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 flex justify-end">
          <button
            onClick={handleQuickAdd}
            disabled={adding}
            className={`p-2.5 rounded-full shadow-md text-xs font-medium flex items-center justify-center transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-white hover:bg-black text-black hover:text-white'
            }`}
            title="Quick add to bag"
            aria-label="Quick add"
          >
            {added ? (
              <Check className="w-4 h-4" />
            ) : adding ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
            )}
          </button>
        </div>
      </Link>

      {/* Typography Underneath */}
      <div className="pt-3 pb-1 flex flex-col items-center text-center">
        {/* Title */}
        <Link
          to={`/products/${product.handle}`}
          className="text-[14px] sm:text-[15px] font-normal text-[#121212] group-hover:underline line-clamp-1 leading-snug cursor-pointer px-1"
        >
          {title}
        </Link>

        {/* Price */}
        <div className="mt-1 flex items-center justify-center gap-2 text-[13px] sm:text-[14px] text-[#121212] font-normal">
          <span>Rs. {product.price.toLocaleString('en-IN')}.00</span>
          {product.compare_at_price > product.price && (
            <span className="text-gray-400 line-through text-xs font-light">
              Rs. {product.compare_at_price.toLocaleString('en-IN')}.00
            </span>
          )}
        </div>

        {/* Reviews */}
        {reviewCount > 0 && (
          <div className="mt-1 flex items-center justify-center gap-1">
            <div className="flex text-[#E6A046]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3 h-3 fill-[#E6A046] text-[#E6A046]"
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-500 font-normal">
              ({reviewCount})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProductCard;
