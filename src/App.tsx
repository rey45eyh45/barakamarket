import { useState, useEffect } from 'react';
import { saveCart, getCart, saveFavorites, getFavorites } from './utils/storage';
import { createOrderNotification, createSystemNotification } from './utils/notifications';
import { sendVendorApprovalEmail, sendVendorRejectionEmail } from './utils/emailNotifications';
import { Toaster } from './components/ui/sonner';
import { TelegramProvider } from './contexts/TelegramContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductGrid } from './components/ProductGrid';
import { ProductModal } from './components/ProductModal';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { MyOrders } from './components/MyOrders';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './components/HomePage';
import { CatalogPage } from './components/CatalogPage';
import { FavoritesPage } from './components/FavoritesPage';
import { CartPage } from './components/CartPage';
import { ProfilePage } from './components/ProfilePage';
import { AuthPage } from './components/AuthPage';
import { VendorRegistration } from './components/VendorRegistration';
import { VendorRegistrationSuccess } from './components/VendorRegistrationSuccess';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { VendorsManagement } from './components/admin/VendorsManagement';
import { BannersManagement } from './components/admin/BannersManagement';
import { CategoriesManagement } from './components/admin/CategoriesManagement';
import { UsersManagement } from './components/admin/UsersManagement';
import { ProductsManagement } from './components/admin/ProductsManagement';
import { OrdersManagement } from './components/admin/OrdersManagement';
import { SettingsManagement } from './components/admin/SettingsManagement';
import { SupportManagement } from './components/admin/SupportManagement';
import { PromoCodesManagement } from './components/admin/PromoCodesManagement';
import { ShippingManagement } from './components/admin/ShippingManagement';
import { VendorDashboard } from './components/vendor/VendorDashboard';
import { AddProductForm } from './components/vendor/AddProductForm';
import { EditProductForm } from './components/vendor/EditProductForm';
import { VendorOrdersManagement } from './components/vendor/VendorOrdersManagement';
import { VendorRevenue } from './components/vendor/VendorRevenue';
import { AdminSetup } from './components/AdminSetup';
import { NotificationsPage } from './components/NotificationsPage';
import { SettingsPage } from './components/SettingsPage';
import { HelpPage } from './components/HelpPage';
import { AddressesPage } from './components/AddressesPage';
import { Product, CartItem, ProductVariant } from './types';
import { VendorProfile, AdminStats } from './types/roles';
import { COLOR_VARIANTS, SIZE_VARIANTS, CAPACITY_VARIANTS } from './types/variant';
import { SpinWheelManagement } from './components/admin/SpinWheelManagement';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: "Samsung Galaxy A54",
    price: 3500000,
    category: 'elektronika',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',
    description: '6GB RAM, 128GB, Super AMOLED ekran',
    stock: 25,
    lowStockThreshold: 5,
    // Variant support
    hasVariants: true,
    variantGroups: [
      {
        type: 'color',
        label: 'Rang',
        options: [
          COLOR_VARIANTS[0], // red
          COLOR_VARIANTS[1], // blue
          COLOR_VARIANTS[3]  // black
        ]
      },
      {
        type: 'capacity',
        label: 'Xotira',
        options: [
          CAPACITY_VARIANTS[1], // 128GB
          CAPACITY_VARIANTS[2], // 256GB
          CAPACITY_VARIANTS[3]  // 512GB
        ]
      }
    ],
    variants: [
      {
        id: 'v1-red-128',
        productId: '1',
        options: [
          { id: 'red', type: 'color', name: 'Qizil', value: 'red' },
          { id: '128gb', type: 'capacity', name: '128GB', value: '128gb' }
        ],
        price: 3500000,
        stock: 10,
        isAvailable: true
      },
      {
        id: 'v1-red-256',
        productId: '1',
        options: [
          { id: 'red', type: 'color', name: 'Qizil', value: 'red' },
          { id: '256gb', type: 'capacity', name: '256GB', value: '256gb' }
        ],
        price: 3550000,
        stock: 8,
        isAvailable: true
      },
      {
        id: 'v1-blue-128',
        productId: '1',
        options: [
          { id: 'blue', type: 'color', name: "Ko'k", value: 'blue' },
          { id: '128gb', type: 'capacity', name: '128GB', value: '128gb' }
        ],
        price: 3500000,
        stock: 5,
        isAvailable: true
      },
      {
        id: 'v1-blue-256',
        productId: '1',
        options: [
          { id: 'blue', type: 'color', name: "Ko'k", value: 'blue' },
          { id: '256gb', type: 'capacity', name: '256GB', value: '256gb' }
        ],
        price: 3550000,
        stock: 0,
        isAvailable: false
      },
      {
        id: 'v1-black-128',
        productId: '1',
        options: [
          { id: 'black', type: 'color', name: 'Qora', value: 'black' },
          { id: '128gb', type: 'capacity', name: '128GB', value: '128gb' }
        ],
        price: 3500000,
        stock: 2,
        isAvailable: true
      }
    ]
  },
  {
    id: '2',
    name: "Apple iPhone 13",
    price: 8500000,
    category: 'elektronika',
    image: 'https://images.unsplash.com/photo-1592286927505-b0501739c188?w=400',
    description: '128GB, A15 Bionic chip, iOS',
    stock: 3,
    lowStockThreshold: 5
  },
  {
    id: '3',
    name: "Nike Air Max",
    price: 850000,
    category: 'kiyim',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    description: 'Sport poyabzal, yuqori sifat',
    stock: 50,
    lowStockThreshold: 10
  },
  {
    id: '4',
    name: "Adidas Klassik",
    price: 650000,
    category: 'kiyim',
    image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=400',
    description: 'Klassik dizayn, barcha o\'lchamlar',
    stock: 0,
    lowStockThreshold: 10
  },
  {
    id: '5',
    name: "MacBook Pro 14",
    price: 25000000,
    category: 'elektronika',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    description: 'M3 chip, 16GB RAM, 512GB SSD',
    stock: 8,
    lowStockThreshold: 3
  },
  {
    id: '6',
    name: "Sony WH-1000XM5",
    price: 3200000,
    category: 'elektronika',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
    description: 'Shovqinni yo\'qotuvchi quloqchin',
    stock: 15,
    lowStockThreshold: 5
  },
  {
    id: '7',
    name: "Kitob: Rich Dad Poor Dad",
    price: 75000,
    category: 'kitoblar',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    description: 'Robert Kiyosaki, moliyaviy savodxonlik',
    stock: 100,
    lowStockThreshold: 20
  },
  {
    id: '8',
    name: "Kitob: Atomic Habits",
    price: 85000,
    category: 'kitoblar',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    description: 'James Clear, odatlar haqida',
    stock: 2,
    lowStockThreshold: 10
  },
  {
    id: '9',
    name: "Uy dekor - Vazalar to'plami",
    price: 250000,
    category: 'uy-buyumlari',
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400',
    description: 'Zamonaviy dizayn, 3 dona',
    stock: 30,
    lowStockThreshold: 5
  },
  {
    id: '10',
    name: "LED Chiroq",
    price: 180000,
    category: 'uy-buyumlari',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400',
    description: 'Energiya tejovchi, sovuq yorug\'lik',
    stock: 45,
    lowStockThreshold: 10
  },
  {
    id: '11',
    name: "Futbolka - O'zbekiston",
    price: 120000,
    category: 'kiyim',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    description: '100% paxta, barcha o\'lchamlar',
    stock: 1,
    lowStockThreshold: 5
  },
  {
    id: '12',
    name: "Smartwatch Xiaomi Band 8",
    price: 450000,
    category: 'elektronika',
    image: 'https://images.unsplash.com/photo-1523475496153-3d6cc0f0bf19?w=400',
    description: 'Fitness tracker, yurak urishi monitoring',
    stock: 20,
    lowStockThreshold: 5
  }
];

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'catalog' | 'favorites' | 'cart' | 'profile'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showMyOrders, setShowMyOrders] = useState(false);
  
  // Vendor/Admin states
  const [showVendorRegistration, setShowVendorRegistration] = useState(false);
  const [showVendorRegistrationSuccess, setShowVendorRegistrationSuccess] = useState(false);
  const [vendorRegistrationData, setVendorRegistrationData] = useState({ storeName: '' });
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [adminPage, setAdminPage] = useState('dashboard');
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showVendorOrders, setShowVendorOrders] = useState(false);
  const [showVendorRevenue, setShowVendorRevenue] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  // Profile sub-pages
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);

  // Initialize products from localStorage or use MOCK_PRODUCTS as default
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('all_products');
      if (storedProducts) {
        const parsed = JSON.parse(storedProducts);
        // Filter out iPhone 13 (id: '2') from existing data
        const filtered = parsed.filter((p: Product) => p.id !== '2');
        setAllProducts(filtered);
        localStorage.setItem('all_products', JSON.stringify(filtered));
        console.log('✅ iPhone 13 olib tashlandi va localStorage yangilandi');
      } else {
        // First time - save MOCK_PRODUCTS to localStorage
        localStorage.setItem('all_products', JSON.stringify(MOCK_PRODUCTS));
        setAllProducts(MOCK_PRODUCTS);
      }
    } catch (error) {
      console.error('Error loading products from localStorage:', error);
      setAllProducts(MOCK_PRODUCTS);
    }
    
    // Initialize demo banner if no banners exist
    try {
      const storedBanners = localStorage.getItem('banners');
      if (!storedBanners) {
        const demoBanner = [
          {
            id: 'demo_banner_1',
            title: 'Yozgi mega chegirma!',
            description: 'Barcha mahsulotlarga 50% gacha chegirma',
            imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
            isActive: true,
            order: 1,
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('banners', JSON.stringify(demoBanner));
        console.log('✅ Demo banner qo\'shildi!');
      }
    } catch (error) {
      console.error('Error initializing demo banner:', error);
    }
    
    // ✅ YANGI: Initialize vendor application for 23komilov@gmail.com
    try {
      const existingVendor = localStorage.getItem('vendor_user_komilov');
      if (!existingVendor) {
        const komilovVendor = {
          id: 'user_komilov',
          storeName: 'Komilov Store',
          storeDescription: 'Sifatli mahsulotlar',
          address: 'Toshkent, O\'zbekiston',
          phone: '+998901234567',
          email: '23komilov@gmail.com',
          ownerName: 'Komilov',
          status: 'pending',
          rating: 0,
          totalSales: 0,
          commission: 10,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('vendor_user_komilov', JSON.stringify(komilovVendor));
        console.log('✅ Vendor ariza yaratildi: 23komilov@gmail.com');
      }
    } catch (error) {
      console.error('Error initializing vendor application:', error);
    }
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      const storedCart = await getCart();
      if (storedCart && storedCart.length > 0) {
        setCartItems(storedCart);
        console.log(`🛒 Loaded cart: ${storedCart.length} items`);
      }
    };
    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const saveCartData = async () => {
      await saveCart(cartItems);
      if (cartItems.length > 0) {
        console.log(`💾 Saved cart: ${cartItems.length} items`);
      }
    };
    saveCartData();
  }, [cartItems]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const loadFavorites = async () => {
      const storedFavorites = await getFavorites();
      if (storedFavorites && storedFavorites.length > 0) {
        setFavoriteIds(storedFavorites);
        console.log(`❤️ Loaded favorites: ${storedFavorites.length} items`);
      }
    };
    loadFavorites();
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    const saveFavoritesData = async () => {
      await saveFavorites(favoriteIds);
      if (favoriteIds.length > 0) {
        console.log(`💾 Saved favorites: ${favoriteIds.length} items`);
      }
    };
    saveFavoritesData();
  }, [favoriteIds]);

  // Apply theme on component mount and listen for changes
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      const root = document.documentElement;
      
      if (savedTheme === 'auto') {
        // Detect system theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      } else if (savedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for theme changes in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        applyTheme();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for system theme changes when auto is selected
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'auto') {
        applyTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  // Initialize default admin if no admin exists
  useEffect(() => {
    const initializeAdmin = () => {
      try {
        const usersData = localStorage.getItem('users');
        const users: Record<string, { password: string; user: any }> = usersData ? JSON.parse(usersData) : {};
        
        // Check if any admin exists
        const hasAdmin = Object.values(users).some(entry => entry.user.role === 'admin');
        
        if (!hasAdmin) {
          console.log('🔧 No admin found, creating default admin...');
          
          // Create default admin
          const adminEmail = 'ibrohimkomilov001@gmail.com';
          users[adminEmail] = {
            password: 'Telegraph2019@',
            user: {
              id: `admin_${Date.now()}`,
              email: adminEmail,
              name: 'Super Admin',
              role: 'admin'
            }
          };
          
          localStorage.setItem('users', JSON.stringify(users));
          console.log('✅ Default admin created successfully!');
        }
      } catch (error) {
        console.error('❌ Error initializing admin:', error);
      }
    };
    
    initializeAdmin();
  }, []);

  // Load vendor profile if user is vendor
  useEffect(() => {
    if (user?.role === 'vendor') {
      loadVendorProfile();
    }
  }, [user]);

  // Load admin data if user is admin
  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user, allProducts]);

  const loadVendorProfile = () => {
    try {
      const stored = localStorage.getItem(`vendor_${user?.id}`);
      if (stored) {
        setVendorProfile(JSON.parse(stored));
      }
      const storedProducts = localStorage.getItem(`vendor_products_${user?.id}`);
      if (storedProducts) {
        setVendorProducts(JSON.parse(storedProducts));
      }
    } catch (error) {
      console.error('Failed to load vendor profile:', error);
    }
  };

  const loadAdminData = () => {
    try {
      // ✅ TUZATISH: Load all vendors including demo vendors and pending applications
      const allVendors: VendorProfile[] = [];
      const loadedVendorIds = new Set<string>(); // Track loaded vendors to avoid duplicates
      let totalUsers = 0;
      
      // 1. Load demo vendors (vendor_demo_tech, vendor_demo_fashion, etc.)
      const demoVendorKeys = ['vendor_demo_tech', 'vendor_demo_fashion', 'vendor_demo_book', 'vendor_demo_decor', 'vendor_demo_sport'];
      for (const key of demoVendorKeys) {
        const demoVendorData = localStorage.getItem(`vendor_${key}`);
        if (demoVendorData) {
          try {
            const vendor = JSON.parse(demoVendorData);
            allVendors.push(vendor);
            loadedVendorIds.add(vendor.id);
          } catch (err) {
            console.error(`Error parsing ${key}:`, err);
          }
        }
      }
      
      // 2. Load ALL vendor_* entries from localStorage (including pending applications)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('vendor_') && !key.startsWith('vendor_products_')) {
          // Skip demo vendors (already loaded)
          if (demoVendorKeys.some(demoKey => key === `vendor_${demoKey}`)) {
            continue;
          }
          
          try {
            const vendorData = localStorage.getItem(key);
            if (vendorData) {
              const vendor = JSON.parse(vendorData);
              // Avoid duplicates
              if (!loadedVendorIds.has(vendor.id)) {
                allVendors.push(vendor);
                loadedVendorIds.add(vendor.id);
                console.log('📦 Loaded vendor from localStorage:', vendor.storeName, vendor.status);
              }
            }
          } catch (err) {
            console.error(`Error parsing ${key}:`, err);
          }
        }
      }
      
      // 3. Count total users
      const usersData = localStorage.getItem('users');
      if (usersData) {
        const users = JSON.parse(usersData);
        totalUsers = Object.keys(users).length;
      }
      
      setVendors(allVendors);
      
      // Calculate stats
      const stats: AdminStats = {
        totalUsers: totalUsers,
        totalVendors: allVendors.length,
        activeVendors: allVendors.filter(v => v.status === 'active').length,
        pendingVendors: allVendors.filter(v => v.status === 'pending').length,
        totalProducts: allProducts.length,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0
      };
      setAdminStats(stats);
      console.log('✅ Admin data loaded:', { 
        totalVendors: allVendors.length, 
        pending: stats.pendingVendors,
        active: stats.activeVendors,
        vendors: allVendors.map(v => ({ name: v.storeName, status: v.status }))
      });
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  };

  const handleVendorRegistration = (data: {
    storeName: string;
    storeDescription: string;
    address: string;
    phone: string;
    email: string;
    ownerName: string;
    businessLicense?: string;
    logo?: string;
  }) => {
    try {
      console.log('🏪 Creating vendor registration...', { userId: user?.id, data });
      
      const newVendor: VendorProfile = {
        id: user?.id || '',
        storeName: data.storeName,
        storeDescription: data.storeDescription,
        address: data.address,
        phone: data.phone,
        email: data.email,
        ownerName: data.ownerName,
        businessLicense: data.businessLicense,
        storeLogo: data.logo,
        status: 'pending',
        rating: 0,
        totalSales: 0,
        commission: 10, // Default 10%
        createdAt: new Date().toISOString()
      };
      
      const storageKey = `vendor_${user?.id}`;
      console.log('💾 Saving to localStorage:', storageKey, newVendor);
      localStorage.setItem(storageKey, JSON.stringify(newVendor));
      
      // Verify it was saved
      const verification = localStorage.getItem(storageKey);
      console.log('✅ Verification - data saved:', verification ? 'YES' : 'NO');
      
      setVendorProfile(newVendor);
      setShowVendorRegistration(false);
      setShowVendorRegistrationSuccess(true);
      
      console.log('✅ Vendor registration successful:', newVendor);
    } catch (error) {
      console.error('❌ Vendor registration failed:', error);
      alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  };

  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    try {
      const newProduct: Product = {
        ...productData,
        id: `product_${Date.now()}`
      };
      
      // Add to vendor's products
      const updatedVendorProducts = [...vendorProducts, newProduct];
      setVendorProducts(updatedVendorProducts);
      localStorage.setItem(`vendor_products_${user?.id}`, JSON.stringify(updatedVendorProducts));
      
      // ✅ IMPORTANT: Add to all_products so customers can see it
      const updatedAllProducts = [...allProducts, newProduct];
      setAllProducts(updatedAllProducts);
      localStorage.setItem('all_products', JSON.stringify(updatedAllProducts));
      
      setShowAddProduct(false);
      alert('Mahsulot muvaffaqiyatli qo\'shildi! Endi bozorda ko\'rinadi.');
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  };

  const handleEditProduct = (productData: Product) => {
    try {
      // Update in vendor's products
      const updatedVendorProducts = vendorProducts.map(product =>
        product.id === productData.id ? productData : product
      );
      setVendorProducts(updatedVendorProducts);
      localStorage.setItem(`vendor_products_${user?.id}`, JSON.stringify(updatedVendorProducts));
      
      // ✅ IMPORTANT: Update in all_products so customers see changes
      const updatedAllProducts = allProducts.map(product =>
        product.id === productData.id ? productData : product
      );
      setAllProducts(updatedAllProducts);
      localStorage.setItem('all_products', JSON.stringify(updatedAllProducts));
      
      setShowEditProduct(false);
      setEditingProduct(null);
      alert('Mahsulot muvaffaqiyatli o\'zgartirildi!');
    } catch (error) {
      console.error('Failed to edit product:', error);
      alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  };

  const handleDeleteProduct = (productId: string) => {
    try {
      if (confirm('Mahsulotni o\'chirishni xohlaysizmi?')) {
        // Delete from vendor's products
        const updatedVendorProducts = vendorProducts.filter(product => product.id !== productId);
        setVendorProducts(updatedVendorProducts);
        localStorage.setItem(`vendor_products_${user?.id}`, JSON.stringify(updatedVendorProducts));
        
        // ✅ IMPORTANT: Delete from all_products so it disappears from marketplace
        const updatedAllProducts = allProducts.filter(product => product.id !== productId);
        setAllProducts(updatedAllProducts);
        localStorage.setItem('all_products', JSON.stringify(updatedAllProducts));
        
        alert('Mahsulot muvaffaqiyatli o\'chirildi!');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  };

  const handleApproveVendor = (vendorId: string) => {
    try {
      const vendorData = localStorage.getItem(`vendor_${vendorId}`);
      if (vendorData) {
        const vendor = JSON.parse(vendorData);
        vendor.status = 'active'; // 'approved' emas, 'active' bo'lishi kerak
        localStorage.setItem(`vendor_${vendorId}`, JSON.stringify(vendor));
        
        // vendors state'ini ham yangilash
        const updatedVendors = vendors.map(v => 
          v.id === vendorId ? { ...v, status: 'active' } : v
        );
        setVendors(updatedVendors);
        
        loadAdminData();
        alert('Do\'kon tasdiqlandi va faol holatga o\'tkazildi!');
        
        // Send approval email
        if (vendor.email) {
          sendVendorApprovalEmail(vendor.email, vendor.storeName, vendorId);
        }
      } else {
        alert('Do\'kon topilmadi!');
      }
    } catch (error) {
      console.error('Failed to approve vendor:', error);
      alert('Xatolik yuz berdi.');
    }
  };

  const handleSuspendVendor = (vendorId: string) => {
    try {
      const vendorData = localStorage.getItem(`vendor_${vendorId}`);
      if (vendorData) {
        const vendor = JSON.parse(vendorData);
        vendor.status = 'suspended';
        localStorage.setItem(`vendor_${vendorId}`, JSON.stringify(vendor));
        loadAdminData();
        alert('Do\'kon to\'xtatildi!');
        
        // Send rejection email with reason
        if (vendor.email) {
          sendVendorRejectionEmail(
            vendor.email,
            vendor.storeName,
            'Arizangiz talablarga javob bermadi. Iltimos, to\'liqroq ma\'lumot kiritib qayta yuborishingizni so\'raymiz.',
            vendorId
          );
        }
      }
    } catch (error) {
      console.error('Failed to suspend vendor:', error);
      alert('Xatolik yuz berdi.');
    }
  };

  const handleRejectVendor = (vendorId: string, reason?: string) => {
    try {
      const vendorData = localStorage.getItem(`vendor_${vendorId}`);
      if (vendorData) {
        const vendor = JSON.parse(vendorData);
        vendor.status = 'rejected';
        vendor.rejectedAt = new Date().toISOString();
        vendor.rejectionReason = reason || 'Ariza rad etildi';
        localStorage.setItem(`vendor_${vendorId}`, JSON.stringify(vendor));
        
        // Update vendors state
        const updatedVendors = vendors.map(v => 
          v.id === vendorId ? { ...v, status: 'rejected' as any } : v
        );
        setVendors(updatedVendors);
        
        loadAdminData();
        alert('Do\'kon arizasi rad etildi!');
        
        // Send rejection email with reason
        if (vendor.email) {
          sendVendorRejectionEmail(
            vendor.email,
            vendor.storeName,
            reason || 'Arizangiz talablarga javob bermadi. Iltimos, to\'liqroq ma\'lumot kiritib qayta yuborishingizni so\'raymiz.',
            vendorId
          );
        }
      } else {
        alert('Do\'kon topilmadi!');
      }
    } catch (error) {
      console.error('Failed to reject vendor:', error);
      alert('Xatolik yuz berdi.');
    }
  };

  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const favoriteProducts = allProducts.filter(product => favoriteIds.includes(product.id));

  const toggleFavorite = (productId: string) => {
    setFavoriteIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (product: Product, variant?: ProductVariant) => {
    setCartItems(prev => {
      // If variant provided, check if same variant exists
      if (variant) {
        const existing = prev.find(
          item => item.product.id === product.id && item.selectedVariant?.id === variant.id
        );
        if (existing) {
          return prev.map(item =>
            item.product.id === product.id && item.selectedVariant?.id === variant.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { product, quantity: 1, selectedVariant: variant }];
      }
      
      // Without variant
      const existing = prev.find(item => item.product.id === product.id && !item.selectedVariant);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && !item.selectedVariant
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCartItems(prev => prev.filter(item => {
      if (variantId) {
        return !(item.product.id === productId && item.selectedVariant?.id === variantId);
      }
      return !(item.product.id === productId && !item.selectedVariant);
    }));
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => {
        if (variantId) {
          // Update item with matching product ID and variant ID
          return item.product.id === productId && item.selectedVariant?.id === variantId
            ? { ...item, quantity }
            : item;
        }
        // Update item with matching product ID and no variant
        return item.product.id === productId && !item.selectedVariant
          ? { ...item, quantity }
          : item;
      })
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleOrderComplete = () => {
    // Create notification for order
    const orderId = `order_${Date.now()}`;
    createOrderNotification(orderId, 'pending', user?.id);
    
    setCartItems([]);
    setShowCheckout(false);
    setShowMyOrders(true);
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentPage('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show auth page
  if (!user) {
    return <AuthPage onLogin={() => {}} />;
  }

  // Admin Panel
  if (user.role === 'admin') {
    const renderAdminPage = () => {
      if (!adminStats) {
        return (
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
              </div>
            </div>
          </div>
        );
      }
      
      switch (adminPage) {
        case 'dashboard':
          return <AdminDashboard stats={adminStats} />;
        case 'banners':
          return <BannersManagement />;
        case 'categories':
          return <CategoriesManagement />;
        case 'vendors':
          return (
            <VendorsManagement
              vendors={vendors}
              onApprove={handleApproveVendor}
              onReject={(id) => handleRejectVendor(id)}
              onRejectWithReason={handleRejectVendor}
              onSuspend={handleSuspendVendor}
            />
          );
        case 'products':
          return <ProductsManagement />;
        case 'users':
          return <UsersManagement />;
        case 'orders':
          return <OrdersManagement />;
        case 'spin-wheel':
          return <SpinWheelManagement />;
        case 'settings':
          return <SettingsManagement />;
        case 'support':
          return <SupportManagement />;
        case 'promo-codes':
          return <PromoCodesManagement />;
        case 'shipping':
          return <ShippingManagement />;
        default:
          return <AdminDashboard stats={adminStats} />;
      }
    };

    return (
      <AdminLayout
        currentPage={adminPage}
        onNavigate={setAdminPage}
        onLogout={handleLogout}
        userName={user.name}
      >
        {renderAdminPage()}
      </AdminLayout>
    );
  }

  // Vendor Panel
  if (user.role === 'vendor') {
    if (!vendorProfile) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Vendor profili yuklanmoqda...</p>
          </div>
        </div>
      );
    }

    // Filter products to show only vendor's products from allProducts
    const vendorAllProducts = allProducts.filter(
      product => product.vendorId === vendorProfile.id
    );

    // Combine with vendorProducts state (newly added products)
    const combinedVendorProducts = [...vendorAllProducts, ...vendorProducts];

    return (
      <div className="min-h-screen bg-gray-50">
        {!showVendorOrders && !showAddProduct && !showEditProduct && !showVendorRevenue && (
          <VendorDashboard
            vendor={vendorProfile}
            products={combinedVendorProducts}
            onAddProduct={() => setShowAddProduct(true)}
            onEditProduct={(id) => {
              const product = combinedVendorProducts.find(p => p.id === id);
              if (product) {
                setEditingProduct(product);
                setShowEditProduct(true);
              }
            }}
            onDeleteProduct={handleDeleteProduct}
            onViewOrders={() => setShowVendorOrders(true)}
            onViewRevenue={() => setShowVendorRevenue(true)}
          />
        )}
        
        {showAddProduct && (
          <AddProductForm
            onClose={() => setShowAddProduct(false)}
            onSubmit={handleAddProduct}
            vendorId={vendorProfile.id}
          />
        )}
        
        {showEditProduct && editingProduct && (
          <EditProductForm
            onClose={() => setShowEditProduct(false)}
            onSubmit={handleEditProduct}
            product={editingProduct}
          />
        )}
        
        {showVendorOrders && (
          <VendorOrdersManagement
            vendorId={vendorProfile.id}
            onBack={() => setShowVendorOrders(false)}
          />
        )}
        
        {showVendorRevenue && (
          <VendorRevenue
            vendorId={vendorProfile.id}
            onBack={() => setShowVendorRevenue(false)}
          />
        )}
      </div>
    );
  }

  // Show vendor registration if requested
  if (showVendorRegistration) {
    return (
      <VendorRegistration
        onSubmit={handleVendorRegistration}
        onCancel={() => setShowVendorRegistration(false)}
      />
    );
  }
  
  // Show vendor registration success
  if (showVendorRegistrationSuccess) {
    return (
      <VendorRegistrationSuccess
        storeName={vendorProfile?.storeName || 'Do\'kon'}
        onContinue={() => {
          setShowVendorRegistrationSuccess(false);
          setCurrentPage('profile');
        }}
      />
    );
  }

  if (showCheckout) {
    return (
      <Checkout
        cartItems={cartItems}
        totalPrice={getTotalPrice()}
        onBack={() => setShowCheckout(false)}
        onComplete={handleOrderComplete}
      />
    );
  }

  if (showMyOrders) {
    return (
      <MyOrders
        onBack={() => {
          setShowMyOrders(false);
          setCurrentPage('home');
        }}
      />
    );
  }

  // Profile sub-pages
  if (showNotifications) {
    return <NotificationsPage onBack={() => setShowNotifications(false)} />;
  }

  if (showSettings) {
    return <SettingsPage onBack={() => setShowSettings(false)} userEmail={user.email} />;
  }

  if (showHelp) {
    return <HelpPage onBack={() => setShowHelp(false)} />;
  }

  if (showAddresses) {
    return <AddressesPage onBack={() => setShowAddresses(false)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            products={allProducts}
            onProductClick={setSelectedProduct}
            onAddToCart={addToCart}
            onNavigateToCatalog={() => setCurrentPage('catalog')}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'catalog':
        return (
          <CatalogPage
            products={filteredProducts}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onProductClick={setSelectedProduct}
            onAddToCart={addToCart}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'favorites':
        return (
          <FavoritesPage
            products={favoriteProducts}
            onProductClick={setSelectedProduct}
            onAddToCart={addToCart}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'cart':
        return (
          <CartPage
            cartItems={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            totalPrice={getTotalPrice()}
            onCheckout={handleCheckout}
          />
        );
      case 'profile':
        return (
          <ProfilePage 
            user={{ email: user.email, name: user.name }} 
            onLogout={handleLogout}
            onBecomeVendor={user.role === 'customer' ? () => setShowVendorRegistration(true) : undefined}
            onViewOrders={() => setShowMyOrders(true)}
            onViewNotifications={() => setShowNotifications(true)}
            onViewSettings={() => setShowSettings(true)}
            onViewHelp={() => setShowHelp(true)}
            onViewAddresses={() => setShowAddresses(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {renderPage()}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
          isFavorite={favoriteIds.includes(selectedProduct.id)}
          onToggleFavorite={() => toggleFavorite(selectedProduct.id)}
        />
      )}

      <BottomNav 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <TelegramProvider>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
          <Toaster position="top-center" richColors expand={false} />
        </LanguageProvider>
      </AuthProvider>
    </TelegramProvider>
  );
}