import { Users, Store, Package, ShoppingBag, DollarSign, TrendingUp, Clock, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { AdminStats } from '../../types/roles';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface AdminDashboardProps {
  stats: AdminStats;
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  // Sample data for charts
  const salesData = [
    { name: 'Yan', savdo: 4000, daromad: 2400 },
    { name: 'Fev', savdo: 3000, daromad: 1398 },
    { name: 'Mar', savdo: 2000, daromad: 9800 },
    { name: 'Apr', savdo: 2780, daromad: 3908 },
    { name: 'May', savdo: 1890, daromad: 4800 },
    { name: 'Iyun', savdo: 2390, daromad: 3800 },
    { name: 'Iyul', savdo: 3490, daromad: 4300 },
  ];

  const categoryData = [
    { name: 'Elektronika', value: 400 },
    { name: 'Kiyim', value: 300 },
    { name: 'Kitoblar', value: 200 },
    { name: 'Uy buyumlari', value: 100 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const statCards = [
    {
      icon: Users,
      label: 'Jami foydalanuvchilar',
      value: stats.totalUsers,
      change: '+12%',
      changeType: 'up',
      color: 'blue',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-500'
    },
    {
      icon: Store,
      label: 'Faol do\'konlar',
      value: stats.activeVendors,
      change: '+8%',
      changeType: 'up',
      color: 'green',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-500'
    },
    {
      icon: Package,
      label: 'Jami mahsulotlar',
      value: stats.totalProducts,
      change: '+23%',
      changeType: 'up',
      color: 'purple',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-500'
    },
    {
      icon: ShoppingBag,
      label: 'Bugungi buyurtmalar',
      value: stats.totalOrders || 45,
      change: '-3%',
      changeType: 'down',
      color: 'orange',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-500'
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Platformani boshqarish va monitoring</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 flex-shrink-0 ${stat.iconBg} rounded-lg flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  stat.changeType === 'up' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {stat.changeType === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-gray-900 dark:text-white mb-1 text-2xl font-bold">{stat.value}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Savdo statistikasi
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorSavdo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDaromad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area type="monotone" dataKey="savdo" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSavdo)" />
              <Area type="monotone" dataKey="daromad" stroke="#10b981" fillOpacity={1} fill="url(#colorDaromad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-gray-900 dark:text-white mb-4">Kategoriyalar bo'yicha</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-gray-900 dark:text-white mb-4">Tez harakatlar</h2>
          <div className="space-y-3">
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:shadow-lg transition text-left flex items-center gap-3">
              <Users className="w-5 h-5" />
              <span>Yangi admin qo'shish</span>
            </button>
            <button className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-4 rounded-lg hover:shadow-lg transition text-left flex items-center gap-3">
              <CheckCircle className="w-5 h-5" />
              <span>Do'konlarni tasdiqlash ({stats.pendingVendors})</span>
            </button>
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:shadow-lg transition text-left flex items-center gap-3">
              <Package className="w-5 h-5" />
              <span>Mahsulotlarni moderatsiya qilish</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-gray-900 dark:text-white mb-4">So'nggi faollik</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white text-sm font-medium">Yangi do'kon tasdiqlandi</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">2 daqiqa oldin</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white text-sm font-medium">15 ta yangi mahsulot</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">10 daqiqa oldin</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white text-sm font-medium">23 ta yangi buyurtma</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">30 daqiqa oldin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Daromad statistikasi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Bugungi daromad</p>
            <p className="text-gray-900 dark:text-white text-2xl font-bold">{(stats.totalRevenue * 0.15).toLocaleString()} so'm</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Haftalik daromad</p>
            <p className="text-gray-900 dark:text-white text-2xl font-bold">{(stats.totalRevenue * 0.5).toLocaleString()} so'm</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Oylik daromad</p>
            <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.totalRevenue.toLocaleString()} so'm</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="daromad" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}