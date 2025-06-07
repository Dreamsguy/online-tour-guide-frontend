import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

function BecomeGuide() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Вы должны быть авторизованы для подачи заявки.');
      return;
    }

    try {
      const response = await api.post('/api/auth/request-role', { requestedRole: 'guide' });
      setSuccess(response.data.message);
      setError('');
      setTimeout(() => navigate('/profile'), 2000); // Редирект через 2 секунды
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при подаче заявки.');
      setSuccess('');
    }
  };

  if (!user || user.role !== 'user') {
    return (
      <div className="min-h-screen pt-24 bg-gray-900 text-gray-200 text-center">
        <h1 className="text-3xl font-bold mb-4">Стать гидом</h1>
        <p>Только пользователи могут подать заявку на роль гида. Пожалуйста, войдите или зарегистрируйтесь.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-yellow-400">Стать гидом</h1>
        <p className="mb-6 text-center">Подайте заявку, чтобы стать гидом. Ваша заявка будет рассмотрена администратором.</p>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Подать заявку
          </button>
        </form>
      </div>
    </div>
  );
}

export default BecomeGuide;