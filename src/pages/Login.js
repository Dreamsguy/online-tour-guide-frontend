import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      login(token, user);
      if (user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сети или неверные данные');
    }
  };

  return (
    <div
      className="min-h-screen pt-0 bg-cover bg-center"
      style={{
        backgroundImage: "url('/Города Беларуси.jpg')",
        backgroundSize: 'cover',
        minHeight: '100vh',
      }}
    >
      <div className="bg-black bg-opacity-40 h-screen">
        <div className="container mx-auto py-12 px-4">
          <h1 className="text-7xl font-forum font-normal text-center mb-12 text-white tracking-[0.2em]">
            Вход
          </h1>
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 mb-12 bg-opacity-80 relative">
            <div
              className="diamond w-30 h-30 bg-glass absolute"
              style={{ top: '-15px', left: '-15px' }}
            ></div>
            <div
              className="diamond w-30 h-30 bg-glass absolute"
              style={{ bottom: '-15px', right: '-15px' }}
            ></div>
            {error && (
              <p className="text-red-500 mb-4 text-xl text-center bg-red-900/30 p-4 rounded-lg">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-2xl font-forum mb-2 text-yellow-400">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Введите ваш email"
                  required
                />
              </div>
              <div>
                <label className="block text-2xl font-forum mb-2 text-yellow-400">
                  Пароль
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Введите ваш пароль"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-forum text-2xl"
              >
                Войти
              </button>
              <div className="text-center text-xl mt-4 text-gray-400 font-forum">
                <p>
                  Нет аккаунта?{' '}
                  <Link to="/register" className="text-yellow-400 hover:underline">
                    Регистрация
                  </Link>
                </p>
                <p className="mt-2">
                  Забыли пароль?{' '}
                  <Link to="/forgot-password" className="text-yellow-400 hover:underline">
                    Восстановить
                  </Link>
                </p>
                <p className="mt-2">
                  <Link to="/" className="text-yellow-400 hover:underline">
                    Главная
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;