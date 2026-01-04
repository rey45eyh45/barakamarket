import { useState } from 'react';
import { X, Upload, Plus, Minus, Package, DollarSign, Tag, Calendar, Shield, RotateCcw, Info, Star } from 'lucide-react';
import { Product } from '../../types';
import { Button, IconButton } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface AddProductFormProps {
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id'>) => void;
  vendorId: string;
}

export function AddProductForm({ onClose, onSubmit, vendorId }: AddProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '', // Avvalgi narx (chegirma uchun)
    category: 'elektronika',
    description: '',
    stock: '',
    
    // Discount
    discount: '',
    
    // Product Details
    warranty: '', // Kafolat muddati
    returnPolicy: '', // Qaytarish muddati
    
    // Additional
    brand: '',
    material: '',
    color: '',
    size: '',
    weight: '',
    dimensions: '',
    madeIn: ''
  });

  const [images, setImages] = useState<string[]>(['']);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const categories = [
    { id: 'elektronika', name: 'Elektronika' },
    { id: 'kiyim', name: 'Kiyim-kechak' },
    { id: 'kitoblar', name: 'Kitoblar' },
    { id: 'uy-buyumlari', name: 'Uy buyumlari' },
    { id: 'sport', name: 'Sport' },
    { id: 'bolalar', name: 'Bolalar uchun' },
    { id: 'oziq-ovqat', name: 'Oziq-ovqat' },
    { id: 'boshqa', name: 'Boshqa' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = parseFloat(formData.price);
    const originalPrice = formData.originalPrice ? parseFloat(formData.originalPrice) : undefined;
    const discount = formData.discount ? parseFloat(formData.discount) : undefined;
    
    const product: Omit<Product, 'id'> = {
      name: formData.name,
      price,
      originalPrice,
      discount,
      category: formData.category,
      description: formData.description,
      image: images.filter(img => img).find(img => img) || '', // First valid image
      images: images.filter(img => img), // All valid images
      stock: formData.stock ? parseInt(formData.stock) : undefined,
      vendorId,
      
      // Product Details
      warranty: formData.warranty || undefined,
      returnPolicy: formData.returnPolicy || undefined,
      
      // Additional
      brand: formData.brand || undefined,
      material: formData.material || undefined,
      color: formData.color || undefined,
      size: formData.size || undefined,
      weight: formData.weight || undefined,
      dimensions: formData.dimensions || undefined,
      madeIn: formData.madeIn || undefined,
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSubmit(product);
    onClose();
  };

  const addImageField = () => {
    if (images.length < 5) {
      setImages([...images, '']);
    }
  };

  const removeImageField = (index: number) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  // Calculate discount automatically
  const calculateDiscount = () => {
    const price = parseFloat(formData.price);
    const originalPrice = parseFloat(formData.originalPrice);
    
    if (originalPrice && price && originalPrice > price) {
      const discount = ((originalPrice - price) / originalPrice * 100).toFixed(0);
      setFormData({ ...formData, discount });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between z-10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white font-bold">Yangi mahsulot qo'shish</h2>
              <p className="text-blue-100 text-sm">To'liq ma'lumotlarni kiriting</p>
            </div>
          </div>
          <IconButton
            icon={<X />}
            variant="ghost"
            size="md"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Basic Info Section */}
            <Card variant="outlined" padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-gray-900 dark:text-white font-semibold">Asosiy ma'lumotlar</h3>
              </div>
              
              <div className="space-y-4">
                {/* Product Name */}
                <Input
                  label="Mahsulot nomi"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masalan: Samsung Galaxy A54"
                  required
                />

                {/* Category */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                    Kategoriya <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-700 transition"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                    Mahsulot tavsifi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-700 min-h-[120px] transition resize-none"
                    placeholder="Mahsulot haqida to'liq ma'lumot kiriting..."
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Price & Discount Section */}
            <Card variant="outlined" padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-gray-900 dark:text-white font-semibold">Narx va chegirma</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Price (Optional) */}
                  <Input
                    label="Avvalgi narx (ixtiyoriy)"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => {
                      setFormData({ ...formData, originalPrice: e.target.value });
                      setTimeout(calculateDiscount, 100);
                    }}
                    placeholder="0"
                    min="0"
                    icon={<Tag />}
                  />

                  {/* Current Price */}
                  <Input
                    label="Hozirgi narx (so'm)"
                    type="number"
                    value={formData.price}
                    onChange={(e) => {
                      setFormData({ ...formData, price: e.target.value });
                      setTimeout(calculateDiscount, 100);
                    }}
                    placeholder="0"
                    min="0"
                    required
                    icon={<DollarSign />}
                  />
                </div>

                {/* Discount Display */}
                {formData.originalPrice && formData.price && parseFloat(formData.originalPrice) > parseFloat(formData.price) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-900 text-sm font-medium">Chegirma:</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-500 line-through text-sm">
                            {new Intl.NumberFormat('uz-UZ').format(parseFloat(formData.originalPrice))} so'm
                          </span>
                          <span className="text-green-600 font-bold">
                            {new Intl.NumberFormat('uz-UZ').format(parseFloat(formData.price))} so'm
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                          -{formData.discount}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </Card>

            {/* Stock Section */}
            <Card variant="outlined" padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-gray-900 dark:text-white font-semibold">Ombor</h3>
              </div>
              
              <Input
                label="Mahsulot soni"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                min="0"
                icon={<Package />}
                helperText="Omborda mavjud mahsulotlar soni"
              />
            </Card>

            {/* Warranty & Return Section */}
            <Card variant="outlined" padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-gray-900 dark:text-white font-semibold">Kafolat va qaytarish</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Kafolat muddati (ixtiyoriy)"
                  type="text"
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  placeholder="Masalan: 12 oy, 2 yil"
                  icon={<Shield />}
                />

                <Input
                  label="Qaytarish muddati (ixtiyoriy)"
                  type="text"
                  value={formData.returnPolicy}
                  onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
                  placeholder="Masalan: 14 kun, 30 kun"
                  icon={<RotateCcw />}
                />
              </div>
            </Card>

            {/* Images Section */}
            <Card variant="outlined" padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-gray-900 dark:text-white font-semibold">Rasmlar</h3>
              </div>
              
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {images.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-2"
                    >
                      <Input
                        type="url"
                        value={image}
                        onChange={(e) => updateImage(index, e.target.value)}
                        placeholder={index === 0 ? "Asosiy rasm URL (majburiy)" : "Qo'shimcha rasm URL"}
                        required={index === 0}
                      />
                      {index > 0 && (
                        <IconButton
                          icon={<Minus />}
                          variant="destructive"
                          size="md"
                          onClick={() => removeImageField(index)}
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {images.length < 5 && (
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    icon={<Plus />}
                    onClick={addImageField}
                  >
                    Rasm qo'shish ({images.length}/5)
                  </Button>
                )}
              </div>
            </Card>

            {/* Advanced Fields (Optional) */}
            <Card variant="outlined" padding="lg">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-gray-900 dark:text-white font-semibold mb-4"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span>Qo'shimcha ma'lumotlar (ixtiyoriy)</span>
                </div>
                <motion.div
                  animate={{ rotate: showAdvanced ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="w-5 h-5" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Brend"
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="Masalan: Samsung"
                      />

                      <Input
                        label="Rang"
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="Masalan: Qora, Oq"
                      />

                      <Input
                        label="Material"
                        type="text"
                        value={formData.material}
                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                        placeholder="Masalan: Plastik, Metal"
                      />

                      <Input
                        label="O'lcham"
                        type="text"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        placeholder="Masalan: L, XL, 42"
                      />

                      <Input
                        label="Og'irlik"
                        type="text"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="Masalan: 500g, 2kg"
                      />

                      <Input
                        label="O'lchamlari"
                        type="text"
                        value={formData.dimensions}
                        onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                        placeholder="Masalan: 30x20x10 cm"
                      />

                      <Input
                        label="Ishlab chiqarilgan"
                        type="text"
                        value={formData.madeIn}
                        onChange={(e) => setFormData({ ...formData, madeIn: e.target.value })}
                        placeholder="Masalan: Xitoy, AQSh"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 pt-6 pb-2 mt-6 border-t dark:border-gray-700 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={onClose}
              className="flex-1"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={<Plus />}
              className="flex-1"
            >
              Mahsulot qo'shish
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}