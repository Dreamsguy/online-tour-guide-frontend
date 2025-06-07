import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/passwordreset/reset', { token, newPassword });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Ошибка: ' + err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Сброс пароля</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-base font-semibold mb-2">Новый пароль</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-4 rounded-lg border"
              placeholder="Введите новый пароль"
              required
            />
          </div>
          <button type="submit" className="w-full bg-black text-white p-4 rounded-lg font-medium hover:bg-gray-800 transition">
            СБРОСИТЬ ПАРОЛЬ
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;