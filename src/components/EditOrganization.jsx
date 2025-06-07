import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

function EditOrganization() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/organizations/${id}`);
        setForm(res.data);
        setLoading(false);
      } catch (err) {
        alert('Ошибка загрузки: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/admin/organizations/${id}`, form);
      alert('Организация обновлена.');
      navigate('/profile');
    } catch (err) {
      alert('Ошибка: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="min-h-screen pt-24 text-center text-lg text-gray-300">Загрузка...</div>;

  return (
    <div className="min-h-screen pt-24 bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Редактировать организацию</h1>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
          <div className="mb-4">
            <label className="block text-base font-semibold mb-2 text-yellow-200">Название</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-base font-semibold mb-2 text-yellow-200">Рейтинг</label>
            <input
              type="number"
              value={form.rating || ''}
              onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) })}
              className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
            />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition">
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditOrganization;