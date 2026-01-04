import { useState } from 'react';
import { X, SlidersHorizontal, Star, DollarSign, Package, TrendingUp, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/Button';

export interface FilterOptions {
  // Price Range
  minPrice: number;
  maxPrice: number;
  
  // Rating
  minRating: number; // 0 = all, 1-5 = minimum rating
  
  // Stock
  inStockOnly: boolean;
  
  // Sort
  sortBy: 'default' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'popular';
  
  // Vendor
  vendorIds: string[];
  
  // Categories (multi-select)
  categories: string[];
}

interface AdvancedFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
  availableVendors?: { id: string; name: string }[];
  availableCategories?: string[];
  priceRange?: { min: number; max: number };
}

export function AdvancedFilterPanel({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  availableVendors = [],
  availableCategories = [],
  priceRange = { min: 0, max: 10000000 }
}: AdvancedFilterPanelProps) {
  const { language } = useLanguage();
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      minPrice: 0,
      maxPrice: priceRange.max,
      minRating: 0,
      inStockOnly: false,
      sortBy: 'default',
      vendorIds: [],
      categories: []
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const ratingOptions = [
    { value: 0, label: { uz: 'Hammasi', ru: 'Все', en: 'All' }, stars: 0 },
    { value: 5, label: { uz: '5 yulduz', ru: '5 звёзд', en: '5 stars' }, stars: 5 },
    { value: 4, label: { uz: '4+ yulduz', ru: '4+ звёзд', en: '4+ stars' }, stars: 4 },
    { value: 3, label: { uz: '3+ yulduz', ru: '3+ звёзд', en: '3+ stars' }, stars: 3 },
    { value: 2, label: { uz: '2+ yulduz', ru: '2+ звёзд', en: '2+ stars' }, stars: 2 },
    { value: 1, label: { uz: '1+ yulduz', ru: '1+ звёзд', en: '1+ stars' }, stars: 1 }
  ];

  const sortOptions = [
    { value: 'default', label: { uz: 'Standart', ru: 'По умолчанию', en: 'Default' } },
    { value: 'newest', label: { uz: 'Yangilari', ru: 'Новые', en: 'Newest' } },
    { value: 'popular', label: { uz: 'Mashhur', ru: 'Популярные', en: 'Popular' } },
    { value: 'price-low', label: { uz: 'Narx: Pastdan yuqoriga', ru: 'Цена: По возрастанию', en: 'Price: Low to High' } },
    { value: 'price-high', label: { uz: 'Narx: Yuqoridan pastga', ru: 'Цена: По убыванию', en: 'Price: High to Low' } },
    { value: 'rating', label: { uz: 'Reyting', ru: 'Рейтинг', en: 'Rating' } }
  ];

  const toggleCategory = (category: string) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleVendor = (vendorId: string) => {
    setLocalFilters(prev => ({
      ...prev,
      vendorIds: prev.vendorIds.includes(vendorId)
        ? prev.vendorIds.filter(v => v !== vendorId)
        : [...prev.vendorIds, vendorId]
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  const activeFiltersCount = 
    (localFilters.minPrice > 0 || localFilters.maxPrice < priceRange.max ? 1 : 0) +
    (localFilters.minRating > 0 ? 1 : 0) +
    (localFilters.inStockOnly ? 1 : 0) +
    (localFilters.sortBy !== 'default' ? 1 : 0) +
    localFilters.vendorIds.length +
    localFilters.categories.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Panel - Slide from right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-gray-900 dark:text-white font-semibold">
                    {language === 'uz' ? 'Filter' : language === 'ru' ? 'Фильтры' : 'Filters'}
                  </h2>
                  {activeFiltersCount > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activeFiltersCount} {language === 'uz' ? 'ta faol' : language === 'ru' ? 'активных' : 'active'}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Price Range */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {language === 'uz' ? 'Narx oralig\'i' : language === 'ru' ? 'Диапазон цен' : 'Price Range'}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {/* Min Price */}
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {language === 'uz' ? 'Min' : language === 'ru' ? 'Мин' : 'Min'}
                    </label>
                    <input
                      type="number"
                      value={localFilters.minPrice}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, minPrice: Number(e.target.value) || 0 }))}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Max Price */}
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {language === 'uz' ? 'Max' : language === 'ru' ? 'Макс' : 'Max'}
                    </label>
                    <input
                      type="number"
                      value={localFilters.maxPrice}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) || priceRange.max }))}
                      placeholder={formatPrice(priceRange.max)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Price Range Slider */}
                  <div className="pt-2">
                    <input
                      type="range"
                      min={priceRange.min}
                      max={priceRange.max}
                      step={10000}
                      value={localFilters.maxPrice}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{formatPrice(priceRange.min)} so'm</span>
                      <span>{formatPrice(priceRange.max)} so'm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {language === 'uz' ? 'Reyting' : language === 'ru' ? 'Рейтинг' : 'Rating'}
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {ratingOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        localFilters.minRating === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="rating"
                          value={option.value}
                          checked={localFilters.minRating === option.value}
                          onChange={() => setLocalFilters(prev => ({ ...prev, minRating: option.value }))}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-900 dark:text-white">
                          {option.label[language]}
                        </span>
                      </div>
                      {option.stars > 0 && (
                        <div className="flex gap-0.5">
                          {[...Array(option.stars)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {language === 'uz' ? 'Saralash' : language === 'ru' ? 'Сортировка' : 'Sort By'}
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        localFilters.sortBy === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="sort"
                          value={option.value}
                          checked={localFilters.sortBy === option.value}
                          onChange={() => setLocalFilters(prev => ({ ...prev, sortBy: option.value as any }))}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-900 dark:text-white text-sm">
                          {option.label[language]}
                        </span>
                      </div>
                      {localFilters.sortBy === option.value && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {language === 'uz' ? 'Mavjudlik' : language === 'ru' ? 'Наличие' : 'Availability'}
                  </h3>
                </div>
                
                <label className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                  <span className="text-gray-900 dark:text-white">
                    {language === 'uz' ? 'Faqat mavjud mahsulotlar' : language === 'ru' ? 'Только в наличии' : 'In stock only'}
                  </span>
                  <input
                    type="checkbox"
                    checked={localFilters.inStockOnly}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                  />
                </label>
              </div>

              {/* Categories (if available) */}
              {availableCategories.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {language === 'uz' ? 'Kategoriyalar' : language === 'ru' ? 'Категории' : 'Categories'}
                  </h3>
                  
                  <div className="space-y-2">
                    {availableCategories.map((category) => (
                      <label
                        key={category}
                        className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                      >
                        <span className="text-gray-900 dark:text-white capitalize">
                          {category}
                        </span>
                        <input
                          type="checkbox"
                          checked={localFilters.categories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Vendors (if available) */}
              {availableVendors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {language === 'uz' ? 'Sotuvchilar' : language === 'ru' ? 'Продавцы' : 'Vendors'}
                  </h3>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableVendors.map((vendor) => (
                      <label
                        key={vendor.id}
                        className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                      >
                        <span className="text-gray-900 dark:text-white">
                          {vendor.name}
                        </span>
                        <input
                          type="checkbox"
                          checked={localFilters.vendorIds.includes(vendor.id)}
                          onChange={() => toggleVendor(vendor.id)}
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Sticky */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 flex gap-3">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1"
              >
                {language === 'uz' ? 'Tozalash' : language === 'ru' ? 'Сбросить' : 'Reset'}
              </Button>
              <Button
                onClick={handleApply}
                variant="primary"
                className="flex-1"
              >
                {language === 'uz' ? 'Qo\'llash' : language === 'ru' ? 'Применить' : 'Apply'}
                {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
