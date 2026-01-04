export type Language = 'uz' | 'ru' | 'en';

export interface Translations {
  // Common
  common: {
    search: string;
    filter: string;
    sort: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    add: string;
    back: string;
    next: string;
    loading: string;
    error: string;
    success: string;
    yes: string;
    no: string;
    all: string;
    close: string;
  };

  // Navigation
  nav: {
    home: string;
    catalog: string;
    cart: string;
    orders: string;
    profile: string;
    favorites: string;
  };

  // Product
  product: {
    price: string;
    addToCart: string;
    buyNow: string;
    inStock: string;
    outOfStock: string;
    lowStock: string;
    description: string;
    specifications: string;
    reviews: string;
    rating: string;
    soldCount: string;
    views: string;
    brand: string;
    category: string;
    newArrival: string;
    featured: string;
    discount: string;
    saved: string;
  };

  // Cart
  cart: {
    title: string;
    empty: string;
    emptyDescription: string;
    itemsCount: string;
    subtotal: string;
    shipping: string;
    discount: string;
    total: string;
    checkout: string;
    continueShopping: string;
    remove: string;
    quantity: string;
  };

  // Checkout
  checkout: {
    title: string;
    shippingAddress: string;
    paymentMethod: string;
    orderSummary: string;
    placeOrder: string;
    processing: string;
    promoCode: string;
    applyPromo: string;
    deliveryTime: string;
    orderNotes: string;
  };

  // Orders
  orders: {
    title: string;
    myOrders: string;
    orderNumber: string;
    orderDate: string;
    status: string;
    items: string;
    tracking: string;
    viewDetails: string;
    reorder: string;
    cancelOrder: string;
    pending: string;
    processing: string;
    shipped: string;
    delivered: string;
    cancelled: string;
  };

  // Profile
  profile: {
    title: string;
    personalInfo: string;
    savedAddresses: string;
    orderHistory: string;
    favorites: string;
    settings: string;
    language: string;
    theme: string;
    logout: string;
    name: string;
    email: string;
    phone: string;
  };

  // Reviews
  reviews: {
    title: string;
    writeReview: string;
    rating: string;
    comment: string;
    submit: string;
    helpful: string;
    verified: string;
    vendorResponse: string;
    sortBy: string;
    newest: string;
    highest: string;
    lowest: string;
  };

  // Vendor
  vendor: {
    shop: string;
    products: string;
    followers: string;
    rating: string;
    verified: string;
    trusted: string;
    premium: string;
    pro: string;
    top: string;
    follow: string;
    unfollow: string;
    contactVendor: string;
  };

  // Filters
  filters: {
    title: string;
    priceRange: string;
    minPrice: string;
    maxPrice: string;
    rating: string;
    availability: string;
    inStockOnly: string;
    sortBy: string;
    newest: string;
    priceLow: string;
    priceHigh: string;
    topRated: string;
    popular: string;
    clearAll: string;
  };

  // Address
  address: {
    title: string;
    addNew: string;
    edit: string;
    delete: string;
    setDefault: string;
    label: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    region: string;
    postalCode: string;
    home: string;
    work: string;
    other: string;
  };

  // Notifications
  notifications: {
    addedToCart: string;
    removedFromCart: string;
    orderPlaced: string;
    orderCancelled: string;
    reviewSubmitted: string;
    addressSaved: string;
    addressDeleted: string;
    promoApplied: string;
    promoInvalid: string;
    stockLow: string;
    stockOut: string;
  };

  // Errors
  errors: {
    networkError: string;
    notFound: string;
    unauthorized: string;
    invalidInput: string;
    outOfStock: string;
    invalidPromoCode: string;
    paymentFailed: string;
    tryAgain: string;
  };
}

export const translations: Record<Language, Translations> = {
  uz: {
    common: {
      search: 'Qidirish',
      filter: 'Filtrlar',
      sort: 'Saralash',
      cancel: 'Bekor qilish',
      confirm: 'Tasdiqlash',
      save: 'Saqlash',
      delete: "O'chirish",
      edit: 'Tahrirlash',
      add: "Qo'shish",
      back: 'Ortga',
      next: 'Keyingi',
      loading: 'Yuklanmoqda...',
      error: 'Xatolik',
      success: 'Muvaffaqiyatli',
      yes: 'Ha',
      no: "Yo'q",
      all: 'Barchasi',
      close: 'Yopish',
    },
    nav: {
      home: 'Bosh sahifa',
      catalog: 'Katalog',
      cart: 'Savat',
      orders: 'Buyurtmalar',
      profile: 'Profil',
      favorites: 'Sevimlilar',
    },
    product: {
      price: 'Narxi',
      addToCart: 'Savatga',
      buyNow: 'Hoziroq sotib olish',
      inStock: 'Mavjud',
      outOfStock: 'Tugagan',
      lowStock: 'Kam qoldi',
      description: 'Tavsif',
      specifications: 'Xususiyatlar',
      reviews: 'Sharhlar',
      rating: 'Reyting',
      soldCount: 'Sotildi',
      views: "Ko'rishlar",
      brand: 'Brend',
      category: 'Kategoriya',
      newArrival: 'Yangi',
      featured: 'TOP',
      discount: 'Chegirma',
      saved: 'Tejaldi',
    },
    cart: {
      title: 'Savat',
      empty: "Savat bo'sh",
      emptyDescription: "Savatda hech narsa yo'q. Mahsulotlarni ko'rishni boshlang!",
      itemsCount: 'ta mahsulot',
      subtotal: 'Jami',
      shipping: 'Yetkazib berish',
      discount: 'Chegirma',
      total: 'Umumiy summa',
      checkout: "To'lovga o'tish",
      continueShopping: 'Xaridni davom ettirish',
      remove: "O'chirish",
      quantity: 'Soni',
    },
    checkout: {
      title: "To'lov",
      shippingAddress: 'Yetkazib berish manzili',
      paymentMethod: "To'lov usuli",
      orderSummary: 'Buyurtma xulosasi',
      placeOrder: 'Buyurtma berish',
      processing: 'Buyurtma berilmoqda...',
      promoCode: 'Promo kod',
      applyPromo: "Qo'llash",
      deliveryTime: 'Yetkazib berish vaqti',
      orderNotes: 'Izoh',
    },
    orders: {
      title: 'Buyurtmalar',
      myOrders: 'Mening buyurtmalarim',
      orderNumber: 'Buyurtma raqami',
      orderDate: 'Sana',
      status: 'Holati',
      items: 'Mahsulotlar',
      tracking: 'Kuzatuv',
      viewDetails: 'Batafsil',
      reorder: 'Qayta buyurtma',
      cancelOrder: 'Bekor qilish',
      pending: 'Kutilmoqda',
      processing: 'Tayyorlanmoqda',
      shipped: "Yo'lda",
      delivered: 'Yetkazildi',
      cancelled: 'Bekor qilindi',
    },
    profile: {
      title: 'Profil',
      personalInfo: 'Shaxsiy ma\'lumotlar',
      savedAddresses: 'Saqlangan manzillar',
      orderHistory: 'Buyurtmalar tarixi',
      favorites: 'Sevimlilar',
      settings: 'Sozlamalar',
      language: 'Til',
      theme: 'Mavzu',
      logout: 'Chiqish',
      name: 'Ism',
      email: 'Email',
      phone: 'Telefon',
    },
    reviews: {
      title: 'Sharhlar',
      writeReview: 'Sharh yozish',
      rating: 'Baho',
      comment: 'Izoh',
      submit: 'Yuborish',
      helpful: 'Foydali',
      verified: 'Tasdiqlangan xaridor',
      vendorResponse: 'Sotuvchi javobi',
      sortBy: 'Saralash',
      newest: 'Yangi',
      highest: 'Yuqori',
      lowest: 'Past',
    },
    vendor: {
      shop: "Do'kon",
      products: 'Mahsulotlar',
      followers: 'Obunachilar',
      rating: 'Reyting',
      verified: 'Tekshirilgan',
      trusted: 'Ishonchli',
      premium: 'Premium',
      pro: 'Pro',
      top: 'Top sotuvchi',
      follow: 'Obuna',
      unfollow: 'Bekor qilish',
      contactVendor: "Bog'lanish",
    },
    filters: {
      title: 'Filtrlar',
      priceRange: 'Narx oralig\'i',
      minPrice: 'Minimal',
      maxPrice: 'Maksimal',
      rating: 'Reyting',
      availability: 'Mavjudlik',
      inStockOnly: 'Faqat mavjud',
      sortBy: 'Saralash',
      newest: 'Yangi',
      priceLow: 'Arzon',
      priceHigh: 'Qimmat',
      topRated: 'Yaxshi',
      popular: 'Mashhur',
      clearAll: 'Tozalash',
    },
    address: {
      title: 'Manzillar',
      addNew: 'Yangi qo\'shish',
      edit: 'Tahrirlash',
      delete: "O'chirish",
      setDefault: 'Standart qilish',
      label: 'Yorliq',
      fullName: "To'liq ism",
      phone: 'Telefon',
      address: 'Manzil',
      city: 'Shahar',
      region: 'Viloyat',
      postalCode: 'Pochta indeksi',
      home: 'Uy',
      work: 'Ish',
      other: 'Boshqa',
    },
    notifications: {
      addedToCart: 'Savatga qo\'shildi',
      removedFromCart: 'Savatdan o\'chirildi',
      orderPlaced: 'Buyurtma berildi',
      orderCancelled: 'Buyurtma bekor qilindi',
      reviewSubmitted: 'Sharh yuborildi',
      addressSaved: 'Manzil saqlandi',
      addressDeleted: 'Manzil o\'chirildi',
      promoApplied: 'Promo kod qo\'llandi',
      promoInvalid: 'Promo kod noto\'g\'ri',
      stockLow: 'Kam qoldi',
      stockOut: 'Tugagan',
    },
    errors: {
      networkError: 'Tarmoq xatosi',
      notFound: 'Topilmadi',
      unauthorized: 'Ruxsat yo\'q',
      invalidInput: 'Noto\'g\'ri ma\'lumot',
      outOfStock: 'Mahsulot tugagan',
      invalidPromoCode: 'Promo kod noto\'g\'ri',
      paymentFailed: 'To\'lov amalga oshmadi',
      tryAgain: 'Qayta urinib ko\'ring',
    },
  },

  ru: {
    common: {
      search: 'Поиск',
      filter: 'Фильтры',
      sort: 'Сортировка',
      cancel: 'Отмена',
      confirm: 'Подтвердить',
      save: 'Сохранить',
      delete: 'Удалить',
      edit: 'Редактировать',
      add: 'Добавить',
      back: 'Назад',
      next: 'Далее',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      yes: 'Да',
      no: 'Нет',
      all: 'Все',
      close: 'Закрыть',
    },
    nav: {
      home: 'Главная',
      catalog: 'Каталог',
      cart: 'Корзина',
      orders: 'Заказы',
      profile: 'Профиль',
      favorites: 'Избранное',
    },
    product: {
      price: 'Цена',
      addToCart: 'В корзину',
      buyNow: 'Купить сейчас',
      inStock: 'В наличии',
      outOfStock: 'Нет в наличии',
      lowStock: 'Осталось мало',
      description: 'Описание',
      specifications: 'Характеристики',
      reviews: 'Отзывы',
      rating: 'Рейтинг',
      soldCount: 'Продано',
      views: 'Просмотров',
      brand: 'Бренд',
      category: 'Категория',
      newArrival: 'Новинка',
      featured: 'ТОП',
      discount: 'Скидка',
      saved: 'Экономия',
    },
    cart: {
      title: 'Корзина',
      empty: 'Корзина пуста',
      emptyDescription: 'В корзине ничего нет. Начните просматривать товары!',
      itemsCount: 'товаров',
      subtotal: 'Сумма',
      shipping: 'Доставка',
      discount: 'Скидка',
      total: 'Итого',
      checkout: 'Оформить заказ',
      continueShopping: 'Продолжить покупки',
      remove: 'Удалить',
      quantity: 'Количество',
    },
    checkout: {
      title: 'Оформление',
      shippingAddress: 'Адрес доставки',
      paymentMethod: 'Способ оплаты',
      orderSummary: 'Итого по заказу',
      placeOrder: 'Оформить заказ',
      processing: 'Обработка заказа...',
      promoCode: 'Промокод',
      applyPromo: 'Применить',
      deliveryTime: 'Время доставки',
      orderNotes: 'Комментарий',
    },
    orders: {
      title: 'Заказы',
      myOrders: 'Мои заказы',
      orderNumber: 'Номер заказа',
      orderDate: 'Дата',
      status: 'Статус',
      items: 'Товары',
      tracking: 'Отслеживание',
      viewDetails: 'Подробнее',
      reorder: 'Повторить заказ',
      cancelOrder: 'Отменить',
      pending: 'В ожидании',
      processing: 'Обрабатывается',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменен',
    },
    profile: {
      title: 'Профиль',
      personalInfo: 'Личные данные',
      savedAddresses: 'Сохраненные адреса',
      orderHistory: 'История заказов',
      favorites: 'Избранное',
      settings: 'Настройки',
      language: 'Язык',
      theme: 'Тема',
      logout: 'Выйти',
      name: 'Имя',
      email: 'Email',
      phone: 'Телефон',
    },
    reviews: {
      title: 'Отзывы',
      writeReview: 'Написать отзыв',
      rating: 'Оценка',
      comment: 'Комментарий',
      submit: 'Отправить',
      helpful: 'Полезно',
      verified: 'Проверенная покупка',
      vendorResponse: 'Ответ продавца',
      sortBy: 'Сортировка',
      newest: 'Новые',
      highest: 'Высокие',
      lowest: 'Низкие',
    },
    vendor: {
      shop: 'Магазин',
      products: 'Товары',
      followers: 'Подписчики',
      rating: 'Рейтинг',
      verified: 'Проверен',
      trusted: 'Надежный',
      premium: 'Премиум',
      pro: 'Про',
      top: 'Топ продавец',
      follow: 'Подписаться',
      unfollow: 'Отписаться',
      contactVendor: 'Связаться',
    },
    filters: {
      title: 'Фильтры',
      priceRange: 'Диапазон цен',
      minPrice: 'Минимум',
      maxPrice: 'Максимум',
      rating: 'Рейтинг',
      availability: 'Наличие',
      inStockOnly: 'Только в наличии',
      sortBy: 'Сортировка',
      newest: 'Новые',
      priceLow: 'Дешевые',
      priceHigh: 'Дорогие',
      topRated: 'Лучшие',
      popular: 'Популярные',
      clearAll: 'Очистить',
    },
    address: {
      title: 'Адреса',
      addNew: 'Добавить новый',
      edit: 'Редактировать',
      delete: 'Удалить',
      setDefault: 'Сделать основным',
      label: 'Метка',
      fullName: 'Полное имя',
      phone: 'Телефон',
      address: 'Адрес',
      city: 'Город',
      region: 'Область',
      postalCode: 'Почтовый индекс',
      home: 'Дом',
      work: 'Работа',
      other: 'Другое',
    },
    notifications: {
      addedToCart: 'Добавлено в корзину',
      removedFromCart: 'Удалено из корзины',
      orderPlaced: 'Заказ оформлен',
      orderCancelled: 'Заказ отменен',
      reviewSubmitted: 'Отзыв отправлен',
      addressSaved: 'Адрес сохранен',
      addressDeleted: 'Адрес удален',
      promoApplied: 'Промокод применен',
      promoInvalid: 'Неверный промокод',
      stockLow: 'Осталось мало',
      stockOut: 'Нет в наличии',
    },
    errors: {
      networkError: 'Ошибка сети',
      notFound: 'Не найдено',
      unauthorized: 'Нет доступа',
      invalidInput: 'Неверные данные',
      outOfStock: 'Товар закончился',
      invalidPromoCode: 'Неверный промокод',
      paymentFailed: 'Оплата не прошла',
      tryAgain: 'Попробуйте снова',
    },
  },

  en: {
    common: {
      search: 'Search',
      filter: 'Filters',
      sort: 'Sort',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      back: 'Back',
      next: 'Next',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      yes: 'Yes',
      no: 'No',
      all: 'All',
      close: 'Close',
    },
    nav: {
      home: 'Home',
      catalog: 'Catalog',
      cart: 'Cart',
      orders: 'Orders',
      profile: 'Profile',
      favorites: 'Favorites',
    },
    product: {
      price: 'Price',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      lowStock: 'Low Stock',
      description: 'Description',
      specifications: 'Specifications',
      reviews: 'Reviews',
      rating: 'Rating',
      soldCount: 'Sold',
      views: 'Views',
      brand: 'Brand',
      category: 'Category',
      newArrival: 'New',
      featured: 'Featured',
      discount: 'Discount',
      saved: 'Saved',
    },
    cart: {
      title: 'Shopping Cart',
      empty: 'Cart is Empty',
      emptyDescription: 'Your cart is empty. Start browsing products!',
      itemsCount: 'items',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      discount: 'Discount',
      total: 'Total',
      checkout: 'Checkout',
      continueShopping: 'Continue Shopping',
      remove: 'Remove',
      quantity: 'Quantity',
    },
    checkout: {
      title: 'Checkout',
      shippingAddress: 'Shipping Address',
      paymentMethod: 'Payment Method',
      orderSummary: 'Order Summary',
      placeOrder: 'Place Order',
      processing: 'Processing Order...',
      promoCode: 'Promo Code',
      applyPromo: 'Apply',
      deliveryTime: 'Delivery Time',
      orderNotes: 'Order Notes',
    },
    orders: {
      title: 'Orders',
      myOrders: 'My Orders',
      orderNumber: 'Order Number',
      orderDate: 'Date',
      status: 'Status',
      items: 'Items',
      tracking: 'Tracking',
      viewDetails: 'View Details',
      reorder: 'Reorder',
      cancelOrder: 'Cancel Order',
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    },
    profile: {
      title: 'Profile',
      personalInfo: 'Personal Information',
      savedAddresses: 'Saved Addresses',
      orderHistory: 'Order History',
      favorites: 'Favorites',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      logout: 'Logout',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
    },
    reviews: {
      title: 'Reviews',
      writeReview: 'Write Review',
      rating: 'Rating',
      comment: 'Comment',
      submit: 'Submit',
      helpful: 'Helpful',
      verified: 'Verified Purchase',
      vendorResponse: 'Vendor Response',
      sortBy: 'Sort By',
      newest: 'Newest',
      highest: 'Highest',
      lowest: 'Lowest',
    },
    vendor: {
      shop: 'Shop',
      products: 'Products',
      followers: 'Followers',
      rating: 'Rating',
      verified: 'Verified',
      trusted: 'Trusted',
      premium: 'Premium',
      pro: 'Pro',
      top: 'Top Seller',
      follow: 'Follow',
      unfollow: 'Unfollow',
      contactVendor: 'Contact',
    },
    filters: {
      title: 'Filters',
      priceRange: 'Price Range',
      minPrice: 'Min Price',
      maxPrice: 'Max Price',
      rating: 'Rating',
      availability: 'Availability',
      inStockOnly: 'In Stock Only',
      sortBy: 'Sort By',
      newest: 'Newest',
      priceLow: 'Price: Low to High',
      priceHigh: 'Price: High to Low',
      topRated: 'Top Rated',
      popular: 'Popular',
      clearAll: 'Clear All',
    },
    address: {
      title: 'Addresses',
      addNew: 'Add New',
      edit: 'Edit',
      delete: 'Delete',
      setDefault: 'Set as Default',
      label: 'Label',
      fullName: 'Full Name',
      phone: 'Phone',
      address: 'Address',
      city: 'City',
      region: 'Region',
      postalCode: 'Postal Code',
      home: 'Home',
      work: 'Work',
      other: 'Other',
    },
    notifications: {
      addedToCart: 'Added to cart',
      removedFromCart: 'Removed from cart',
      orderPlaced: 'Order placed',
      orderCancelled: 'Order cancelled',
      reviewSubmitted: 'Review submitted',
      addressSaved: 'Address saved',
      addressDeleted: 'Address deleted',
      promoApplied: 'Promo code applied',
      promoInvalid: 'Invalid promo code',
      stockLow: 'Low stock',
      stockOut: 'Out of stock',
    },
    errors: {
      networkError: 'Network error',
      notFound: 'Not found',
      unauthorized: 'Unauthorized',
      invalidInput: 'Invalid input',
      outOfStock: 'Out of stock',
      invalidPromoCode: 'Invalid promo code',
      paymentFailed: 'Payment failed',
      tryAgain: 'Try again',
    },
  },
};
