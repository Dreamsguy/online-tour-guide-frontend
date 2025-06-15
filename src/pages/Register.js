import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

 const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        console.log('Sending registration:', { email, name, password }); // Отладка
        const response = await api.post('/api/auth/register', { email, name, password });
        if (response.data.message === 'Регистрация успешна') {
            const loginResponse = await api.post('/api/auth/login', { email, password });
            const { token, user } = loginResponse.data;
            login(token, user);
            setSuccessMessage('Регистрация успешна!');
            setTimeout(() => navigate('/'), 2000);
        } else {
            setError(response.data.message || 'Ошибка регистрации');
        }
    } catch (err) {
        console.error('Registration error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Ошибка сервера');
    }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200 flex items-center justify-center pt-24">
      <div className="bg-gray-800/80 backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-6 text-yellow-400">Регистрация</h1>
        {error && <p className="text-red-400 text-center mb-4 bg-red-900/30 p-4 rounded-lg">{error}</p>}
        {successMessage && (
          <p className="text-green-400 text-center mb-4 bg-green-900/30 p-4 rounded-lg">{successMessage}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base font-semibold mb-2 text-yellow-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Введите ваш email"
              required
            />
          </div>
          <div>
            <label className="block text-base font-semibold mb-2 text-yellow-200">Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Введите ваше имя"
              required
            />
          </div>
          <div>
            <label className="block text-base font-semibold mb-2 text-yellow-200">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Введите ваш пароль"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white p-4 rounded-lg font-medium hover:bg-gray-800 transition shadow-md"
          >
            ЗАРЕГИСТРИРОВАТЬСЯ
          </button>
          <p className="text-center text-base mt-4 text-gray-400">
            Уже есть аккаунт? <Link to="/login" className="text-yellow-400 hover:underline">Войти</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;