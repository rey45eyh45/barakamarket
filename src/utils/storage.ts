/**
 * ☁️ TELEGRAM CLOUD STORAGE + localStorage HYBRID
 * 
 * VERSION SUPPORT:
 * - Telegram 6.9+ : Cloud Storage ☁️
 * - Telegram < 6.9 : localStorage 📦 (ONLY)
 * - Browser        : localStorage 📦
 */

interface TelegramWebApp {
  version?: string;
  CloudStorage?: {
    setItem: (key: string, value: string, callback?: (error: Error | null, success: boolean) => void) => void;
    getItem: (key: string, callback: (error: Error | null, value: string) => void) => void;
    getItems: (keys: string[], callback: (error: Error | null, values: Record<string, string>) => void) => void;
    removeItem: (key: string, callback?: (error: Error | null, success: boolean) => void) => void;
    getKeys: (callback: (error: Error | null, keys: string[]) => void) => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

class StorageManager {
  private initialized: boolean = false;
  private cloudAvailable: boolean = false;

  constructor() {
    // Check once on initialization
    if (typeof window !== 'undefined') {
      // Wait a bit for Telegram to fully initialize
      setTimeout(() => {
        this.checkCloudAvailability();
        this.logStorageStatus();
      }, 500);
    }
  }

  /**
   * Check and cache Cloud Storage availability
   */
  private checkCloudAvailability(): void {
    if (typeof window === 'undefined') {
      this.cloudAvailable = false;
      return;
    }
    
    const telegram = window.Telegram;
    if (!telegram?.WebApp) {
      this.cloudAvailable = false;
      return;
    }
    
    // Check version - Cloud Storage only works in 6.9+
    const version = telegram.WebApp.version;
    if (!version) {
      this.cloudAvailable = false;
      return;
    }
    
    // Parse version (e.g., "6.0" -> 6.0, "6.9" -> 6.9)
    const versionNumber = parseFloat(version);
    if (isNaN(versionNumber) || versionNumber < 6.9) {
      this.cloudAvailable = false;
      return;
    }
    
    const cloudStorage = telegram.WebApp.CloudStorage;
    if (!cloudStorage || typeof cloudStorage.setItem !== 'function') {
      this.cloudAvailable = false;
      return;
    }
    
    this.cloudAvailable = true;
  }

  /**
   * Log storage status
   */
  private logStorageStatus(): void {
    if (this.initialized) return;
    this.initialized = true;

    const telegram = window.Telegram;
    const version = telegram?.WebApp?.version || 'unknown';

    if (telegram?.WebApp) {
      console.log(`💾 Telegram WebApp version: ${version}`);
      
      if (this.cloudAvailable) {
        console.log(`💾 Storage: Telegram Cloud Storage ☁️ (v6.9+ detected)`);
      } else {
        console.log(`📦 Storage: localStorage ONLY (Cloud requires v6.9+, current: ${version})`);
      }
    } else {
      console.log(`📦 Storage: localStorage (not in Telegram)`);
    }
  }

  /**
   * Ma'lumot saqlash (localStorage ONLY for now)
   */
  async setItem(key: string, value: any): Promise<void> {
    const stringValue = JSON.stringify(value);
    localStorage.setItem(key, stringValue);
    return Promise.resolve();
  }

  /**
   * Ma'lumot o'qish (localStorage ONLY for now)
   */
  async getItem<T>(key: string): Promise<T | null> {
    const value = localStorage.getItem(key);
    return Promise.resolve(value ? JSON.parse(value) : null);
  }

  /**
   * Ko'p ma'lumotlarni bir vaqtda o'qish
   */
  async getItems<T>(keys: string[]): Promise<Record<string, T>> {
    const result: Record<string, T> = {};
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        result[key] = JSON.parse(value);
      }
    });
    return Promise.resolve(result);
  }

  /**
   * Ma'lumotni o'chirish
   */
  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
    return Promise.resolve();
  }

  /**
   * Barcha kalitlarni olish
   */
  async getKeys(): Promise<string[]> {
    const keys = Object.keys(localStorage);
    return Promise.resolve(keys);
  }

  /**
   * Telegram Cloud Storage'dan ma'lumotlarni sync qilish
   * (Only if Cloud is available)
   */
  async syncFromCloud(): Promise<void> {
    // Skip if Cloud not available
    if (!this.cloudAvailable) {
      return;
    }

    console.log('🔄 Syncing from Cloud Storage...');
    
    try {
      await new Promise<void>((resolve) => {
        window.Telegram!.WebApp!.CloudStorage!.getKeys((error, keys) => {
          if (error || !keys || keys.length === 0) {
            console.log('ℹ️ No data in Cloud Storage');
            resolve();
            return;
          }

          window.Telegram!.WebApp!.CloudStorage!.getItems(keys, (error, values) => {
            if (error) {
              console.warn('⚠️ Cloud sync error:', error.message);
              resolve();
              return;
            }

            // Save to localStorage
            Object.entries(values).forEach(([key, value]) => {
              if (value) {
                localStorage.setItem(key, value);
              }
            });

            console.log(`✅ Synced ${keys.length} items from Cloud`);
            resolve();
          });
        });
      });
    } catch (error) {
      console.warn('⚠️ Cloud sync exception:', error);
    }
  }

  /**
   * localStorage'dan Cloud Storage'ga ko'chirish
   * (Only if Cloud is available)
   */
  async migrateToCloud(): Promise<void> {
    // Skip if Cloud not available
    if (!this.cloudAvailable) {
      console.log('ℹ️ Cloud Storage not available (v6.9+ required)');
      return;
    }

    console.log('🔄 Migrating to Cloud Storage...');
    
    try {
      const keys = Object.keys(localStorage);
      let migrated = 0;

      for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value) {
          await new Promise<void>((resolve) => {
            window.Telegram!.WebApp!.CloudStorage!.setItem(key, value, (error) => {
              if (!error) {
                migrated++;
              }
              resolve();
            });
          });
        }
      }

      console.log(`✅ Migrated ${migrated} items to Cloud`);
    } catch (error) {
      console.warn('⚠️ Migration error:', error);
    }
  }

  /**
   * Public method to check Cloud Storage availability
   */
  hasCloudStorage(): boolean {
    return this.cloudAvailable;
  }
}

// Singleton instance
export const storage = new StorageManager();

// Helper functions for common operations
export const saveUserData = async (userId: string, data: any) => {
  await storage.setItem(`user_${userId}`, data);
};

export const getUserData = async (userId: string) => {
  return await storage.getItem(`user_${userId}`);
};

export const saveOrders = async (userId: string, orders: any[]) => {
  await storage.setItem(`orders_${userId}`, orders);
};

export const getOrders = async (userId: string) => {
  return await storage.getItem<any[]>(`orders_${userId}`) || [];
};

export const saveCart = async (cart: any[]) => {
  await storage.setItem('cart', cart);
};

export const getCart = async () => {
  return await storage.getItem<any[]>('cart') || [];
};

export const saveFavorites = async (favorites: string[]) => {
  await storage.setItem('favorites', favorites);
};

export const getFavorites = async () => {
  return await storage.getItem<string[]>('favorites') || [];
};

export const saveVendorProducts = async (vendorId: string, products: any[]) => {
  await storage.setItem(`vendor_products_${vendorId}`, products);
};

export const getVendorProducts = async (vendorId: string) => {
  return await storage.getItem<any[]>(`vendor_products_${vendorId}`) || [];
};

// Promo Codes
export const savePromoCodes = async (promoCodes: any[]) => {
  await storage.setItem('promo_codes', promoCodes);
};

export const getPromoCodes = async () => {
  return await storage.getItem<any[]>('promo_codes') || [];
};

export const savePromoCodeUsage = async (userId: string, usage: any[]) => {
  await storage.setItem(`promo_usage_${userId}`, usage);
};

export const getPromoCodeUsage = async (userId: string) => {
  return await storage.getItem<any[]>(`promo_usage_${userId}`) || [];
};

// Shipping Zones & Methods
export const saveShippingZones = async (zones: any[]) => {
  await storage.setItem('shipping_zones', zones);
};

export const getShippingZones = async () => {
  return await storage.getItem<any[]>('shipping_zones') || [];
};

export const saveShippingMethods = async (methods: any[]) => {
  await storage.setItem('shipping_methods', methods);
};

export const getShippingMethods = async () => {
  return await storage.getItem<any[]>('shipping_methods') || [];
};

// DON'T auto-sync on load to avoid CloudStorage calls in old versions
// Users can manually call storage.syncFromCloud() if needed

export default storage;