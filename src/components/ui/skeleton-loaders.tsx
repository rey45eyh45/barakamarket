import { motion } from 'motion/react';

// Base Skeleton with shimmer animation
export function Skeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 rounded ${className}`}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="w-full aspect-square" />
      
      {/* Content skeleton */}
      <div className="p-3 space-y-3">
        {/* Title */}
        <Skeleton className="h-4 w-3/4" />
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        
        {/* Stock badge */}
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
    </div>
  );
}

// Order Card Skeleton
export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          {/* Order number */}
          <Skeleton className="h-4 w-32" />
          {/* Date */}
          <Skeleton className="h-3 w-40" />
        </div>
        {/* Status badge */}
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      
      {/* Products count and price */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

// Banner Skeleton
export function BannerSkeleton() {
  return (
    <div className="relative">
      <Skeleton className="w-full h-48 rounded-xl" />
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <Skeleton className="h-6 w-2/3 bg-gray-300" />
        <Skeleton className="h-4 w-1/2 bg-gray-300" />
      </div>
    </div>
  );
}

// Category Button Skeleton
export function CategorySkeleton() {
  return (
    <Skeleton className="h-10 px-4 rounded-full flex-shrink-0 w-24" />
  );
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Order List Skeleton
export function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Search Result Skeleton
export function SearchResultSkeleton() {
  return (
    <div className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg">
      <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

// Profile Stats Skeleton
export function ProfileStatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
          <Skeleton className="h-6 w-12 mx-auto mb-2" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
      ))}
    </div>
  );
}

// Review Skeleton
export function ReviewSkeleton() {
  return (
    <div className="border-b pb-4 mb-4">
      <div className="flex items-start gap-3 mb-2">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  );
}

// Table Row Skeleton (for admin)
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// Card Skeleton (generic)
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

// Image Skeleton with aspect ratio
export function ImageSkeleton({ aspectRatio = 'square' }: { aspectRatio?: 'square' | 'video' | 'portrait' }) {
  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]'
  }[aspectRatio];

  return <Skeleton className={`w-full ${aspectClass}`} />;
}

// Text Skeleton (multiple lines)
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="h-3" 
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

// Button Skeleton
export function ButtonSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32'
  }[size];

  return <Skeleton className={`rounded-xl ${sizeClass}`} />;
}

// Avatar Skeleton
export function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }[size];

  return <Skeleton className={`rounded-full ${sizeClass}`} />;
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <Skeleton className="h-6 w-1/3 mb-6" />
      <div className="space-y-3">
        {[60, 80, 40, 90, 50, 70].map((height, i) => (
          <div key={i} className="flex items-end gap-2">
            <Skeleton className="w-full" style={{ height: `${height}px` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
