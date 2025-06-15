import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function UserProfileEdit() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: '', email: '', role: '', fullName: '', experience: '', residence: '', cities: '', ideas: '', photosDescription: '', otherInfo: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/excursions');
      return;
    }
    api.get(`/api/auth/users/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Ошибка загрузки профиля: ' + err.message);
        setLoading(false);
      });
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.put(`/api/auth/users/${id}`, profile, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(() => navigate(`/user/${id}`))
      .catch(err => setError('Ошибка обновления: ' + err.message));
  };

  if (loading) return <div className="min-h-screen pt-24 text-center text-lg text-gray-300">Загрузка...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (user?.role !== 'admin') return <div className="min-h-screen pt-24 text-center text-lg text-red-500">Доступ запрещён</div>;

  return (
    <div className="min-h-screen pt-24 bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-yellow-400">Редактирование профиля</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <div>
            <label className="block text-yellow-200">Имя:</label>
            <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
          </div>
          <div>
            <label className="block text-yellow-200">Email:</label>
            <input type="email" name="email" value={profile.email} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
          </div>
          <div>
            <label className="block text-yellow-200">Роль:</label>
            <select name="role" value={profile.role} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white">
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="guide">Guide</option>
            </select>
          </div>
          {profile.role === 'guide' && (
            <>
              <div>
                <label className="block text-yellow-200">ФИО:</label>
                <input type="text" name="fullName" value={profile.fullName} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
              </div>
              <div>
                <label className="block text-yellow-200">Опыт:</label>
                <input type="text" name="experience" value={profile.experience} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
              </div>
              <div>
                <label className="block text-yellow-200">Проживание:</label>
                <input type="text" name="residence" value={profile.residence} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
              </div>
              <div>
                <label className="block text-yellow-200">Города работы:</label>
                <input type="text" name="cities" value={profile.cities} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
              </div>
              <div>
                <label className="block text-yellow-200">Идеи:</label>
                <input type="text" name="ideas" value={profile.ideas} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
              </div>
              <div>
                <label className="block text-yellow-200">Описание фотографий:</label>
                <input type="text" name="photosDescription" value={profile.photosDescription} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
              </div>
              <div>
                <label className="block text-yellow-200">Дополнительно:</label>
                <input type="text" name="otherInfo" value={profile.otherInfo} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
              </div>
            </>
          )}
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Сохранить</button>
          {error && <p className="text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default UserProfileEdit;