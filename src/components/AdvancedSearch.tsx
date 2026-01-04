import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, Star, Package, DollarSign, Tag, Filter, Trash2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface SearchFilters {
  categories: string[];
  priceRange: { min: number; max: number };
  minRating: number;
  inStockOnly: boolean;
  brands: string[];
  sortBy: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating' | 'newest';
}

interface AdvancedSearchProps {
  products: Product[];
  onFilterChange: (filtered: Product[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'Barchasi', icon: '🛍️' },
  { id: 'elektronika', label: 'Elektronika', icon: '📱' },
  { id: 'kiyim', label: 'Kiyim', icon: '👕' },
  { id: 'kitoblar', label: 'Kitoblar', icon: '📚' },
  { id: 'uy-buyumlari', label: 'Uy buyumlari', icon: '🏠' },
  { id: 'sport', label: 'Sport', icon: '⚽' },
  { id: 'oziq-ovqat', label: 'Oziq-ovqat', icon: '🍎' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Eng yangilari' },
  { value: 'price-asc', label: 'Arzon → Qimmat' },
  { value: 'price-desc', label: 'Qimmat → Arzon' },
  { value: 'name-asc', label: 'A → Z' },
  { value: 'name-desc', label: 'Z → A' },
  { value: 'rating', label: 'Reytingi yuqori' }
];

export function AdvancedSearch({ products, onFilterChange, searchQuery, onSearchChange }: AdvancedSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    priceRange: { min: 0, max: 50000000 },
    minRating: 0,
    inStockOnly: false,
    brands: [],
    sortBy: 'newest'
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(50000000);
  const [expandedSections, setExpandedSections] = useState<string[]>(['categories', 'price']);

  // Load search history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('search_history');
    if (stored) {
      setSearchHistory(JSON.parse(stored));
    }
  }, []);

  // Save search to history
  const saveToHistory = (query: string) => {
    if (!query.trim() || searchHistory.includes(query)) return;
    
    const newHistory = [query, ...searchHistory].slice(0, 10); // Keep last 10
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search_history');
  };

  // Get unique brands from products
  const availableBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  // Calculate price range from products
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setPriceMin(min);
      setPriceMax(max);
      setFilters(prev => ({
        ...prev,
        priceRange: { min, max }
      }));
    }
  }, [products]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];

    // Search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes('all')) {
      filtered = filtered.filter(product =>
        filters.categories.includes(product.category)
      );
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= filters.priceRange.min &&
      product.price <= filters.priceRange.max
    );

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(product =>
        (product.rating || 0) >= filters.minRating
      );
    }

    // Stock filter
    if (filters.inStockOnly) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product =>
        product.brand && filters.brands.includes(product.brand)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        // Assume newer products have higher IDs
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
    }

    onFilterChange(filtered);
  }, [products, searchQuery, filters]);

  const toggleCategory = (categoryId: string) => {
    setFilters(prev => {
      if (categoryId === 'all') {
        return { ...prev, categories: [] };
      }
      
      const newCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId];
      
      return { ...prev, categories: newCategories };
    });
  };

  const toggleBrand = (brand: string) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: { min: priceMin, max: priceMax },
      minRating: 0,
      inStockOnly: false,
      brands: [],
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.categories.length > 0 ||
      filters.priceRange.min > priceMin ||
      filters.priceRange.max < priceMax ||
      filters.minRating > 0 ||
      filters.inStockOnly ||
      filters.brands.length > 0
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  const handleSearch = (value: string) => {
    onSearchChange(value);
    if (value.trim()) {
      setShowHistory(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setShowHistory(searchHistory.length > 0)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                saveToHistory(searchQuery);
                setShowHistory(false);
              }
            }}
            placeholder="Mahsulot qidirish..."
            className="w-full pl-10 pr-24 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                showFilters || hasActiveFilters()
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {hasActiveFilters() && (
                <span className="text-xs font-semibold">
                  {filters.categories.length + filters.brands.length + (filters.inStockOnly ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Search History */}
          <AnimatePresence>
            {showHistory && searchHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Oxirgi qidiruvlar</span>
                  </div>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Tozalash
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {searchHistory.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSearchChange(term);
                        setShowHistory(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters() && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-600 dark:text-gray-400">Filtrlar:</span>
            
            {filters.categories.map(categoryId => {
              const category = CATEGORIES.find(c => c.id === categoryId);
              return category ? (
                <motion.button
                  key={categoryId}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => toggleCategory(categoryId)}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                  <X className="w-3 h-3" />
                </motion.button>
              ) : null;
            })}

            {filters.brands.map(brand => (
              <motion.button
                key={brand}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => toggleBrand(brand)}
                className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-xs"
              >
                <Tag className="w-3 h-3" />
                <span>{brand}</span>
                <X className="w-3 h-3" />
              </motion.button>
            ))}

            {filters.inStockOnly && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => setFilters(prev => ({ ...prev, inStockOnly: false }))}
                className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-xs"
              >
                <Package className="w-3 h-3" />
                <span>Omborda bor</span>
                <X className="w-3 h-3" />
              </motion.button>
            )}

            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-xs"
            >
              <Trash2 className="w-3 h-3" />
              <span>Tozalash</span>
            </button>
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Saralash:</span>
          {SORT_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setFilters(prev => ({ ...prev, sortBy: option.value as any }))}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                filters.sortBy === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t dark:border-gray-700"
          >
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Categories */}
              <div>
                <button
                  onClick={() => toggleSection('categories')}
                  className="flex items-center justify-between w-full mb-3"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">Kategoriyalar</span>
                  </div>
                  {expandedSections.includes('categories') ? (
                    <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                
                {expandedSections.includes('categories') && (
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.filter(c => c.id !== 'all').map(category => (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                          filters.categories.includes(category.id)
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span>{category.icon}</span>
                        <span className="text-sm">{category.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div>
                <button
                  onClick={() => toggleSection('price')}
                  className="flex items-center justify-between w-full mb-3"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">Narx oralig'i</span>
                  </div>
                  {expandedSections.includes('price') ? (
                    <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>

                {expandedSections.includes('price') && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={filters.priceRange.min}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, min: Number(e.target.value) }
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Min"
                      />
                      <span className="text-gray-500">—</span>
                      <input
                        type="number"
                        value={filters.priceRange.max}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, max: Number(e.target.value) }
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Max"
                      />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      {formatPrice(filters.priceRange.min)} - {formatPrice(filters.priceRange.max)} so'm
                    </div>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div>
                <button
                  onClick={() => toggleSection('rating')}
                  className="flex items-center justify-between w-full mb-3"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">Reyting</span>
                  </div>
                  {expandedSections.includes('rating') ? (
                    <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>

                {expandedSections.includes('rating') && (
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setFilters(prev => ({ ...prev, minRating: rating }))}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                          filters.minRating === rating
                            ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500 text-yellow-700 dark:text-yellow-300'
                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {Array.from({ length: rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-sm">va yuqori</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Brands */}
              {availableBrands.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleSection('brands')}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">Brendlar</span>
                    </div>
                    {expandedSections.includes('brands') ? (
                      <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>

                  {expandedSections.includes('brands') && (
                    <div className="space-y-2">
                      {availableBrands.map(brand => (
                        <label
                          key={brand}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filters.brands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{brand}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Stock */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStockOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <Package className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Faqat omborda bor mahsulotlar</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
