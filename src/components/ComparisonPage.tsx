// Comparison Page Component - Full product comparison

import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  X, 
  Share2, 
  Download, 
  ShoppingCart,
  TrendingUp,
  Award,
  DollarSign,
  Star,
  AlertCircle
} from 'lucide-react';
import {
  getComparison,
  removeFromComparison,
  clearComparison,
  extractComparisonFeatures,
  analyzeComparison,
  shareComparison,
  exportComparison,
  exportComparisonCSV,
  formatComparisonValue,
  type ComparisonItem,
  type ComparisonFeature
} from '../types/comparison';

interface ComparisonPageProps {
  language?: 'uz' | 'ru' | 'en';
}

export function ComparisonPage({ language = 'uz' }: ComparisonPageProps) {
  const [items, setItems] = useState<ComparisonItem[]>([]);
  const [features, setFeatures] = useState<ComparisonFeature[]>([]);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  useEffect(() => {
    loadComparison();
  }, []);

  useEffect(() => {
    const handleUpdate = () => loadComparison();
    window.addEventListener('comparison-updated', handleUpdate);
    return () => window.removeEventListener('comparison-updated', handleUpdate);
  }, []);

  const loadComparison = () => {
    const comparison = getComparison();
    setItems(comparison.items);
    
    if (comparison.items.length > 0) {
      const extractedFeatures = extractComparisonFeatures(comparison.items);
      setFeatures(extractedFeatures);
    } else {
      setFeatures([]);
    }
  };

  const handleRemove = (productId: string) => {
    removeFromComparison(productId);
    loadComparison();
  };

  const handleClear = () => {
    if (window.confirm('Solishtirishni tozalashni xohlaysizmi?')) {
      clearComparison();
      loadComparison();
    }
  };

  const handleShare = () => {
    const share = shareComparison();
    navigator.clipboard.writeText(share.shareUrl);
    alert('Havola nusxalandi! ' + share.shareUrl);
  };

  const handleExportJSON = () => {
    const data = exportComparison();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-${Date.now()}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    const data = exportComparisonCSV();
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-${Date.now()}.csv`;
    a.click();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Scale size={48} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Solishtirish uchun mahsulot yo'q
          </h2>
          <p className="text-gray-600 mb-6">
            Mahsulotlarni solishtirish uchun qo'shing (maksimum 4 ta)
          </p>
          <a
            href="/catalog"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Katalogga o'tish
          </a>
        </div>
      </div>
    );
  }

  const analysis = analyzeComparison(items);
  const displayFeatures = showAllFeatures ? features : features.slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ⚖️ Mahsulotlarni solishtirish
            </h1>
            <p className="text-gray-600">
              {items.length} ta mahsulot
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Share2 size={20} />
              <span className="hidden sm:inline">Ulashish</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download size={20} />
              <span className="hidden sm:inline">JSON</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download size={20} />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
            >
              <X size={20} />
              <span className="hidden sm:inline">Tozalash</span>
            </button>
          </div>
        </div>

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {analysis.recommendations.map((rec, index) => {
              const product = items[rec.productIndex].product;
              const icons = {
                budget: <DollarSign className="text-green-600" size={20} />,
                quality: <Star className="text-yellow-600" size={20} />,
                balanced: <Award className="text-blue-600" size={20} />,
                popular: <TrendingUp className="text-purple-600" size={20} />
              };
              
              const colors = {
                budget: 'bg-green-50 border-green-200',
                quality: 'bg-yellow-50 border-yellow-200',
                balanced: 'bg-blue-50 border-blue-200',
                popular: 'bg-purple-50 border-purple-200'
              };

              return (
                <div key={index} className={`${colors[rec.type]} border rounded-lg p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    {icons[rec.type]}
                    <span className="font-semibold text-gray-900">
                      {rec.reason}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 truncate">
                    {product.name}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="sticky left-0 z-10 bg-gray-50 px-6 py-4 text-left font-semibold text-gray-900 min-w-[200px]">
                  Xususiyat
                </th>
                {items.map((item) => (
                  <th key={item.productId} className="px-6 py-4 min-w-[250px]">
                    <div className="relative">
                      {/* Product Image */}
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Product Name */}
                      <h3 className="font-semibold text-gray-900 mb-2 text-left line-clamp-2">
                        {item.product.name}
                      </h3>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-full flex items-center justify-center shadow-md transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayFeatures.map((feature, featureIndex) => (
                <tr
                  key={feature.key}
                  className={`
                    border-b border-gray-200 hover:bg-gray-50 transition-colors
                    ${feature.highlight ? 'bg-blue-50/30' : ''}
                  `}
                >
                  <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900 border-r border-gray-200">
                    {feature.label}
                  </td>
                  {feature.values.map((value, valueIndex) => {
                    const isWinner = feature.winner === valueIndex;
                    
                    return (
                      <td
                        key={valueIndex}
                        className={`
                          px-6 py-4 text-center
                          ${isWinner ? 'bg-green-50 font-bold text-green-900' : 'text-gray-900'}
                        `}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {isWinner && <Award size={16} className="text-green-600" />}
                          <span>{formatComparisonValue(value, feature.type)}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Show More Button */}
        {features.length > 10 && (
          <div className="border-t border-gray-200 p-4 text-center">
            <button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-all"
            >
              {showAllFeatures 
                ? 'Kamroq ko\'rsatish' 
                : `Barcha xususiyatlarni ko'rish (${features.length})`
              }
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.productId} className="flex flex-col gap-2">
                <a
                  href={`/product/${item.productId}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-semibold transition-all"
                >
                  Ko'rish
                </a>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-semibold transition-all"
                  disabled={item.product.stock === 0}
                >
                  <ShoppingCart size={16} />
                  Savat
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Significant Differences Alert */}
      {analysis.differences.length > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">
                Muhim farqlar
              </h4>
              <p className="text-sm text-yellow-800">
                Quyidagi xususiyatlarda sezilarli farq bor:{' '}
                {analysis.differences.map(d => d.feature).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
