import { useState, useEffect, useCallback } from 'react';

export interface SavedAddress {
  id: string;
  userId: string;
  label: string; // "Uy", "Ish", "Ona-otam", etc.
  fullName: string;
  phone: string;
  address: string;
  city: string;
  region?: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useSavedAddresses(userId: string) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<SavedAddress | null>(null);

  const loadAddresses = useCallback(() => {
    try {
      const stored = localStorage.getItem('saved_addresses');
      if (!stored) {
        setAddresses([]);
        setDefaultAddress(null);
        return;
      }

      const allAddresses: SavedAddress[] = JSON.parse(stored);
      const userAddresses = allAddresses.filter(addr => addr.userId === userId);
      
      setAddresses(userAddresses);
      
      const defaultAddr = userAddresses.find(addr => addr.isDefault) || null;
      setDefaultAddress(defaultAddr);
    } catch (error) {
      console.error('Error loading addresses:', error);
      setAddresses([]);
      setDefaultAddress(null);
    }
  }, [userId]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const addAddress = useCallback((address: Omit<SavedAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newAddress: SavedAddress = {
        ...address,
        id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const stored = localStorage.getItem('saved_addresses');
      const allAddresses: SavedAddress[] = stored ? JSON.parse(stored) : [];

      // If this is the first address or marked as default, unset other defaults
      if (newAddress.isDefault || allAddresses.filter(a => a.userId === userId).length === 0) {
        allAddresses.forEach(addr => {
          if (addr.userId === userId) {
            addr.isDefault = false;
          }
        });
        newAddress.isDefault = true;
      }

      allAddresses.push(newAddress);
      localStorage.setItem('saved_addresses', JSON.stringify(allAddresses));
      
      loadAddresses();
      return { success: true, address: newAddress };
    } catch (error) {
      console.error('Error adding address:', error);
      return { success: false, error: 'Xatolik yuz berdi' };
    }
  }, [userId, loadAddresses]);

  const updateAddress = useCallback((id: string, updates: Partial<SavedAddress>) => {
    try {
      const stored = localStorage.getItem('saved_addresses');
      if (!stored) return { success: false, error: 'Manzillar topilmadi' };

      const allAddresses: SavedAddress[] = JSON.parse(stored);
      const addressIndex = allAddresses.findIndex(addr => addr.id === id && addr.userId === userId);

      if (addressIndex === -1) {
        return { success: false, error: 'Manzil topilmadi' };
      }

      // If setting as default, unset other defaults
      if (updates.isDefault) {
        allAddresses.forEach(addr => {
          if (addr.userId === userId && addr.id !== id) {
            addr.isDefault = false;
          }
        });
      }

      allAddresses[addressIndex] = {
        ...allAddresses[addressIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('saved_addresses', JSON.stringify(allAddresses));
      loadAddresses();
      
      return { success: true };
    } catch (error) {
      console.error('Error updating address:', error);
      return { success: false, error: 'Xatolik yuz berdi' };
    }
  }, [userId, loadAddresses]);

  const deleteAddress = useCallback((id: string) => {
    try {
      const stored = localStorage.getItem('saved_addresses');
      if (!stored) return { success: false };

      const allAddresses: SavedAddress[] = JSON.parse(stored);
      const addressToDelete = allAddresses.find(addr => addr.id === id && addr.userId === userId);
      
      if (!addressToDelete) {
        return { success: false, error: 'Manzil topilmadi' };
      }

      const filtered = allAddresses.filter(addr => addr.id !== id);

      // If deleted address was default, set first address as default
      if (addressToDelete.isDefault) {
        const userAddresses = filtered.filter(addr => addr.userId === userId);
        if (userAddresses.length > 0) {
          const firstAddr = userAddresses[0];
          const firstIndex = filtered.findIndex(addr => addr.id === firstAddr.id);
          if (firstIndex !== -1) {
            filtered[firstIndex].isDefault = true;
          }
        }
      }

      localStorage.setItem('saved_addresses', JSON.stringify(filtered));
      loadAddresses();
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting address:', error);
      return { success: false };
    }
  }, [userId, loadAddresses]);

  const setAsDefault = useCallback((id: string) => {
    return updateAddress(id, { isDefault: true });
  }, [updateAddress]);

  const getAddress = useCallback((id: string): SavedAddress | null => {
    return addresses.find(addr => addr.id === id) || null;
  }, [addresses]);

  return {
    addresses,
    defaultAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    setAsDefault,
    getAddress,
    reload: loadAddresses
  };
}
