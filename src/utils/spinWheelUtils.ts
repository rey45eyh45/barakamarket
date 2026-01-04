/**
 * Spin Wheel utility functions
 */

import { SpinWheelPrize, SpinWheelConfig, UserSpinHistory } from '../types/spinWheel';

/**
 * Get spin wheel configuration
 */
export function getSpinWheelConfig(): SpinWheelConfig {
  try {
    const stored = localStorage.getItem('spin_wheel_config');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading spin wheel config:', error);
  }

  // Default configuration
  const defaultConfig: SpinWheelConfig = {
    isEnabled: true,
    spinsPerDay: 1,
    title: "Omadli G'ildirak!",
    subtitle: 'Aylantirib, sovg\'a yutib oling!',
    buttonText: 'Aylantirish',
    segments: 8,
    spinDuration: 5000,
    minSpins: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem('spin_wheel_config', JSON.stringify(defaultConfig));
  return defaultConfig;
}

/**
 * Save spin wheel configuration
 */
export function saveSpinWheelConfig(config: SpinWheelConfig): void {
  config.updatedAt = new Date().toISOString();
  localStorage.setItem('spin_wheel_config', JSON.stringify(config));
}

/**
 * Get all spin wheel prizes
 */
export function getSpinWheelPrizes(): SpinWheelPrize[] {
  try {
    const stored = localStorage.getItem('spin_wheel_prizes');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading spin wheel prizes:', error);
  }

  // Default prizes
  const defaultPrizes: SpinWheelPrize[] = [
    {
      id: '1',
      name: '10% Chegirma',
      type: 'discount',
      description: 'Barcha mahsulotlarga 10% chegirma',
      discountPercent: 10,
      probability: 20,
      color: '#FF6B6B',
      isActive: true,
      createdAt: new Date().toISOString(),
      claimedCount: 0,
      isLimited: true,
      maxClaims: 100,
      displayText: '10%',
      icon: '💰'
    },
    {
      id: '2',
      name: 'Bepul Yetkazib Berish',
      type: 'free_shipping',
      description: 'Keyingi buyurtmangizga bepul yetkazib berish',
      probability: 15,
      color: '#4ECDC4',
      isActive: true,
      createdAt: new Date().toISOString(),
      claimedCount: 0,
      isLimited: true,
      maxClaims: 50,
      displayText: 'Bepul',
      icon: '🚚'
    },
    {
      id: '3',
      name: '20% Chegirma',
      type: 'discount',
      description: 'Barcha mahsulotlarga 20% chegirma',
      discountPercent: 20,
      probability: 10,
      color: '#FFD93D',
      isActive: true,
      createdAt: new Date().toISOString(),
      claimedCount: 0,
      isLimited: true,
      maxClaims: 50,
      displayText: '20%',
      icon: '🎁'
    },
    {
      id: '4',
      name: 'Qaytadan Urinib Ko\'ring',
      type: 'try_again',
      description: 'Bu safar omad kelmadi, ertaga qayta urinib ko\'ring!',
      probability: 25,
      color: '#95E1D3',
      isActive: true,
      createdAt: new Date().toISOString(),
      claimedCount: 0,
      isLimited: false,
      displayText: 'Yana',
      icon: '🔄'
    },
    {
      id: '5',
      name: '5% Chegirma',
      type: 'discount',
      description: 'Barcha mahsulotlarga 5% chegirma',
      discountPercent: 5,
      probability: 20,
      color: '#F38181',
      isActive: true,
      createdAt: new Date().toISOString(),
      claimedCount: 0,
      isLimited: true,
      maxClaims: 200,
      displayText: '5%',
      icon: '💵'
    },
    {
      id: '6',
      name: 'Bonus Ball',
      type: 'bonus',
      description: '100 bonus ball yutib oldingiz!',
      probability: 5,
      color: '#AA96DA',
      isActive: true,
      createdAt: new Date().toISOString(),
      claimedCount: 0,
      isLimited: true,
      maxClaims: 30,
      displayText: '100★',
      icon: '⭐'
    },
    {
      id: '7',
      name: '15% Chegirma',
      type: 'discount',
      description: 'Barcha mahsulotlarga 15% chegirma',
      discountPercent: 15,
      probability: 10,
      color: '#FCBAD3',
      isActive: true,
      createdAt: new Date().toISOString(),
      claimedCount: 0,
      isLimited: true,
      maxClaims: 75,
      displayText: '15%',
      icon: '🏷️'
    },
    {
      id: '8',
      name: 'Qaytadan Urinib Ko\'ring',
      type: 'try_again',
      description: 'Bu safar omad kelmadi, ertaga qayta urinib ko\'ring!',
      probability: 5,
      color: '#A8E6CF',
      isActive: true,
      createdAt: new Date().toISOString(),
      claimedCount: 0,
      isLimited: false,
      displayText: 'Yana',
      icon: '🔄'
    }
  ];

  localStorage.setItem('spin_wheel_prizes', JSON.stringify(defaultPrizes));
  return defaultPrizes;
}

/**
 * Save spin wheel prizes
 */
export function saveSpinWheelPrizes(prizes: SpinWheelPrize[]): void {
  localStorage.setItem('spin_wheel_prizes', JSON.stringify(prizes));
}

/**
 * Get user spin history
 */
export function getUserSpinHistory(userId: string): UserSpinHistory {
  try {
    const stored = localStorage.getItem(`spin_history_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading user spin history:', error);
  }

  // Default history
  const defaultHistory: UserSpinHistory = {
    userId,
    lastSpinDate: '',
    spinsToday: 0,
    totalSpins: 0,
    prizes: []
  };

  return defaultHistory;
}

/**
 * Save user spin history
 */
export function saveUserSpinHistory(history: UserSpinHistory): void {
  localStorage.setItem(`spin_history_${history.userId}`, JSON.stringify(history));
}

/**
 * Check if user can spin today
 */
export function canUserSpin(userId: string): { canSpin: boolean; reason?: string } {
  const config = getSpinWheelConfig();
  
  if (!config.isEnabled) {
    return { canSpin: false, reason: 'Spin wheel is currently disabled' };
  }

  const history = getUserSpinHistory(userId);
  const today = new Date().toDateString();
  const lastSpinDate = history.lastSpinDate ? new Date(history.lastSpinDate).toDateString() : '';

  // Reset spins if it's a new day
  if (lastSpinDate !== today) {
    return { canSpin: true };
  }

  // Check if user has spins left today
  if (history.spinsToday >= config.spinsPerDay) {
    return { canSpin: false, reason: `You've used all ${config.spinsPerDay} spin(s) for today. Come back tomorrow!` };
  }

  return { canSpin: true };
}

/**
 * Select a random prize based on probability
 */
export function selectRandomPrize(prizes: SpinWheelPrize[]): SpinWheelPrize | null {
  const activePrizes = prizes.filter(p => p.isActive);
  
  if (activePrizes.length === 0) {
    return null;
  }

  // Calculate total probability
  const totalProbability = activePrizes.reduce((sum, prize) => sum + prize.probability, 0);

  // Generate random number
  const random = Math.random() * totalProbability;

  // Select prize based on probability
  let cumulativeProbability = 0;
  for (const prize of activePrizes) {
    cumulativeProbability += prize.probability;
    if (random <= cumulativeProbability) {
      return prize;
    }
  }

  // Fallback to first prize
  return activePrizes[0];
}

/**
 * Calculate rotation angle for prize
 */
export function calculateRotationAngle(
  prizeIndex: number,
  totalPrizes: number,
  minSpins: number = 5
): number {
  const segmentAngle = 360 / totalPrizes;
  const prizeAngle = prizeIndex * segmentAngle;
  
  // Add minimum rotations (full 360° spins)
  const minRotation = minSpins * 360;
  
  // Add random extra rotation (0-360°)
  const randomRotation = Math.random() * 360;
  
  // Calculate final angle (point to center of prize segment)
  const finalAngle = minRotation + randomRotation + (360 - prizeAngle) + (segmentAngle / 2);
  
  return finalAngle;
}

/**
 * Record spin result
 */
export function recordSpin(userId: string, prize: SpinWheelPrize): void {
  const history = getUserSpinHistory(userId);
  const today = new Date().toDateString();
  const lastSpinDate = history.lastSpinDate ? new Date(history.lastSpinDate).toDateString() : '';

  // Reset spins if it's a new day
  if (lastSpinDate !== today) {
    history.spinsToday = 0;
  }

  // Update history
  history.lastSpinDate = new Date().toISOString();
  history.spinsToday += 1;
  history.totalSpins += 1;
  history.prizes.push({
    prizeId: prize.id,
    prizeName: prize.name,
    wonAt: new Date().toISOString(),
    claimed: false
  });

  saveUserSpinHistory(history);

  // Update prize claim count
  const prizes = getSpinWheelPrizes();
  const updatedPrizes = prizes.map(p => 
    p.id === prize.id 
      ? { ...p, claimedCount: (p.claimedCount || 0) + 1 }
      : p
  );
  saveSpinWheelPrizes(updatedPrizes);
}

/**
 * Claim a prize
 */
export function claimPrize(userId: string, prizeId: string): boolean {
  try {
    const history = getUserSpinHistory(userId);
    const prizeIndex = history.prizes.findIndex(p => p.prizeId === prizeId && !p.claimed);
    
    if (prizeIndex === -1) {
      return false;
    }

    history.prizes[prizeIndex].claimed = true;
    saveUserSpinHistory(history);
    
    return true;
  } catch (error) {
    console.error('Error claiming prize:', error);
    return false;
  }
}

/**
 * Get spin wheel statistics
 */
export function getSpinWheelStats(): any {
  // This would aggregate data from all user histories
  // For now, return basic stats
  return {
    totalSpins: 0,
    totalPrizesWon: 0,
    activeUsers: 0
  };
}