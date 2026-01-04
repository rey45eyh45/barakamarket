import { motion } from 'motion/react';
import { Package, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

interface StockBadgeProps {
  stock: number;
  lowStockThreshold?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  animated?: boolean;
}

export function StockBadge({ 
  stock, 
  lowStockThreshold = 10, 
  size = 'md',
  showIcon = true,
  animated = true 
}: StockBadgeProps) {
  const getStockStatus = () => {
    if (stock <= 0) {
      return {
        label: 'Tugadi',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: XCircle
      };
    }
    
    if (stock <= lowStockThreshold) {
      return {
        label: `Kam qoldi: ${stock} ta`,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        borderColor: 'border-orange-200 dark:border-orange-800',
        icon: AlertTriangle
      };
    }
    
    return {
      label: `Mavjud: ${stock} ta`,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800',
      icon: CheckCircle
    };
  };

  const status = getStockStatus();
  const Icon = status.icon;

  const sizes = {
    sm: {
      container: 'px-2 py-1 text-xs gap-1',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    md: {
      container: 'px-3 py-1.5 text-sm gap-1.5',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    lg: {
      container: 'px-4 py-2 text-base gap-2',
      icon: 'w-5 h-5',
      text: 'text-base'
    }
  };

  const sizeConfig = sizes[size];

  const badge = (
    <div
      className={`
        inline-flex items-center rounded-full font-medium
        ${status.bgColor} ${status.color} ${sizeConfig.container}
        border ${status.borderColor}
      `}
    >
      {showIcon && <Icon className={sizeConfig.icon} />}
      <span className={sizeConfig.text}>{status.label}</span>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="inline-block"
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
}

// Stock indicator for product cards (compact)
interface StockIndicatorProps {
  stock: number;
  lowStockThreshold?: number;
}

export function StockIndicator({ stock, lowStockThreshold = 10 }: StockIndicatorProps) {
  if (stock <= 0) {
    return (
      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-md">
        Tugadi
      </div>
    );
  }

  if (stock <= lowStockThreshold) {
    return (
      <div className="absolute top-2 right-2 bg-orange-600 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-md animate-pulse">
        Kam qoldi: {stock}
      </div>
    );
  }

  return null;
}

// Stock progress bar
interface StockProgressProps {
  stock: number;
  maxStock: number;
  lowStockThreshold?: number;
  showLabel?: boolean;
}

export function StockProgress({ 
  stock, 
  maxStock, 
  lowStockThreshold = 10,
  showLabel = true 
}: StockProgressProps) {
  const percentage = (stock / maxStock) * 100;
  
  const getColor = () => {
    if (stock <= 0) return 'bg-red-500';
    if (stock <= lowStockThreshold) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getTextColor = () => {
    if (stock <= 0) return 'text-red-600 dark:text-red-400';
    if (stock <= lowStockThreshold) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Omborda:</span>
          <span className={`font-medium ${getTextColor()}`}>
            {stock} / {maxStock} ta
          </span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full ${getColor()} rounded-full`}
        />
      </div>
    </div>
  );
}

// Stock alert for admin/vendor
interface StockAlertProps {
  products: Array<{
    id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
  }>;
  onManageClick: (productId: string) => void;
}

export function StockAlert({ products, onManageClick }: StockAlertProps) {
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);
  const outOfStock = products.filter(p => p.stock <= 0);

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border-l-4 border-orange-500"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-orange-900 dark:text-orange-100 font-semibold mb-2">
            ⚠️ Stok ogohlantirishi
          </h3>
          
          {outOfStock.length > 0 && (
            <div className="mb-3">
              <p className="text-orange-800 dark:text-orange-200 text-sm font-medium mb-1">
                Tugagan mahsulotlar ({outOfStock.length}):
              </p>
              <ul className="space-y-1">
                {outOfStock.slice(0, 3).map(product => (
                  <li key={product.id} className="text-orange-700 dark:text-orange-300 text-sm flex items-center justify-between">
                    <span>• {product.name}</span>
                    <button
                      onClick={() => onManageClick(product.id)}
                      className="text-orange-600 dark:text-orange-400 hover:underline text-xs"
                    >
                      Boshqarish
                    </button>
                  </li>
                ))}
                {outOfStock.length > 3 && (
                  <li className="text-orange-600 dark:text-orange-400 text-xs">
                    ...va yana {outOfStock.length - 3} ta
                  </li>
                )}
              </ul>
            </div>
          )}

          {lowStockProducts.length > outOfStock.length && (
            <div>
              <p className="text-orange-800 dark:text-orange-200 text-sm font-medium mb-1">
                Kam qolgan mahsulotlar ({lowStockProducts.length - outOfStock.length}):
              </p>
              <ul className="space-y-1">
                {lowStockProducts
                  .filter(p => p.stock > 0)
                  .slice(0, 3)
                  .map(product => (
                    <li key={product.id} className="text-orange-700 dark:text-orange-300 text-sm flex items-center justify-between">
                      <span>• {product.name} ({product.stock} ta qoldi)</span>
                      <button
                        onClick={() => onManageClick(product.id)}
                        className="text-orange-600 dark:text-orange-400 hover:underline text-xs"
                      >
                        To'ldirish
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Check stock availability before purchase
export function checkStockAvailability(
  product: { stock?: number },
  quantity: number
): { available: boolean; message: string } {
  if (product.stock === undefined) {
    return { available: true, message: '' };
  }

  if (product.stock <= 0) {
    return {
      available: false,
      message: 'Mahsulot tugagan'
    };
  }

  if (product.stock < quantity) {
    return {
      available: false,
      message: `Faqat ${product.stock} ta mavjud`
    };
  }

  return { available: true, message: '' };
}

// Update stock after purchase
export function updateStockAfterPurchase(
  productId: string,
  quantity: number
): void {
  try {
    const productsJson = localStorage.getItem('products');
    if (!productsJson) return;

    const products = JSON.parse(productsJson);
    const productIndex = products.findIndex((p: any) => p.id === productId);

    if (productIndex !== -1 && products[productIndex].stock !== undefined) {
      products[productIndex].stock = Math.max(0, products[productIndex].stock - quantity);
      products[productIndex].soldCount = (products[productIndex].soldCount || 0) + quantity;
      products[productIndex].updatedAt = new Date().toISOString();

      localStorage.setItem('products', JSON.stringify(products));
    }
  } catch (error) {
    console.error('Error updating stock:', error);
  }
}
