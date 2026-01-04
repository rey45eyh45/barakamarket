import { Smartphone, Shirt, Book, Home, Grid3x3 } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'Hammasi', icon: Grid3x3 },
  { id: 'elektronika', name: 'Elektronika', icon: Smartphone },
  { id: 'kiyim', name: 'Kiyim', icon: Shirt },
  { id: 'kitoblar', name: 'Kitoblar', icon: Book },
  { id: 'uy-buyumlari', name: 'Uy buyumlari', icon: Home },
];

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-[120px] z-40">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 py-3 min-w-max">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}