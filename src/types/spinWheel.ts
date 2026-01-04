/**
 * Spin Wheel types for gamification feature
 */

export interface SpinWheelPrize {
  id: string;
  name: string;
  type: 'product' | 'discount' | 'free_shipping' | 'try_again' | 'bonus';
  description: string;
  image?: string;
  productId?: string; // If type is 'product'
  discountPercent?: number; // If type is 'discount'
  probability: number; // 0-100 (percentage chance)
  color: string; // Segment color
  isActive: boolean;
  createdAt: string;
  claimedCount?: number;
  
  // New: Prize limitations
  isLimited: boolean; // Cheklangan yoki yo'q
  maxClaims?: number; // Maksimal yutuq soni (masalan: 100)
  availableUntil?: string; // Muddati (optional)
  
  // Display on wheel
  displayText: string; // Barabanda ko'rsatiladigan qisqa text
  icon?: string; // Emoji icon
}

export interface SpinWheelConfig {
  isEnabled: boolean;
  spinsPerDay: number;
  title: string;
  subtitle: string;
  buttonText: string;
  segments: number; // Total segments (usually 8 or 12)
  spinDuration: number; // Animation duration in ms
  minSpins: number; // Minimum rotations before stopping
  createdAt: string;
  updatedAt: string;
}

export interface UserSpinHistory {
  userId: string;
  lastSpinDate: string;
  spinsToday: number;
  totalSpins: number;
  prizes: {
    prizeId: string;
    prizeName: string;
    wonAt: string;
    claimed: boolean;
  }[];
}

export interface SpinWheelStats {
  totalSpins: number;
  totalPrizesWon: number;
  totalPrizesClaimed: number;
  prizeDistribution: {
    prizeId: string;
    prizeName: string;
    count: number;
  }[];
  activeUsers: number;
  conversionRate: number; // Prize claims / Total wins
}