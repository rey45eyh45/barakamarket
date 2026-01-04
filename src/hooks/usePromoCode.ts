import { useState, useCallback } from 'react';
import { PromoCode, PromoCodeUsage } from '../types';

interface ApplyPromoCodeResult {
  success: boolean;
  message: string;
  discount?: number;
  type?: 'percentage' | 'fixed';
  promoCode?: PromoCode;
}

export function usePromoCode(userId: string) {
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Validate and apply promo code
  const applyPromoCode = useCallback(async (
    code: string,
    orderAmount: number
  ): Promise<ApplyPromoCodeResult> => {
    setIsApplying(true);

    try {
      // Get all promo codes
      const promoCodesJson = localStorage.getItem('promo_codes');
      if (!promoCodesJson) {
        return {
          success: false,
          message: 'Promo kod topilmadi'
        };
      }

      const promoCodes: PromoCode[] = JSON.parse(promoCodesJson);
      const promoCode = promoCodes.find(
        pc => pc.code.toUpperCase() === code.toUpperCase()
      );

      if (!promoCode) {
        return {
          success: false,
          message: 'Promo kod topilmadi'
        };
      }

      // Check if active
      if (!promoCode.isActive) {
        return {
          success: false,
          message: 'Bu promo kod faol emas'
        };
      }

      // Check dates
      const now = new Date();
      const validFrom = new Date(promoCode.validFrom);
      const validUntil = new Date(promoCode.validUntil);

      if (now < validFrom) {
        return {
          success: false,
          message: 'Bu promo kod hali faol emas'
        };
      }

      if (now > validUntil) {
        return {
          success: false,
          message: 'Bu promo kodning muddati tugagan'
        };
      }

      // Check usage limit
      if (promoCode.usedCount >= promoCode.usageLimit) {
        return {
          success: false,
          message: 'Bu promo kod limitga yetdi'
        };
      }

      // Check min order amount
      if (orderAmount < promoCode.minOrderAmount) {
        return {
          success: false,
          message: `Minimal buyurtma summasi: ${new Intl.NumberFormat('uz-UZ').format(promoCode.minOrderAmount)} so'm`
        };
      }

      // Check user usage limit
      const usageJson = localStorage.getItem('promo_code_usage');
      const usages: PromoCodeUsage[] = usageJson ? JSON.parse(usageJson) : [];
      const userUsage = usages.find(
        u => u.userId === userId && u.promoCodeId === promoCode.id
      );

      if (userUsage && userUsage.usedCount >= promoCode.userLimit) {
        return {
          success: false,
          message: 'Siz bu promo kodni allaqachon ishlatgansiz'
        };
      }

      // Calculate discount
      let discount = 0;
      if (promoCode.type === 'percentage') {
        discount = Math.round(orderAmount * (promoCode.value / 100));
        // Apply max discount if set
        if (promoCode.maxDiscount && discount > promoCode.maxDiscount) {
          discount = promoCode.maxDiscount;
        }
      } else {
        discount = promoCode.value;
      }

      setAppliedPromoCode(promoCode);

      return {
        success: true,
        message: `${promoCode.description}`,
        discount,
        type: promoCode.type,
        promoCode
      };
    } catch (error) {
      console.error('Error applying promo code:', error);
      return {
        success: false,
        message: 'Xatolik yuz berdi'
      };
    } finally {
      setIsApplying(false);
    }
  }, [userId]);

  // Record promo code usage
  const recordUsage = useCallback((promoCodeId: string) => {
    try {
      // Update promo code usage count
      const promoCodesJson = localStorage.getItem('promo_codes');
      if (!promoCodesJson) return;

      const promoCodes: PromoCode[] = JSON.parse(promoCodesJson);
      const promoCodeIndex = promoCodes.findIndex(pc => pc.id === promoCodeId);

      if (promoCodeIndex !== -1) {
        promoCodes[promoCodeIndex].usedCount++;
        promoCodes[promoCodeIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('promo_codes', JSON.stringify(promoCodes));
      }

      // Update user usage
      const usageJson = localStorage.getItem('promo_code_usage');
      const usages: PromoCodeUsage[] = usageJson ? JSON.parse(usageJson) : [];
      
      const userUsageIndex = usages.findIndex(
        u => u.userId === userId && u.promoCodeId === promoCodeId
      );

      if (userUsageIndex !== -1) {
        usages[userUsageIndex].usedCount++;
        usages[userUsageIndex].lastUsed = new Date().toISOString();
      } else {
        usages.push({
          userId,
          promoCodeId,
          usedCount: 1,
          lastUsed: new Date().toISOString()
        });
      }

      localStorage.setItem('promo_code_usage', JSON.stringify(usages));
    } catch (error) {
      console.error('Error recording promo code usage:', error);
    }
  }, [userId]);

  // Remove applied promo code
  const removePromoCode = useCallback(() => {
    setAppliedPromoCode(null);
  }, []);

  // Calculate discount amount
  const calculateDiscount = useCallback((orderAmount: number): number => {
    if (!appliedPromoCode) return 0;

    let discount = 0;
    if (appliedPromoCode.type === 'percentage') {
      discount = Math.round(orderAmount * (appliedPromoCode.value / 100));
      if (appliedPromoCode.maxDiscount && discount > appliedPromoCode.maxDiscount) {
        discount = appliedPromoCode.maxDiscount;
      }
    } else {
      discount = appliedPromoCode.value;
    }

    return discount;
  }, [appliedPromoCode]);

  return {
    appliedPromoCode,
    isApplying,
    applyPromoCode,
    removePromoCode,
    recordUsage,
    calculateDiscount
  };
}

// Hook for managing promo codes (Admin)
export function usePromoCodeManagement() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);

  const loadPromoCodes = useCallback(() => {
    try {
      const stored = localStorage.getItem('promo_codes');
      if (stored) {
        setPromoCodes(JSON.parse(stored));
      } else {
        setPromoCodes([]);
      }
    } catch (error) {
      console.error('Error loading promo codes:', error);
      setPromoCodes([]);
    }
  }, []);

  React.useEffect(() => {
    loadPromoCodes();
  }, [loadPromoCodes]);

  const createPromoCode = useCallback((promoCode: Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>) => {
    try {
      const newPromoCode: PromoCode = {
        ...promoCode,
        id: `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        usedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const stored = localStorage.getItem('promo_codes');
      const promoCodes: PromoCode[] = stored ? JSON.parse(stored) : [];
      promoCodes.push(newPromoCode);

      localStorage.setItem('promo_codes', JSON.stringify(promoCodes));
      loadPromoCodes();

      return { success: true, promoCode: newPromoCode };
    } catch (error) {
      console.error('Error creating promo code:', error);
      return { success: false, error: 'Xatolik yuz berdi' };
    }
  }, [loadPromoCodes]);

  const updatePromoCode = useCallback((id: string, updates: Partial<PromoCode>) => {
    try {
      const stored = localStorage.getItem('promo_codes');
      if (!stored) return { success: false, error: 'Promo kodlar topilmadi' };

      const promoCodes: PromoCode[] = JSON.parse(stored);
      const index = promoCodes.findIndex(pc => pc.id === id);

      if (index === -1) {
        return { success: false, error: 'Promo kod topilmadi' };
      }

      promoCodes[index] = {
        ...promoCodes[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('promo_codes', JSON.stringify(promoCodes));
      loadPromoCodes();

      return { success: true };
    } catch (error) {
      console.error('Error updating promo code:', error);
      return { success: false, error: 'Xatolik yuz berdi' };
    }
  }, [loadPromoCodes]);

  const deletePromoCode = useCallback((id: string) => {
    try {
      const stored = localStorage.getItem('promo_codes');
      if (!stored) return { success: false };

      const promoCodes: PromoCode[] = JSON.parse(stored);
      const filtered = promoCodes.filter(pc => pc.id !== id);

      localStorage.setItem('promo_codes', JSON.stringify(filtered));
      loadPromoCodes();

      return { success: true };
    } catch (error) {
      console.error('Error deleting promo code:', error);
      return { success: false };
    }
  }, [loadPromoCodes]);

  const toggleActive = useCallback((id: string) => {
    try {
      const stored = localStorage.getItem('promo_codes');
      if (!stored) return { success: false };

      const promoCodes: PromoCode[] = JSON.parse(stored);
      const index = promoCodes.findIndex(pc => pc.id === id);

      if (index === -1) return { success: false };

      promoCodes[index].isActive = !promoCodes[index].isActive;
      promoCodes[index].updatedAt = new Date().toISOString();

      localStorage.setItem('promo_codes', JSON.stringify(promoCodes));
      loadPromoCodes();

      return { success: true };
    } catch (error) {
      console.error('Error toggling promo code:', error);
      return { success: false };
    }
  }, [loadPromoCodes]);

  const getActivePromoCodes = useCallback(() => {
    const now = new Date();
    return promoCodes.filter(pc => {
      const validFrom = new Date(pc.validFrom);
      const validUntil = new Date(pc.validUntil);
      return (
        pc.isActive &&
        now >= validFrom &&
        now <= validUntil &&
        pc.usedCount < pc.usageLimit
      );
    });
  }, [promoCodes]);

  return {
    promoCodes,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    toggleActive,
    getActivePromoCodes,
    reload: loadPromoCodes
  };
}

// Import React
import React from 'react';
