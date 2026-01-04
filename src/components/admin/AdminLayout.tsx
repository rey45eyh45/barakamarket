import { useState, ReactNode } from 'react';
import { LayoutDashboard, Users, Package, ShoppingBag, Settings, Store, Bell, LogOut, Image, Tag, Percent, Truck, Headphones as HeadphonesIcon, Menu, X, Gift } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userName: string;
}

export function AdminLayout({ children, currentPage, onNavigate, onLogout, userName }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default false for mobile
  const [showNotifications, setShowNotifications] = useState(false);

  // Demo bildirishnomalar - localStorage'dan yuklash
  const getNotifications = () => {
    try {
      const stored = localStorage.getItem('admin_notifications');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
    
    return [
      {
        id: 1,
        type: 'order',
        title: 'Yangi buyurtma',
        message: 'Ali Valiyev 3 ta mahsulot buyurtma qildi',
        time: '5 daqiqa oldin',
        unread: true
      },
      {
        id: 2,
        type: 'vendor',
        title: 'Yangi do\'kon',
        message: 'Home Decor Pro tasdiqlashni kutmoqda',
        time: '15 daqiqa oldin',
        unread: true
      },
      {
        id: 3,
        type: 'product',
        title: 'Mahsulot qo\'shildi',
        message: 'Tech Galaxy yangi mahsulot qo\'shdi',
        time: '1 soat oldin',
        unread: false
      },
      {
        id: 4,
        type: 'user',
        title: 'Yangi foydalanuvchi',
        message: '3 ta yangi foydalanuvchi ro\'yxatdan o\'tdi',
        time: '2 soat oldin',
        unread: false
      }
    ];
  };

  const [notifications, setNotifications] = useState(getNotifications());

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, unread: false }));
    setNotifications(updatedNotifications);
    localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'banners', label: 'Bannerlar', icon: Image },
    { id: 'categories', label: 'Kategoriyalar', icon: Tag },
    { id: 'vendors', label: 'Do\'konlar', icon: Store },
    { id: 'products', label: 'Mahsulotlar', icon: Package },
    { id: 'users', label: 'Foydalanuvchilar', icon: Users },
    { id: 'orders', label: 'Buyurtmalar', icon: ShoppingBag },
    { id: 'spin-wheel', label: 'Barabanli O\'yin', icon: Gift },
    { id: 'promo-codes', label: 'Promo Kodlar', icon: Percent },
    { id: 'shipping', label: 'Yetkazib berish', icon: Truck },
    { id: 'support', label: 'Qo\'llab-quvvatlash', icon: HeadphonesIcon },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 z-50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64 lg:w-64`}
      >
        <div className={`h-full flex flex-col ${!sidebarOpen && 'lg:items-center'}`}>
          {/* Logo */}
          <div className={`h-16 flex items-center ${sidebarOpen ? 'justify-between px-6' : 'justify-center px-2'} border-b border-gray-200 dark:border-gray-700`}>
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">👑</span>
                </div>
                <span className="text-gray-900 dark:text-white font-semibold">Baraka Market</span>
              </div>
            )}
            {!sidebarOpen && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">👑</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${!sidebarOpen && 'justify-center'}`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {sidebarOpen ? (
              <div className="mb-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{userName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-white font-medium truncate">{userName}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Super Administrator</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-3 mx-auto">
                <span className="text-white font-semibold">{userName.charAt(0)}</span>
              </div>
            )}
            <button
              onClick={onLogout}
              className={`w-full flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition ${!sidebarOpen && 'justify-center'}`}
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span className="text-sm font-medium">Chiqish</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>

      {/* Notifications Modal */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-end p-4"
          onClick={() => setShowNotifications(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mt-16 mr-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold">Bildirishnomalar</h3>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{unreadCount} ta o'qilmagan</p>
                )}
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-[500px] overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-6 py-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer ${
                    notif.unread ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'order' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      notif.type === 'vendor' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      notif.type === 'product' ? 'bg-green-100 dark:bg-green-900/30' :
                      'bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                      {notif.type === 'order' && <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                      {notif.type === 'vendor' && <Store className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                      {notif.type === 'product' && <Package className="w-5 h-5 text-green-600 dark:text-green-400" />}
                      {notif.type === 'user' && <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {notif.title}
                        </h4>
                        {notif.unread && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {notif.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={markAllAsRead}
                className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
              >
                Barchasini o'qilgan deb belgilash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}