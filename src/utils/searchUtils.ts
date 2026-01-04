/**
 * Search utility functions with optimizations
 */

import { useEffect, useState, useMemo } from 'react';

/**
 * Custom debounce hook for search inputs
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Normalize string for search comparison
 * - Converts to lowercase
 * - Trims whitespace
 * - Removes extra spaces
 */
export function normalizeSearchString(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Check if text matches search query
 * @param text - Text to search in
 * @param query - Search query
 * @returns true if text contains query
 */
export function matchesSearchQuery(text: string, query: string): boolean {
  if (!query || !query.trim()) return true;
  
  const normalizedText = normalizeSearchString(text);
  const normalizedQuery = normalizeSearchString(query);
  
  return normalizedText.includes(normalizedQuery);
}

/**
 * Search in multiple fields
 * @param item - Object to search in
 * @param fields - Array of field names to search
 * @param query - Search query
 * @returns true if any field matches
 */
export function searchInFields<T extends Record<string, any>>(
  item: T,
  fields: (keyof T)[],
  query: string
): boolean {
  if (!query || !query.trim()) return true;
  
  return fields.some(field => {
    const value = item[field];
    if (typeof value === 'string') {
      return matchesSearchQuery(value, query);
    }
    if (typeof value === 'number') {
      return value.toString().includes(query.trim());
    }
    return false;
  });
}

/**
 * Highlight search matches in text
 * @param text - Text to highlight in
 * @param query - Search query to highlight
 * @returns Text with <mark> tags around matches
 */
export function highlightMatches(text: string, query: string): string {
  if (!query || !query.trim()) return text;
  
  const normalizedQuery = normalizeSearchString(query);
  const regex = new RegExp(`(${normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Get search suggestions based on query
 * @param items - Array of items to search
 * @param query - Search query
 * @param field - Field name to get suggestions from
 * @param limit - Max number of suggestions (default: 5)
 * @returns Array of unique suggestions
 */
export function getSearchSuggestions<T extends Record<string, any>>(
  items: T[],
  query: string,
  field: keyof T,
  limit: number = 5
): string[] {
  if (!query || !query.trim()) return [];
  
  const normalizedQuery = normalizeSearchString(query);
  const suggestions = new Set<string>();
  
  for (const item of items) {
    const value = item[field];
    if (typeof value === 'string') {
      const normalizedValue = normalizeSearchString(value);
      if (normalizedValue.includes(normalizedQuery)) {
        suggestions.add(value);
        if (suggestions.size >= limit) break;
      }
    }
  }
  
  return Array.from(suggestions);
}
