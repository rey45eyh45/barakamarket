import { useState, useEffect, useRef } from 'react';
import { X, Gift, Trophy, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SpinWheelPrize } from '../types/spinWheel';
import {
  getSpinWheelConfig,
  getSpinWheelPrizes,
  canUserSpin,
  selectRandomPrize,
  calculateRotationAngle,
  recordSpin
} from '../utils/spinWheelUtils';
import { toast } from 'sonner@2.0.3';

interface SpinWheelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function SpinWheel({ isOpen, onClose, userId }: SpinWheelProps) {
  const [prizes, setPrizes] = useState<SpinWheelPrize[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<SpinWheelPrize | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [spinMessage, setSpinMessage] = useState('');
  const wheelRef = useRef<HTMLDivElement>(null);

  const config = getSpinWheelConfig();

  useEffect(() => {
    if (isOpen) {
      const loadedPrizes = getSpinWheelPrizes();
      const activePrizes = loadedPrizes.filter(p => p.isActive);
      
      // Check prize availability
      const availablePrizes = activePrizes.filter(p => {
        if (!p.isLimited) return true;
        return (p.claimedCount || 0) < (p.maxClaims || Infinity);
      });

      setPrizes(availablePrizes);

      // Check if user can spin
      const { canSpin: allowed, reason } = canUserSpin(userId);
      setCanSpin(allowed);
      if (reason) {
        setSpinMessage(reason);
      }

      if (availablePrizes.length === 0) {
        setCanSpin(false);
        setSpinMessage('Hozircha barcha sovg\'alar tugadi. Keyinroq qaytib keling!');
      }
    }
  }, [isOpen, userId]);

  const handleSpin = () => {
    if (!canSpin || isSpinning || prizes.length === 0) return;

    setIsSpinning(true);

    // Select random prize
    const selectedPrize = selectRandomPrize(prizes);
    if (!selectedPrize) return;

    // Check if prize is still available
    if (selectedPrize.isLimited) {
      const currentClaims = selectedPrize.claimedCount || 0;
      const maxClaims = selectedPrize.maxClaims || 0;
      
      if (currentClaims >= maxClaims) {
        // Prize sold out, try again
        toast.error('Bu sovg\'a tugab qoldi!');
        setIsSpinning(false);
        return;
      }
    }

    // Find prize index
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);

    // Calculate rotation
    const finalRotation = calculateRotationAngle(prizeIndex, prizes.length, config.minSpins);
    setRotation(finalRotation);

    // Show result after animation
    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(selectedPrize);
      setShowResult(true);
      recordSpin(userId, selectedPrize);
      
      // Confetti effect
      if (selectedPrize.type !== 'try_again') {
        createConfetti();
      }
    }, config.spinDuration);
  };

  const createConfetti = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#FFC300'];
    const confettiCount = 80;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = confetti.style.width;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * window.innerWidth + 'px';
      confetti.style.top = '-20px';
      confetti.style.opacity = '1';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      document.body.appendChild(confetti);

      const animation = confetti.animate([
        { 
          transform: 'translateY(0) rotate(0deg)', 
          opacity: 1 
        },
        { 
          transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720 - 360}deg)`, 
          opacity: 0 
        }
      ], {
        duration: Math.random() * 2000 + 2000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });

      animation.onfinish = () => {
        document.body.removeChild(confetti);
      };
    }
  };

  const handleClose = () => {
    setShowResult(false);
    setWonPrize(null);
    setRotation(0);
    onClose();
  };

  const handleXButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 opacity-50" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200/30 to-orange-300/30 dark:from-amber-900/20 dark:to-orange-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-rose-200/30 to-pink-300/30 dark:from-rose-900/20 dark:to-pink-900/20 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <button
                onClick={handleXButtonClick}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <motion.div 
                    className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Gift className="w-8 h-8" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold">{config.title}</h2>
                    <p className="text-amber-100">{config.subtitle}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Wheel Container */}
            <div className="p-6">
              {!showResult ? (
                <>
                  {/* Spin Wheel */}
                  <div className="relative mb-6">
                    {/* Pointer - Triangle at top */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
                      <div className="relative">
                        <div className="w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-t-[36px] border-t-red-500 drop-shadow-2xl" />
                        {/* Glow effect */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-red-500/50 rounded-full blur-xl" />
                      </div>
                    </div>

                    {/* Wheel */}
                    <div className="relative w-full aspect-square max-w-sm mx-auto">
                      <div
                        ref={wheelRef}
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          transition: isSpinning ? `transform ${config.spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)` : 'none'
                        }}
                        className="w-full h-full rounded-full shadow-2xl relative overflow-hidden border-[10px] border-white dark:border-gray-700"
                      >
                        {prizes.map((prize, index) => {
                          const segmentAngle = 360 / prizes.length;
                          const startAngle = index * segmentAngle;
                          const isLimitedAndLow = prize.isLimited && prize.maxClaims && 
                            (prize.claimedCount || 0) >= prize.maxClaims * 0.8;

                          return (
                            <div
                              key={prize.id}
                              style={{
                                position: 'absolute',
                                width: '50%',
                                height: '50%',
                                left: '50%',
                                top: '50%',
                                transformOrigin: '0 0',
                                transform: `rotate(${startAngle}deg) skewY(${-90 + segmentAngle}deg)`,
                                backgroundColor: prize.color,
                                borderRight: '2px solid rgba(255, 255, 255, 0.3)',
                              }}
                              className="flex items-center justify-center transition-colors"
                            >
                              {/* Prize content */}
                              <div
                                style={{
                                  transform: `skewY(${90 - segmentAngle}deg) rotate(${segmentAngle / 2}deg) translateX(${prizes.length <= 6 ? '50px' : '45px'})`,
                                }}
                                className="flex flex-col items-center justify-center"
                              >
                                {/* Icon */}
                                <div className="text-3xl mb-1 filter drop-shadow-lg">
                                  {prize.icon}
                                </div>
                                {/* Text */}
                                <div className="text-white font-bold text-center text-sm leading-tight drop-shadow-lg">
                                  {prize.displayText}
                                </div>
                                {/* Limited badge */}
                                {isLimitedAndLow && (
                                  <div className="text-[8px] bg-red-500 text-white px-1 py-0.5 rounded-full mt-1 font-bold">
                                    {(prize.maxClaims || 0) - (prize.claimedCount || 0)}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Center Circle with logo */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white dark:bg-gray-800 rounded-full shadow-2xl flex items-center justify-center border-4 border-amber-500">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-10 h-10 text-amber-500" />
                          </motion.div>
                        </div>

                        {/* Outer rim decoration */}
                        <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none" 
                             style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.2)' }} 
                        />
                      </div>

                      {/* Outer glow */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 opacity-20 blur-2xl -z-10" />
                    </div>
                  </div>

                  {/* Spin Button */}
                  <div className="text-center mb-4">
                    {canSpin ? (
                      <motion.button
                        onClick={handleSpin}
                        disabled={isSpinning}
                        whileHover={!isSpinning ? { scale: 1.05 } : {}}
                        whileTap={!isSpinning ? { scale: 0.95 } : {}}
                        className={`relative px-10 py-5 rounded-2xl font-bold text-xl transition-all transform overflow-hidden ${
                          isSpinning
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-2xl'
                        }`}
                      >
                        {/* Shimmer effect */}
                        {!isSpinning && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: ['-200%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                        )}
                        
                        <span className="relative z-10 flex items-center gap-2">
                          {isSpinning ? (
                            <>
                              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Aylanmoqda...
                            </>
                          ) : (
                            <>
                              <Gift className="w-6 h-6" />
                              {config.buttonText}
                            </>
                          )}
                        </span>
                      </motion.button>
                    ) : (
                      <div className="bg-amber-100 dark:bg-gray-700 rounded-2xl p-4 border-2 border-amber-300 dark:border-amber-700">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                          <p className="text-amber-800 dark:text-amber-200">
                            {spinMessage || "Ertaga qayta urinib ko'ring!"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Prize List */}
                  <div className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-gray-900 dark:text-white font-bold mb-3 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      Mavjud Sovg'alar
                    </h3>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {prizes.map((prize) => {
                        const remaining = prize.isLimited 
                          ? (prize.maxClaims || 0) - (prize.claimedCount || 0)
                          : null;
                        
                        return (
                          <div
                            key={prize.id}
                            className="flex items-center gap-2 text-xs bg-white dark:bg-gray-600 rounded-xl p-2.5 border border-gray-100 dark:border-gray-500 hover:scale-105 transition-transform"
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm"
                              style={{ backgroundColor: prize.color }}
                            >
                              <span className="text-lg">{prize.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-gray-900 dark:text-white font-medium truncate block">
                                {prize.name}
                              </span>
                              {remaining !== null && (
                                <span className={`text-[10px] ${
                                  remaining < 10 
                                    ? 'text-red-600 dark:text-red-400 font-bold' 
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {remaining} ta qoldi
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                /* Result Screen */
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8"
                >
                  {/* Prize display with animation */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 200,
                      damping: 15
                    }}
                    className="w-40 h-40 mx-auto mb-6 rounded-full flex items-center justify-center relative"
                    style={{ backgroundColor: wonPrize?.color }}
                  >
                    <div className="absolute inset-0 rounded-full animate-ping opacity-75"
                         style={{ backgroundColor: wonPrize?.color }} 
                    />
                    <div className="relative z-10">
                      <div className="text-7xl mb-2">{wonPrize?.icon}</div>
                      <div className="text-white font-bold text-xl">
                        {wonPrize?.displayText}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {wonPrize?.type === 'try_again' ? 'Qaytadan Urinib Ko\'ring!' : 'Tabriklaymiz! 🎉'}
                    </h3>
                    <p className="text-2xl text-amber-600 dark:text-amber-400 font-bold mb-3">
                      {wonPrize?.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 px-4">
                      {wonPrize?.description}
                    </p>
                  </motion.div>

                  {wonPrize?.type !== 'try_again' && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-4 mb-6"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-green-900 dark:text-green-100 font-bold mb-1">
                            Sovg'a Yutib Oldingiz!
                          </p>
                          <p className="text-green-700 dark:text-green-300 text-sm">
                            Sovg'angiz profilingizga qo'shildi. "Mening Sovg'alarim" bo'limidan foydalanishingiz mumkin.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2 group"
                  >
                    Yopish
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}