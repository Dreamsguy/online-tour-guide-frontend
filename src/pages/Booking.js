import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function Booking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const excursionId = location.state?.excursionId;
  const [excursion, setExcursion] = useState(null);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]); // Добавляем состояние

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!excursionId) {
      setError('Экскурсия не выбрана');
      return;
    }

    console.log('ExcursionId type:', typeof excursionId, 'Value:', excursionId);

    api.get(`/api/excursions/${excursionId}`)
      .then(res => setExcursion(res.data))
      .catch(err => setError('Ошибка загрузки экскурсии: ' + err.message));
  }, [user, excursionId, navigate]);

  const handleBooking = () => {
    if (!user.id || !excursionId) {
      setError('Ошибка: Пользователь или экскурсия не определены');
      return;
    }
    const bookingData = {
      userId: Number(user.id),
      excursionId: Number(excursionId),
    };
    console.log('Booking data:', bookingData);
    api.post('/api/Bookings', bookingData)
      .then(() => {
        alert('Бронирование успешно!');
        // Обновляем бронирования
        api.get(`/api/bookings/user/${user.id}`)
          .then(res => {
            setBookings(res.data); // Обновляем локальное состояние
            navigate('/profile', { state: { updatedBookings: res.data } }); // Передаём в профиль
          })
          .catch(err => setError('Ошибка обновления бронирований: ' + err.message));
      })
      .catch(err => {
        console.error('Полная ошибка бронирования:', err.response?.data);
        setError('Ошибка бронирования: ' + (err.response?.data?.title || err.message));
      });
  };

  if (!user || !excursionId) return null;

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Бронирование экскурсии</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {excursion && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">{excursion.title}</h2>
            <p className="mb-2"><strong>Описание:</strong> {excursion.description}</p>
            <p className="mb-2"><strong>Цена:</strong> €{excursion.price}</p>
            <p className="mb-2"><strong>Расписание:</strong> {new Date(excursion.schedule).toLocaleString()}</p>
            <p className="mb-2"><strong>Город:</strong> {excursion.city}</p>
            <button onClick={handleBooking} className="mt-4 bg-green-500 text-white p-3 rounded-lg w-full">
              Подтвердить бронирование
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Booking;