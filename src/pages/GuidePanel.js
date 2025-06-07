import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function GuidePanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [excursions, setExcursions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !user.role.includes('guide')) {
      navigate('/login');
      return;
    }

    const fetchExcursions = async () => {
      try {
        const res = await api.get('/api/excursions');
        const guideExcursions = res.data.filter(e => e.guideId === user.id && e.isIndividual);
        setExcursions(guideExcursions);
      } catch (err) {
        setError('Ошибка загрузки экскурсий: ' + (err.response?.data?.message || err.message));
      }
    };

    const fetchBookings = async () => {
      try {
        const res = await api.get('/api/bookings');
        const guideBookings = res.data.filter(b => excursions.some(e => e.id === b.excursionId));
        setBookings(guideBookings);
      } catch (err) {
        setError('Ошибка загрузки бронирований: ' + (err.response?.data?.message || err.message));
      }
    };

    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/api/guides/${user.id}/analytics`);
        setAnalytics(res.data);
      } catch (err) {
        setError('Ошибка загрузки аналитики: ' + (err.response?.data?.message || err.message));
      }
    };

    fetchExcursions();
    fetchBookings();
    fetchAnalytics();
  }, [user, navigate, excursions]);

  if (error) return <div className="min-h-screen pt-24 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen pt-24 bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Панель гида</h1>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Календарь маршрутов</h2>
          <button
            onClick={() => navigate('/create-excursion')}
            className="mb-4 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
          >
            Создать экскурсию
          </button>
          {excursions.length > 0 ? (
            <ul className="list-disc pl-5">
              {excursions.map(excursion => (
                <li key={excursion.id} className="text-gray-300">
                  {excursion.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">У вас пока нет экскурсий.</p>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Заказы</h2>
          {bookings.length > 0 ? (
            <ul className="list-disc pl-5">
              {bookings.map(booking => (
                <li key={booking.id} className="text-gray-300">
                  {booking.ticketCategory}, {new Date(booking.dateTime).toLocaleString()}, Кол-во: {booking.quantity}, Пользователь: <Link to={`/user/${booking.userId}`} className="text-blue-400">{booking.userId}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">У вас пока нет заказов.</p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Аналитика</h2>
          {analytics ? (
            <div>
              <p>Общее количество заказов: {analytics.totalBookings}</p>
              <p>Средний рейтинг: {analytics.averageRating || 'Нет отзывов'}</p>
            </div>
          ) : (
            <p className="text-gray-400">Аналитика недоступна.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GuidePanel;