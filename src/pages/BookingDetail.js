import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    api.get(`/api/Auth/bookings/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBooking(res.data))
      .catch(err => setError('Ошибка загрузки бронирования: ' + err.message));
  }, [id, token, navigate]);

  if (error) return <div className="min-h-screen pt-24 text-center text-red-500">{error}</div>;
  if (!booking) return <div className="min-h-screen pt-24 text-center">Загрузка...</div>;

  return (
    <div className="min-h-screen pt-24 bg-gray-100">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-8">Детали бронирования</h1>
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <p><strong>Экскурсия:</strong> {booking.Excursion.Title}</p>
          <p><strong>Категория:</strong> {booking.TicketCategory}</p>
          <p><strong>Дата и время:</strong> {new Date(booking.DateTime).toLocaleString()}</p>
          <p><strong>Количество:</strong> {booking.Quantity}</p>
          <p><strong>Статус:</strong> {booking.Status}</p>
          <p><strong>Дата создания:</strong> {new Date(booking.CreatedAt).toLocaleString()}</p>
          <button
            className="mt-4 bg-black text-white p-4 rounded-lg font-medium hover:bg-gray-800 transition text-base"
            onClick={() => navigate('/profile')}
          >
            НАЗАД
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingDetail;