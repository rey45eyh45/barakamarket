import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SlidersHorizontal, 
  Star, 
  DollarSign, 
  TrendingUp, 
  Clock,
  ChevronDown,
  X 
} from 'lucide-react';
import { formatPrice } from '../utils/formatters';

export type SortOption = 'newest' | 'price-low' | 'price-high' | 'rating' | 'popular';
export type RatingFilter = 'all' | '5' | '4+' | '3+';

export interface FilterState {
  priceRange: [number, number];
  rating: RatingFilter;
  sort: SortOption;
  inStockOnly: boolean;
}

interface QuickFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  maxPrice?: number;
  productCount?: number;
  onReset?: () => void;
}

export function QuickFilters({ 
  filters, 
  onChange, 
  maxPrice = 10000000,
  productCount,
  onReset 
}: QuickFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sortOptions: Array<{ value: SortOption; label: string; icon: typeof Clock }> = [
    { value: 'newest', label: 'Yangi', icon: Clock },
    { value: 'price-low', label: 'Arzon', icon: DollarSign },
    { value: 'price-high', label: 'Qimmat', icon: TrendingUp },
    { value: 'rating', label: 'Reyting', icon: Star },
    { value: 'popular', label: 'Mashhur', icon: TrendingUp }
  ];

  const ratingOptions: Array<{ value: RatingFilter; label: string }> = [
    { value: 'all', label: 'Barchasi' },
    { value: '5', label: '5 ⭐' },
    { value: '4+', label: '4+ ⭐' },
    { value: '3+', label: '3+ ⭐' }
  ];

  const handlePriceRangeChange = (index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...filters.priceRange];
    newRange[index] = value;
    onChange({ ...filters, priceRange: newRange });
  };

  const handleReset = () => {
    onChange({
      priceRange: [0, maxPrice],
      rating: 'all',
      sort: 'newest',
      inStockOnly: false
    });
    if (onReset) onReset();
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) count++;
    if (filters.rating !== 'all') count++;
    if (filters.sort !== 'newest') count++;
    if (filters.inStockOnly) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition"
        >
          <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-gray-900 dark:text-white font-medium">
            Filtrlar
          </span>
          {activeFiltersCount() > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFiltersCount()}
            </span>
          )}
          <ChevronDown 
            className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {/* Quick sort buttons */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {sortOptions.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => onChange({ ...filters, sort: option.value })}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition
                  ${filters.sort === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 space-y-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Narx oralig'i
                </label>
                
                <div className="space-y-3">
                  {/* Range slider */}
                  <div className="px-2">
                    <input
                      type="range"
                      min={0}
                      max={maxPrice}
                      step={10000}
                      value={filters.priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Min/Max inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Minimal
                      </label>
                      <input
                        type="number"
                        value={filters.priceRange[0]}
                        onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Maksimal
                      </label>
                      <input
                        type="number"
                        value={filters.priceRange[1]}
                        onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value) || maxPrice)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Display range */}
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Reyting
                </label>
                
                <div className="grid grid-cols-4 gap-2">
                  {ratingOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => onChange({ ...filters, rating: option.value })}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition
                        ${filters.rating === option.value
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-2 border-yellow-400 dark:border-yellow-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStockOnly}
                    onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
                    className="w-5 h-5 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Faqat mavjud mahsulotlar
                  </span>
                </label>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                  Tozalash
                </button>

                {productCount !== undefined && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {productCount} ta mahsulot topildi
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filters chips */}
      {activeFiltersCount() > 0 && !isExpanded && (
        <div className="flex gap-2 flex-wrap">
          {filters.rating !== 'all' && (
            <FilterChip
              label={`Reyting: ${filters.rating}`}
              onRemove={() => onChange({ ...filters, rating: 'all' })}
            />
          )}
          
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) && (
            <FilterChip
              label={`${formatPrice(filters.priceRange[0])} - ${formatPrice(filters.priceRange[1])}`}
              onRemove={() => onChange({ ...filters, priceRange: [0, maxPrice] })}
            />
          )}
          
          {filters.inStockOnly && (
            <FilterChip
              label="Mavjud"
              onRemove={() => onChange({ ...filters, inStockOnly: false })}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Filter chip component
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full p-0.5 transition"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

// Apply filters to products
export function applyFilters(
  products: Array<any>,
  filters: FilterState
): Array<any> {
  let filtered = [...products];

  // Price range
  filtered = filtered.filter(
    p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
  );

  // Rating
  if (filters.rating !== 'all') {
    const minRating = filters.rating === '5' ? 5 : filters.rating === '4+' ? 4 : 3;
    filtered = filtered.filter(p => (p.rating || 0) >= minRating);
  }

  // Stock
  if (filters.inStockOnly) {
    filtered = filtered.filter(p => {
      const stock = p.stock ?? Infinity;
      return stock > 0;
    });
  }

  // Sort
  switch (filters.sort) {
    case 'newest':
      filtered.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      break;
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'popular':
      filtered.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
      break;
  }

  return filtered;
}
