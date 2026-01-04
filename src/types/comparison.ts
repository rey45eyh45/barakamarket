// Product Comparison System Types

import { Product } from './index';

export interface ComparisonItem {
  productId: string;
  product: Product;
  addedAt: string;
}

export interface Comparison {
  items: ComparisonItem[];
  category?: string; // Products should be from same category
  createdAt: string;
  updatedAt: string;
}

export interface ComparisonFeature {
  key: string;
  label: string;
  values: (string | number | boolean | null)[];
  type: 'text' | 'number' | 'boolean' | 'price' | 'rating';
  winner?: number; // Index of best value
  highlight?: boolean; // Highlight differences
}

export interface ComparisonAnalysis {
  bestPrice: number; // Index
  bestRating: number; // Index
  bestValue: number; // Best price/rating ratio
  mostPopular: number; // Highest sales
  mostReviewed: number; // Most reviews
  
  differences: {
    feature: string;
    significant: boolean;
  }[];
  
  recommendations: {
    type: 'budget' | 'quality' | 'balanced' | 'popular';
    productIndex: number;
    reason: string;
  }[];
}

export interface ComparisonShare {
  id: string;
  items: ComparisonItem[];
  category?: string;
  shareUrl: string;
  expiresAt?: string;
  createdAt: string;
}

// Maximum comparison items
export const MAX_COMPARISON_ITEMS = 4;

/**
 * Get comparison from localStorage
 */
export function getComparison(): Comparison {
  const stored = localStorage.getItem('comparison');
  
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Save comparison to localStorage
 */
export function saveComparison(comparison: Comparison): void {
  const updated = {
    ...comparison,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem('comparison', JSON.stringify(updated));
  
  // Trigger event for other components
  window.dispatchEvent(new Event('comparison-updated'));
}

/**
 * Check if product is in comparison
 */
export function isInComparison(productId: string): boolean {
  const comparison = getComparison();
  return comparison.items.some(item => item.productId === productId);
}

/**
 * Add product to comparison
 */
export function addToComparison(product: Product): { success: boolean; error?: string } {
  const comparison = getComparison();
  
  // Check if already in comparison
  if (comparison.items.some(item => item.productId === product.id)) {
    return { success: false, error: 'Already in comparison' };
  }
  
  // Check maximum items
  if (comparison.items.length >= MAX_COMPARISON_ITEMS) {
    return { 
      success: false, 
      error: `Maximum ${MAX_COMPARISON_ITEMS} items allowed` 
    };
  }
  
  // Check category match (if not first item)
  if (comparison.items.length > 0) {
    const firstCategory = comparison.items[0].product.category;
    if (product.category !== firstCategory) {
      return { 
        success: false, 
        error: 'Products must be from same category' 
      };
    }
  }
  
  const item: ComparisonItem = {
    productId: product.id,
    product,
    addedAt: new Date().toISOString()
  };
  
  comparison.items.push(item);
  
  // Set category if first item
  if (comparison.items.length === 1) {
    comparison.category = product.category;
  }
  
  saveComparison(comparison);
  
  return { success: true };
}

/**
 * Remove product from comparison
 */
export function removeFromComparison(productId: string): boolean {
  const comparison = getComparison();
  const initialLength = comparison.items.length;
  
  comparison.items = comparison.items.filter(item => item.productId !== productId);
  
  // Clear category if empty
  if (comparison.items.length === 0) {
    comparison.category = undefined;
  }
  
  if (comparison.items.length < initialLength) {
    saveComparison(comparison);
    return true;
  }
  
  return false;
}

/**
 * Toggle comparison
 */
export function toggleComparison(product: Product): { success: boolean; inComparison: boolean; error?: string } {
  if (isInComparison(product.id)) {
    removeFromComparison(product.id);
    return { success: true, inComparison: false };
  } else {
    const result = addToComparison(product);
    return { 
      success: result.success, 
      inComparison: result.success,
      error: result.error
    };
  }
}

/**
 * Clear comparison
 */
export function clearComparison(): void {
  const comparison: Comparison = {
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  saveComparison(comparison);
}

/**
 * Get comparison count
 */
export function getComparisonCount(): number {
  const comparison = getComparison();
  return comparison.items.length;
}

/**
 * Get comparison items
 */
export function getComparisonItems(): ComparisonItem[] {
  const comparison = getComparison();
  return comparison.items;
}

/**
 * Extract comparison features from products
 */
export function extractComparisonFeatures(items: ComparisonItem[]): ComparisonFeature[] {
  if (items.length === 0) return [];
  
  const features: ComparisonFeature[] = [];
  
  // Basic features
  features.push({
    key: 'name',
    label: 'Nomi',
    values: items.map(item => item.product.name),
    type: 'text'
  });
  
  features.push({
    key: 'price',
    label: 'Narx',
    values: items.map(item => item.product.price),
    type: 'price',
    winner: findBestPriceIndex(items)
  });
  
  features.push({
    key: 'discount',
    label: 'Chegirma',
    values: items.map(item => item.product.discount || 0),
    type: 'number',
    winner: findMaxValueIndex(items.map(item => item.product.discount || 0)),
    highlight: true
  });
  
  features.push({
    key: 'rating',
    label: 'Reyting',
    values: items.map(item => item.product.rating || 0),
    type: 'rating',
    winner: findMaxValueIndex(items.map(item => item.product.rating || 0))
  });
  
  features.push({
    key: 'reviews',
    label: 'Sharhlar',
    values: items.map(item => item.product.reviews || 0),
    type: 'number',
    winner: findMaxValueIndex(items.map(item => item.product.reviews || 0))
  });
  
  features.push({
    key: 'stock',
    label: 'Omborda',
    values: items.map(item => item.product.stock),
    type: 'number',
    winner: findMaxValueIndex(items.map(item => item.product.stock))
  });
  
  features.push({
    key: 'brand',
    label: 'Brend',
    values: items.map(item => item.product.brand || '-'),
    type: 'text'
  });
  
  features.push({
    key: 'category',
    label: 'Kategoriya',
    values: items.map(item => item.product.category),
    type: 'text'
  });
  
  // Specifications (if available)
  const firstProduct = items[0].product;
  if (firstProduct.specifications) {
    Object.entries(firstProduct.specifications).forEach(([key, value]) => {
      features.push({
        key: `spec_${key}`,
        label: key,
        values: items.map(item => 
          item.product.specifications?.[key] ?? '-'
        ),
        type: 'text',
        highlight: true
      });
    });
  }
  
  return features;
}

/**
 * Find index of lowest price
 */
function findBestPriceIndex(items: ComparisonItem[]): number {
  let minPrice = Infinity;
  let minIndex = 0;
  
  items.forEach((item, index) => {
    const effectivePrice = item.product.discount
      ? item.product.price * (1 - item.product.discount / 100)
      : item.product.price;
    
    if (effectivePrice < minPrice) {
      minPrice = effectivePrice;
      minIndex = index;
    }
  });
  
  return minIndex;
}

/**
 * Find index of maximum value
 */
function findMaxValueIndex(values: number[]): number {
  let maxValue = -Infinity;
  let maxIndex = 0;
  
  values.forEach((value, index) => {
    if (value > maxValue) {
      maxValue = value;
      maxIndex = index;
    }
  });
  
  return maxIndex;
}

/**
 * Analyze comparison and provide recommendations
 */
export function analyzeComparison(items: ComparisonItem[]): ComparisonAnalysis {
  if (items.length === 0) {
    return {
      bestPrice: -1,
      bestRating: -1,
      bestValue: -1,
      mostPopular: -1,
      mostReviewed: -1,
      differences: [],
      recommendations: []
    };
  }
  
  // Find best price (considering discount)
  const bestPrice = findBestPriceIndex(items);
  
  // Find best rating
  const ratings = items.map(item => item.product.rating || 0);
  const bestRating = findMaxValueIndex(ratings);
  
  // Find best value (price/rating ratio)
  let bestValueIndex = 0;
  let bestValueScore = 0;
  
  items.forEach((item, index) => {
    const price = item.product.price;
    const rating = item.product.rating || 1;
    const discount = item.product.discount || 0;
    
    // Higher score = better value
    const effectivePrice = price * (1 - discount / 100);
    const valueScore = (rating / effectivePrice) * 1000000; // Normalize
    
    if (valueScore > bestValueScore) {
      bestValueScore = valueScore;
      bestValueIndex = index;
    }
  });
  
  // Most popular (highest sales)
  const sales = items.map(item => item.product.sales || 0);
  const mostPopular = findMaxValueIndex(sales);
  
  // Most reviewed
  const reviews = items.map(item => item.product.reviews || 0);
  const mostReviewed = findMaxValueIndex(reviews);
  
  // Find significant differences
  const differences: ComparisonAnalysis['differences'] = [];
  const features = extractComparisonFeatures(items);
  
  features.forEach(feature => {
    if (feature.type === 'number' || feature.type === 'price') {
      const values = feature.values as number[];
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      // Significant if difference > 20%
      if (max > 0 && ((max - min) / max) > 0.2) {
        differences.push({
          feature: feature.label,
          significant: true
        });
      }
    }
  });
  
  // Generate recommendations
  const recommendations: ComparisonAnalysis['recommendations'] = [];
  
  // Budget option
  recommendations.push({
    type: 'budget',
    productIndex: bestPrice,
    reason: 'Eng arzon variant'
  });
  
  // Quality option
  if (bestRating !== bestPrice) {
    recommendations.push({
      type: 'quality',
      productIndex: bestRating,
      reason: 'Eng yuqori reyting'
    });
  }
  
  // Balanced option
  if (bestValueIndex !== bestPrice && bestValueIndex !== bestRating) {
    recommendations.push({
      type: 'balanced',
      productIndex: bestValueIndex,
      reason: 'Eng yaxshi narx-sifat nisbati'
    });
  }
  
  // Popular option
  if (mostPopular !== bestPrice && mostPopular !== bestRating) {
    recommendations.push({
      type: 'popular',
      productIndex: mostPopular,
      reason: 'Eng ko\'p sotilgan'
    });
  }
  
  return {
    bestPrice,
    bestRating,
    bestValue: bestValueIndex,
    mostPopular,
    mostReviewed,
    differences,
    recommendations
  };
}

/**
 * Share comparison - generate shareable link
 */
export function shareComparison(): ComparisonShare {
  const comparison = getComparison();
  
  const shareId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const share: ComparisonShare = {
    id: shareId,
    items: comparison.items,
    category: comparison.category,
    shareUrl: `${window.location.origin}/compare/shared/${shareId}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem(`comparison_share_${shareId}`, JSON.stringify(share));
  
  return share;
}

/**
 * Get shared comparison by ID
 */
export function getSharedComparison(shareId: string): ComparisonShare | null {
  const stored = localStorage.getItem(`comparison_share_${shareId}`);
  
  if (!stored) return null;
  
  const share: ComparisonShare = JSON.parse(stored);
  
  // Check if expired
  if (share.expiresAt && new Date() > new Date(share.expiresAt)) {
    localStorage.removeItem(`comparison_share_${shareId}`);
    return null;
  }
  
  return share;
}

/**
 * Import shared comparison
 */
export function importSharedComparison(shareId: string): boolean {
  const shared = getSharedComparison(shareId);
  
  if (!shared) return false;
  
  const comparison: Comparison = {
    items: shared.items,
    category: shared.category,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  saveComparison(comparison);
  
  return true;
}

/**
 * Export comparison as JSON
 */
export function exportComparison(): string {
  const comparison = getComparison();
  const features = extractComparisonFeatures(comparison.items);
  const analysis = analyzeComparison(comparison.items);
  
  const exportData = {
    comparison,
    features,
    analysis,
    exportedAt: new Date().toISOString()
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Export comparison as CSV
 */
export function exportComparisonCSV(): string {
  const comparison = getComparison();
  const features = extractComparisonFeatures(comparison.items);
  
  if (comparison.items.length === 0) return '';
  
  // Header
  let csv = 'Feature,' + comparison.items.map(item => item.product.name).join(',') + '\n';
  
  // Rows
  features.forEach(feature => {
    csv += feature.label + ',' + feature.values.map(v => {
      if (typeof v === 'string') return `"${v}"`;
      return v;
    }).join(',') + '\n';
  });
  
  return csv;
}

/**
 * Calculate similarity score between products
 */
export function calculateSimilarity(product1: Product, product2: Product): number {
  let score = 0;
  let maxScore = 0;
  
  // Category match (high weight)
  maxScore += 30;
  if (product1.category === product2.category) {
    score += 30;
  }
  
  // Brand match
  maxScore += 20;
  if (product1.brand === product2.brand) {
    score += 20;
  }
  
  // Price similarity (within 20%)
  maxScore += 20;
  const priceDiff = Math.abs(product1.price - product2.price) / Math.max(product1.price, product2.price);
  if (priceDiff < 0.2) {
    score += 20 * (1 - priceDiff / 0.2);
  }
  
  // Rating similarity
  maxScore += 15;
  const rating1 = product1.rating || 0;
  const rating2 = product2.rating || 0;
  const ratingDiff = Math.abs(rating1 - rating2) / 5;
  score += 15 * (1 - ratingDiff);
  
  // Specifications match
  maxScore += 15;
  if (product1.specifications && product2.specifications) {
    const keys1 = Object.keys(product1.specifications);
    const keys2 = Object.keys(product2.specifications);
    const commonKeys = keys1.filter(k => keys2.includes(k));
    
    if (commonKeys.length > 0) {
      score += 15 * (commonKeys.length / Math.max(keys1.length, keys2.length));
    }
  }
  
  return (score / maxScore) * 100;
}

/**
 * Find similar products for comparison suggestions
 */
export function findSimilarProducts(product: Product, allProducts: Product[], limit: number = 3): Product[] {
  const similarities = allProducts
    .filter(p => p.id !== product.id)
    .map(p => ({
      product: p,
      similarity: calculateSimilarity(product, p)
    }))
    .sort((a, b) => b.similarity - a.similarity);
  
  return similarities.slice(0, limit).map(s => s.product);
}

/**
 * Format value for display
 */
export function formatComparisonValue(value: any, type: ComparisonFeature['type']): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  
  switch (type) {
    case 'price':
      return new Intl.NumberFormat('uz-UZ').format(value) + ' so\'m';
    
    case 'number':
      return value.toString();
    
    case 'rating':
      return value.toFixed(1) + ' ⭐';
    
    case 'boolean':
      return value ? '✓' : '✗';
    
    case 'text':
    default:
      return value.toString();
  }
}
