import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function ExcursionBook({ excursionId, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [excursion, setExcursion] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    ticketCategory: '',
    dateTime: '',
    quantity: 1,
  });
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!user || user.role.toLowerCase() !== 'user') {
      navigate('/login');
      return;
    }
    const fetchExcursion = async () => {
      try {
        const res = await api.get(`/api/excursions/${excursionId}`);
        console.log('Данные экскурсии для бронирования:', res.data);
        const data = res.data;
        setExcursion(data);
        if (data.AvailableTicketsByDate && Object.keys(data.AvailableTicketsByDate).length > 0) {
          const firstDate = Object.keys(data.AvailableTicketsByDate)[0];
          const firstCategory = Object.keys(data.AvailableTicketsByDate[firstDate])[0];
          setBookingDetails({
            ticketCategory: firstCategory,
            dateTime: firstDate,
            quantity: 1,
          });
        } else {
          setError('Нет доступных билетов для этой экскурсии.');
        }
      } catch (err) {
        console.error('Ошибка загрузки экскурсии:', err.response?.data || err.message);
        setError('Ошибка загрузки экскурсии: ' + (err.response?.data?.message || err.message));
      }
    };
    fetchExcursion();
  }, [excursionId, user, navigate]);

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dateTime') {
      const categories = Object.keys(excursion.AvailableTicketsByDate[value] || {});
      const newCategory = categories.length > 0 ? categories[0] : '';
      setBookingDetails({
        ...bookingDetails,
        dateTime: value,
        ticketCategory: newCategory,
        quantity: 1,
      });
    } else if (name === 'ticketCategory') {
      setBookingDetails({
        ...bookingDetails,
        ticketCategory: value,
        quantity: 1,
      });
    } else if (name === 'quantity') {
      const selectedTickets = excursion.AvailableTicketsByDate?.[bookingDetails.dateTime]?.[bookingDetails.ticketCategory] || 0;
      const newValue = Math.min(parseInt(value) || 1, selectedTickets);
      setBookingDetails({ ...bookingDetails, [name]: newValue });
    }
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    setError('');
    const { ticketCategory, dateTime, quantity } = bookingDetails;
    if (!ticketCategory || !dateTime) {
      setError('Пожалуйста, выберите категорию и дату/время.');
      return;
    }
    if (quantity < 1) {
      setError('Количество билетов должно быть больше 0.');
      return;
    }
    const selectedTickets = excursion.AvailableTicketsByDate[dateTime][ticketCategory];
    if (!selectedTickets || quantity > selectedTickets) {
      setError(`Недостаточно билетов в категории ${ticketCategory} на ${new Date(dateTime).toLocaleString()}. Доступно: ${selectedTickets || 0}.`);
      return;
    }
    setShowConfirm(true);
  };

  const handleSubmitBooking = async () => {
    try {
      const selectedTickets = excursion.AvailableTicketsByDate[bookingDetails.dateTime][bookingDetails.ticketCategory];
      if (!selectedTickets || bookingDetails.quantity > selectedTickets) {
        throw new Error(`Недостаточно билетов: доступно ${selectedTickets || 0} мест`);
      }

      const bookingData = {
        userId: user.id,
        excursionId: parseInt(excursionId),
        ticketCategory: bookingDetails.ticketCategory,
        dateTime: bookingDetails.dateTime,
        quantity: parseInt(bookingDetails.quantity),
        status: 'Pending',
        image: 'default_image.jpg',
        paymentMethod: 'NotSpecified',
        total: (excursion.price || 0) * parseInt(bookingDetails.quantity),
      };

      console.log('Отправляемые данные:', bookingData);
      const response = await api.post('/api/bookings', bookingData);
      console.log('Ответ сервера:', response.data);
      setShowConfirm(false);
      alert('Бронирование успешно создано!');
      if (onClose) onClose(); // Закрываем попап
      else navigate('/profile');
    } catch (err) {
      const serverError = err.response?.data?.message || err.response?.data?.errors?.join(', ') || err.message || 'Неизвестная ошибка';
      console.error('Полная ошибка:', err.response?.data);
      setError('Ошибка бронирования: ' + serverError);
      setShowConfirm(false);
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;
  if (!excursion) return <div className="text-gray-300">Загрузка...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 text-gray-200">
      <h1 className="text-2xl font-bold mb-4 text-yellow-300">Бронирование экскурсии</h1>
      <h2 className="text-xl font-semibold mb-2">{excursion.Title}</h2>
      <p className="mb-2">Описание: {excursion.Description}</p>
      <p className="mb-4">Цена: {(excursion.price || 0)} BYN</p>

      {excursion.AvailableTicketsByDate && Object.keys(excursion.AvailableTicketsByDate).length > 0 ? (
        <div className="space-y-4">
          <select
            name="dateTime"
            value={bookingDetails.dateTime}
            onChange={handleBookingChange}
            className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white"
          >
            <option value="">Выберите дату и время</option>
            {Object.keys(excursion.AvailableTicketsByDate).map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleString()}
              </option>
            ))}
          </select>

          <select
            name="ticketCategory"
            value={bookingDetails.ticketCategory}
            onChange={handleBookingChange}
            className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white"
            disabled={!bookingDetails.dateTime}
          >
            <option value="">Выберите категорию билета</option>
            {bookingDetails.dateTime &&
              Object.keys(excursion.AvailableTicketsByDate[bookingDetails.dateTime] || {}).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
          </select>

          <input
            type="number"
            name="quantity"
            value={bookingDetails.quantity}
            onChange={handleBookingChange}
            min="1"
            max={excursion.AvailableTicketsByDate?.[bookingDetails.dateTime]?.[bookingDetails.ticketCategory] || 1}
            className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white"
            placeholder="Количество билетов"
            disabled={!bookingDetails.ticketCategory || !bookingDetails.dateTime}
          />
          <p className="text-sm text-gray-400">
            Доступно: {excursion.AvailableTicketsByDate?.[bookingDetails.dateTime]?.[bookingDetails.ticketCategory] || 0} билетов
          </p>

          <button
            className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition"
            onClick={handleConfirmBooking}
            disabled={!bookingDetails.ticketCategory || !bookingDetails.dateTime}
          >
            Подтвердить бронирование
          </button>
        </div>
      ) : (
        <p className="text-red-500">Мест нет</p>
      )}

      {showConfirm && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-300">Подтверждение</h3>
          <p>Экскурсия: {excursion.Title}</p>
          <p>Категория: {bookingDetails.ticketCategory}</p>
          <p>Дата и время: {new Date(bookingDetails.dateTime).toLocaleString()}</p>
          <p>Количество: {bookingDetails.quantity}</p>
          <div className="mt-2 flex justify-end gap-2">
            <button
              className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700"
              onClick={() => setShowConfirm(false)}
            >
              Отмена
            </button>
            <button
              className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
              onClick={handleSubmitBooking}
            >
              Подтвердить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExcursionBook;