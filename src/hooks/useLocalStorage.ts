import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for localStorage with TypeScript support
 * Automatically handles JSON serialization/deserialization
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook to sync localStorage across browser tabs
 */
export function useLocalStorageSync<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue, removeValue] = useLocalStorage<T>(key, initialValue);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, setStoredValue]);

  return [storedValue, setStoredValue];
}

/**
 * Hook for temporary storage (cleared on browser close)
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook with expiration time
 */
export function useLocalStorageWithExpiry<T>(
  key: string,
  initialValue: T,
  expiryInMs: number
): [T | null, (value: T) => void, () => void] {
  const [value, setValue] = useState<T | null>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = JSON.parse(item);
      const now = new Date().getTime();

      if (now > parsed.expiry) {
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return parsed.value;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValueWithExpiry = useCallback(
    (newValue: T) => {
      try {
        const now = new Date().getTime();
        const item = {
          value: newValue,
          expiry: now + expiryInMs
        };

        setValue(newValue);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(item));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, expiryInMs]
  );

  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setValue(null);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key]);

  return [value, setValueWithExpiry, removeValue];
}

/**
 * Utilities for localStorage management
 */
export const localStorageUtils = {
  // Get all keys
  getAllKeys: (): string[] => {
    if (typeof window === 'undefined') return [];
    return Object.keys(window.localStorage);
  },

  // Get all items
  getAllItems: (): Record<string, any> => {
    if (typeof window === 'undefined') return {};
    const items: Record<string, any> = {};
    const keys = Object.keys(window.localStorage);
    
    keys.forEach(key => {
      try {
        items[key] = JSON.parse(window.localStorage.getItem(key) || 'null');
      } catch {
        items[key] = window.localStorage.getItem(key);
      }
    });
    
    return items;
  },

  // Clear all items
  clearAll: (): void => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  },

  // Clear items by prefix
  clearByPrefix: (prefix: string): void => {
    if (typeof window === 'undefined') return;
    const keys = Object.keys(window.localStorage);
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        window.localStorage.removeItem(key);
      }
    });
  },

  // Get storage size
  getStorageSize: (): number => {
    if (typeof window === 'undefined') return 0;
    let total = 0;
    for (const key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        total += window.localStorage[key].length + key.length;
      }
    }
    return total;
  },

  // Format storage size
  getStorageSizeFormatted: (): string => {
    const bytes = localStorageUtils.getStorageSize();
    const kb = bytes / 1024;
    const mb = kb / 1024;
    
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    if (kb >= 1) return `${kb.toFixed(2)} KB`;
    return `${bytes} bytes`;
  }
};
