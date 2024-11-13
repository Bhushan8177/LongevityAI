import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const signIn = async (email, password) => {
    try {
      // In a real app, validate credentials with API
      const userData = { id: Date.now().toString(), email };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      router.replace('/home');
    } catch (error) {
      throw new Error('Sign in failed');
    }
  };

  const signOut = async () => {
    try {
      // await AsyncStorage.removeItem('user');
      // setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);