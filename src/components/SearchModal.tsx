import { useState, useEffect } from 'react';
import { Search, X, Clock, TrendingUp, ArrowLeft } from 'lucide-react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductClick: (product: Product) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'Barchasi', icon: '🛍️' },
  { id: 'elektronika', name: 'Elektronika', icon: '📱' },
  { id: 'kiyim', name: 'Kiyim', icon: '👕' },
  { id: 'kitoblar', name: 'Kitoblar', icon: '📚' },
  { id: 'uy-buyumlari', name: 'Uy buyumlari', icon: '🏠' }
];

function SearchResultSkeleton() {
  return (
    <div className="flex gap-3 bg-white rounded-xl p-3 border border-gray-200 animate-pulse">
      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );
}

export function SearchModal({
  isOpen,
  onClose,
  products,
  onProductClick,
  searchQuery,
  onSearchChange
}: SearchModalProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Load search history
  useEffect(() => {
    const stored = localStorage.getItem('search_history');
    if (stored) {
      setSearchHistory(JSON.parse(stored));
    }
  }, []);

  const handleSearch = (value: string) => {
    setLocalQuery(value);
    onSearchChange(value);
    
    // Simulate searching delay
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 300);

    // Save to history if not empty
    if (value.trim() && !searchHistory.includes(value)) {
      const newHistory = [value, ...searchHistory].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search_history');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  // Filter products
  let filteredProducts = products.filter(product => {
    const matchesQuery = localQuery.trim()
      ? product.name.toLowerCase().includes(localQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(localQuery.toLowerCase())
      : true;

    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Mahsulotlarni qidirish..."
                value={localQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              {localQuery && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full transition flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="text-sm">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {/* Search History */}
          {!localQuery && searchHistory.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm text-gray-600 dark:text-gray-400">Oxirgi qidiruvlar</h3>
                </div>
                <button
                  onClick={clearHistory}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Tozalash
                </button>
              </div>
              <div className="space-y-2">
                {searchHistory.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(term)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left"
                  >
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white">{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Count */}
          {localQuery && (
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                <span className="font-medium">{filteredProducts.length}</span> ta natija topildi
              </p>
            </div>
          )}

          {/* No Results */}
          {filteredProducts.length === 0 && localQuery ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-2">Mahsulotlar topilmadi</p>
              <p className="text-gray-400 dark:text-gray-500 text-center text-sm">
                "{localQuery}" uchun hech narsa topilmadi
              </p>
            </div>
          ) : !localQuery && searchHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-6xl mb-4">🔎</div>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-2">Mahsulot qidiring</p>
              <p className="text-gray-400 dark:text-gray-500 text-center text-sm">
                Mahsulot nomini kiriting
              </p>
            </div>
          ) : isSearching ? (
            <div className="p-4">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <SearchResultSkeleton key={index} />
                ))}
              </div>
            </div>
          ) : localQuery ? (
            <div className="p-4">
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      onProductClick(product);
                      onClose();
                    }}
                    className="flex gap-3 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition cursor-pointer"
                  >
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-900 dark:text-white mb-1 line-clamp-2">
                        {product.name}
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{product.category}</p>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold">{formatPrice(product.price)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
