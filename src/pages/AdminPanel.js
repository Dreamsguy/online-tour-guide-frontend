import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

function AdminPanel() {
  const { user, users, setUsers } = useAuth();
  const [newExcursion, setNewExcursion] = useState({ title: '', price: '', description: '' });
  const [newAttraction, setNewAttraction] = useState({ name: '', description: '' });
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });

  const handleAddExcursion = () => {
    if (!newExcursion.title || !newExcursion.price || !newExcursion.description) {
      alert('Пожалуйста, заполните все поля для экскурсии.');
      return;
    }
    alert(`Добавлена экскурсия: ${newExcursion.title}`);
    setNewExcursion({ title: '', price: '', description: '' });
  };

  const handleAddAttraction = () => {
    if (!newAttraction.name || !newAttraction.description) {
      alert('Пожалуйста, заполните все поля для достопримечательности.');
      return;
    }
    alert(`Добавлена достопримечательность: ${newAttraction.name}`);
    setNewAttraction({ name: '', description: '' });
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      alert('Пожалуйста, заполните все поля для пользователя.');
      return;
    }
    if (users.some(u => u.email === newUser.email)) {
      alert('Пользователь с таким email уже существует.');
      return;
    }
    setUsers([...users, { ...newUser, createdAt: new Date().toISOString() }]);
    setNewUser({ name: '', email: '', role: 'user' });
  };

  const handleDeleteUser = (email) => {
    if (email === 'admin@belarusguide.by') {
      alert('Первого администратора нельзя удалить!');
      return;
    }
    setUsers(users.filter(u => u.email !== email));
  };

  if (!user || user.role !== 'admin') {
    return <div className="min-h-screen bg-gray-100 font-sans pt-20 text-center text-gray-500 text-sm">Доступ запрещен</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Панель администратора - Руководство по Беларуси</h1>
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Добавить экскурсию</h2>
          <input
            type="text"
            placeholder="Название экскурсии"
            className="p-2 w-full border rounded mb-2 text-sm"
            value={newExcursion.title}
            onChange={(e) => setNewExcursion({ ...newExcursion, title: e.target.value })}
          />
          <input
            type="number"
            placeholder="Цена (€)"
            className="p-2 w-full border rounded mb-2 text-sm"
            value={newExcursion.price}
            onChange={(e) => setNewExcursion({ ...newExcursion, price: e.target.value })}
          />
          <input
            type="text"
            placeholder="Описание"
            className="p-2 w-full border rounded mb-2 text-sm"
            value={newExcursion.description}
            onChange={(e) => setNewExcursion({ ...newExcursion, description: e.target.value })}
          />
          <button
            className="bg-black text-white p-2 rounded w-full hover:bg-gray-800 transition text-sm"
            onClick={handleAddExcursion}
          >
            ДОБАВИТЬ ЭКСКУРСИЮ
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Добавить достопримечательность</h2>
          <input
            type="text"
            placeholder="Название достопримечательности"
            className="p-2 w-full border rounded mb-2 text-sm"
            value={newAttraction.name}
            onChange={(e) => setNewAttraction({ ...newAttraction, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Описание"
            className="p-2 w-full border rounded mb-2 text-sm"
            value={newAttraction.description}
            onChange={(e) => setNewAttraction({ ...newAttraction, description: e.target.value })}
          />
          <button
            className="bg-black text-white p-2 rounded w-full hover:bg-gray-800 transition text-sm"
            onClick={handleAddAttraction}
          >
            ДОБАВИТЬ ДОСТОПРИМЕЧАТЕЛЬНОСТЬ
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Управление пользователями</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Имя"
              className="p-2 w-full border rounded mb-2 text-sm"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="p-2 w-full border rounded mb-2 text-sm"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="p-2 w-full border rounded mb-2 text-sm"
            >
              <option value="user">Пользователь</option>
              <option value="manager">Менеджер</option>
              <option value="guide">Гид</option>
              <option value="admin">Администратор</option>
            </select>
            <button
              className="bg-black text-white p-2 rounded w-full hover:bg-gray-800 transition text-sm"
              onClick={handleAddUser}
            >
              ДОБАВИТЬ ПОЛЬЗОВАТЕЛЯ
            </button>
          </div>
          <h3 className="text-xl font-semibold mb-2">Список пользователей</h3>
          {users.map(u => (
            <div key={u.email} className="p-2 border-b text-sm flex justify-between">
              <div>
                <p>{u.name} ({u.email}) - {u.role}</p>
              </div>
              <button
                className="bg-red-600 text-white p-1 rounded hover:bg-red-700 transition text-sm"
                onClick={() => handleDeleteUser(u.email)}
              >
                УДАЛИТЬ
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;