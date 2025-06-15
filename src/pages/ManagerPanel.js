import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import AddExcursion from '../components/AddExcursion';

function ManagerPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [excursions, setExcursions] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'manager') {
      navigate('/');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    axios
      .get(`http://localhost:5248/api/excursions/manager/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log('Ответ от API:', res.data);
        setExcursions(res.data.excursions || []);
        setOrganization(res.data.organization);
      })
      .catch((err) => {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные. Проверьте сервер или обратитесь к администратору.');
        if (err.response?.status === 401) navigate('/login');
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user || user.role !== 'manager') return null;

  if (loading) return <div className="text-center py-10">Загрузка...</div>;

  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  if (showAddForm && organization) {
    return (
      <AddExcursion
        managerId={user.id}
        organizationId={organization.id}
        onClose={() => setShowAddForm(false)}
        initialData={{
          managerId: user.id,
          organizationId: organization.id,
          isDisabledOrganization: true,
        }}
      />
    );
  }

  if (showEditForm && organization) {
    const excursionToEdit = excursions.find((e) => e.id === showEditForm);
    return (
      <AddExcursion
        managerId={user.id}
        organizationId={organization.id}
        onClose={() => setShowEditForm(null)}
        initialData={{
          ...excursionToEdit,
          managerId: user.id,
          organizationId: organization.id,
          isDisabledOrganization: true,
        }}
        isEditMode={true}
      />
    );
  }

  const handleDeleteExcursion = (id) => {
    const token = localStorage.getItem('token');
    axios
      .delete(`http://localhost:5248/api/excursions/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setExcursions(excursions.filter((e) => e.id !== id));
      })
      .catch((err) => console.error('Ошибка удаления экскурсии:', err));
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Панель менеджера</h1>
        <div className="bg-gray-800/80 backdrop-blur-md p-6 rounded-xl shadow-2xl w-full max-w-2xl mx-auto border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-200">Организация</h2>
          {organization ? (
            <p className="text-gray-200">Название: {organization.name || 'Не указано'}</p>
          ) : (
            <p className="text-gray-300">Организация не привязана</p>
          )}

          <h2 className="text-2xl font-semibold mt-6 mb-4 text-yellow-200">Управление экскурсиями</h2>
          {excursions.length ? (
            excursions.map((e) => (
              <div key={e.id} className="border-b py-2 flex justify-between items-center">
                <p className="text-gray-200">{e.title} - {e.status}</p>
                <div>
                  <button
                    className="bg-blue-500 text-white p-2 rounded mr-2 hover:bg-blue-600 transition"
                    onClick={() => setShowEditForm(e.id)}
                  >
                    Редактировать
                  </button>
                  <button
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                    onClick={() => handleDeleteExcursion(e.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-300">Экскурсий нет</p>
          )}

          <button
            className="mt-6 w-full bg-yellow-600 text-white p-3 rounded-lg font-medium hover:bg-yellow-500 transition shadow-md"
            onClick={() => setShowAddForm(true)}
          >
            Добавить экскурсию
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManagerPanel;