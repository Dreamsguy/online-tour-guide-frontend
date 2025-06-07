import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function ManagerSchedule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [guides, setGuides] = useState([]);
  const [excursions, setExcursions] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    guideId: '',
    excursionId: '',
    startTime: '',
    endTime: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role.toLowerCase() !== 'manager') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Получаем гидов организации
        const guidesRes = await api.get(`/api/users?organizationId=${user.organizationId}&role=Guide`);
        setGuides(guidesRes.data);

        // Получаем экскурсии организации
        const excursionsRes = await api.get(`/api/excursions?organizationId=${user.organizationId}`);
        setExcursions(excursionsRes.data);
      } catch (err) {
        setError('Ошибка загрузки данных: ' + (err.response?.data?.message || err.message));
      }
    };
    fetchData();
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setNewSchedule({ ...newSchedule, [e.target.name]: e.target.value });
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const scheduleData = {
        guideId: parseInt(newSchedule.guideId),
        excursionId: parseInt(newSchedule.excursionId),
        startTime: new Date(newSchedule.startTime).toISOString(),
        endTime: new Date(newSchedule.endTime).toISOString(),
      };

      await api.post('/api/schedules', scheduleData);
      alert('Расписание успешно добавлено!');
      setNewSchedule({ guideId: '', excursionId: '', startTime: '', endTime: '' });
    } catch (err) {
      setError('Ошибка добавления расписания: ' + (err.response?.data?.message || err.message));
    }
  };

  if (error) return <div className="min-h-screen pt-24 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen pt-24 bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Создание расписания</h1>
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Добавить расписание</h2>
          <form onSubmit={handleAddSchedule} className="space-y-4">
            <select
              name="guideId"
              value={newSchedule.guideId}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg border border-gray-300 text-gray-800"
              required
            >
              <option value="">Выберите гида</option>
              {guides.map((guide) => (
                <option key={guide.id} value={guide.id}>
                  {guide.username}
                </option>
              ))}
            </select>

            <select
              name="excursionId"
              value={newSchedule.excursionId}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg border border-gray-300 text-gray-800"
              required
            >
              <option value="">Выберите экскурсию</option>
              {excursions.map((excursion) => (
                <option key={excursion.id} value={excursion.id}>
                  {excursion.title}
                </option>
              ))}
            </select>

            <input
              type="datetime-local"
              name="startTime"
              value={newSchedule.startTime}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg border border-gray-300 text-gray-800"
              required
            />
            <input
              type="datetime-local"
              name="endTime"
              value={newSchedule.endTime}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg border border-gray-300 text-gray-800"
              required
            />

            <button
              type="submit"
              className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition"
            >
              Добавить в расписание
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ManagerSchedule;