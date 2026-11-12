import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ChevronDown, Check } from 'lucide-react';
import type { Product, Collection } from '../types';
import { ProductCard } from '../components/ProductCard';

export const CollectionsPage: React.FC = () => {
  const { categoryParam } = useParams<{ categoryParam?: string }>();
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get('q') || '';
  const queryCategory = searchParams.get('c') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active category: route param, query param, or 'all'
  const activeCategory = (categoryParam || queryCategory || 'forever-flower').toLowerCase();

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [colRes, prodRes] = await Promise.all([
          fetch('/api/collections').then(r => r.json()).catch(() => ({ success: false })),
          fetch('/api/products').then(r => r.json()).catch(() => ({ success: false }))
        ]);

        if (colRes?.success && colRes.collections) {
          setCollections(colRes.collections);
        }
        if (prodRes?.success && prodRes.products) {
          setProducts(prodRes.products);
        }
      } catch (err) {
        console.error('Failed to load collections data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Title formatting matching rareyou.com
  const currentCollectionTitle = useMemo(() => {
    if (querySearch) return `Search results for "${querySearch}"`;
    if (activeCategory.includes('flower')) return 'Forever Flower';
    if (activeCategory.includes('decor')) return 'Home Decor';
    if (activeCategory.includes('access')) return 'Accessories';
    if (activeCategory.includes('cloth')) return 'Clothing';
    if (activeCategory.includes('swing') || activeCategory.includes('kid')) return 'Kids';
    if (activeCategory === 'all') return 'All Products';
    const found = collections.find(c => c.id === activeCategory || c.handle === activeCategory);
    return found ? found.name : 'Forever Flower';
  }, [activeCategory, querySearch, collections]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.filter-dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      // Category match
      if (activeCategory && activeCategory !== 'all') {
        const pCol = (product.collection_id || '').toLowerCase();
        const pCat = (product.category || '').toLowerCase();
        if (activeCategory.includes('flower')) {
          if (!pCol.includes('flower') && !pCat.includes('flower')) return false;
        } else if (activeCategory.includes('swing') || activeCategory.includes('kid')) {
          if (pCol !== 'kids' && pCol !== 'swings' && pCat !== 'kids' && pCat !== 'swings') return false;
        } else if (activeCategory.includes('decor')) {
          if (pCol !== 'home-decor' && pCat !== 'home-decor') return false;
        } else if (activeCategory.includes('access')) {
          if (pCol !== 'accessories' && pCat !== 'accessories' && !pCol.includes('plush')) return false;
        } else if (activeCategory.includes('cloth')) {
          if (pCol !== 'clothing' && pCat !== 'clothing') return false;
        } else {
          if (pCol !== activeCategory && pCat !== activeCategory) return false;
        }
      }

      // Search query
      if (querySearch.trim()) {
        const q = querySearch.toLowerCase().trim();
        const title = (product.title || product.name || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();
        if (!title.includes(q) && !desc.includes(q)) return false;
      }

      // Price filter
      if (priceFilter === 'under-1500' && product.price >= 1500) return false;
      if (priceFilter === '1500-3000' && (product.price < 1500 || product.price > 3000)) return false;
      if (priceFilter === 'above-3000' && product.price <= 3000) return false;

      // Color filter
      if (colorFilter !== 'all') {
        const title = (product.title || product.name || '').toLowerCase();
        if (!title.includes(colorFilter.toLowerCase())) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (sortBy === 'title-asc') {
      result.sort((a, b) => (a.title || a.name).localeCompare(b.title || b.name));
    } else {
      // 'featured': bumble-in-blue, always-glowing, surajmukhi-2-0, sky first
      const priorityHandles = ['bumble-in-blue', 'always-glowing', 'surajmukhi-2-0', 'sky'];
      result.sort((a, b) => {
        const idxA = priorityHandles.indexOf(a.handle);
        const idxB = priorityHandles.indexOf(b.handle);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
    }

    return result;
  }, [products, activeCategory, querySearch, priceFilter, colorFilter, sortBy]);

  return (
    <div className="min-h-screen bg-white font-sans text-[#121212] pb-24">
      {/* Container matching Shopify Dawn width */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-8 sm:pt-12">
        {/* Collection Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-[#121212] text-left">
          {currentCollectionTitle}
        </h1>

        {/* Filters & Sorting Bar matching Screenshot 6 */}
        <div className="mt-8 mb-8 pb-4 flex flex-wrap items-center justify-between gap-4 filter-dropdown-container">
          {/* Left Side: Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-4 text-[14px]">
            <span className="text-[#121212] font-normal">Filter:</span>

            {/* Availability Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'availability' ? null : 'availability')}
                className="flex items-center gap-1.5 text-[#121212] hover:text-gray-600 transition-colors py-1 cursor-pointer"
              >
                <span>Availability</span>
                <ChevronDown className="w-4 h-4 text-gray-700 stroke-[1.5]" />
              </button>

              {openDropdown === 'availability' && (
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-30">
                  <button
                    onClick={() => { setAvailabilityFilter('all'); setOpenDropdown(null); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between text-xs"
                  >
                    <span>All Products</span>
                    {availabilityFilter === 'all' && <Check className="w-3.5 h-3.5 text-black" />}
                  </button>
                  <button
                    onClick={() => { setAvailabilityFilter('in-stock'); setOpenDropdown(null); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between text-xs"
                  >
                    <span>In Stock</span>
                    {availabilityFilter === 'in-stock' && <Check className="w-3.5 h-3.5 text-black" />}
                  </button>
                </div>
              )}
            </div>

            {/* Price Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
                className="flex items-center gap-1.5 text-[#121212] hover:text-gray-600 transition-colors py-1 cursor-pointer"
              >
                <span>Price</span>
                <ChevronDown className="w-4 h-4 text-gray-700 stroke-[1.5]" />
              </button>

              {openDropdown === 'price' && (
                <div className="absolute left-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-30">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under-1500', label: 'Under Rs. 1,500' },
                    { id: '1500-3000', label: 'Rs. 1,500 - Rs. 3,000' },
                    { id: 'above-3000', label: 'Above Rs. 3,000' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setPriceFilter(p.id); setOpenDropdown(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between text-xs"
                    >
                      <span>{p.label}</span>
                      {priceFilter === p.id && <Check className="w-3.5 h-3.5 text-black" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Color Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'color' ? null : 'color')}
                className="flex items-center gap-1.5 text-[#121212] hover:text-gray-600 transition-colors py-1 cursor-pointer"
              >
                <span>Color</span>
                <ChevronDown className="w-4 h-4 text-gray-700 stroke-[1.5]" />
              </button>

              {openDropdown === 'color' && (
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-30">
                  {['all', 'Blue', 'Pink', 'Yellow', 'Purple', 'Rose', 'Sunflower'].map(c => (
                    <button
                      key={c}
                      onClick={() => { setColorFilter(c); setOpenDropdown(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between text-xs capitalize"
                    >
                      <span>{c === 'all' ? 'All Colors' : c}</span>
                      {colorFilter === c && <Check className="w-3.5 h-3.5 text-black" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Filters (if active) */}
            {(priceFilter !== 'all' || colorFilter !== 'all' || availabilityFilter !== 'all') && (
              <button
                onClick={() => {
                  setPriceFilter('all');
                  setColorFilter('all');
                  setAvailabilityFilter('all');
                }}
                className="text-xs text-red-600 hover:underline cursor-pointer ml-2"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Right Side: Sort by & Product count */}
          <div className="flex items-center gap-6 text-[14px]">
            {/* Sort Dropdown */}
            <div className="relative flex items-center gap-2">
              <span className="text-[#121212] font-normal">Sort by:</span>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                className="flex items-center gap-1.5 text-[#121212] hover:text-gray-600 cursor-pointer"
              >
                <span className="capitalize">
                  {sortBy === 'featured' ? 'Featured' : sortBy === 'price-low' ? 'Price: Low to High' : sortBy === 'price-high' ? 'Price: High to Low' : 'Alphabetically'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-700 stroke-[1.5]" />
              </button>

              {openDropdown === 'sort' && (
                <div className="absolute right-0 mt-2 top-full w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-30">
                  {[
                    { id: 'featured', label: 'Featured' },
                    { id: 'price-low', label: 'Price, low to high' },
                    { id: 'price-high', label: 'Price, high to low' },
                    { id: 'title-asc', label: 'Alphabetically, A-Z' },
                    { id: 'rating', label: 'Highest Rated' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setSortBy(s.id); setOpenDropdown(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between text-xs"
                    >
                      <span>{s.label}</span>
                      {sortBy === s.id && <Check className="w-3.5 h-3.5 text-black" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product count */}
            <span className="text-[#444444] text-[14px]">
              {filteredProducts.length} products
            </span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-square bg-gray-100 rounded-2xl" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="py-24 text-center">
            <h2 className="text-xl font-normal text-gray-900 mb-2">No products found</h2>
            <p className="text-sm text-gray-500 mb-6">
              Try adjusting your search criteria or resetting active filters.
            </p>
            <button
              onClick={() => {
                setPriceFilter('all');
                setColorFilter('all');
                setAvailabilityFilter('all');
              }}
              className="px-6 py-2.5 bg-black text-white text-xs font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          /* Exact 4-Column Product Grid Matching Screenshot 6 */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12">
            {filteredProducts.map(product => (
              <ProductCard key={product.id || product.handle} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default CollectionsPage;
