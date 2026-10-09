import React, { createContext, useContext, useState, useEffect } from 'react';
import { DemoUser } from '../types';

export const DEMO_ACCOUNTS: DemoUser[] = [
  {
    id: 'user-aarav',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campus.edu',
    role: 'student',
    rollNo: '22CS104',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-priya',
    name: 'Priya Patel',
    email: 'priya.patel@campus.edu',
    role: 'student',
    rollNo: '23EC078',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-officer-raj',
    name: 'Officer Rajendra Kumar',
    email: 'security.desk@campus.edu',
    role: 'admin',
    rollNo: 'STAFF-SEC-09',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-guest',
    name: 'Campus Visitor',
    email: 'guest@campus.edu',
    role: 'student',
    rollNo: 'VISITOR',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  }
];

interface AuthContextType {
  currentUser: DemoUser;
  switchUser: (userId: string) => void;
  availableUsers: DemoUser[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<DemoUser>(() => {
    const saved = localStorage.getItem('findback_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const found = DEMO_ACCOUNTS.find(u => u.id === parsed.id);
        if (found) return found;
      } catch (e) {
        console.error('Error parsing saved demo user:', e);
      }
    }
    return DEMO_ACCOUNTS[0]; // Default: Aarav Sharma
  });

  const switchUser = (userId: string) => {
    const found = DEMO_ACCOUNTS.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('findback_current_user', JSON.stringify(found));
    }
  };

  useEffect(() => {
    localStorage.setItem('findback_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, switchUser, availableUsers: DEMO_ACCOUNTS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
