import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, FolderTree, Package, Search, X, Upload, Download, Grid, List, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDebounce, searchInFields } from '../../utils/searchUtils';

interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
  color: string;
  order: number;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  image?: string;
}

const iconOptions = [
  '📱', '💻', '🎧', '⌚', '📷', '🎮', '👕', '👟', '🏠', '🍔', '📚', '⚽', '🎨', '💄', 
  '🔧', '🚗', '✈️', '🏥', '🎓', '💰', '🎵', '🎬', '🏋️', '🍕', '☕', '🌸', '🎁', '💍',
  '🔌', '📺', '🖥️', '⌨️', '🖱️', '🎤', '🧳', '💡', '🔋', '🎯', '🏆', '🎪', '🎭', '🎸'
];

const colorOptions = [
  { name: 'Havo ko\'k', value: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' },
  { name: 'Yashil', value: 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' },
  { name: 'Qizil', value: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' },
  { name: 'Sariq', value: 'bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' },
  { name: 'Pushti', value: 'bg-pink-100 text-pink-600 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800' },
  { name: 'Binafsha', value: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800' },
  { name: 'To\'q ko\'k', value: 'bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800' },
  { name: 'To\'q yashil', value: 'bg-teal-100 text-teal-600 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800' },
  { name: 'Apelsinrang', value: 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' },
  { name: 'Kulrang', value: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800' },
  { name: 'Qo\'ng\'ir', value: 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' },
  { name: 'Moviy', value: 'bg-cyan-100 text-cyan-600 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800' },
];

export function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [formData, setFormData] = useState({
    name: '',
    icon: '📱',
    slug: '',
    color: colorOptions[0].value,
    order: 1,
    isActive: true,
    image: ''
  });

  // Load categories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('categories');
    if (saved) {
      setCategories(JSON.parse(saved));
    } else {
      // Default categories
      const defaultCategories: Category[] = [
        { 
          id: '1', 
          name: 'Elektronika', 
          icon: '📱', 
          slug: 'electronics', 
          color: colorOptions[0].value, 
          order: 1, 
          isActive: true, 
          productCount: 8, 
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          image: 'https://images.unsplash.com/photo-1758186355698-bd0183fc75ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        { 
          id: '2', 
          name: 'Kiyim', 
          icon: '👕', 
          slug: 'clothing', 
          color: colorOptions[4].value, 
          order: 2, 
          isActive: true, 
          productCount: 3, 
          createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
          image: 'https://images.unsplash.com/photo-1599012307530-d163bd04ecab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        { 
          id: '3', 
          name: 'Uy va bog\'', 
          icon: '🏠', 
          slug: 'home', 
          color: colorOptions[1].value, 
          order: 3, 
          isActive: true, 
          productCount: 1, 
          createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
          image: 'https://images.unsplash.com/photo-1621960144410-36da870e29b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        { 
          id: '4', 
          name: 'Sport', 
          icon: '⚽', 
          slug: 'sports', 
          color: colorOptions[8].value, 
          order: 4, 
          isActive: true, 
          productCount: 1, 
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          image: 'https://images.unsplash.com/photo-1658848507056-24ba67502b1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        { 
          id: '5', 
          name: 'Kitoblar', 
          icon: '📚', 
          slug: 'books', 
          color: colorOptions[10].value, 
          order: 5, 
          isActive: true, 
          productCount: 1, 
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          image: 'https://images.unsplash.com/photo-1582203914614-e23623afc345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
        { 
          id: '6', 
          name: 'Aksessuarlar', 
          icon: '⌚', 
          slug: 'accessories', 
          color: colorOptions[5].value, 
          order: 6, 
          isActive: false, 
          productCount: 0, 
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          image: 'https://images.unsplash.com/photo-1762513461072-5008c7f6511d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
        },
      ];
      setCategories(defaultCategories);
      localStorage.setItem('categories', JSON.stringify(defaultCategories));
    }
  }, []);

  const saveCategories = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  const generateSlug = (name: string) => {
    const cyrillicToLatin: { [key: string]: string } = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
      'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'ў': 'o\'', 'қ': 'q', 'ғ': 'g\'', 'ҳ': 'h'
    };

    return name
      .toLowerCase()
      .split('')
      .map(char => cyrillicToLatin[char] || char)
      .join('')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const slug = formData.slug || generateSlug(formData.name);
    
    if (editingCategory) {
      // Update existing category
      const updated = categories.map(c =>
        c.id === editingCategory.id
          ? { ...c, ...formData, slug }
          : c
      );
      saveCategories(updated);
    } else {
      // Add new category
      const newCategory: Category = {
        id: Date.now().toString(),
        ...formData,
        slug,
        productCount: 0,
        createdAt: new Date().toISOString()
      };
      saveCategories([...categories, newCategory]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '📱',
      slug: '',
      color: colorOptions[0].value,
      order: categories.length + 1,
      isActive: true,
      image: ''
    });
    setEditingCategory(null);
    setShowModal(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      slug: category.slug,
      color: category.color,
      order: category.order,
      isActive: category.isActive,
      image: category.image || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category && category.productCount && category.productCount > 0) {
      alert(`Bu katalogda ${category.productCount} ta mahsulot bor. Avval mahsulotlarni o'chiring yoki boshqa katalogga o'tkazing.`);
      return;
    }
    
    if (confirm('Katalogni o\'chirmoqchimisiz?')) {
      saveCategories(categories.filter(c => c.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    const updated = categories.map(c =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    saveCategories(updated);
  };

  const moveCategory = (id: string, direction: 'up' | 'down') => {
    const index = categories.findIndex(c => c.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === categories.length - 1)
    ) {
      return;
    }

    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
    
    // Update order
    const reordered = newCategories.map((c, i) => ({ ...c, order: i + 1 }));
    saveCategories(reordered);
  };

  const exportCategories = () => {
    const dataStr = JSON.stringify(categories, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `categories-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importCategories = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          saveCategories(imported);
          alert('Kataloglar muvaffaqiyatli import qilindi!');
        }
      } catch (error) {
        alert('Xatolik yuz berdi. Faylni tekshiring.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredCategories = useMemo(() => {
    return categories
      .filter(category => {
        const matchesSearch = searchInFields(category, ['name', 'slug'], debouncedSearchQuery);
        const matchesFilter = filterActive === 'all' || 
                             (filterActive === 'active' && category.isActive) ||
                             (filterActive === 'inactive' && !category.isActive);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => a.order - b.order);
  }, [categories, debouncedSearchQuery, filterActive]);

  const activeCategories = categories.filter(c => c.isActive).length;
  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">Mahsulot Kataloglari</h1>
          <p className="text-gray-600 dark:text-gray-400">Mahsulot kategoriyalarini boshqaring</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".json"
            onChange={importCategories}
            className="hidden"
            id="import-categories"
          />
          <button
            onClick={() => document.getElementById('import-categories')?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={exportCategories}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            <span>Katalog qo'shish</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <FolderTree className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Jami kataloglar</p>
              <p className="text-gray-900 dark:text-white text-2xl font-bold">{categories.length}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Faol kataloglar</p>
              <p className="text-gray-900 dark:text-white text-2xl font-bold">{activeCategories}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Jami mahsulotlar</p>
              <p className="text-gray-900 dark:text-white text-2xl font-bold">{totalProducts}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <EyeOff className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Nofaol</p>
              <p className="text-gray-900 dark:text-white text-2xl font-bold">{categories.length - activeCategories}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Katalog nomi yoki slug bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            {['all', 'active', 'inactive'].map(filter => (
              <button
                key={filter}
                onClick={() => setFilterActive(filter as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterActive === filter
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter === 'all' ? 'Barchasi' : filter === 'active' ? 'Faol' : 'Nofaol'}
              </button>
            ))}
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Grid className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <List className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid/List */}
      {filteredCategories.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center"
        >
          <FolderTree className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery ? 'Hech narsa topilmadi' : 'Hozircha kataloglar yo\'q'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Birinchi katalogni qo'shish
            </button>
          )}
        </motion.div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          <AnimatePresence mode="popLayout">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 transition hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 ${
                  !category.isActive ? 'opacity-50' : ''
                } ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}
              >
                {/* Image & Icon */}
                <div className={`${viewMode === 'list' ? 'w-24 h-24' : 'w-full h-32'} relative rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600`}>
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl">{category.icon}</span>
                    </div>
                  )}
                  <div className={`absolute top-2 left-2 w-10 h-10 rounded-lg flex items-center justify-center text-2xl border-2 ${category.color}`}>
                    {category.icon}
                  </div>
                </div>

                {/* Content */}
                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-gray-900 dark:text-white font-semibold mb-1">{category.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">/{category.slug}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      category.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {category.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-600 dark:text-gray-400">
                      📦 {category.productCount || 0} mahsulot
                    </span>
                    <span className="text-gray-500 dark:text-gray-500 text-xs">
                      #{category.order}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => moveCategory(category.id, 'up')}
                      disabled={index === 0}
                      className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Yuqoriga"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveCategory(category.id, 'down')}
                      disabled={index === filteredCategories.length - 1}
                      className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Pastga"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(category.id)}
                      className={`p-1.5 rounded transition ${
                        category.isActive
                          ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                          : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                      }`}
                      title={category.isActive ? 'Nofaol qilish' : 'Faol qilish'}
                    >
                      {category.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10 flex items-center justify-between">
                <h2 className="text-gray-900 dark:text-white font-semibold text-xl">
                  {editingCategory ? 'Katalogni tahrirlash' : 'Yangi katalog qo\'shish'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Katalog nomi *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        name: e.target.value,
                        slug: generateSlug(e.target.value)
                      });
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="Masalan: Elektronika"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">URL slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="electronics"
                  />
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1.5">URL'da ishlatiladi: /category/{formData.slug}</p>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Rasm URL (ixtiyoriy)</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Icon tanlang *</label>
                  <div className="grid grid-cols-8 md:grid-cols-12 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`p-3 text-2xl rounded-lg border-2 transition hover:scale-110 ${
                          formData.icon === icon
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Rang tanlang *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`p-3 rounded-lg border-2 transition ${color.value} ${
                          formData.color === color.value
                            ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800 scale-105'
                            : 'hover:scale-105'
                        }`}
                      >
                        <span className="text-sm font-medium">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Tartib raqami *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1.5">Kichik raqam birinchi ko'rinadi</p>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <label htmlFor="isActive" className="text-gray-700 dark:text-gray-300 font-medium">
                    Katalogni darhol faol qilish
                  </label>
                </div>

                {/* Preview */}
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 font-medium">Ko'rinish:</p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 ${formData.color}`}>
                      <span className="text-3xl">{formData.icon}</span>
                      <div>
                        <span className="font-semibold">{formData.name || 'Katalog nomi'}</span>
                        <p className="text-xs opacity-75">/{formData.slug || 'slug'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium"
                  >
                    {editingCategory ? 'O\'zgarishlarni saqlash' : 'Katalog qo\'shish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}