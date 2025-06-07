import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attractions, setAttractions] = useState([]);
  const [newAttraction, setNewAttraction] = useState({
    name: '', image: '', description: '', coordinates: null, history: '', visitingHours: '', entryFee: '', city: '', rating: 0,
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/unauthorized');
      return;
    }
    api.get('/api/attractions').then(res => setAttractions(res.data));
  }, [user, navigate]);

  const handleAddAttraction = () => {
    if (!newAttraction.name || !newAttraction.city) {
      alert('Заполните обязательные поля (название, город).');
      return;
    }
    api.post('/api/attractions', {
      ...newAttraction,
      coordinates: newAttraction.coordinates ? { x: newAttraction.coordinates[0], y: newAttraction.coordinates[1] } : null,
      entryFee: newAttraction.entryFee ? parseFloat(newAttraction.entryFee) : null,
    }).then(res => setAttractions([...attractions, res.data]));
  };

  const handleDeleteAttraction = (id) => {
    api.delete(`/api/attractions/${id}`).then(() => {
      setAttractions(attractions.filter(attr => attr.id !== id));
    });
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-12">Панель администратора</h1>
        {/* Форма добавления */}
        <div className="card p-8 max-w-lg mx-auto mb-12">
          <h2 className="text-3xl font-semibold mb-6">Добавить достопримечательность</h2>
          <input type="text" placeholder="Название" value={newAttraction.name} onChange={(e) => setNewAttraction({ ...newAttraction, name: e.target.value })} className="w-full p-4 rounded-lg mb-4" />
          <input type="text" placeholder="Город" value={newAttraction.city} onChange={(e) => setNewAttraction({ ...newAttraction, city: e.target.value })} className="w-full p-4 rounded-lg mb-4" />
          <input type="text" placeholder="URL изображения" value={newAttraction.image} onChange={(e) => setNewAttraction({ ...newAttraction, image: e.target.value })} className="w-full p-4 rounded-lg mb-4" />
          <input type="text" placeholder="Стоимость входа" value={newAttraction.entryFee} onChange={(e) => setNewAttraction({ ...newAttraction, entryFee: e.target.value })} className="w-full p-4 rounded-lg mb-4" />
          <button onClick={handleAddAttraction} className="p-4 rounded-lg w-full text-base font-medium">Добавить</button>
        </div>
        {/* Список достопримечательностей */}
        <div className="grid grid-cols-1 gap-6">
          {attractions.map(attraction => (
            <div key={attraction.id} className="card p-4">
              <h3 className="text-2xl font-semibold">{attraction.name}</h3>
              <button onClick={() => handleDeleteAttraction(attraction.id)} className="bg-red-500 text-white p-2 rounded mt-2">Удалить</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;