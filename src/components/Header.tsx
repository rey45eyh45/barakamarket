import { Search, ShoppingCart } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  onCartClick: () => void;
}

export function Header({ searchQuery, onSearchChange, cartCount, onCartClick }: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white shadow-lg">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          {/* Logo */}
          <Logo size="sm" showText={true} />
          
          {/* Cart Button */}
          <button
            onClick={onCartClick}
            className="relative p-2 hover:bg-white/10 rounded-full transition-all duration-200 active:scale-95"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Mahsulotlarni qidirish..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner bg-white/95 backdrop-blur-sm"
          />
        </div>
      </div>
    </div>
  );
}