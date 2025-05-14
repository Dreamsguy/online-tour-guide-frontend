import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
      navigate('/profile'); // Перенаправление в профиль
    } catch (err) {
      setError('Ошибка регистрации');
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="card p-8 w-full max-w-md">
        <h1 className="text-5xl font-bold text-center mb-6">Регистрация</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-base font-semibold mb-2">Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-lg text-base"
              placeholder="Введите ваше имя"
              required
            />
          </div>
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
          <div className="mb-4">
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
          <div className="mb-6">
            <label className="block text-base font-semibold mb-2">Роль</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-4 rounded-lg text-base"
            >
              <option value="user">Пользователь</option>
              <option value="manager">Менеджер</option>
              <option value="guide">Гид</option>
            </select>
          </div>
          <button
            type="submit"
            className="p-4 rounded-lg w-full text-base font-medium"
          >
            ЗАРЕГИСТРИРОВАТЬСЯ
          </button>
        </form>
        <p className="text-center text-base mt-4">
          Уже есть аккаунт? <Link to="/login" className="text-primary hover:underline">Войти</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;