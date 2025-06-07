import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function ExcursionBook() {
  const { id } = useParams();
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
        const res = await api.get(`/api/excursions/${id}`);
        const data = res.data;
        setExcursion(data);

        if (data.availableTicketsByDate && Object.keys(data.availableTicketsByDate).length > 0) {
          const firstDate = Object.keys(data.availableTicketsByDate)[0];
          const firstCategory = Object.keys(data.availableTicketsByDate[firstDate])[0];
          setBookingDetails({
            ticketCategory: firstCategory,
            dateTime: firstDate,
            quantity: 1,
          });
        }
      } catch (err) {
        setError('Ошибка загрузки экскурсии: ' + (err.response?.data?.message || err.message));
      }
    };
    fetchExcursion();
  }, [id, user, navigate]);

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dateTime') {
      const categories = Object.keys(excursion.availableTicketsByDate[value] || {});
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
      const selectedTickets = excursion.availableTicketsByDate?.[bookingDetails.dateTime]?.[bookingDetails.ticketCategory] || 0;
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
    const selectedTickets = excursion.availableTicketsByDate[dateTime][ticketCategory];
    if (!selectedTickets || quantity > selectedTickets) {
      setError(`Недостаточно билетов в категории ${ticketCategory} на ${new Date(dateTime).toLocaleString()}. Доступно: ${selectedTickets || 0}.`);
      return;
    }
    setShowConfirm(true);
  };

  const handleSubmitBooking = async () => {
    try {
      const selectedTickets = excursion.availableTicketsByDate[bookingDetails.dateTime][bookingDetails.ticketCategory];
      if (!selectedTickets || bookingDetails.quantity > selectedTickets) {
        throw new Error(`Недостаточно билетов: доступно ${selectedTickets || 0} мест`);
      }

      const bookingData = {
        userId: user.id,
        excursionId: parseInt(id),
        ticketCategory: bookingDetails.ticketCategory,
        dateTime: bookingDetails.dateTime, // Отправляем как строка "yyyy-MM-dd HH:mm"
        quantity: parseInt(bookingDetails.quantity),
        status: 'Pending',
        image: 'default_image.jpg',
        paymentMethod: 'NotSpecified',
        total: excursion?.price * parseInt(bookingDetails.quantity) || 0,
      };

      console.log('Отправляемые данные:', bookingData);
      const response = await api.post('/api/bookings', bookingData);
      console.log('Ответ сервера:', response.data);
      setShowConfirm(false);
      alert('Бронирование успешно создано!');
      navigate('/profile');
    } catch (err) {
      const serverError = err.response?.data?.message || err.response?.data?.errors?.join(', ') || err.message || 'Неизвестная ошибка';
      console.error('Полная ошибка:', err.response?.data);
      setError('Ошибка бронирования: ' + serverError);
      setShowConfirm(false);
    }
  };

  if (error) return <div className="min-h-screen pt-24 text-center text-red-500">{error}</div>;
  if (!excursion) return <div className="min-h-screen pt-24 text-center text-gray-300">Загрузка...</div>;

  return (
    <div className="min-h-screen pt-24 bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Бронирование экскурсии</h1>
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-300">{excursion.title}</h2>
          <p className="mb-2">Описание: {excursion.description}</p>
          <p className="mb-4">Цена: {excursion.price} BYN</p>

          {excursion.availableTicketsByDate && Object.keys(excursion.availableTicketsByDate).length > 0 ? (
            <div className="mb-4">
              <p className="font-semibold text-yellow-200">Доступные билеты по датам:</p>
              <ul className="list-disc pl-5">
                {Object.entries(excursion.availableTicketsByDate).map(([date, categories]) => (
                  <li key={date}>
                    {new Date(date).toLocaleString()}:
                    <ul className="list-disc pl-5">
                      {Object.entries(categories).map(([category, count]) => (
                        <li key={category}>
                          {category}: {count} мест
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-center text-red-500 font-medium">Мест нет</p>
          )}

          <div className="space-y-4">
            <select
              name="dateTime"
              value={bookingDetails.dateTime}
              onChange={handleBookingChange}
              className="w-full p-3 rounded-lg border border-gray-300 text-gray-800"
              required
            >
              <option value="">Выберите дату и время</option>
              {excursion.availableTicketsByDate &&
                Object.keys(excursion.availableTicketsByDate).map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleString()}
                  </option>
                ))}
            </select>

            <select
              name="ticketCategory"
              value={bookingDetails.ticketCategory}
              onChange={handleBookingChange}
              className="w-full p-3 rounded-lg border border-gray-300 text-gray-800"
              required
              disabled={!bookingDetails.dateTime}
            >
              <option value="">Выберите категорию билета</option>
              {bookingDetails.dateTime &&
                Object.keys(excursion.availableTicketsByDate[bookingDetails.dateTime] || {}).map((category) => (
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
              max={
                excursion.availableTicketsByDate?.[bookingDetails.dateTime]?.[bookingDetails.ticketCategory] || 1
              }
              className="w-full p-3 rounded-lg border border-gray-300 text-gray-800"
              placeholder="Количество билетов"
              required
              disabled={!bookingDetails.ticketCategory || !bookingDetails.dateTime}
            />
            <p className="text-sm text-gray-400">
              Доступно: {
                excursion.availableTicketsByDate?.[bookingDetails.dateTime]?.[bookingDetails.ticketCategory] || 0
              } билетов
            </p>

            <button
              className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition"
              onClick={handleConfirmBooking}
              disabled={!bookingDetails.ticketCategory || !bookingDetails.dateTime}
            >
              Подтвердить бронирование
            </button>
          </div>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 text-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-yellow-300">Подтверждение бронирования</h2>
              <p>Экскурсия: {excursion.title}</p>
              <p>Категория: {bookingDetails.ticketCategory}</p>
              <p>Дата и время: {new Date(bookingDetails.dateTime).toLocaleString()}</p>
              <p>Количество: {bookingDetails.quantity}</p>
              <div className="mt-4 flex justify-end gap-4">
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
          </div>
        )}
      </div>
    </div>
  );
}

export default ExcursionBook;