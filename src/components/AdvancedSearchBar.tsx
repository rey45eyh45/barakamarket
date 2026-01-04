// Advanced Search Bar Component with autocomplete and voice search

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Mic, 
  Clock, 
  TrendingUp,
  Filter,
  Loader
} from 'lucide-react';
import {
  addSearchToHistory,
  getRecentSearches,
  getTrendingSearches,
  generateSearchSuggestions,
  startVoiceSearch,
  type SearchSuggestion,
  type SearchQuery,
  type TrendingSearch
} from '../types/search';
import { Product } from '../types';

interface AdvancedSearchBarProps {
  allProducts: Product[];
  onSearch: (query: string) => void;
  onShowFilters?: () => void;
  placeholder?: string;
  showTrending?: boolean;
  showRecent?: boolean;
  language?: 'uz' | 'ru' | 'en';
}

export function AdvancedSearchBar({
  allProducts,
  onSearch,
  onShowFilters,
  placeholder = 'Qidirish...',
  showTrending = true,
  showRecent = true,
  language = 'uz'
}: AdvancedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchQuery[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load initial data
  useEffect(() => {
    setRecentSearches(getRecentSearches(5));
    setTrendingSearches(getTrendingSearches(5));
  }, []);

  // Generate suggestions when query changes
  useEffect(() => {
    if (query.trim()) {
      const newSuggestions = generateSearchSuggestions(query, allProducts, 8);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query, allProducts]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add to history
    addSearchToHistory(searchQuery, 'text', 0); // Count will be updated after search

    // Trigger search
    onSearch(searchQuery);
    
    // Close suggestions
    setShowSuggestions(false);
    
    // Update recent searches
    setRecentSearches(getRecentSearches(5));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    handleSearch(text);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleVoiceSearch = () => {
    setIsVoiceSearching(true);
    
    const voiceSearch = startVoiceSearch(
      (transcript) => {
        setQuery(transcript);
        setIsVoiceSearching(false);
        handleSearch(transcript);
      },
      (error) => {
        console.error('Voice search error:', error);
        alert('Ovozli qidiruv xatosi: ' + error);
        setIsVoiceSearching(false);
      }
    );

    if (!voiceSearch) {
      setIsVoiceSearching(false);
      alert('Ovozli qidiruv ushbu brauzerda qo\'llab-quvvatlanmaydi');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalSuggestions = suggestions.length + recentSearches.length + trendingSearches.length;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % totalSuggestions);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalSuggestions) % totalSuggestions);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      
      // Determine which list the selection is from
      if (selectedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedIndex].text);
      } else if (selectedIndex < suggestions.length + recentSearches.length) {
        const idx = selectedIndex - suggestions.length;
        handleSuggestionClick(recentSearches[idx].query);
      } else {
        const idx = selectedIndex - suggestions.length - recentSearches.length;
        handleSuggestionClick(trendingSearches[idx].query);
      }
    }
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'query': return '🔍';
      case 'product': return '📦';
      case 'category': return '📁';
      case 'brand': return '🏷️';
      default: return '🔍';
    }
  };

  const getTrendIcon = (trend: TrendingSearch['trend']) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-gray-400" size={20} />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-12 pr-32 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />

          <div className="absolute right-2 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            )}

            <button
              type="button"
              onClick={handleVoiceSearch}
              disabled={isVoiceSearching}
              className={`p-2 rounded-full transition-all ${
                isVoiceSearching
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title="Ovozli qidiruv"
            >
              {isVoiceSearching ? <Loader size={18} className="animate-spin" /> : <Mic size={18} />}
            </button>

            {onShowFilters && (
              <button
                type="button"
                onClick={onShowFilters}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                title="Filterlar"
              >
                <Filter size={18} />
              </button>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Qidirish
            </button>
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query || showRecent || showTrending) && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[500px] overflow-y-auto">
          {/* Suggestions */}
          {query && suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                Tavsiyalar
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    selectedIndex === index ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className="text-xl">{getSuggestionIcon(suggestion.type)}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm text-gray-900">{suggestion.text}</div>
                    {suggestion.count !== undefined && (
                      <div className="text-xs text-gray-500">
                        {suggestion.count} ta natija
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {!query && showRecent && recentSearches.length > 0 && (
            <div className="py-2 border-t border-gray-100">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                <Clock size={14} />
                So'nggi qidiruvlar
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={search.id}
                  onClick={() => handleSuggestionClick(search.query)}
                  className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    selectedIndex === suggestions.length + index ? 'bg-blue-50' : ''
                  }`}
                >
                  <Clock size={16} className="text-gray-400" />
                  <div className="flex-1 text-left">
                    <div className="text-sm text-gray-900">{search.query}</div>
                    <div className="text-xs text-gray-500">
                      {search.resultsCount} ta natija
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {!query && showTrending && trendingSearches.length > 0 && (
            <div className="py-2 border-t border-gray-100">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                <TrendingUp size={14} />
                Mashhur qidiruvlar
              </div>
              {trendingSearches.map((trending, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(trending.query)}
                  className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    selectedIndex === suggestions.length + recentSearches.length + index ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className="text-lg">{getTrendIcon(trending.trend)}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm text-gray-900">{trending.query}</div>
                    <div className="text-xs text-gray-500">
                      {trending.count} marta qidirilgan
                      {trending.trend !== 'stable' && (
                        <span className={trending.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                          {' '}({trending.trend === 'up' ? '+' : ''}{trending.percentage.toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {query && suggestions.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              <p className="text-sm">Hech narsa topilmadi</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
