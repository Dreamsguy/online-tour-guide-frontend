import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function UserProfile() {
  const { user } = useAuth();
  const { id } = useParams();
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
        setProfile(res.data);
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err.response?.data || err);
        setError('Ошибка загрузки профиля: ' + (err.response?.data?.message || err.message));
      }
    };

    loadProfile();
  }, [user, id, navigate]);

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
              <p><span className="font-semibold text-yellow-200">ФИО:</span> {profile.fullName}</p>
              <p><span className="font-semibold text-yellow-200">Опыт:</span> {profile.experience}</p>
              <p><span className="font-semibold text-yellow-200">Проживание:</span> {profile.residence}</p>
              <p><span className="font-semibold text-yellow-200">Города работы:</span> {profile.cities}</p>
              <p><span className="font-semibold text-yellow-200">Идеи:</span> {profile.ideas}</p>
              <p><span className="font-semibold text-yellow-200">Описание фотографий:</span> {profile.photosDescription}</p>
              <p><span className="font-semibold text-yellow-200">Дополнительно:</span> {profile.otherInfo}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;