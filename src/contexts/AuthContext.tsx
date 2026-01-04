import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'customer' | 'vendor' | 'admin';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize demo users immediately
  const initializeDemoUsers = () => {
    try {
      const demoUsers = {
        'customer@dream.com': {
          user: { id: 'customer1', email: 'customer@dream.com', name: 'Customer Demo', role: 'customer' as const },
          password: 'customer123'
        },
        'vendor@dream.com': {
          user: { id: 'vendor1', email: 'vendor@dream.com', name: 'Vendor Demo', role: 'vendor' as const },
          password: 'vendor123'
        },
        'admin@dream.com': {
          user: { id: 'admin1', email: 'admin@dream.com', name: 'Admin Demo', role: 'admin' as const },
          password: 'admin123'
        },
        // ✅ YANGI: Real foydalanuvchi uchun account
        '23komilov@gmail.com': {
          user: { id: 'user_komilov', email: '23komilov@gmail.com', name: 'Komilov', role: 'customer' as const },
          password: 'tele1212'
        }
      };
      
      // Save or merge with existing users
      const existingUsersData = localStorage.getItem('users');
      if (!existingUsersData) {
        localStorage.setItem('users', JSON.stringify(demoUsers));
        console.log('✅ Demo users initialized:', Object.keys(demoUsers));
        return demoUsers;
      } else {
        const existingUsers = JSON.parse(existingUsersData);
        // Merge demo users with existing users (don't overwrite existing)
        let updated = false;
        for (const [email, userData] of Object.entries(demoUsers)) {
          if (!existingUsers[email]) {
            existingUsers[email] = userData;
            updated = true;
            console.log(`➕ Added demo user: ${email}`);
          }
        }
        
        if (updated) {
          localStorage.setItem('users', JSON.stringify(existingUsers));
          console.log('✅ Demo users merged with existing users');
        }
        
        console.log('✅ Users loaded:', Object.keys(existingUsers));
        return existingUsers;
      }
    } catch (error) {
      console.error('❌ Error initializing demo users:', error);
      return {};
    }
  };

  // Initialize users on mount
  useEffect(() => {
    initializeDemoUsers();
  }, []);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          console.log('✅ Loaded current user:', parsed.email);
        } else {
          console.log('ℹ️ No current user found');
        }
      } catch (error) {
        console.error('❌ Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Signing in with:', { email, password: '***' });
      
      // Ensure demo users are initialized
      const currentUsers = initializeDemoUsers();
      
      // Get all users from localStorage (freshly)
      const usersData = localStorage.getItem('users');
      console.log('📦 localStorage users data:', usersData ? 'exists' : 'missing');
      
      const users: Record<string, { password: string; user: User }> = usersData ? JSON.parse(usersData) : currentUsers;
      console.log('👥 Available users:', Object.keys(users));
      
      // Find user by email
      const userEntry = users[email];
      console.log('🔍 Looking for user:', email);
      console.log('✓ User found:', userEntry ? 'YES' : 'NO');
      
      if (!userEntry) {
        console.error('❌ User not found. Available emails:', Object.keys(users));
        throw new Error('Foydalanuvchi topilmadi');
      }
      
      console.log('🔑 Checking password...');
      if (userEntry.password !== password) {
        console.error('❌ Password mismatch');
        throw new Error('Parol noto\'g\'ri');
      }
      
      // Set current user
      setUser(userEntry.user);
      localStorage.setItem('currentUser', JSON.stringify(userEntry.user));
      
      console.log('✅ Sign in successful:', userEntry.user);
    } catch (error: any) {
      console.error('❌ Sign in error:', error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('📝 Signing up:', email, name);
      
      // Get all users from localStorage
      const usersData = localStorage.getItem('users');
      const users: Record<string, { password: string; user: User }> = usersData ? JSON.parse(usersData) : {};
      
      // Check if user already exists
      if (users[email]) {
        throw new Error('Bu email allaqachon ro\'yxatdan o\'tgan');
      }
      
      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        role: 'customer'
      };
      
      // Save user
      users[email] = {
        password,
        user: newUser
      };
      
      localStorage.setItem('users', JSON.stringify(users));
      
      // Set as current user
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      console.log('✅ Sign up successful:', newUser);
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    console.log('👋 Signed out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}