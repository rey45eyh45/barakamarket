// Wishlist Button Component - Add/Remove from wishlist

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Product } from '../types';
import { isInWishlist, toggleWishlist } from '../types/wishlist';

interface WishlistButtonProps {
  product: Product;
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  onToggle?: (inWishlist: boolean) => void;
}

export function WishlistButton({
  product,
  userId,
  size = 'md',
  showText = false,
  className = '',
  onToggle
}: WishlistButtonProps) {
  const [inWishlist, setInWishlist] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if product is in wishlist
  useEffect(() => {
    setInWishlist(isInWishlist(product.id, userId));
  }, [product.id, userId]);

  // Listen for wishlist updates
  useEffect(() => {
    const handleWishlistUpdate = () => {
      setInWishlist(isInWishlist(product.id, userId));
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate);
  }, [product.id, userId]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newState = toggleWishlist(product, userId);
    setInWishlist(newState);
    
    // Animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Callback
    onToggle?.(newState);

    // Toast notification (optional)
    if (newState) {
      console.log('✅ Sevimlilar ro\'yxatiga qo\'shildi');
    } else {
      console.log('❌ Sevimlilar ro\'yxatidan o\'chirildi');
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center gap-2
        rounded-full
        transition-all duration-200
        ${inWishlist
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-white/90 text-gray-600 hover:bg-gray-100 hover:text-red-500'
        }
        shadow-md hover:shadow-lg
        ${isAnimating ? 'scale-125' : 'scale-100'}
        ${className}
      `}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      title={inWishlist ? 'Sevimlilardan o\'chirish' : 'Sevimlilarga qo\'shish'}
    >
      <Heart
        size={iconSize[size]}
        fill={inWishlist ? 'currentColor' : 'none'}
        className="transition-all"
      />
      {showText && (
        <span className="pr-2">
          {inWishlist ? 'Saqlangan' : 'Saqlash'}
        </span>
      )}
    </button>
  );
}
