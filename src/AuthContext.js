import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(() => {
    const storedUsers = localStorage.getItem('users');
    return storedUsers
      ? JSON.parse(storedUsers)
      : [
          { email: 'admin@belarusguide.by', name: 'Админ', role: 'admin', createdAt: new Date().toISOString() },
          { email: 'guide@belarusguide.by', name: 'Гид Иван', role: 'guide', createdAt: new Date().toISOString() },
          { email: 'manager@belarusguide.by', name: 'Менеджер Мария', role: 'manager', createdAt: new Date().toISOString() },
        ];
  });
  const [settings, setSettings] = useState(() => {
    const storedSettings = localStorage.getItem('settings');
    return storedSettings ? JSON.parse(storedSettings) : { currency: 'EUR', language: 'ru' };
  });

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const login = (email, password, name = 'Пользователь', role = 'user') => {
    const foundUser = users.find(u => u.email === email && u.email.includes('@belarusguide.by'));
    if (foundUser && password !== 'vk-auth') {
      setUser({ email: foundUser.email, name: foundUser.name, role: foundUser.role });
    } else if (password !== 'vk-auth') {
      const newUser = { email, name, role, createdAt: new Date().toISOString() };
      setUsers([...users, newUser]);
      setUser(newUser);
    } else {
      throw new Error('Неверные учетные данные');
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, users, setUsers, settings, setSettings, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}