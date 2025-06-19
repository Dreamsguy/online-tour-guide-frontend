import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ExcursionDetail() {
  const { id } = useParams();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [excursion, setExcursion] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/excursions/${id}`)
      .then(res => {
        const data = res.data;
        console.log('Полученные данные:', data); // Лог для отладки
        setExcursion(data); // Убедимся, что данные корректно устанавливаются
      })
      .catch(err => {
        console.error('Ошибка загрузки экскурсии:', err);
        setError('Не удалось загрузить экскурсию: ' + err.message);
      });
  }, [id]);

  useEffect(() => {
    if (mapRef.current && excursion?.Attractions?.length) {
      const map = mapRef.current;
      const coords = excursion.Attractions[0]?.Coordinates || { lat: 53.9006, lng: 30.3416 }; // Могилев
      map.setView([coords.lat, coords.lng], 10);
    }
  }, [excursion]);

  const handleBookExcursion = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role.toLowerCase() !== 'user') {
      alert('Только пользователи могут бронировать экскурсии.');
    } else if (hasAvailableTickets()) {
      navigate(`/excursion/${id}/book`);
    } else {
      alert('Нет доступных билетов для бронирования.');
    }
  };

  const hasAvailableTickets = () => {
    return excursion?.AvailableTicketsByDate && Object.values(excursion.AvailableTicketsByDate).some(date =>
      Object.values(date).some(ticket => ticket.Count > 0)
    );
  };

  const renderRatingDiamonds = (rating = 0) => {
    const maxDiamonds = 5;
    const filledCount = Math.round(rating);
    return (
      <div className="excursion-rating-diamonds">
        {Array.from({ length: maxDiamonds }, (_, i) => (
          <span
            key={i}
            className={`diamond-rating ${i < filledCount ? 'filled-diamond' : 'empty-diamond'}`}
            style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '4px' }}
          />
        ))}
      </div>
    );
  };

  if (isLoading) return <div className="min-h-screen pt-24 text-center text-gray-300 text-lg">Загрузка пользователя...</div>;
  if (error) return <div className="min-h-screen pt-24 text-center text-red-500 text-lg">Ошибка: {error}</div>;
  if (!excursion) return <div className="min-h-screen pt-24 text-center text-gray-300 text-lg">Загрузка...</div>;

  const defaultCenter = [53.9006, 30.3416]; // Могилев
  const mapCenter = excursion.Attractions?.[0]?.Coordinates?.lat && excursion.Attractions?.[0]?.Coordinates?.lng
    ? [excursion.Attractions[0].Coordinates.lat, excursion.Attractions[0].Coordinates.lng]
    : defaultCenter;

  const photoUrl = excursion.Images && excursion.Images.length > 0
    ? `http://localhost:5248${excursion.Images[0]}`
    : 'https://picsum.photos/300/400'; // Прямой fallback на случайное фото

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4">
        <div className="card-detail bg-glass rounded-lg p-6 shadow-lg relative overflow-hidden">
          <button
            onClick={() => navigate('/excursions')}
            className="btn-secondary mb-4 flex items-center text-white bg-red-600 hover:bg-red-700 py-2 px-4 rounded-lg"
          >
            <i className="fas fa-arrow-left mr-2"></i> Назад к списку
          </button>
          <h1 className="custom-title text-center mb-6 text-3xl font-bold text-white">
            {excursion.Title || 'Без названия'}
            <div className="diamond-outer"></div>
            <div className="diamond-inner"></div>
          </h1>
          <img
            src={photoUrl}
            alt={excursion.Title || 'Экскурсия'}
            className="w-full h-96 object-cover rounded-lg mb-6 shadow-md transition-transform duration-300 hover:scale-105"
            onError={(e) => { e.target.src = 'https://picsum.photos/300/400'; }}
          />
          <div className="space-y-6 text-gray-300">
            <p className="flex items-start">
              <span className="font-semibold text-yellow-200 w-32 inline-block shrink-0">Описание:</span>
              <span className="card-text flex-1">{excursion.Description || 'Нет описания'}</span>
            </p>
            <p className="flex items-start">
              <span className="font-semibold text-yellow-200 w-32 inline-block shrink-0">Город:</span>
              <span className="card-text flex-1">{excursion.City || 'Не указан'}</span>
            </p>
            <p className="flex items-start">
              <span className="font-semibold text-yellow-200 w-32 inline-block shrink-0">Категория:</span>
              <span className="card-text flex-1">{excursion.Category || 'Не указана'}</span>
            </p>
            <p className="flex items-start">
              <span className="font-semibold text-yellow-200 w-32 inline-block shrink-0">Рейтинг:</span>
              {renderRatingDiamonds(excursion.Rating)}
            </p>
            <p className="flex items-start">
              <span className="font-semibold text-yellow-200 w-32 inline-block shrink-0">Тип:</span>
              <span className="card-text flex-1">{excursion.IsIndividual ? 'Индивидуальная' : 'Групповая'}</span>
            </p>
            {excursion.GuideId && excursion.IsIndividual && (
              <p className="flex items-start">
                <span className="font-semibold text-yellow-200 w-32 inline-block shrink-0">Гид:</span>
                <Link to={`/profile/${excursion.GuideId}`} className="text-blue-400 hover:underline flex-1">
                  {excursion.Guide?.name || 'Посмотреть профиль'}
                </Link>
              </p>
            )}
            {excursion.Attractions && excursion.Attractions.length > 0 ? (
              <div>
                <p className="font-semibold text-yellow-200">Достопримечательности:</p>
                <ul className="list-disc pl-6 card-text space-y-2">
                  {excursion.Attractions.map((attr, index) => (
                    <li key={index} className="ml-4">{attr.Name || attr.name || `Место ${index + 1}`}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-center text-gray-300">Достопримечательности не указаны</p>
            )}
            {excursion.AvailableTicketsByDate && Object.keys(excursion.AvailableTicketsByDate).length > 0 ? (
              <div>
                <p className="font-semibold text-yellow-200">Доступные билеты по датам:</p>
                <ul className="list-disc pl-6 card-text space-y-3">
                  {Object.entries(excursion.AvailableTicketsByDate).map(([date, categories]) => (
                    <li key={date} className="ml-4">
                      {new Date(date).toLocaleString('ru-RU', { timeZone: 'Europe/Minsk' })}:
                      <ul className="list-disc pl-6 mt-1 space-y-1">
                        {Object.entries(categories).map(([type, ticket]) => (
                          <li key={type} className="ml-4">
                            {type}: {ticket.Count > 0 ? `${ticket.Count} мест` : 'Мест нет'} (Цена: ${ticket.Price} {ticket.Currency})
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-center text-red-500 font-medium mt-4">Мест нет</p>
            )}
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4 text-yellow-200">Карта достопримечательностей</h3>
              {excursion.Attractions && excursion.Attractions.length > 0 ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-transparent rounded-lg blur-md"></div>
                  <MapContainer center={mapCenter} zoom={10} style={{ height: '400px', width: '100%', borderRadius: '8px' }} ref={mapRef}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
                    {excursion.Attractions
                      ?.filter(a => a.Coordinates?.lat && a.Coordinates?.lng && !isNaN(a.Coordinates.lat) && !isNaN(a.Coordinates.lng))
                      .map((a, i) => (
                        <Marker key={i} position={[a.Coordinates.lat, a.Coordinates.lng]}>
                          <Popup>{a.Name || a.name || `Место ${i + 1}`}</Popup>
                        </Marker>
                      ))}
                  </MapContainer>
                </div>
              ) : (
                <p className="text-center text-gray-300">Карта недоступна (нет достопримечательностей)</p>
              )}
            </div>
            {hasAvailableTickets() && (
              <button
                onClick={handleBookExcursion}
                className="btn-green w-full mt-6 py-3 text-lg font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg"
              >
                Забронировать
              </button>
            )}
            {!hasAvailableTickets() && (
              <p className="text-center text-red-500 mt-6 font-medium">Мест нет</p>
            )}
          </div>
          <div className="diamond w-50 absolute top-[-25px] left-[-25px] bg-glass opacity-50"></div>
          <div className="diamond w-40 absolute bottom-[-20px] right-[-20px] bg-glass opacity-50"></div>
        </div>
      </div>
    </div>
  );
}

export default ExcursionDetail;