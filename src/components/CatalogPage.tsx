import { Product } from '../types';
import { Search, Heart, ShoppingCart, X, SlidersHorizontal, ChevronDown, ArrowUpDown, PackageSearch } from 'lucide-react';
import { CategoryFilter } from './CategoryFilter';
import { SearchModal } from './SearchModal';
import { AdvancedSearch } from './AdvancedSearch';
import { AdvancedFilterPanel, FilterOptions } from './AdvancedFilterPanel';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductGridSkeleton } from './ui/skeleton-loaders';
import { ProductCardImage } from './ui/ProductImage';
import { Button, IconButton } from './ui/Button';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';
import { EmptyState } from './ui/EmptyState';

interface CatalogPageProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  favoriteIds: string[];
  onToggleFavorite: (productId: string) => void;
  loading?: boolean;
}

type SortType = 'default' | 'price-low' | 'price-high' | 'name';

export function CatalogPage({
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onProductClick,
  onAddToCart,
  favoriteIds,
  onToggleFavorite,
  loading = false
}: CatalogPageProps) {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [showPriceSheet, setShowPriceSheet] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [sortType, setSortType] = useState<SortType>('default');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  // Filter and sort products
  let filteredProducts = [...products];

  // Apply price filter
  if (minPrice || maxPrice) {
    filteredProducts = filteredProducts.filter(p => {
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      return p.price >= min && p.price <= max;
    });
  }

  // Apply sorting
  switch (sortType) {
    case 'price-low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  const handleSortSelect = (type: SortType) => {
    setSortType(type);
    setShowSortSheet(false);
  };

  const handlePriceApply = () => {
    setShowPriceSheet(false);
  };

  const clearAllFilters = () => {
    setSortType('default');
    setMinPrice('');
    setMaxPrice('');
  };

  const hasActiveFilters = sortType !== 'default' || minPrice || maxPrice;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Skeleton */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 py-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Category Tabs Skeleton */}
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Filter Bar Skeleton */}
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-2">
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="container mx-auto px-4 py-6">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Search */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-3">
          {/* Search Input - Opens Modal */}
          <div
            onClick={() => setShowSearchModal(true)}
            className="relative cursor-pointer"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
            <div className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              {searchQuery || 'Mahsulotlarni qidirish...'}
            </div>
          </div>

          {/* Filter Chips - Only 3 buttons */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {/* Sort Button */}
            <button
              onClick={() => setShowSortSheet(true)}
              className={`flex-shrink-0 px-4 py-2 rounded-full border transition flex items-center gap-2 ${
                sortType !== 'default'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="text-sm">
                {sortType === 'price-low' && 'Arzonroq'}
                {sortType === 'price-high' && 'Qimmatroq'}
                {sortType === 'name' && 'A-Z'}
                {sortType === 'default' && 'Saralash'}
              </span>
            </button>

            {/* Price Filter Button */}
            <button
              onClick={() => setShowPriceSheet(true)}
              className={`flex-shrink-0 px-4 py-2 rounded-full border transition flex items-center gap-2 ${
                minPrice || maxPrice
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              }`}
            >
              <span className="text-sm">Narx</span>
              {(minPrice || maxPrice) && <X className="w-4 h-4" />}
            </button>

            {/* More Filters */}
            <button
              onClick={() => setShowMoreSheet(true)}
              className="flex-shrink-0 px-4 py-2 rounded-full border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 transition flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm">Boshqa</span>
            </button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={clearAllFilters}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Barcha filtrlarni tozalash
            </motion.button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-[140px] z-30">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            <span className="font-medium">{filteredProducts.length}</span> ta natija topildi
          </p>
        </div>
      )}

      {/* Products Grid */}
      <div className="p-4">
        {loading ? (
          <ProductGridSkeleton />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title={searchQuery ? "Hech narsa topilmadi" : "Mahsulotlar yo'q"}
            description={
              searchQuery 
                ? `"${searchQuery}" bo'yicha hech narsa topilmadi. Boshqa kalit so'z bilan qidiring.`
                : hasActiveFilters
                ? "Bu filtrlar bo'yicha mahsulot yo'q. Filtrlarni o'zgartiring."
                : "Bu kategoriyada hozircha mahsulotlar yo'q."
            }
            actionLabel={hasActiveFilters ? "Filtrlarni tozalash" : undefined}
            onAction={hasActiveFilters ? clearAllFilters : undefined}
            secondaryActionLabel="Boshqa kategoriyani ko'rish"
            onSecondaryAction={() => onSelectCategory('all')}
            illustration="search"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const isFavorite = favoriteIds.includes(product.id);
              
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card variant="elevated" padding="none" hoverable>
                    <div className="relative">
                      <div
                        onClick={() => onProductClick(product)}
                        className="cursor-pointer"
                      >
                        <div className="aspect-square overflow-hidden bg-gray-100 rounded-t-lg">
                          <ProductCardImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <IconButton
                        icon={<Heart className={isFavorite ? 'fill-current' : ''} />}
                        variant={isFavorite ? 'destructive' : 'secondary'}
                        size="md"
                        rounded
                        onClick={() => onToggleFavorite(product.id)}
                        className="absolute top-2 right-2 shadow-md"
                      />
                    </div>
                    <div className="p-3">
                      <h3
                        onClick={() => onProductClick(product)}
                        className="text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem] cursor-pointer"
                      >
                        {product.name}
                      </h3>
                      
                      {/* Price with Discount */}
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <div className="mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-400 line-through text-sm">
                              {formatPrice(product.originalPrice)}
                            </span>
                            {product.discount && (
                              <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                                -{product.discount}%
                              </span>
                            )}
                          </div>
                          <p className="text-blue-600 font-bold">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-blue-600 font-semibold mb-2">
                          {formatPrice(product.price)}
                        </p>
                      )}
                      
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        icon={<ShoppingCart />}
                        onClick={() => onAddToCart(product)}
                      >
                        Savatga
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        products={products}
        onProductClick={onProductClick}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />

      {/* Sort Bottom Sheet */}
      <AnimatePresence>
        {showSortSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSortSheet(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl z-50 p-6"
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-gray-900 dark:text-gray-100 mb-4">Saralash</h3>
              
              <div className="space-y-2">
                {[
                  { value: 'default', label: 'Ommabop' },
                  { value: 'price-low', label: 'Arzonroq' },
                  { value: 'price-high', label: 'Qimmatroq' },
                  { value: 'name', label: 'A-Z' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortSelect(option.value as SortType)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition ${
                      sortType === option.value
                        ? 'bg-blue-50 text-blue-600'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {sortType === option.value && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowSortSheet(false)}
                className="w-full mt-4 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition"
              >
                Yopish
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Price Range Bottom Sheet */}
      <AnimatePresence>
        {showPriceSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPriceSheet(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl z-50 p-6"
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-gray-900 dark:text-gray-100 mb-4">Narx oralig'i</h3>
              
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Dan</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Gacha</label>
                  <input
                    type="number"
                    placeholder="100000000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={handlePriceApply}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition mb-2"
              >
                Qo'llash
              </button>

              <button
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  setShowPriceSheet(false);
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition"
              >
                Tozalash
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* More Filters Bottom Sheet */}
      <AnimatePresence>
        {showMoreSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoreSheet(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl z-50 p-6"
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-gray-900 dark:text-gray-100 mb-4">Qo'shimcha filtrlar</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">Faqat chegirmalari</span>
                  <input type="checkbox" className="w-5 h-5 rounded" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">Yangi mahsulotlar</span>
                  <input type="checkbox" className="w-5 h-5 rounded" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">Bepul yetkazib berish</span>
                  <input type="checkbox" className="w-5 h-5 rounded" />
                </div>
              </div>

              <button
                onClick={() => setShowMoreSheet(false)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition mb-2"
              >
                Qo'llash
              </button>

              <button
                onClick={() => setShowMoreSheet(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition"
              >
                Yopish
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}