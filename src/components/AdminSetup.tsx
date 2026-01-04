import { useState } from 'react';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';

export function AdminSetup({ onBack }: { onBack?: () => void }) {
  const [email, setEmail] = useState('ibrohimkomilov001@gmail.com');
  const [name, setName] = useState('Super Admin');
  const [password, setPassword] = useState('Telegraph2019@');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);

  const createAdmin = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🚀 Creating admin locally...');
      
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setResult({ success: false, error: 'Email manzil noto\'g\'ri formatda' });
        setLoading(false);
        return;
      }
      
      // Get all users from localStorage
      const usersData = localStorage.getItem('users');
      const users: Record<string, { password: string; user: any }> = usersData ? JSON.parse(usersData) : {};
      
      // Check if any admin already exists
      const hasAdmin = Object.values(users).some(entry => entry.user.role === 'admin');
      
      if (hasAdmin) {
        setResult({ success: false, error: 'Admin allaqachon mavjud' });
        console.log('❌ Admin already exists');
        setLoading(false);
        return;
      }
      
      // Check if email is already taken
      if (users[email]) {
        setResult({ success: false, error: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
        setLoading(false);
        return;
      }
      
      // Create admin user
      const adminUser = {
        id: `admin_${Date.now()}`,
        email,
        name,
        role: 'admin'
      };
      
      users[email] = {
        password,
        user: adminUser
      };
      
      localStorage.setItem('users', JSON.stringify(users));
      
      setResult({ success: true, message: 'Admin muvaffaqiyatli yaratildi! Endi login qiling.' });
      console.log('✅ Admin created:', adminUser);
      
      // Clear form after 2 seconds and go back
      setTimeout(() => {
        if (onBack) onBack();
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Error creating admin:', error);
      setResult({ success: false, error: error.message || 'Xatolik yuz berdi' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-gray-900 mb-2">Birinchi Admin yaratish</h2>
          <p className="text-gray-500">Bu faqat bir marta ishlaydi</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Email manzil</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900"
              placeholder="admin@market.uz"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Ism</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900"
              placeholder="Super Admin"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900"
              placeholder="Kamida 6 ta belgi"
            />
          </div>

          {result && (
            <div className={`p-4 rounded-xl ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`${result.success ? 'text-green-600' : 'text-red-600'}`}>
                {result.success ? `✅ ${result.message}` : `❌ ${result.error}`}
              </p>
            </div>
          )}

          <button
            onClick={createAdmin}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-4 rounded-xl hover:bg-purple-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Yaratilmoqda...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Admin yaratish</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-gray-700 text-sm mb-2">💡 Eslatma:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Bu faqat birinchi admin uchun</li>
            <li>• Ma'lumotlar localStorage'da saqlanadi</li>
            <li>• Admin yaratilgandan so'ng login sahifasiga o'tasiz</li>
          </ul>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 transition flex items-center justify-center gap-2 mt-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Orqaga qaytish</span>
          </button>
        )}
      </div>
    </div>
  );
}