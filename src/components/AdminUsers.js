import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function AdminUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/excursions');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/users');
        setUsers(response.data);
      } catch (err) {
        console.error('Ошибка загрузки пользователей:', err);
        setError('Не удалось загрузить список пользователей.');
      }
    };
    fetchUsers();
  }, [user, navigate]);

  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm('Вы уверены, что хотите удалить этого пользователя?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      alert('Пользователь успешно удалён!');
    } catch (err) {
      console.error('Ошибка удаления пользователя:', err);
      alert(`Ошибка при удалении: ${err.response?.data?.message || 'Проблема на сервере'}`);
    }
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      const response = await api.put(`/api/users/${id}/role`, { role: newRole });
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
      alert('Роль пользователя обновлена!');
    } catch (err) {
      console.error('Ошибка изменения роли:', err);
      alert(`Ошибка при изменении роли: ${err.response?.data?.message || 'Проблема на сервере'}`);
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1>Управление пользователями</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(u => (
            <div key={u.id} className="card animate-fade-in">
              <div className="p-4">
                <h3 className="card-title">{u.username}</h3>
                <p className="card-text mb-2">Роль: {u.role}</p>
                <p className="card-text mb-2">Email: {u.email || 'Не указан'}</p>
                <div className="flex space-x-3 mt-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleChangeRole(u.id, e.target.value)}
                    className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
                  >
                    <option value="user">Пользователь</option>
                    <option value="guide">Гид</option>
                    <option value="manager">Менеджер</option>
                    <option value="admin">Администратор</option>
                  </select>
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="btn-secondary w-full"
                  >
                    УДАЛИТЬ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;