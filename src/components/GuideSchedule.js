import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function GuideSchedule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role.toLowerCase() !== 'guide') {
      navigate('/login');
      return;
    }

    const fetchSchedule = async () => {
      try {
        const res = await api.get(`/api/schedules/guide/${user.id}`);
        setSchedule(res.data);
      } catch (err) {
        setError('Ошибка загрузки расписания: ' + (err.response?.data?.message || err.message));
      }
    };
    fetchSchedule();
  }, [user, navigate]);

  if (error) return <div className="min-h-screen pt-24 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen pt-24 bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Моё расписание</h1>
        {schedule.length === 0 ? (
          <p className="text-center text-gray-400">Расписание пусто.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedule.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-yellow-300">{item.excursion.title}</h3>
                <p className="mt-2">Начало: {new Date(item.startTime).toLocaleString()}</p>
                <p>Конец: {new Date(item.endTime).toLocaleString()}</p>
                <p>Статус: {item.status}</p>
                <button
                  onClick={() => navigate(`/excursion/${item.excursionId}`)}
                  className="mt-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                >
                  Подробнее об экскурсии
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GuideSchedule;