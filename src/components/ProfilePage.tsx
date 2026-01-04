import {
  User,
  Package,
  MapPin,
  Bell,
  Settings,
  HeadphonesIcon,
  LogOut,
  ChevronRight,
  Languages,
  Check,
  Store,
  Sun,
  Moon,
  Monitor,
  ShoppingBag,
  DollarSign,
  Tag,
  Camera,
  Gift,
  Sparkles,
  TrendingUp,
  Award,
  Crown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";
import { SpinWheel } from "./SpinWheel";
import { getSpinWheelConfig } from "../utils/spinWheelUtils";

interface ProfilePageProps {
  user: { email: string; name: string } | null;
  onLogout: () => void;
  onBecomeVendor?: () => void;
  onViewOrders?: () => void;
  onViewNotifications?: () => void;
  onViewSettings?: () => void;
  onViewHelp?: () => void;
  onViewAddresses?: () => void;
}

export function ProfilePage({
  user,
  onLogout,
  onBecomeVendor,
  onViewOrders,
  onViewNotifications,
  onViewSettings,
  onViewHelp,
  onViewAddresses,
}: ProfilePageProps) {
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [spinWheelEnabled, setSpinWheelEnabled] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    averageDiscount: 0,
  });

  // Load profile image from localStorage
  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  // Check if spin wheel is enabled
  useEffect(() => {
    const config = getSpinWheelConfig();
    setSpinWheelEnabled(config.isEnabled);
  }, []);

  // Load user stats from localStorage
  useEffect(() => {
    const loadUserStats = () => {
      try {
        const ordersData = localStorage.getItem("orders");
        if (ordersData) {
          const orders = JSON.parse(ordersData);
          const totalOrders = orders.length;
          const totalSpent = orders.reduce(
            (sum: number, order: any) => sum + (order.total || 0),
            0,
          );

          // Calculate average discount
          let totalDiscount = 0;
          let discountCount = 0;
          orders.forEach((order: any) => {
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach((item: any) => {
                if (item.product.discount && item.product.discount > 0) {
                  totalDiscount += item.product.discount;
                  discountCount++;
                }
              });
            }
          });

          const averageDiscount =
            discountCount > 0 ? Math.round(totalDiscount / discountCount) : 0;

          setUserStats({
            totalOrders,
            totalSpent,
            averageDiscount,
          });
        }
      } catch (error) {
        console.error("Error loading user stats:", error);
      }
    };

    loadUserStats();
  }, [user]);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setSelectedTheme(savedTheme);
  }, []);

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    localStorage.setItem("theme", theme);

    // Apply theme
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // Auto mode
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "theme",
        newValue: theme,
      }),
    );

    setShowThemeModal(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Rasm hajmi juda katta! Maksimal 5MB bo'lishi kerak.");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Iltimos, rasm faylini yuklang!");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfileImage(base64String);
      localStorage.setItem("profileImage", base64String);
    };
    reader.readAsDataURL(file);
  };

  const languages = [
    { id: "uz", name: "O'zbekcha", flag: "🇺🇿" },
    { id: "ru", name: "Русский", flag: "🇷🇺" },
    { id: "en", name: "English", flag: "🇬🇧" },
  ];

  const themes = [
    {
      id: "light",
      name: "Yorug'",
      description: "Oq fon",
      icon: <Sun className="w-6 h-6" />,
    },
    {
      id: "dark",
      name: "Qorong'i",
      description: "Qora fon",
      icon: <Moon className="w-6 h-6" />,
    },
    {
      id: "auto",
      name: "Avto",
      description: "Tizim sozlamasi",
      icon: <Monitor className="w-6 h-6" />,
    },
  ];

  const menuItems = [
    {
      icon: ShoppingBag,
      label: t("customer.myOrders"),
      description: t("orders.order"),
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      onClick: onViewOrders,
    },
    // Spin Wheel - only show if enabled
    ...(spinWheelEnabled
      ? [
          {
            icon: Gift,
            label: "Omadli G'ildirak",
            description: "Sovg'alarni yutib oling!",
            gradient: "from-amber-500 to-orange-600",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-600 dark:text-amber-400",
            badge: "🎁",
            onClick: () => setShowSpinWheel(true),
          },
        ]
      : []),
    {
      icon: MapPin,
      label: t("customer.myAddresses"),
      description: t("customer.savedAddresses"),
      gradient: "from-green-500 to-emerald-600",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600 dark:text-green-400",
      onClick: onViewAddresses,
    },
    {
      icon: Bell,
      label: t("notifications.notifications"),
      description: "Yangiliklar va chegirmalar",
      gradient: "from-orange-500 to-red-600",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
      onClick: onViewNotifications,
    },
    {
      icon: Languages,
      label: t("settings.language"),
      description: languages.find((l) => l.id === language)?.name || "O'zbekcha",
      gradient: "from-indigo-500 to-purple-600",
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      onClick: () => setShowLanguageModal(true),
    },
    {
      icon:
        selectedTheme === "light"
          ? Sun
          : selectedTheme === "dark"
            ? Moon
            : Monitor,
      label: "Mavzu",
      description: themes.find((th) => th.id === selectedTheme)?.name || "Yorug'",
      gradient: "from-pink-500 to-rose-600",
      iconBg: "bg-pink-500/10",
      iconColor: "text-pink-600 dark:text-pink-400",
      onClick: () => setShowThemeModal(true),
    },
    {
      icon: Settings,
      label: t("settings.settings"),
      description: "Ilova sozlamalari",
      gradient: "from-gray-500 to-gray-600",
      iconBg: "bg-gray-500/10",
      iconColor: "text-gray-600 dark:text-gray-400",
      onClick: onViewSettings,
    },
    {
      icon: HeadphonesIcon,
      label: t("customer.help"),
      description: "FAQ va yordam",
      gradient: "from-cyan-500 to-blue-600",
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      onClick: onViewHelp,
    },
  ];

  const stats = [
    {
      icon: ShoppingBag,
      label: "Buyurtmalar",
      value: userStats.totalOrders,
      gradient: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-600",
    },
    {
      icon: DollarSign,
      label: "Jami xarid",
      value: formatPrice(userStats.totalSpent),
      gradient: "from-green-500 to-emerald-500",
      iconColor: "text-green-600",
    },
    {
      icon: Tag,
      label: "O'rtacha chegirma",
      value: userStats.averageDiscount + "%",
      gradient: "from-orange-500 to-red-500",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Header with Profile Card */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800" />
        <div className="absolute inset-0 bg-black/10 dark:bg-black/30" />
        
        {/* Decorative Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />

        <div className="relative z-10 px-6 pt-8 pb-6">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            {/* Avatar */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white/20 overflow-hidden"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                )}
              </motion.div>
              
              {/* Camera Button with Hidden Input */}
              <label htmlFor="profile-upload">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 cursor-pointer shadow-lg"
                >
                  <Camera className="w-4 h-4 text-white" />
                </motion.div>
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-white text-2xl font-bold mb-1 drop-shadow-lg">
                {user?.name || "Foydalanuvchi"}
              </h1>
              <p className="text-white/80 text-sm drop-shadow">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-3 shadow-xl border border-white/20"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-2 shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                  {stat.label}
                </p>
                <p className="text-gray-900 dark:text-white font-bold text-sm">
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 py-6 space-y-3">
        {menuItems.map((item, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={item.onClick}
            className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 group"
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-6 h-6 ${item.iconColor}`} />
              </div>

              {/* Text */}
              <div className="flex-1 text-left">
                <p className="text-gray-900 dark:text-white font-semibold mb-0.5">
                  {item.label}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {item.description}
                </p>
              </div>

              {/* Badge (if any) */}
              {item.badge && (
                <span className="text-xl">{item.badge}</span>
              )}

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>
        ))}

        {/* Become Vendor Button (if applicable) */}
        {onBecomeVendor && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBecomeVendor}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
          >
            {/* Shimmer Effect */}
            <motion.div
              animate={{ x: ["-200%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />

            <div className="relative flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold mb-0.5">
                  Sotuvchi bo'lish
                </p>
                <p className="text-white/80 text-sm">
                  O'z do'koningizni oching va daromad qiling
                </p>
              </div>
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
          </motion.button>
        )}

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl p-4 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border border-red-100 dark:border-red-900/50 group"
        >
          <div className="flex items-center justify-center gap-3">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Chiqish</span>
          </div>
        </motion.button>
      </div>

      {/* Language Modal */}
      {showLanguageModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowLanguageModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h2 className="text-white text-xl font-bold">
                {t("settings.language")}
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setLanguage(lang.id as "uz" | "ru" | "en");
                    setShowLanguageModal(false);
                  }}
                  className={`w-full p-4 rounded-2xl transition-all flex items-center gap-3 ${
                    language === lang.id
                      ? "bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-500"
                      : "bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <span className="text-3xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {lang.name}
                    </p>
                  </div>
                  {language === lang.id && (
                    <Check className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Theme Modal */}
      {showThemeModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowThemeModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
          >
            <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-4">
              <h2 className="text-white text-xl font-bold">Mavzu</h2>
            </div>
            <div className="p-6 space-y-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`w-full p-4 rounded-2xl transition-all flex items-center gap-3 ${
                    selectedTheme === theme.id
                      ? "bg-pink-50 dark:bg-pink-900/30 border-2 border-pink-500"
                      : "bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="w-12 h-12 bg-white dark:bg-gray-600 rounded-xl flex items-center justify-center">
                    {theme.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {theme.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {theme.description}
                    </p>
                  </div>
                  {selectedTheme === theme.id && (
                    <Check className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Spin Wheel Modal */}
      {showSpinWheel && (
        <SpinWheel 
          isOpen={showSpinWheel}
          onClose={() => setShowSpinWheel(false)}
          userId={user?.email || 'guest'}
        />
      )}
    </div>
  );
}