import { Users, Search, Shield, ShoppingBag, Store, Ban, CheckCircle, MoreVertical, Mail, Phone, Plus, X, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'customer' | 'vendor' | 'admin';
  status: 'active' | 'banned';
  createdAt: string;
  totalOrders?: number;
}

export function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'customer' | 'vendor' | 'admin'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

  // Get users from localStorage
  const getUsers = (): User[] => {
    try {
      const stored = localStorage.getItem('admin_users');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
    
    // Default users
    return [
      {
        id: '1',
        name: 'Ibrohim Komilov',
        email: 'ibrohimkomilov001@gmail.com',
        phone: '+998901234567',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        totalOrders: 0
      },
      {
        id: '2',
        name: 'Ali Valiyev',
        email: 'ali@example.com',
        phone: '+998901111111',
        role: 'customer',
        status: 'active',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        totalOrders: 15
      },
      {
        id: '3',
        name: 'Sardor Rashidov',
        email: 'sardor@example.com',
        phone: '+998902222222',
        role: 'vendor',
        status: 'active',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        totalOrders: 0
      },
      {
        id: '4',
        name: 'Dilshod Karimov',
        email: 'dilshod@example.com',
        phone: '+998903333333',
        role: 'customer',
        status: 'active',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        totalOrders: 8
      },
      {
        id: '5',
        name: 'Aziza Mahmudova',
        email: 'aziza@example.com',
        phone: '+998904444444',
        role: 'customer',
        status: 'banned',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        totalOrders: 3
      }
    ];
  };

  const [users, setUsers] = useState<User[]>(getUsers());

  // Save to localStorage whenever users change
  useEffect(() => {
    localStorage.setItem('admin_users', JSON.stringify(users));
  }, [users]);

  // Add new user
  const handleAddUser = (userData: Omit<User, 'id' | 'createdAt' | 'totalOrders'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      totalOrders: 0
    };
    setUsers([...users, newUser]);
    setShowAddModal(false);
  };

  // Toggle user status
  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'banned' : 'active' as any }
        : user
    ));
    setShowActionsMenu(null);
  };

  // Delete user
  const deleteUser = (userId: string) => {
    if (window.confirm('Foydalanuvchini o\'chirishni tasdiqlaysizmi?')) {
      setUsers(users.filter(user => user.id !== userId));
      setShowActionsMenu(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone.includes(searchQuery);
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
      vendor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      customer: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
    };
    const labels = {
      admin: 'Administrator',
      vendor: 'Hamkor',
      customer: 'Mijoz'
    };
    const icons = {
      admin: Shield,
      vendor: Store,
      customer: ShoppingBag
    };
    const Icon = icons[role as keyof typeof icons];
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${styles[role as keyof typeof styles]}`}>
        <Icon className="w-3 h-3" />
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  const stats = {
    total: users.length,
    customers: users.filter(u => u.role === 'customer').length,
    vendors: users.filter(u => u.role === 'vendor').length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.status === 'active').length,
    banned: users.filter(u => u.status === 'banned').length
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">Foydalanuvchilar boshqaruvi</h1>
          <p className="text-gray-600 dark:text-gray-400">Barcha foydalanuvchilarni ko'rish va boshqarish</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yangi qo'shish
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Jami</p>
          </div>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-5 h-5 text-green-600" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Mijozlar</p>
          </div>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.customers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Store className="w-5 h-5 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Hamkorlar</p>
          </div>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.vendors}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Adminlar</p>
          </div>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.admins}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Faol</p>
          </div>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Ban className="w-5 h-5 text-red-600" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Bloklangan</p>
          </div>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.banned}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ism, email yoki telefon raqam bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          {/* Role Filter */}
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'customer', label: 'Mijozlar' },
              { id: 'vendor', label: 'Hamkorlar' },
              { id: 'admin', label: 'Adminlar' }
            ].map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedRole === role.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 dark:text-white font-semibold text-xl">Yangi foydalanuvchi qo'shish</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAddUser({
                  name: formData.get('name') as string,
                  email: formData.get('email') as string,
                  phone: formData.get('phone') as string,
                  role: formData.get('role') as 'customer' | 'vendor' | 'admin',
                  status: 'active'
                });
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ism *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="Ism kiriting"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefon raqam *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rol *
                  </label>
                  <select
                    name="role"
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="customer">Mijoz</option>
                    <option value="vendor">Hamkor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Foydalanuvchi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Aloqa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ro'yxatdan o'tgan
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Harakatlar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold">{user.name.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        {user.totalOrders !== undefined && user.totalOrders > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{user.totalOrders} ta buyurtma</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {user.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {user.status === 'active' ? 'Faol' : 'Bloklangan'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm relative">
                    <button
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition"
                      onClick={() => setShowActionsMenu(showActionsMenu === user.id ? null : user.id)}
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    {showActionsMenu === user.id && (
                      <>
                        <div
                          className="fixed inset-0 z-[60]"
                          onClick={() => setShowActionsMenu(null)}
                        />
                        <div className="absolute right-10 top-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-[70] min-w-[160px] border border-gray-200 dark:border-gray-700">
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg transition"
                            onClick={() => toggleUserStatus(user.id)}
                          >
                            {user.status === 'active' ? '🚫 Bloklash' : '✅ Faol qilish'}
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-b-lg transition"
                            onClick={() => deleteUser(user.id)}
                          >
                            🗑️ O'chirish
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Foydalanuvchilar topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
}