import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function ForGuides() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    experience: '',
    residence: '',
    cities: '',
    ideas: '',
    photosDescription: '',
    otherInfo: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Пожалуйста, авторизуйтесь для подачи заявки.');
      navigate('/login');
      return;
    }

    try {
      await api.post('/api/auth/request-role', {
        ...formData,
        role: 'guide',
        userId: user.id,
      });
      alert('Заявка на роль гида успешно отправлена на модерацию!');
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка отправки заявки');
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Стать гидом</h1>
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-yellow-200">ФИО</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-yellow-200">Опыт работы</label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 text-gray-800"
                rows="3"
                required
              />
            </div>
            <div>
              <label className="block text-yellow-200">Место проживания</label>
              <input
                type="text"
                name="residence"
                value={formData.residence}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-yellow-200">Города работы</label>
              <input
                type="text"
                name="cities"
                value={formData.cities}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-yellow-200">Интересные идеи</label>
              <textarea
                name="ideas"
                value={formData.ideas}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 text-gray-800"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-yellow-200">Описание фотографий</label>
              <textarea
                name="photosDescription"
                value={formData.photosDescription}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 text-gray-800"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-yellow-200">Дополнительная информация</label>
              <textarea
                name="otherInfo"
                value={formData.otherInfo}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 text-gray-800"
                rows="3"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
            >
              Отправить заявку
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForGuides;