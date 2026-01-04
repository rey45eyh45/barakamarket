import { Home, Grid3x3, Heart, ShoppingCart, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BottomNavProps {
  currentPage: 'home' | 'catalog' | 'favorites' | 'cart' | 'profile';
  onNavigate: (page: 'home' | 'catalog' | 'favorites' | 'cart' | 'profile') => void;
  cartCount: number;
}

export function BottomNav({ currentPage, onNavigate, cartCount }: BottomNavProps) {
  const context = useLanguage();
  const t = context?.t;

  // Fallback labels if translation is not available
  const fallbackLabels = {
    home: 'Bosh sahifa',
    catalog: 'Katalog',
    favorites: 'Sevimlilar',
    cart: 'Savat',
    profile: 'Profil'
  };

  const navItems = [
    { id: 'home' as const, label: t?.nav?.home || fallbackLabels.home, icon: Home },
    { id: 'catalog' as const, label: t?.nav?.catalog || fallbackLabels.catalog, icon: Grid3x3 },
    { id: 'favorites' as const, label: t?.nav?.favorites || fallbackLabels.favorites, icon: Heart },
    { id: 'cart' as const, label: t?.nav?.cart || fallbackLabels.cart, icon: ShoppingCart },
    { id: 'profile' as const, label: t?.nav?.profile || fallbackLabels.profile, icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="grid grid-cols-5 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'fill-blue-600 dark:fill-blue-400' : ''}`} />
                {item.id === 'cart' && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}