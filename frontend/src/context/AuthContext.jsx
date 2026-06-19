import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage on mount
    const storedUser = localStorage.getItem('khedutsaathi_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from local storage', e);
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('khedutsaathi_user', JSON.stringify(userData));
  };

  const updateUser = (newUserData) => {
    // Merge existing user data with new user data
    const updated = { ...user, ...newUserData };
    setUser(updated);
    localStorage.setItem('khedutsaathi_user', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('khedutsaathi_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
