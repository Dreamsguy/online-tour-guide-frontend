import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import VKAuth from 'react-vk-auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/profile');
    } catch (err) {
      setError('Неверные учетные данные');
    }
  };

  const handleVKLogin = (response) => {
    if (response.session) {
      const { user } = response.session;
      const email = user.email || `${user.id}@vk.com`;
      const name = `${user.first_name} ${user.last_name}`;
      try {
        login(email, 'vk-auth', name);
        navigate('/profile');
      } catch (err) {
        setError('Ошибка входа через VK');
      }
    } else {
      setError('Ошибка входа через VK');
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="card p-8 w-full max-w-md">
        <h1 className="text-5xl font-bold text-center mb-6">Вход</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-base font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-lg text-base"
              placeholder="Введите ваш email"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-base font-semibold mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-lg text-base"
              placeholder="Введите ваш пароль"
              required
            />
          </div>
          <button
            type="submit"
            className="p-4 rounded-lg w-full text-base font-medium"
          >
            ВОЙТИ
          </button>
        </form>
        <div className="mt-4 flex justify-center">
          <VKAuth
            apiId="YOUR_VK_APP_ID"
            onAuth={handleVKLogin}
            className="p-4 rounded-lg w-full text-base font-medium text-center"
          >
            Войти через VK
          </VKAuth>
        </div>
        <p className="text-center text-base mt-4">
          Нет аккаунта? <Link to="/register" className="text-primary hover:underline">Зарегистрироваться</Link>
        </p>
        <p className="text-center text-base mt-4">
          Тестовые учетные данные:<br />
          Админ: admin@belarusguide.by / admin123<br />
          Гид: guide@belarusguide.by / guide123<br />
          Менеджер: manager@belarusguide.by / manager123
        </p>
      </div>
    </div>
  );
}

export default Login;