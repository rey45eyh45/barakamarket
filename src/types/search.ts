// Advanced Search System Types

import { Product } from './index';

export interface SearchQuery {
  id: string;
  query: string;
  type: 'text' | 'voice' | 'barcode' | 'visual';
  filters?: SearchFilters;
  resultsCount: number;
  timestamp: string;
}

export interface SearchFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  inStock?: boolean;
  discount?: boolean;
  brands?: string[];
  sortBy?: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'popular';
}

export interface SearchHistory {
  queries: SearchQuery[];
  maxSize: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'product' | 'category' | 'brand';
  count?: number; // Number of results
  score: number; // Relevance score
}

export interface TrendingSearch {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number; // Change percentage
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueQueries: number;
  averageResultsCount: number;
  mostSearched: string[];
  recentSearches: SearchQuery[];
  topCategories: { [category: string]: number };
  searchesByType: {
    text: number;
    voice: number;
    barcode: number;
    visual: number;
  };
  emptySearches: number; // Searches with 0 results
  clickThroughRate: number; // Percentage
}

export interface SearchResult {
  products: Product[];
  total: number;
  query: string;
  filters?: SearchFilters;
  suggestions: SearchSuggestion[];
  didYouMean?: string;
  timestamp: string;
}

// Maximum history size
export const MAX_SEARCH_HISTORY = 50;

/**
 * Get search history from localStorage
 */
export function getSearchHistory(): SearchHistory {
  const stored = localStorage.getItem('search_history');
  
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    queries: [],
    maxSize: MAX_SEARCH_HISTORY
  };
}

/**
 * Save search history to localStorage
 */
export function saveSearchHistory(history: SearchHistory): void {
  localStorage.setItem('search_history', JSON.stringify(history));
  window.dispatchEvent(new Event('search-history-updated'));
}

/**
 * Add search query to history
 */
export function addSearchToHistory(
  query: string,
  type: SearchQuery['type'],
  resultsCount: number,
  filters?: SearchFilters
): void {
  if (!query.trim()) return;
  
  const history = getSearchHistory();
  
  // Check if already exists (recent duplicate)
  const existingIndex = history.queries.findIndex(
    q => q.query.toLowerCase() === query.toLowerCase() && 
         Date.now() - new Date(q.timestamp).getTime() < 60000 // Within 1 minute
  );
  
  if (existingIndex !== -1) {
    // Update existing entry
    history.queries[existingIndex] = {
      ...history.queries[existingIndex],
      resultsCount,
      timestamp: new Date().toISOString()
    };
  } else {
    // Add new entry
    const searchQuery: SearchQuery = {
      id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      query: query.trim(),
      type,
      filters,
      resultsCount,
      timestamp: new Date().toISOString()
    };
    
    history.queries.unshift(searchQuery);
    
    // Keep only max size
    if (history.queries.length > history.maxSize) {
      history.queries = history.queries.slice(0, history.maxSize);
    }
  }
  
  saveSearchHistory(history);
}

/**
 * Remove search from history
 */
export function removeSearchFromHistory(searchId: string): void {
  const history = getSearchHistory();
  history.queries = history.queries.filter(q => q.id !== searchId);
  saveSearchHistory(history);
}

/**
 * Clear search history
 */
export function clearSearchHistory(): void {
  const history: SearchHistory = {
    queries: [],
    maxSize: MAX_SEARCH_HISTORY
  };
  saveSearchHistory(history);
}

/**
 * Get recent searches (last N)
 */
export function getRecentSearches(limit: number = 10): SearchQuery[] {
  const history = getSearchHistory();
  return history.queries.slice(0, limit);
}

/**
 * Get popular searches (most frequent)
 */
export function getPopularSearches(limit: number = 10): TrendingSearch[] {
  const history = getSearchHistory();
  
  // Count occurrences
  const counts: { [query: string]: number } = {};
  
  history.queries.forEach(q => {
    const normalized = q.query.toLowerCase();
    counts[normalized] = (counts[normalized] || 0) + 1;
  });
  
  // Sort by count
  const popular = Object.entries(counts)
    .map(([query, count]) => ({
      query,
      count,
      trend: 'stable' as const,
      percentage: 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  
  return popular;
}

/**
 * Get trending searches (recent popular)
 */
export function getTrendingSearches(limit: number = 10): TrendingSearch[] {
  const history = getSearchHistory();
  const now = Date.now();
  const last24h = now - 24 * 60 * 60 * 1000;
  const last48h = now - 48 * 60 * 60 * 1000;
  
  // Count for last 24h
  const counts24h: { [query: string]: number } = {};
  history.queries
    .filter(q => new Date(q.timestamp).getTime() > last24h)
    .forEach(q => {
      const normalized = q.query.toLowerCase();
      counts24h[normalized] = (counts24h[normalized] || 0) + 1;
    });
  
  // Count for 24-48h ago
  const counts48h: { [query: string]: number } = {};
  history.queries
    .filter(q => {
      const time = new Date(q.timestamp).getTime();
      return time > last48h && time <= last24h;
    })
    .forEach(q => {
      const normalized = q.query.toLowerCase();
      counts48h[normalized] = (counts48h[normalized] || 0) + 1;
    });
  
  // Calculate trends
  const trending = Object.entries(counts24h)
    .map(([query, count]) => {
      const prevCount = counts48h[query] || 0;
      let trend: 'up' | 'down' | 'stable' = 'stable';
      let percentage = 0;
      
      if (prevCount === 0) {
        trend = 'up';
        percentage = 100;
      } else {
        percentage = ((count - prevCount) / prevCount) * 100;
        if (percentage > 10) trend = 'up';
        else if (percentage < -10) trend = 'down';
      }
      
      return {
        query,
        count,
        trend,
        percentage
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  
  return trending;
}

/**
 * Generate search suggestions based on query
 */
export function generateSearchSuggestions(
  query: string,
  allProducts: Product[],
  limit: number = 10
): SearchSuggestion[] {
  if (!query.trim()) return [];
  
  const suggestions: SearchSuggestion[] = [];
  const lowerQuery = query.toLowerCase();
  
  // 1. Query suggestions from history
  const history = getSearchHistory();
  const historySuggestions = history.queries
    .filter(q => q.query.toLowerCase().includes(lowerQuery))
    .slice(0, 3)
    .map(q => ({
      text: q.query,
      type: 'query' as const,
      count: q.resultsCount,
      score: 10 // High priority
    }));
  
  suggestions.push(...historySuggestions);
  
  // 2. Product name suggestions
  const productSuggestions = allProducts
    .filter(p => p.name.toLowerCase().includes(lowerQuery))
    .slice(0, 3)
    .map(p => ({
      text: p.name,
      type: 'product' as const,
      count: 1,
      score: 8
    }));
  
  suggestions.push(...productSuggestions);
  
  // 3. Category suggestions
  const categories = [...new Set(allProducts.map(p => p.category))];
  const categorySuggestions = categories
    .filter(c => c.toLowerCase().includes(lowerQuery))
    .slice(0, 2)
    .map(c => ({
      text: c,
      type: 'category' as const,
      count: allProducts.filter(p => p.category === c).length,
      score: 6
    }));
  
  suggestions.push(...categorySuggestions);
  
  // 4. Brand suggestions
  const brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean) as string[])];
  const brandSuggestions = brands
    .filter(b => b.toLowerCase().includes(lowerQuery))
    .slice(0, 2)
    .map(b => ({
      text: b,
      type: 'brand' as const,
      count: allProducts.filter(p => p.brand === b).length,
      score: 5
    }));
  
  suggestions.push(...brandSuggestions);
  
  // Sort by score and limit
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Search products with advanced filters
 */
export function searchProducts(
  query: string,
  allProducts: Product[],
  filters?: SearchFilters
): SearchResult {
  const lowerQuery = query.toLowerCase().trim();
  let results = [...allProducts];
  
  // Text search
  if (lowerQuery) {
    results = results.filter(product => {
      const searchableText = [
        product.name,
        product.description,
        product.category,
        product.brand,
        ...(product.tags || [])
      ].join(' ').toLowerCase();
      
      return searchableText.includes(lowerQuery);
    });
  }
  
  // Apply filters
  if (filters) {
    // Category
    if (filters.category) {
      results = results.filter(p => p.category === filters.category);
    }
    
    // Price range
    if (filters.priceMin !== undefined) {
      results = results.filter(p => p.price >= filters.priceMin!);
    }
    if (filters.priceMax !== undefined) {
      results = results.filter(p => p.price <= filters.priceMax!);
    }
    
    // Rating
    if (filters.rating) {
      results = results.filter(p => (p.rating || 0) >= filters.rating!);
    }
    
    // In stock
    if (filters.inStock) {
      results = results.filter(p => p.stock > 0);
    }
    
    // Discount
    if (filters.discount) {
      results = results.filter(p => p.discount && p.discount > 0);
    }
    
    // Brands
    if (filters.brands && filters.brands.length > 0) {
      results = results.filter(p => p.brand && filters.brands!.includes(p.brand));
    }
    
    // Sort
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          results.sort((a, b) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          break;
        case 'popular':
          results.sort((a, b) => (b.sales || 0) - (a.sales || 0));
          break;
        case 'relevance':
        default:
          // Already sorted by relevance
          break;
      }
    }
  }
  
  // Generate suggestions
  const suggestions = generateSearchSuggestions(query, allProducts);
  
  // Did you mean? (simple typo detection)
  const didYouMean = results.length === 0 ? generateDidYouMean(query, allProducts) : undefined;
  
  return {
    products: results,
    total: results.length,
    query,
    filters,
    suggestions,
    didYouMean,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate "Did you mean?" suggestion
 */
function generateDidYouMean(query: string, allProducts: Product[]): string | undefined {
  const lowerQuery = query.toLowerCase();
  
  // Get all unique words from products
  const words = new Set<string>();
  allProducts.forEach(p => {
    [p.name, p.description, p.category, p.brand, ...(p.tags || [])]
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .forEach(word => words.add(word));
  });
  
  // Find closest match using Levenshtein distance
  let closestMatch: string | undefined;
  let minDistance = Infinity;
  
  words.forEach(word => {
    const distance = levenshteinDistance(lowerQuery, word);
    if (distance < minDistance && distance <= 2) { // Max 2 character difference
      minDistance = distance;
      closestMatch = word;
    }
  });
  
  return closestMatch;
}

/**
 * Levenshtein distance algorithm (typo detection)
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Get search analytics
 */
export function getSearchAnalytics(): SearchAnalytics {
  const history = getSearchHistory();
  const queries = history.queries;
  
  const totalSearches = queries.length;
  const uniqueQueries = new Set(queries.map(q => q.query.toLowerCase())).size;
  
  const averageResultsCount = totalSearches > 0
    ? queries.reduce((sum, q) => sum + q.resultsCount, 0) / totalSearches
    : 0;
  
  // Most searched
  const searchCounts: { [query: string]: number } = {};
  queries.forEach(q => {
    const normalized = q.query.toLowerCase();
    searchCounts[normalized] = (searchCounts[normalized] || 0) + 1;
  });
  
  const mostSearched = Object.entries(searchCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([query]) => query);
  
  // Recent searches
  const recentSearches = queries.slice(0, 10);
  
  // Top categories (from filters)
  const topCategories: { [category: string]: number } = {};
  queries.forEach(q => {
    if (q.filters?.category) {
      topCategories[q.filters.category] = (topCategories[q.filters.category] || 0) + 1;
    }
  });
  
  // Searches by type
  const searchesByType = {
    text: queries.filter(q => q.type === 'text').length,
    voice: queries.filter(q => q.type === 'voice').length,
    barcode: queries.filter(q => q.type === 'barcode').length,
    visual: queries.filter(q => q.type === 'visual').length
  };
  
  // Empty searches
  const emptySearches = queries.filter(q => q.resultsCount === 0).length;
  
  // Click-through rate (simplified - assume 80% click rate)
  const clickThroughRate = totalSearches > 0 ? 80 : 0;
  
  return {
    totalSearches,
    uniqueQueries,
    averageResultsCount,
    mostSearched,
    recentSearches,
    topCategories,
    searchesByType,
    emptySearches,
    clickThroughRate
  };
}

/**
 * Voice search (Web Speech API)
 */
export function startVoiceSearch(
  onResult: (transcript: string) => void,
  onError?: (error: string) => void
): { stop: () => void } | null {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    onError?.('Voice search not supported in this browser');
    return null;
  }
  
  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'uz-UZ'; // Uzbek
  
  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };
  
  recognition.onerror = (event: any) => {
    onError?.(event.error);
  };
  
  recognition.start();
  
  return {
    stop: () => recognition.stop()
  };
}

/**
 * Barcode search (placeholder - requires camera API)
 */
export function startBarcodeSearch(
  onResult: (barcode: string) => void,
  onError?: (error: string) => void
): { stop: () => void } | null {
  // This would require a barcode scanning library like QuaggaJS or ZXing
  // For now, just a placeholder
  onError?.('Barcode search requires camera permission and scanner library');
  return null;
}

/**
 * Export search history as JSON
 */
export function exportSearchHistory(): string {
  const history = getSearchHistory();
  const analytics = getSearchAnalytics();
  
  const exportData = {
    history,
    analytics,
    exportedAt: new Date().toISOString()
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Import search history from JSON
 */
export function importSearchHistory(jsonData: string): boolean {
  try {
    const imported = JSON.parse(jsonData);
    
    if (!imported.history || !imported.history.queries) {
      return false;
    }
    
    saveSearchHistory(imported.history);
    return true;
  } catch (error) {
    console.error('Failed to import search history:', error);
    return false;
  }
}

/**
 * Get search suggestions with caching
 */
let suggestionCache: { [query: string]: { suggestions: SearchSuggestion[]; timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCachedSuggestions(
  query: string,
  allProducts: Product[],
  limit: number = 10
): SearchSuggestion[] {
  const now = Date.now();
  const cached = suggestionCache[query];
  
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.suggestions;
  }
  
  const suggestions = generateSearchSuggestions(query, allProducts, limit);
  suggestionCache[query] = { suggestions, timestamp: now };
  
  return suggestions;
}

/**
 * Clear suggestion cache
 */
export function clearSuggestionCache(): void {
  suggestionCache = {};
}
