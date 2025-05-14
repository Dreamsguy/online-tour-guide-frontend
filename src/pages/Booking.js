import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Booking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [excursion, setExcursion] = useState(null);
  const [slots, setSlots] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    if (!state?.excursionId) {
      navigate('/excursions');
      return;
    }
    const exc = {
      id: state.excursionId,
      title: 'Тур по Минску',
      price: 100,
      maxPeople: 20,
      freeSlots: 5,
      schedule: '2025-05-15 10:00',
    };
    setExcursion(exc);
  }, [state, navigate]);

  const handleBook = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (slots > excursion.freeSlots) {
      alert('Недостаточно свободных мест!');
      return;
    }
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
      const booking = {
        id: Date.now(),
        excursion: excursion.title,
        date: excursion.schedule,
        slots,
        total: excursion.price * slots,
        paymentMethod,
        timestamp: new Date().toISOString(),
      };
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      localStorage.setItem('bookings', JSON.stringify([...bookings, booking]));
      localStorage.setItem('bookingNotification', JSON.stringify({
        id: Date.now(),
        message: `Экскурсия "${excursion.title}" забронирована на ${excursion.schedule}`,
      }));
      setTimeout(() => navigate('/profile'), 2000);
    }, 2000);
  };

  if (!excursion) return <div>Загрузка...</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans pt-20 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-6">Бронирование экскурсии - Беларусь</h1>
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">{excursion.title}</h2>
          <p className="text-gray-500 text-sm">Цена: €{excursion.price}</p>
          <p className="text-gray-500 text-sm">Расписание: {excursion.schedule}</p>
          <p className="text-gray-500 text-sm">Свободные места: {excursion.freeSlots}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">Количество мест</label>
          <input
            type="number"
            value={slots}
            onChange={(e) => setSlots(Math.min(e.target.value, excursion.freeSlots))}
            className="w-full p-2 border rounded text-sm"
            min="1"
            max={excursion.freeSlots}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">Способ оплаты</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="card">Банковская карта</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>
        {paymentStatus === 'processing' && <p className="text-yellow-500 text-center">Обработка платежа...</p>}
        {paymentStatus === 'success' && <p className="text-green-500 text-center">Платеж успешно выполнен!</p>}
        <button
          className="bg-black text-white w-full p-2 rounded hover:bg-gray-800 transition text-sm"
          onClick={handleBook}
          disabled={paymentStatus === 'processing'}
        >
          ОПЛАТИТЬ И ЗАБРОНИРОВАТЬ
        </button>
      </div>
    </div>
  );
}

export default Booking;