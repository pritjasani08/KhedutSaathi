import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('khedutsaathi_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse user from local storage', e);
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    // Keep this for any future side effects on mount
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
