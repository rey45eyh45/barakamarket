import { useState } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { VariantGroup, ProductVariant } from '../types/variant';

interface VariantSelectorProps {
  variantGroups: VariantGroup[];
  variants: ProductVariant[];
  onVariantChange: (variant: ProductVariant | null) => void;
  className?: string;
}

export function VariantSelector({ 
  variantGroups, 
  variants, 
  onVariantChange,
  className = ''
}: VariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Find matching variant based on selected options
  const findMatchingVariant = (options: Record<string, string>): ProductVariant | null => {
    const variant = variants.find(v => {
      return v.options.every(opt => options[opt.type] === opt.value);
    });
    return variant || null;
  };

  const handleOptionSelect = (type: string, value: string) => {
    const newOptions = { ...selectedOptions, [type]: value };
    setSelectedOptions(newOptions);
    
    const matchingVariant = findMatchingVariant(newOptions);
    onVariantChange(matchingVariant);
  };

  const isOptionAvailable = (type: string, value: string): boolean => {
    const testOptions = { ...selectedOptions, [type]: value };
    return variants.some(v => {
      return v.options.every(opt => 
        testOptions[opt.type] === undefined || testOptions[opt.type] === opt.value
      ) && v.isAvailable && v.stock > 0;
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {variantGroups.map(group => (
        <div key={group.type}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {group.label}
            </label>
            {selectedOptions[group.type] && (
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {group.options.find(opt => opt.value === selectedOptions[group.type])?.name}
              </span>
            )}
          </div>

          {/* Color Variants - Visual */}
          {group.type === 'color' && (
            <div className="flex flex-wrap gap-2">
              {group.options.map(option => {
                const isSelected = selectedOptions[group.type] === option.value;
                const isAvailable = isOptionAvailable(group.type, option.value);

                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: isAvailable ? 1.05 : 1 }}
                    whileTap={{ scale: isAvailable ? 0.95 : 1 }}
                    onClick={() => isAvailable && handleOptionSelect(group.type, option.value)}
                    disabled={!isAvailable}
                    className={`relative w-10 h-10 rounded-full border-2 transition ${
                      isSelected
                        ? 'border-blue-600 dark:border-blue-400'
                        : 'border-gray-300 dark:border-gray-600'
                    } ${
                      !isAvailable
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:border-blue-400 cursor-pointer'
                    }`}
                    style={{ backgroundColor: option.color }}
                    title={`${option.name}${!isAvailable ? ' (Mavjud emas)' : ''}`}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check 
                          className="w-5 h-5" 
                          style={{ 
                            color: option.color === '#ffffff' || option.color === '#eab308' 
                              ? '#000000' 
                              : '#ffffff' 
                          }} 
                        />
                      </div>
                    )}
                    {!isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-px h-10 bg-red-500 rotate-45"></div>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Size/Capacity/Material Variants - Text */}
          {group.type !== 'color' && (
            <div className="flex flex-wrap gap-2">
              {group.options.map(option => {
                const isSelected = selectedOptions[group.type] === option.value;
                const isAvailable = isOptionAvailable(group.type, option.value);

                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: isAvailable ? 1.05 : 1 }}
                    whileTap={{ scale: isAvailable ? 0.95 : 1 }}
                    onClick={() => isAvailable && handleOptionSelect(group.type, option.value)}
                    disabled={!isAvailable}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    } ${
                      !isAvailable
                        ? 'opacity-40 cursor-not-allowed line-through'
                        : 'hover:border-blue-400 cursor-pointer'
                    }`}
                  >
                    {option.name}
                    {option.priceModifier && option.priceModifier > 0 && (
                      <span className="ml-1 text-xs">
                        +{new Intl.NumberFormat('uz-UZ').format(option.priceModifier)} so'm
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
