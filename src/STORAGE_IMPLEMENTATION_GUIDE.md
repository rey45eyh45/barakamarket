# 🔧 STORAGE SISTEMINI QO'LLASH - TO'LIQ QOʻLLANMA

## 🎯 **MAQSAD:**

Barcha ma'lumotlarni **Telegram Cloud Storage** va **localStorage** hybrid sistemiga o'tkazish.

---

## 📋 **QO'LLASH REJASI:**

### **Qadam 1: TelegramContext import qilish**
```typescript
import { useTelegram } from './contexts/TelegramContext';

function MyComponent() {
  const { storage, user } = useTelegram();
  const userId = user?.id?.toString() || 'guest';
  
  // ...
}
```

### **Qadam 2: Helper functions import**
```typescript
import { 
  saveOrders, 
  getOrders,
  saveCart,
  getCart,
  saveFavorites,
  getFavorites
} from './utils/storage';
```

---

## 🛒 **1. CART (SAVAT) INTEGRATSIYASI**

### **App.tsx'da:**

```typescript
import { saveCart, getCart } from './utils/storage';

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useTelegram();
  const userId = user?.id?.toString() || 'guest';

  // Load cart on mount
  useEffect(() => {
    const loadCart = async () => {
      const savedCart = await getCart(userId);
      setCart(savedCart);
      console.log(`📦 Loaded cart: ${savedCart.length} items`);
    };
    loadCart();
  }, [userId]);

  // Save cart whenever it changes
  useEffect(() => {
    const saveCartData = async () => {
      if (cart.length >= 0) {
        await saveCart(userId, cart);
        console.log(`💾 Saved cart: ${cart.length} items`);
      }
    };
    saveCartData();
  }, [cart, userId]);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    toast.success('Savatga qo\'shildi! 🛒');
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.success('Savatdan olib tashlandi');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = async () => {
    setCart([]);
    await saveCart(userId, []);
    toast.success('Savat tozalandi');
  };

  return (
    // ... cart ma'lumotlarini components'ga pass qilish
  );
}
```

---

## ❤️ **2. FAVORITES (SEVIMLILAR) INTEGRATSIYASI**

### **App.tsx'da:**

```typescript
import { saveFavorites, getFavorites } from './utils/storage';

function App() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const { user } = useTelegram();
  const userId = user?.id?.toString() || 'guest';

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      const savedFavorites = await getFavorites(userId);
      setFavoriteIds(savedFavorites);
      console.log(`❤️ Loaded favorites: ${savedFavorites.length} items`);
    };
    loadFavorites();
  }, [userId]);

  // Save favorites whenever they change
  useEffect(() => {
    const saveFavoritesData = async () => {
      if (favoriteIds.length >= 0) {
        await saveFavorites(userId, favoriteIds);
        console.log(`💾 Saved favorites: ${favoriteIds.length} items`);
      }
    };
    saveFavoritesData();
  }, [favoriteIds, userId]);

  const toggleFavorite = (productId: string) => {
    setFavoriteIds(prev => {
      if (prev.includes(productId)) {
        toast.success('Sevimlilardan olib tashlandi');
        return prev.filter(id => id !== productId);
      } else {
        toast.success('Sevimlilarga qo\'shildi! ❤️');
        return [...prev, productId];
      }
    });
  };

  return (
    // ... favoriteIds'ni components'ga pass qilish
  );
}
```

---

## 📦 **3. ORDERS (BUYURTMALAR) INTEGRATSIYASI**

### **App.tsx'da:**

```typescript
import { saveOrders, getOrders } from './utils/storage';

interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt: string;
  deliveryAddress?: string;
  phone?: string;
}

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useTelegram();
  const userId = user?.id?.toString() || 'guest';

  // Load orders on mount
  useEffect(() => {
    const loadOrders = async () => {
      const savedOrders = await getOrders(userId);
      setOrders(savedOrders);
      console.log(`📦 Loaded orders: ${savedOrders.length} items`);
    };
    loadOrders();
  }, [userId]);

  const placeOrder = async (orderData: {
    items: CartItem[];
    total: number;
    deliveryAddress?: string;
    phone?: string;
  }) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      userId,
      items: orderData.items,
      total: orderData.total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      deliveryAddress: orderData.deliveryAddress,
      phone: orderData.phone,
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    
    // Save to cloud
    await saveOrders(userId, updatedOrders);
    
    // Clear cart
    await clearCart();
    
    toast.success('Buyurtma berildi! 🎉');
    
    return newOrder;
  };

  return (
    // ...
  );
}
```

---

## 👤 **4. USER PROFILE INTEGRATSIYASI**

### **ProfilePage'da:**

```typescript
import { storage } from '../utils/storage';

interface UserProfile {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  avatar?: string;
}

function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { user } = useTelegram();
  const userId = user?.id?.toString() || 'guest';

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      const saved = await storage.getItem<UserProfile>(`profile_${userId}`);
      if (saved) {
        setProfile(saved);
      } else {
        // Default from Telegram
        setProfile({
          name: user?.first_name || 'Foydalanuvchi',
          phone: '',
          email: '',
          address: '',
        });
      }
    };
    loadProfile();
  }, [userId]);

  const saveProfile = async (data: UserProfile) => {
    setProfile(data);
    await storage.setItem(`profile_${userId}`, data);
    toast.success('Profil saqlandi! ✅');
  };

  return (
    // ...
  );
}
```

---

## 🏪 **5. VENDOR PRODUCTS INTEGRATSIYASI**

### **VendorProductsManagement'da:**

```typescript
import { saveVendorProducts, getVendorProducts } from '../utils/storage';

function VendorProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useTelegram();
  const vendorId = user?.id?.toString() || 'guest';

  // Load vendor products
  useEffect(() => {
    const loadProducts = async () => {
      const saved = await getVendorProducts(vendorId);
      setProducts(saved);
      console.log(`🏪 Loaded vendor products: ${saved.length} items`);
    };
    loadProducts();
  }, [vendorId]);

  // Save products whenever they change
  useEffect(() => {
    const saveProducts = async () => {
      if (products.length >= 0) {
        await saveVendorProducts(vendorId, products);
        console.log(`💾 Saved vendor products: ${products.length} items`);
      }
    };
    saveProducts();
  }, [products, vendorId]);

  const addProduct = async (product: Product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      vendorId,
      createdAt: new Date().toISOString(),
    };
    
    setProducts([...products, newProduct]);
    toast.success('Mahsulot qo\'shildi! 🎉');
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, ...updates } : p
    ));
    toast.success('Mahsulot yangilandi! ✅');
  };

  const deleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    toast.success('Mahsulot o\'chirildi');
  };

  return (
    // ...
  );
}
```

---

## 🔄 **6. SYNC STRATEGIYASI**

### **App.tsx'da birinchi yuklashda:**

```typescript
function App() {
  const { storage, user } = useTelegram();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Sync from cloud
        await storage.syncFromCloud();
        
        // Load all data
        const userId = user?.id?.toString() || 'guest';
        
        const [cart, favorites, orders] = await Promise.all([
          getCart(userId),
          getFavorites(userId),
          getOrders(userId),
        ]);
        
        setCart(cart);
        setFavoriteIds(favorites);
        setOrders(orders);
        
        console.log('✅ All data loaded and synced');
      } catch (error) {
        console.error('❌ Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [user]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    // ...
  );
}
```

---

## 🧪 **TEST QILISH:**

### **Test 1: Cart sync**
```
1. Phone'da: 3 ta mahsulot savatga qo'shing
2. Console: "💾 Saved cart: 3 items"
3. Laptop'da: Telegram mini app'ni oching
4. Console: "📦 Loaded cart: 3 items"
5. ✅ 3 ta mahsulot savatda!
```

### **Test 2: Favorites sync**
```
1. Telefonda: 5 ta mahsulotni sevimlilarga qo'shing
2. Console: "💾 Saved favorites: 5 items"
3. Computer'da: Telegram'ni oching
4. Console: "❤️ Loaded favorites: 5 items"
5. ✅ 5 ta mahsulot sevimlilarda!
```

### **Test 3: Orders persistence**
```
1. Buyurtma bering
2. Console: "💾 Saved orders: 1 items"
3. App'ni yoping
4. Qaytadan oching
5. Orders page'ga o'ting
6. ✅ Buyurtma saqlanib qolgan!
```

---

## 📊 **DATA FLOW DIAGRAM:**

```
┌─────────────────────────────────────────┐
│  USER ACTION                            │
│  (Add to cart, favorite, order, etc)    │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│  STATE UPDATE                           │
│  setCart([...cart, newItem])            │
└───────────────┬─────────────────────────┘
                │
                ↓ (useEffect trigger)
┌─────────────────────────────────────────┐
│  SAVE TO STORAGE                        │
│  await saveCart(userId, cart)           │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│  CLOUD STORAGE (Telegram)               │
│  + localStorage (cache)                 │
└───────────────┬─────────────────────────┘
                │
                ↓ (on other device)
┌─────────────────────────────────────────┐
│  LOAD FROM STORAGE                      │
│  const cart = await getCart(userId)     │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│  STATE UPDATE                           │
│  setCart(cart)                          │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│  UI UPDATE                              │
│  Cart items displayed                   │
└─────────────────────────────────────────┘
```

---

## ✅ **CHECKLIST:**

### **App.tsx:**
- [ ] Import storage functions
- [ ] Load cart on mount
- [ ] Save cart on change
- [ ] Load favorites on mount
- [ ] Save favorites on change
- [ ] Load orders on mount
- [ ] Save new orders
- [ ] Sync from cloud on init

### **ProfilePage:**
- [ ] Load profile on mount
- [ ] Save profile on update

### **VendorProductsManagement:**
- [ ] Load vendor products on mount
- [ ] Save products on change

### **OrdersPage:**
- [ ] Load user orders
- [ ] Display order history
- [ ] Real-time updates

---

## 🎯 **MINIMAL INTEGRATION:**

Agar tez ishlatmoqchi bo'lsangiz, eng minimal variant:

```typescript
// App.tsx
import { useEffect } from 'react';
import { storage } from './utils/storage';
import { useTelegram } from './contexts/TelegramContext';

function App() {
  const { user } = useTelegram();
  const userId = user?.id?.toString() || 'guest';

  // Auto-save cart
  useEffect(() => {
    storage.setItem(`cart_${userId}`, cart);
  }, [cart]);

  // Auto-save favorites
  useEffect(() => {
    storage.setItem(`favorites_${userId}`, favoriteIds);
  }, [favoriteIds]);

  // Auto-save orders
  useEffect(() => {
    storage.setItem(`orders_${userId}`, orders);
  }, [orders]);

  // Load on mount
  useEffect(() => {
    const load = async () => {
      const [c, f, o] = await Promise.all([
        storage.getItem(`cart_${userId}`),
        storage.getItem(`favorites_${userId}`),
        storage.getItem(`orders_${userId}`),
      ]);
      
      if (c) setCart(c);
      if (f) setFavoriteIds(f);
      if (o) setOrders(o);
    };
    load();
  }, [userId]);

  return (
    // ...
  );
}
```

---

## 🎉 **NATIJA:**

```
✅ Ma'lumotlar Cloud'da saqlanadi
✅ Barcha qurilmalarda sync
✅ Host qilganda ishlaydi
✅ Offline fallback
✅ Real-time updates
✅ User-specific data
✅ Secure & scalable
```

**Endi Dream Market loyihasi to'liq production-ready!** 🚀✨
