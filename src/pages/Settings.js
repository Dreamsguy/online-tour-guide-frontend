import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

function Settings() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'Русский');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'EUR');
  const [distanceUnit, setDistanceUnit] = useState(() => localStorage.getItem('distanceUnit') || 'km');
  const [bookingNotifications, setBookingNotifications] = useState(() => localStorage.getItem('bookingNotifications') === 'true');

  useEffect(() => {
    // Применяем тему
    document.body.className = theme === 'dark' ? 'dark' : '';
  }, [theme]);

  const handleSave = () => {
    login(email, null, name); // Обновляем данные пользователя
    // Сохраняем настройки в localStorage
    localStorage.setItem('language', language);
    localStorage.setItem('theme', theme);
    localStorage.setItem('currency', currency);
    localStorage.setItem('distanceUnit', distanceUnit);
    localStorage.setItem('bookingNotifications', bookingNotifications);
    alert('Настройки сохранены!');
  };

  if (!user) {
    return <div className="min-h-screen pt-20 text-center text-gray-500 text-sm">Пожалуйста, войдите в аккаунт</div>;
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Настройки</h1>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded text-sm"
              placeholder="Введите ваше имя"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded text-sm"
              placeholder="Введите ваш email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Язык</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border rounded text-sm"
            >
              <option>Русский</option>
              <option>English</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Тема</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="light">Светлая</option>
              <option value="dark">Тёмная</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Валюта</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="RUB">RUB (₽)</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Единицы расстояния</label>
            <select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value)}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="km">Километры (км)</option>
              <option value="mi">Мили (mi)</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={bookingNotifications}
                onChange={(e) => setBookingNotifications(e.target.checked)}
                className="form-checkbox"
              />
              <span className="text-gray-700 text-sm">Уведомления о бронированиях</span>
            </label>
          </div>
          <button
            onClick={handleSave}
            className="bg-black text-white p-2 rounded w-full hover:bg-gray-800 transition text-sm"
          >
            СОХРАНИТЬ
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;