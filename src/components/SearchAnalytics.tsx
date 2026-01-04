// Search Analytics Dashboard Component

import React, { useState, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  BarChart3,
  Download,
  Clock,
  Zap,
  Target,
  Mic,
  Camera,
  Eye
} from 'lucide-react';
import {
  getSearchAnalytics,
  getRecentSearches,
  getPopularSearches,
  getTrendingSearches,
  clearSearchHistory,
  exportSearchHistory,
  type SearchAnalytics as SearchAnalyticsType
} from '../types/search';

interface SearchAnalyticsProps {
  language?: 'uz' | 'ru' | 'en';
}

export function SearchAnalytics({ language = 'uz' }: SearchAnalyticsProps) {
  const [analytics, setAnalytics] = useState<SearchAnalyticsType | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    const handleUpdate = () => loadAnalytics();
    window.addEventListener('search-history-updated', handleUpdate);
    return () => window.removeEventListener('search-history-updated', handleUpdate);
  }, []);

  const loadAnalytics = () => {
    const data = getSearchAnalytics();
    setAnalytics(data);
  };

  const handleClearHistory = () => {
    if (window.confirm('Qidiruv tarixini tozalashni xohlaysizmi?')) {
      clearSearchHistory();
      loadAnalytics();
    }
  };

  const handleExport = () => {
    const data = exportSearchHistory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-analytics-${Date.now()}.json`;
    a.click();
  };

  if (!analytics) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const recentSearches = getRecentSearches(10);
  const popularSearches = getPopularSearches(10);
  const trendingSearches = getTrendingSearches(10);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Qidiruv Statistikasi
          </h1>
          <p className="text-gray-600">
            Foydalanuvchilar qidiruv ma'lumotlari
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download size={20} />
            Export
          </button>
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
          >
            Tozalash
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Search className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {analytics.totalSearches}
          </div>
          <div className="text-sm text-gray-600">Jami qidiruvlar</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Zap className="text-green-600" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {analytics.uniqueQueries}
          </div>
          <div className="text-sm text-gray-600">Noyob so'rovlar</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="text-purple-600" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {analytics.averageResultsCount.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">O'rtacha natijalar</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-orange-600" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {analytics.clickThroughRate}%
          </div>
          <div className="text-sm text-gray-600">CTR</div>
        </div>
      </div>

      {/* Search Types */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Qidiruv turlari
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Search className="mx-auto mb-2 text-blue-600" size={32} />
            <div className="text-2xl font-bold text-gray-900">
              {analytics.searchesByType.text}
            </div>
            <div className="text-sm text-gray-600">Matn</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Mic className="mx-auto mb-2 text-green-600" size={32} />
            <div className="text-2xl font-bold text-gray-900">
              {analytics.searchesByType.voice}
            </div>
            <div className="text-sm text-gray-600">Ovozli</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Camera className="mx-auto mb-2 text-purple-600" size={32} />
            <div className="text-2xl font-bold text-gray-900">
              {analytics.searchesByType.barcode}
            </div>
            <div className="text-sm text-gray-600">Barkod</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Eye className="mx-auto mb-2 text-orange-600" size={32} />
            <div className="text-2xl font-bold text-gray-900">
              {analytics.searchesByType.visual}
            </div>
            <div className="text-sm text-gray-600">Ko'rish</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Most Searched */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={24} />
            Eng ko'p qidirilgan
          </h2>
          <div className="space-y-3">
            {analytics.mostSearched.slice(0, 10).map((query, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 text-sm text-gray-900 truncate">
                  {query}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Searches */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="text-green-600" size={24} />
            Mashhur qidiruvlar
          </h2>
          <div className="space-y-3">
            {popularSearches.map((search, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="text-sm text-gray-900 truncate">
                    {search.query}
                  </div>
                </div>
                <div className="text-xs font-semibold text-gray-500">
                  {search.count}x
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Searches */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="text-purple-600" size={24} />
            Trend qidiruvlar
          </h2>
          <div className="space-y-3">
            {trendingSearches.map((search, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-lg">
                    {search.trend === 'up' ? '📈' : search.trend === 'down' ? '📉' : '➡️'}
                  </div>
                  <div className="text-sm text-gray-900 truncate">
                    {search.query}
                  </div>
                </div>
                <div className={`text-xs font-semibold ${
                  search.trend === 'up' ? 'text-green-600' : 
                  search.trend === 'down' ? 'text-red-600' : 
                  'text-gray-500'
                }`}>
                  {search.trend === 'up' ? '+' : search.trend === 'down' ? '-' : ''}
                  {Math.abs(search.percentage).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Searches */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="text-blue-600" size={24} />
          So'nggi qidiruvlar
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  So'rov
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Turi
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Natijalar
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Vaqt
                </th>
              </tr>
            </thead>
            <tbody>
              {recentSearches.map((search) => (
                <tr key={search.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {search.query}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {search.type === 'text' ? '📝 Matn' :
                     search.type === 'voice' ? '🎤 Ovoz' :
                     search.type === 'barcode' ? '📷 Barkod' :
                     '👁️ Ko\'rish'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {search.resultsCount}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(search.timestamp).toLocaleString('uz-UZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty Searches Alert */}
      {analytics.emptySearches > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 text-xl">⚠️</div>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">
                Bo'sh qidiruvlar
              </h4>
              <p className="text-sm text-yellow-800">
                {analytics.emptySearches} ta qidiruv hech narsa topmadi. 
                Mahsulotlar bazasini kengaytirish tavsiya etiladi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
