import { Product } from '../types';
import { Search, Heart, ShoppingCart, X, SlidersHorizontal, ChevronDown, ArrowUpDown, Filter as FilterIcon } from 'lucide-react';
import { CategoryFilter } from './CategoryFilter';
import { SearchModal } from './SearchModal';
import { AdvancedFilterPanel, FilterOptions } from './AdvancedFilterPanel';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductGridSkeleton } from './ui/skeleton-loaders';
import { ProductCardImage } from './ui/ProductImage';
import { Button, IconButton } from './ui/button';
import { Card } from './ui/card';

interface CatalogPageAdvancedProps {
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

export function CatalogPageAdvanced({
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
}: CatalogPageAdvancedProps) {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Calculate price range from products
  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 10000000 };
    const prices = products.map(p => p.price);
    return {
      min: Math.floor(Math.min(...prices) / 10000) * 10000,
      max: Math.ceil(Math.max(...prices) / 10000) * 10000
    };
  }, [products]);

  // Advanced Filters State
  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: 0,
    maxPrice: priceRange.max,
    minRating: 0,
    inStockOnly: false,
    sortBy: 'default',
    vendorIds: [],
    categories: []
  });

  // Get unique vendors
  const availableVendors = useMemo(() => {
    const vendorMap = new Map();
    products.forEach(p => {
      if (p.vendorId) {
        vendorMap.set(p.vendorId, {
          id: p.vendorId,
          name: `Vendor ${p.vendorId.slice(0, 8)}`  // TODO: Get real vendor names
        });
      }
    });
    return Array.from(vendorMap.values());
  }, [products]);

  // Get unique categories
  const availableCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  // Apply all filters
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Price filter
    if (filters.minPrice > 0 || filters.maxPrice < priceRange.max) {
      filtered = filtered.filter(p => 
        p.price >= filters.minPrice && p.price <= filters.maxPrice
      );
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(p => (p.rating || 0) >= filters.minRating);
    }

    // Stock filter
    if (filters.inStockOnly) {
      filtered = filtered.filter(p => (p.stock || 0) > 0);
    }

    // Category filter (multi-select)
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    // Vendor filter
    if (filters.vendorIds.length > 0) {
      filtered = filtered.filter(p => p.vendorId && filters.vendorIds.includes(p.vendorId));
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'popular':
        filtered.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
    }

    return filtered;
  }, [products, filters, priceRange.max]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: priceRange.max,
      minRating: 0,
      inStockOnly: false,
      sortBy: 'default',
      vendorIds: [],
      categories: []
    });
  };

  // Count active filters
  const activeFiltersCount = 
    (filters.minPrice > 0 || filters.maxPrice < priceRange.max ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.sortBy !== 'default' ? 1 : 0) +
    filters.vendorIds.length +
    filters.categories.length;

  const hasActiveFilters = activeFiltersCount > 0;

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

          {/* Filter Button Row */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {/* Advanced Filter Button */}
            <button
              onClick={() => setShowFilterPanel(true)}
              className={`flex-shrink-0 px-4 py-2 rounded-full border transition flex items-center gap-2 ${
                hasActiveFilters
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm">
                {hasActiveFilters ? `Filter (${activeFiltersCount})` : 'Filter'}
              </span>
            </button>

            {/* Active Filter Chips */}
            {filters.sortBy !== 'default' && (
              <div className="flex-shrink-0 px-3 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm flex items-center gap-2">
                <span>
                  {filters.sortBy === 'price-low' && 'Arzonroq'}
                  {filters.sortBy === 'price-high' && 'Qimmatroq'}
                  {filters.sortBy === 'rating' && 'Reyting bo\'yicha'}
                  {filters.sortBy === 'newest' && 'Yangilari'}
                  {filters.sortBy === 'popular' && 'Mashhur'}
                </span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setFilters(prev => ({ ...prev, sortBy: 'default' }))}
                />
              </div>
            )}

            {filters.minRating > 0 && (
              <div className="flex-shrink-0 px-3 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm flex items-center gap-2">
                <span>{filters.minRating}+ ⭐</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setFilters(prev => ({ ...prev, minRating: 0 }))}
                />
              </div>
            )}

            {filters.inStockOnly && (
              <div className="flex-shrink-0 px-3 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm flex items-center gap-2">
                <span>Mavjud</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => setFilters(prev => ({ ...prev, inStockOnly: false }))}
                />
              </div>
            )}
          </div>

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleResetFilters}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
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
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          <span className="font-medium">{filteredProducts.length}</span> ta mahsulot topildi
        </p>
      </div>

      {/* Products Grid */}
      <div className="p-4 pb-24">
        {loading ? (
          <ProductGridSkeleton />
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-2">Mahsulotlar topilmadi</p>
            <p className="text-gray-400 dark:text-gray-500 text-center text-sm mb-4">
              Boshqa so'z bilan qidiring yoki filtrlarni o'zgartiring
            </p>
            {hasActiveFilters && (
              <Button onClick={handleResetFilters} variant="outline">
                Filtrlarni tozalash
              </Button>
            )}
          </div>
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
                        <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-t-lg">
                          <ProductCardImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>

                      {/* Favorite Button */}
                      <IconButton
                        icon={<Heart className={isFavorite ? 'fill-current' : ''} />}
                        variant={isFavorite ? 'destructive' : 'secondary'}
                        size="md"
                        rounded
                        onClick={() => onToggleFavorite(product.id)}
                        className="absolute top-2 right-2 shadow-md"
                      />

                      {/* Discount Badge */}
                      {product.discount && product.discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          -{product.discount}%
                        </div>
                      )}

                      {/* Stock Badge */}
                      {(product.stock || 0) <= (product.lowStockThreshold || 0) && (product.stock || 0) > 0 && (
                        <div className="absolute bottom-2 left-2 bg-amber-500 text-white px-2 py-1 rounded text-xs">
                          Kam qoldi!
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h3
                        onClick={() => onProductClick(product)}
                        className="text-gray-900 dark:text-white mb-1 line-clamp-2 min-h-[2.5rem] cursor-pointer text-sm"
                      >
                        {product.name}
                      </h3>
                      
                      {/* Rating */}
                      {product.rating && product.rating > 0 && (
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-yellow-500 text-sm">★</span>
                          <span className="text-gray-600 dark:text-gray-400 text-xs">
                            {product.rating.toFixed(1)} ({product.reviewsCount || 0})
                          </span>
                        </div>
                      )}
                      
                      {/* Price */}
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <div className="mb-2">
                          <div className="text-gray-400 dark:text-gray-500 line-through text-xs">
                            {formatPrice(product.originalPrice)}
                          </div>
                          <p className="text-blue-600 dark:text-blue-400 font-bold">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">
                          {formatPrice(product.price)}
                        </p>
                      )}
                      
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        icon={<ShoppingCart />}
                        onClick={() => onAddToCart(product)}
                        disabled={(product.stock || 0) === 0}
                      >
                        {(product.stock || 0) === 0 ? 'Tugagan' : 'Savatga'}
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

      {/* Advanced Filter Panel */}
      <AdvancedFilterPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        availableVendors={availableVendors}
        availableCategories={availableCategories}
        priceRange={priceRange}
      />
    </div>
  );
}
