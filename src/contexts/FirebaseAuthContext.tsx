import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for persisted owner session
    const ownerRank = localStorage.getItem('ownerRank');
    const ownerData = localStorage.getItem('ownerData');
    
    if (ownerRank === 'true' && ownerData) {
      try {
        const parsedOwnerData = JSON.parse(ownerData);
        const mockOwnerUser = {
          uid: 'owner-orko',
          email: parsedOwnerData.email,
          displayName: 'Orko',
          photoURL: '/orko.jpeg',
          emailVerified: true,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async () => ({} as any),
          reload: async () => {},
          toJSON: () => ({}),
          providerId: 'owner-rank'
        } as User;
        setUser(mockOwnerUser);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('ownerRank');
        localStorage.removeItem('ownerData');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (result.user) {
      await updateProfile(result.user, { displayName });
    }
  };

  const login = async (email: string, password: string) => {
    // Check for hardcoded owner accounts
    if ((email === 'orko' && password === 'owner') || 
        (email === 'orko@admin.com' && password === 'admin123')) {
      // Create a mock user object for the owner
      const mockOwnerUser = {
        uid: 'owner-orko',
        email: email === 'orko' ? 'orko@sanvitv.com' : 'orko@admin.com',
        displayName: 'Orko',
        photoURL: '/orko.jpeg',
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: '',
        tenantId: null,
        delete: async () => {},
        getIdToken: async () => '',
        getIdTokenResult: async () => ({} as any),
        reload: async () => {},
        toJSON: () => ({}),
        providerId: 'owner-rank'
      } as User;
      
      setUser(mockOwnerUser);
      // Store owner status and data in localStorage for persistence
      localStorage.setItem('ownerRank', 'true');
      localStorage.setItem('ownerData', JSON.stringify({ email: mockOwnerUser.email }));
      return;
    }
    
    // Clear owner status for regular login
    localStorage.removeItem('ownerRank');
    localStorage.removeItem('ownerData');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    localStorage.removeItem('ownerRank');
    localStorage.removeItem('ownerData');
    setUser(null);
    await signOut(auth);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    loginWithGoogle,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
