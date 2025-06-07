import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';

function ManagerPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [excursions, setExcursions] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'manager') navigate('/');
    else {
      axios.get(`api/excursions/manager/${user.id}`).then(res => setExcursions(res.data));
    }
  }, [user, navigate]);

  if (!user || user.role !== 'manager') return null;

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Панель менеджера</h1>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Управление экскурсиями</h2>
          {excursions.length ? excursions.map(e => (
            <div key={e.id} className="border-b py-2">
              <p>{e.title} - {e.status}</p>
              <button className="bg-blue-500 text-white p-2 rounded">Редактировать</button>
            </div>
          )) : <p>Экскурсий нет</p>}
        </div>
      </div>
    </div>
  );
}

export default ManagerPanel;