// Wishlist Page Component - Full wishlist management

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Share2, 
  Download, 
  Filter,
  TrendingDown,
  AlertCircle,
  Search,
  X
} from 'lucide-react';
import { WishlistButton } from './WishlistButton';
import {
  getWishlist,
  getWishlistStats,
  removeFromWishlist,
  clearWishlist,
  moveWishlistToCart,
  moveAllWishlistToCart,
  shareWishlist,
  sortWishlist,
  filterWishlist,
  searchWishlist,
  exportWishlist,
  type WishlistItem
} from '../types/wishlist';

interface WishlistPageProps {
  userId?: string;
  language?: 'uz' | 'ru' | 'en';
}

export function WishlistPage({ userId, language = 'uz' }: WishlistPageProps) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dateAdded' | 'price-low' | 'price-high' | 'name' | 'discount'>('dateAdded');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceMin: undefined as number | undefined,
    priceMax: undefined as number | undefined,
    inStock: false,
    onSale: false
  });

  const stats = getWishlistStats(userId);

  // Load wishlist
  useEffect(() => {
    loadWishlist();
  }, [userId, sortBy, filters, searchQuery]);

  // Listen for updates
  useEffect(() => {
    const handleUpdate = () => loadWishlist();
    window.addEventListener('wishlist-updated', handleUpdate);
    return () => window.removeEventListener('wishlist-updated', handleUpdate);
  }, [userId, sortBy, filters, searchQuery]);

  const loadWishlist = () => {
    let result: WishlistItem[] = [];

    // Search
    if (searchQuery) {
      result = searchWishlist(searchQuery, userId);
    } else {
      const wishlist = getWishlist(userId);
      result = wishlist.items;
    }

    // Filter
    if (filters.category || filters.priceMin || filters.priceMax || filters.inStock || filters.onSale) {
      result = filterWishlist(filters, userId);
    }

    // Sort
    result = sortWishlist(sortBy, userId);

    setItems(result);
    setFilteredItems(result);
  };

  const handleRemove = (productId: string) => {
    removeFromWishlist(productId, userId);
    loadWishlist();
  };

  const handleClearAll = () => {
    if (window.confirm('Sevimlilar ro\'yxatini tozalashni xohlaysizmi?')) {
      clearWishlist(userId);
      loadWishlist();
    }
  };

  const handleMoveToCart = (productId: string) => {
    moveWishlistToCart(productId, userId);
    loadWishlist();
  };

  const handleMoveAllToCart = () => {
    const count = moveAllWishlistToCart(userId);
    alert(`${count} ta mahsulot savatchaga qo'shildi`);
    loadWishlist();
  };

  const handleShare = () => {
    const share = shareWishlist(userId);
    
    // Copy to clipboard
    navigator.clipboard.writeText(share.shareUrl);
    alert('Havola nusxalandi! ' + share.shareUrl);
  };

  const handleExport = () => {
    const data = exportWishlist(userId);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wishlist-${Date.now()}.json`;
    a.click();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Heart size={48} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sevimlilar ro'yxati bo'sh
          </h2>
          <p className="text-gray-600 mb-6">
            Yoqtirgan mahsulotlaringizni saqlab qo'ying
          </p>
          <a
            href="/catalog"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Katalogga o'tish
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ❤️ Sevimlilar
            </h1>
            <p className="text-gray-600">
              {stats.totalItems} ta mahsulot • {formatPrice(stats.totalValue)}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Share2 size={20} />
              <span className="hidden sm:inline">Ulashish</span>
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download size={20} />
              <span className="hidden sm:inline">Yuklab olish</span>
            </button>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 size={20} />
              <span className="hidden sm:inline">Tozalash</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {stats.priceDropCount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <TrendingDown size={20} />
                <span className="font-semibold">Narx tushdi!</span>
              </div>
              <p className="text-sm text-green-600">
                {stats.priceDropCount} ta mahsulotda
              </p>
            </div>
          )}

          {stats.outOfStockCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-700 mb-1">
                <AlertCircle size={20} />
                <span className="font-semibold">Tugab qolgan</span>
              </div>
              <p className="text-sm text-yellow-600">
                {stats.outOfStockCount} ta mahsulot
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-700 font-semibold mb-1">
              O'rtacha narx
            </div>
            <p className="text-sm text-blue-600">
              {formatPrice(stats.averagePrice)}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidirish..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="dateAdded">Yangilari</option>
            <option value="price-low">Arzon → Qimmat</option>
            <option value="price-high">Qimmat → Arzon</option>
            <option value="name">Nomi bo'yicha</option>
            <option value="discount">Chegirmasi bo'yicha</option>
          </select>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter size={20} />
            Filter
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategoriya
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Barchasi</option>
                  {Object.keys(stats.byCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min narx
                </label>
                <input
                  type="number"
                  value={filters.priceMin || ''}
                  onChange={(e) => setFilters({ ...filters, priceMin: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max narx
                </label>
                <input
                  type="number"
                  value={filters.priceMax || ''}
                  onChange={(e) => setFilters({ ...filters, priceMax: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="∞"
                />
              </div>

              <div className="flex flex-col gap-2 justify-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Omborda bor</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.onSale}
                    onChange={(e) => setFilters({ ...filters, onSale: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Chegirmada</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Move All to Cart */}
        {items.length > 0 && (
          <button
            onClick={handleMoveAllToCart}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} />
            Barchasini savatchaga qo'shish
          </button>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.productId}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-100">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Discount Badge */}
              {item.product.discount && item.product.discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                  -{item.product.discount}%
                </div>
              )}

              {/* Price Drop Badge */}
              {item.product.price < item.priceAtAdd && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  <TrendingDown size={14} />
                  Arzonlashdi
                </div>
              )}

              {/* Out of Stock Overlay */}
              {item.product.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="bg-white px-4 py-2 rounded-lg font-semibold text-gray-900">
                    Tugagan
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {item.product.name}
              </h3>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(item.product.price)}
                  </div>
                  {item.priceAtAdd !== item.product.price && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatPrice(item.priceAtAdd)}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                Qo'shilgan: {new Date(item.addedAt).toLocaleDateString('uz-UZ')}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleMoveToCart(item.productId)}
                  disabled={item.product.stock === 0}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingCart size={16} />
                  Savat
                </button>
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
