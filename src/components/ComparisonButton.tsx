// Comparison Button Component - Add/Remove from comparison

import React, { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';
import { Product } from '../types';
import { isInComparison, toggleComparison, getComparisonCount, MAX_COMPARISON_ITEMS } from '../types/comparison';

interface ComparisonButtonProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  onToggle?: (inComparison: boolean) => void;
}

export function ComparisonButton({
  product,
  size = 'md',
  showText = false,
  className = '',
  onToggle
}: ComparisonButtonProps) {
  const [inComparison, setInComparison] = useState(false);
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if product is in comparison
  useEffect(() => {
    setInComparison(isInComparison(product.id));
    setCount(getComparisonCount());
  }, [product.id]);

  // Listen for comparison updates
  useEffect(() => {
    const handleComparisonUpdate = () => {
      setInComparison(isInComparison(product.id));
      setCount(getComparisonCount());
    };

    window.addEventListener('comparison-updated', handleComparisonUpdate);
    return () => window.removeEventListener('comparison-updated', handleComparisonUpdate);
  }, [product.id]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = toggleComparison(product);
    
    if (result.success) {
      setInComparison(result.inComparison);
      setCount(getComparisonCount());
      
      // Animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);

      // Callback
      onToggle?.(result.inComparison);

      // Notification
      if (result.inComparison) {
        console.log('✅ Solishtirish uchun qo\'shildi');
      } else {
        console.log('❌ Solishtirishdan o\'chirildi');
      }
    } else {
      // Show error
      alert(result.error);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const isFull = count >= MAX_COMPARISON_ITEMS && !inComparison;

  return (
    <button
      onClick={handleClick}
      disabled={isFull}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center gap-2
        rounded-full
        transition-all duration-200
        ${inComparison
          ? 'bg-purple-500 text-white hover:bg-purple-600'
          : isFull
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-white/90 text-gray-600 hover:bg-gray-100 hover:text-purple-500'
        }
        shadow-md hover:shadow-lg
        ${isAnimating ? 'scale-125' : 'scale-100'}
        ${className}
      `}
      aria-label={inComparison ? 'Remove from comparison' : 'Add to comparison'}
      title={
        isFull 
          ? `Maksimum ${MAX_COMPARISON_ITEMS} ta mahsulot`
          : inComparison 
          ? 'Solishtirishdan o\'chirish' 
          : 'Solishtirishga qo\'shish'
      }
    >
      <Scale
        size={iconSize[size]}
        className="transition-all"
      />
      {showText && (
        <span className="pr-2">
          {inComparison ? 'Qo\'shilgan' : 'Solishtirish'}
        </span>
      )}
      {count > 0 && !showText && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}
