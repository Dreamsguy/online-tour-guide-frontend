import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Установка кастомных иконок для Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function AttractionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attraction, setAttraction] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [newReview, setNewReview] = useState({ text: '', rating: 5 });
  const [error, setError] = useState('');

  useEffect(() => {
  if (!id) {
    setError('ID достопримечательности не указан');
    return;
  }
  console.log('Загрузка достопримечательности с ID:', id);
  api.get(`/api/attractions/${id}`)
    .then(res => {
      console.log('Данные достопримечательности:', res.data);
      setAttraction(res.data);
    })
    .catch(err => {
      console.error('Ошибка загрузки:', err);
      setError('Ошибка загрузки достопримечательности: ' + err.message);
    });

  if (user?.id) {
    api.get(`/api/favorites/user/${user.id}`)
      .then(res => {
        console.log('Избранное:', res.data);
        const favorites = res.data || [];
        setIsFavorite(favorites.some(f => f.attractionId === parseInt(id)));
      })
      .catch(err => setError('Ошибка загрузки избранного: ' + err.message));
  }
}, [id, user]);

  const toggleFavorite = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsFavorite(!isFavorite);
    // Здесь должна быть логика отправки запроса на сервер для добавления/удаления из избранного
    api.post(`/api/favorites/${isFavorite ? 'remove' : 'add'}`, { attractionId: id, userId: user.id })
      .catch(err => setError('Ошибка обновления избранного: ' + err.message));
  };

  const handleAddReview = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      alert('Администраторы не могут оставлять отзывы.');
      return;
    }
    if (!newReview.text || !newReview.rating) {
      setError('Пожалуйста, заполните отзыв и рейтинг.');
      return;
    }
    api.post(`/api/attractions/${id}/reviews`, {
      userId: user.id,
      text: newReview.text,
      rating: parseInt(newReview.rating),
    })
      .then(res => {
        setAttraction(prev => ({
          ...prev,
          reviews: [...(prev.reviews || []), { user: user.name, text: newReview.text, rating: newReview.rating }],
        }));
        setNewReview({ text: '', rating: 5 });
        setError('');
      })
      .catch(err => setError('Ошибка добавления отзыва: ' + err.message));
  };

  const handleBookExcursion = (excursionId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/booking', { state: { excursionId } });
  };

  const handleEditAttraction = () => {
    if (user?.role !== 'admin') {
      setError('Только администраторы могут редактировать достопримечательности.');
      return;
    }
    // Логика редактирования (например, переход на форму редактирования)
    alert('Переход к редактированию достопримечательности');
  };

  if (error) return <div className="min-h-screen pt-24 text-center text-red-500">{error}</div>;
  if (!attraction) return <div className="min-h-screen pt-24 text-center">Загрузка...</div>;

  return (
    <div className="min-h-screen pt-24 bg-gray-100">
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-10">
          <h1 className="text-5xl font-bold text-center mb-8 text-gray-800">{attraction.name}</h1>
          <img src={attraction.image} alt={attraction.name} className="w-full h-96 object-cover rounded-xl mb-6" />
          <div className="space-y-4 text-lg text-gray-700">
            <p><span className="font-semibold">Описание:</span> {attraction.description}</p>
            <p><span className="font-semibold">История:</span> {attraction.history}</p>
            <p><span className="font-semibold">Часы работы:</span> {attraction.visitingHours}</p>
            <p><span className="font-semibold">Стоимость входа:</span> {attraction.entryFee}</p>
          </div>
          <div className="mt-8 relative z-10">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Карта</h3>
            <Suspense fallback={<div className="text-lg">Загрузка карты...</div>}>
              <MapContainer
                center={attraction.position || [0, 0]} // Значение по умолчанию, если координаты отсутствуют
                zoom={13}
                style={{ height: '500px', width: '100%', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {attraction.position && <Marker position={attraction.position} />}
              </MapContainer>
            </Suspense>
          </div>
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Связанные экскурсии</h3>
            {attraction.relatedExcursions?.map((exc, idx) => (
              <div key={idx} className="p-4 border-b text-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold">{exc.title}</p>
                  <p>Цена: €{exc.price}</p>
                  <p>Расписание: {new Date(exc.schedule).toLocaleString()}</p>
                </div>
                <button
                  className="bg-black text-white p-3 rounded-lg font-medium hover:bg-gray-800 transition text-lg"
                  onClick={() => handleBookExcursion(exc.id)}
                >
                  ЗАБРОНИРОВАТЬ
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              className={`flex-1 p-4 rounded-lg font-medium text-lg transition ${isFavorite ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-300 hover:bg-gray-400'}`}
              onClick={toggleFavorite}
            >
              {isFavorite ? '★ Удалить из избранного' : '☆ Добавить в избранное'}
            </button>
            {user && user.role === 'admin' && (
              <button
                className="flex-1 bg-blue-600 text-white p-4 rounded-lg font-medium hover:bg-blue-700 transition text-lg"
                onClick={handleEditAttraction}
              >
                РЕДАКТИРОВАТЬ ДОСТОПРИМЕЧАТЕЛЬНОСТЬ
              </button>
            )}
          </div>
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Отзывы</h3>
            <div className="space-y-3">
              {(attraction.reviews || []).map((review, idx) => (
                <p key={idx} className="text-lg">
                  <span className="font-semibold">{review.user}:</span> {review.text} (<span className="text-yellow-500">★</span> {review.rating})
                </p>
              ))}
            </div>
            {user && user.role !== 'admin' && (
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-3 text-gray-800">Оставить отзыв</h4>
                <input
                  type="text"
                  placeholder="Ваш отзыв"
                  className="p-4 w-full rounded-lg border mb-3 text-lg"
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Рейтинг (1-5)"
                  className="p-4 w-full rounded-lg border mb-3 text-lg"
                  min="1"
                  max="5"
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                />
                <button
                  className="w-full bg-black text-white p-4 rounded-lg font-medium hover:bg-gray-800 transition text-lg"
                  onClick={handleAddReview}
                >
                  ОТПРАВИТЬ ОТЗЫВ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttractionDetail;