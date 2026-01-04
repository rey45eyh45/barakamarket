/**
 * Data backup and restore utilities
 * Allows users to backup and restore all localStorage data
 */

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    // Customer data
    cart?: any[];
    favorites?: string[];
    orders?: any[];
    addresses?: any[];
    notifications?: any[];
    searchHistory?: string[];
    
    // Admin data
    adminOrders?: any[];
    adminProducts?: any[];
    adminUsers?: any[];
    categories?: any[];
    banners?: any[];
    flashSales?: any[];
    productRecommendations?: any[];
    
    // Vendor data
    vendors?: any[];
    
    // Settings
    darkMode?: boolean;
    language?: string;
    
    // All products
    allProducts?: any[];
  };
}

/**
 * Create a complete backup of all localStorage data
 */
export function createBackup(): BackupData {
  const backup: BackupData = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    data: {}
  };

  // List of keys to backup
  const keysToBackup = [
    'cart',
    'favorites',
    'orders',
    'addresses',
    'notifications',
    'search_history',
    'admin_orders',
    'admin_products',
    'admin_users',
    'categories',
    'banners',
    'flash_sales',
    'product_recommendations',
    'all_products',
    'dark_mode',
    'language'
  ];

  // Backup each key
  keysToBackup.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        const parsedKey = key.replace(/_/g, '');
        backup.data[parsedKey as keyof typeof backup.data] = JSON.parse(value);
      }
    } catch (error) {
      console.error(`Error backing up ${key}:`, error);
    }
  });

  // Backup vendor data
  const vendorKeys = Object.keys(localStorage).filter(key => key.startsWith('vendor_'));
  const vendors: any[] = [];
  vendorKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        vendors.push({
          key,
          data: JSON.parse(value)
        });
      }
    } catch (error) {
      console.error(`Error backing up ${key}:`, error);
    }
  });
  if (vendors.length > 0) {
    backup.data.vendors = vendors;
  }

  return backup;
}

/**
 * Restore data from backup
 */
export function restoreBackup(backup: BackupData): boolean {
  try {
    // Validate backup
    if (!backup.version || !backup.timestamp || !backup.data) {
      throw new Error('Invalid backup format');
    }

    // Restore regular keys
    const keyMapping: Record<string, string> = {
      cart: 'cart',
      favorites: 'favorites',
      orders: 'orders',
      addresses: 'addresses',
      notifications: 'notifications',
      searchHistory: 'search_history',
      adminOrders: 'admin_orders',
      adminProducts: 'admin_products',
      adminUsers: 'admin_users',
      categories: 'categories',
      banners: 'banners',
      flashSales: 'flash_sales',
      productRecommendations: 'product_recommendations',
      allProducts: 'all_products',
      darkMode: 'dark_mode',
      language: 'language'
    };

    Object.entries(keyMapping).forEach(([backupKey, storageKey]) => {
      const value = backup.data[backupKey as keyof typeof backup.data];
      if (value !== undefined) {
        localStorage.setItem(storageKey, JSON.stringify(value));
      }
    });

    // Restore vendor data
    if (backup.data.vendors) {
      backup.data.vendors.forEach((vendor: any) => {
        if (vendor.key && vendor.data) {
          localStorage.setItem(vendor.key, JSON.stringify(vendor.data));
        }
      });
    }

    // Trigger storage event to update all components
    window.dispatchEvent(new StorageEvent('storage', {
      key: null,
      storageArea: localStorage
    }));

    return true;
  } catch (error) {
    console.error('Error restoring backup:', error);
    return false;
  }
}

/**
 * Export backup to JSON file
 */
export function exportBackupToFile(backup: BackupData): void {
  const dataStr = JSON.stringify(backup, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `dream-market-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Import backup from file
 */
export function importBackupFromFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        resolve(backup);
      } catch (error) {
        reject(new Error('Invalid backup file format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read backup file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Clear all app data (except auth)
 */
export function clearAllAppData(): void {
  const keysToPreserve = ['auth_user', 'auth_session'];
  
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (!keysToPreserve.includes(key)) {
      localStorage.removeItem(key);
    }
  });
  
  // Trigger storage event
  window.dispatchEvent(new StorageEvent('storage', {
    key: null,
    storageArea: localStorage
  }));
}

/**
 * Get storage usage statistics
 */
export function getStorageStats(): {
  totalSize: number;
  itemCount: number;
  largestItems: Array<{ key: string; size: number }>;
} {
  const items: Array<{ key: string; size: number }> = [];
  let totalSize = 0;
  
  Object.keys(localStorage).forEach(key => {
    const value = localStorage.getItem(key) || '';
    const size = new Blob([value]).size;
    totalSize += size;
    items.push({ key, size });
  });
  
  // Sort by size (largest first)
  items.sort((a, b) => b.size - a.size);
  
  return {
    totalSize,
    itemCount: items.length,
    largestItems: items.slice(0, 10)
  };
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate data integrity
 */
export function validateDataIntegrity(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  try {
    // Check critical keys
    const criticalKeys = ['all_products', 'categories'];
    criticalKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (!value) {
        errors.push(`Missing critical data: ${key}`);
      } else {
        try {
          JSON.parse(value);
        } catch (error) {
          errors.push(`Corrupted data: ${key}`);
        }
      }
    });
    
    // Check data consistency
    const products = localStorage.getItem('all_products');
    const adminProducts = localStorage.getItem('admin_products');
    
    if (products && adminProducts) {
      const productsCount = JSON.parse(products).length;
      const adminProductsCount = JSON.parse(adminProducts).length;
      
      if (productsCount !== adminProductsCount) {
        errors.push('Product data mismatch between all_products and admin_products');
      }
    }
    
  } catch (error) {
    errors.push('Failed to validate data integrity');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Auto-backup feature (runs on page load)
 */
export function setupAutoBackup(intervalMinutes: number = 30): () => void {
  const backupKey = 'auto_backup';
  const lastBackupKey = 'last_backup_time';
  
  const doBackup = () => {
    try {
      const backup = createBackup();
      localStorage.setItem(backupKey, JSON.stringify(backup));
      localStorage.setItem(lastBackupKey, new Date().toISOString());
      console.log('✅ Auto-backup created');
    } catch (error) {
      console.error('Auto-backup failed:', error);
    }
  };
  
  // Check if backup is needed
  const lastBackup = localStorage.getItem(lastBackupKey);
  if (!lastBackup) {
    doBackup();
  } else {
    const lastBackupTime = new Date(lastBackup).getTime();
    const now = Date.now();
    const minutesSinceBackup = (now - lastBackupTime) / (1000 * 60);
    
    if (minutesSinceBackup >= intervalMinutes) {
      doBackup();
    }
  }
  
  // Setup interval
  const intervalId = setInterval(doBackup, intervalMinutes * 60 * 1000);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
}

/**
 * Recover from auto-backup
 */
export function recoverFromAutoBackup(): boolean {
  try {
    const backup = localStorage.getItem('auto_backup');
    if (!backup) {
      console.error('No auto-backup found');
      return false;
    }
    
    const parsedBackup = JSON.parse(backup);
    return restoreBackup(parsedBackup);
  } catch (error) {
    console.error('Failed to recover from auto-backup:', error);
    return false;
  }
}
