import { motion } from 'motion/react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-base' },
    md: { container: 'w-12 h-12', text: 'text-xl' },
    lg: { container: 'w-20 h-20', text: 'text-2xl' }, // 16'dan 20'ga oshirdik
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <motion.div
        className={`${sizes[size].container} bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/20`}
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4"
        >
          {/* Shopping Bag Icon */}
          <motion.path
            d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(255,255,255,0.2)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <motion.path
            d="M3 6H21"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.path
            d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 1 }}
          />
          
          {/* Star decoration */}
          <motion.path
            d="M12 3L12.5 5L14 5.5L12.5 6L12 8L11.5 6L10 5.5L11.5 5L12 3Z"
            fill="white"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          />
        </svg>
      </motion.div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <motion.h1
            className={`bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent ${
              size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-3xl'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Baraka Market
          </motion.h1>
          <motion.p
            className="text-white/90 text-xs tracking-wide"
            style={{
              fontFamily: "'Inter', sans-serif",
              textShadow: '0 1px 5px rgba(0,0,0,0.2)',
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Sifat va qulay narxlar
          </motion.p>
        </div>
      )}
    </div>
  );
}