import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function UserProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await api.get(`/api/auth/users/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        console.log('User Profile Response:', res.data);
        setProfile(res.data);
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err.response?.data || err);
        setError('Ошибка загрузки профиля: ' + (err.response?.data?.message || err.message));
      }
    };

    loadProfile();
  }, [user, id, navigate]);

  const isAdmin = user?.role === 'admin';

  if (!user) return null;
  if (error) return <div className="min-h-screen pt-24 text-center text-lg text-red-500">{error}</div>;
  if (!profile) return <div className="min-h-screen pt-24 text-center text-lg text-gray-300">Загрузка...</div>;

  return (
    <div className="min-h-screen pt-24 bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-yellow-400">Профиль пользователя</h1>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mb-6">
          <p><span className="font-semibold text-yellow-200">Имя:</span> {profile.name}</p>
          <p><span className="font-semibold text-yellow-200">Email:</span> {profile.email}</p>
          <p><span className="font-semibold text-yellow-200">Роль:</span> {profile.role}</p>
          {profile.role === 'guide' && (
            <>
              <p><span className="font-semibold text-yellow-200">ФИО:</span> {profile.fullName || 'Не указано'}</p>
              <p><span className="font-semibold text-yellow-200">Опыт:</span> {profile.experience || 'Не указан'}</p>
              <p><span className="font-semibold text-yellow-200">Проживание:</span> {profile.residence || 'Не указано'}</p>
              <p><span className="font-semibold text-yellow-200">Города работы:</span> {profile.cities || 'Не указаны'}</p>
              <p><span className="font-semibold text-yellow-200">Идеи:</span> {profile.ideas || 'Не указаны'}</p>
              <p><span className="font-semibold text-yellow-200">Описание фотографий:</span> {profile.photosDescription || 'Не указано'}</p>
              <p><span className="font-semibold text-yellow-200">Дополнительно:</span> {profile.otherInfo || 'Не указано'}</p>
            </>
          )}
          {isAdmin && (
            <div className="mt-4">
              <button
                onClick={() => navigate(`/user/${id}/edit`)}
                className="bg-blue-600 text-white p-2 rounded mr-2 hover:bg-blue-700"
              >
                Редактировать
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Удалить профиль?')) {
                    api.delete(`/api/auth/users/${id}`, {
                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    })
                      .then(() => navigate('/excursions'))
                      .catch(err => setError('Ошибка удаления: ' + err.message));
                  }
                }}
                className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
              >
                Удалить
              </button>
            </div>
          )}
          {!isAdmin && (
            <p className="text-gray-400">Только администратор может редактировать или удалять профиль.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;