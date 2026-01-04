import { Product } from '../types';
import { ShoppingCart, AlertTriangle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ProductGridSkeleton } from './ui/skeleton-loaders';
import { ProductCardImage } from './ui/ProductImage';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  loading?: boolean;
}

export function ProductGrid({ products, onProductClick, onAddToCart, loading = false }: ProductGridProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  // Show loading skeleton
  if (loading) {
    return <ProductGridSkeleton count={6} />;
  }

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    
    // Check stock
    if (product.stock !== undefined && product.stock === 0) {
      toast.error('Ushbu mahsulot tugab qoldi!');
      return;
    }
    
    onAddToCart(product);
    toast.success('Savatga qo\'shildi!');
  };

  const getStockBadge = (product: Product) => {
    if (product.stock === undefined) return null;
    
    if (product.stock === 0) {
      return (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          <span>Tugab qoldi</span>
        </div>
      );
    }
    
    if (product.lowStockThreshold && product.stock <= product.lowStockThreshold) {
      return (
        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          <span>Kam qoldi: {product.stock}</span>
        </div>
      );
    }
    
    return null;
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <p className="text-gray-500 text-center">
          Mahsulotlar topilmadi
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => {
          const isOutOfStock = product.stock !== undefined && product.stock === 0;
          
          return (
            <div
              key={product.id}
              className={`bg-white rounded-xl shadow-card hover:shadow-card-lg transition-all duration-300 overflow-hidden ${isOutOfStock ? 'opacity-75' : ''}`}
            >
              <div
                onClick={() => onProductClick(product)}
                className="cursor-pointer relative"
              >
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <ProductCardImage
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover hover:scale-110 transition-transform duration-500 ${isOutOfStock ? 'grayscale' : ''}`}
                  />
                </div>
                
                {/* Stock Badge */}
                {getStockBadge(product)}
                
                <div className="p-3">
                  <h3 className="text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <p className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mb-2">
                    {formatPrice(product.price)}
                  </p>
                  
                  {/* Stock Info */}
                  {product.stock !== undefined && product.stock > 0 && (
                    <p className="text-xs text-gray-500">
                      Omborda: {product.stock} ta
                    </p>
                  )}
                </div>
              </div>
              <div className="px-3 pb-3">
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={isOutOfStock}
                  className={`w-full py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {isOutOfStock ? (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Tugagan</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Savatga</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}