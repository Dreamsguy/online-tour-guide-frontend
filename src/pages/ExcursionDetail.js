import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
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
        let data = res.data;
        console.log('Сырые данные из API:', data);

        // Адаптация координат из БД (lat, lng -> y, x)
        if (data.attractions && Array.isArray(data.attractions)) {
          data.attractions = data.attractions.map(attr => {
            if (attr.coordinates && typeof attr.coordinates === 'object' && 'lat' in attr.coordinates) {
              return { ...attr, coordinates: { y: attr.coordinates.lat, x: attr.coordinates.lng } };
            }
            return attr;
          });
        } else {
          // Если attractions пустой, попробуем извлечь координаты из БД-формата
          const coords = data.coordinates; // Предполагаем, что это строка JSON из БД
          if (coords && typeof coords === 'string') {
            try {
              const parsedCoords = JSON.parse(coords.replace(/lat/g, '"y"').replace(/lng/g, '"x"'));
              data.attractions = parsedCoords.map((c, i) => ({ coordinates: c, name: `Место ${i + 1}` }));
            } catch (e) {
              console.error('Ошибка парсинга координат:', e);
            }
          }
        }

        // Преобразование билетов
        if (data.AvailableTicketsByDate && Array.isArray(data.AvailableTicketsByDate)) {
          const ticketsByDate = {};
          data.AvailableTicketsByDate.forEach(ticket => {
            const date = ticket.Date;
            if (!ticketsByDate[date]) ticketsByDate[date] = {};
            ticketsByDate[date][ticket.Type] = {
              Count: ticket.Total || 0,
              Price: ticket.Price || 0,
              Currency: ticket.Currency || 'BYN',
            };
          });
          data.AvailableTicketsByDate = ticketsByDate;
        }
        console.log('Обработанные данные:', data);
        setExcursion(data);
      })
      .catch(err => setError('Ошибка загрузки: ' + err.message));
  }, [id]);

  useEffect(() => {
    if (mapRef.current && excursion?.attractions?.length) {
      const map = mapRef.current;
      map.eachLayer(l => {
        if (l instanceof L.Routing.Control) map.removeControl(l);
      });

      const waypoints = excursion.attractions
        .filter(a => a.coordinates && a.coordinates.y && a.coordinates.x && !isNaN(a.coordinates.y) && !isNaN(a.coordinates.x))
        .map(a => L.latLng(a.coordinates.y, a.coordinates.x));

      if (waypoints.length > 1) {
        L.Routing.control({
          waypoints,
          routeWhileDragging: true,
          show: true,
          lineOptions: { styles: [{ color: '#0078A8', weight: 4 }] },
          addWaypoints: false,
          createMarker: () => null,
        }).addTo(map);
        map.fitBounds(L.latLngBounds(waypoints));
      } else if (waypoints.length === 1) {
        map.setView(waypoints[0], 13);
      }
    }
  }, [excursion]);

  const handleBookExcursion = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role.toLowerCase() !== 'user') {
      alert('Только пользователи могут бронировать экскурсии.');
    } else {
      navigate(`/excursion/${id}/book`);
    }
  };

  const hasAvailableTickets = () => {
    if (!excursion?.AvailableTicketsByDate) return false;
    if (!excursion.AvailableTicketsByDate || Object.keys(excursion.AvailableTicketsByDate).length === 0) return false;
    return Object.values(excursion.AvailableTicketsByDate).some(date =>
      Object.values(date).some(ticket => ticket.Count > 0)
    );
  };

  if (isLoading) return <div className="min-h-screen pt-24 text-center text-lg text-gray-300">Загрузка пользователя...</div>;
  if (error) return <div className="min-h-screen pt-24 text-center text-lg text-red-500">{error}</div>;
  if (!excursion) return <div className="min-h-screen pt-24 text-center text-lg text-gray-300">Загрузка...</div>;

  const defaultCenter = [53.9006, 27.5590];
  const mapCenter = excursion.attractions?.[0]?.coordinates?.y && excursion.attractions?.[0]?.coordinates?.x && !isNaN(excursion.attractions[0].coordinates.y) && !isNaN(excursion.attractions[0].coordinates.x)
    ? [excursion.attractions[0].coordinates.y, excursion.attractions[0].coordinates.x]
    : defaultCenter;

  return (
    <div className="min-h-screen pt-24 bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
          <h1 className="text-4xl font-bold text-center mb-6 text-yellow-400">{excursion.title || excursion.Title || 'Без названия'}</h1>
          <img
            src={excursion.Images && excursion.Images.length > 0 ? `http://localhost:5248${excursion.Images[0]}` : 'https://picsum.photos/300/400'}
            alt={excursion.title || excursion.Title}
            className="w-full h-80 object-cover rounded-lg mb-6"
            onError={(e) => { e.target.src = 'http://localhost:5248/default-image.jpg'; console.log('Ошибка загрузки фото:', e); }}
          />
          <div className="space-y-3 text-base">
            <p><span className="font-semibold text-yellow-200">Описание:</span> <span className="text-gray-300">{excursion.description || excursion.Description || 'Нет описания'}</span></p>
            <p><span className="font-semibold text-yellow-200">Город:</span> <span className="text-gray-300">{excursion.city || excursion.City || 'Не указан'}</span></p>
            <p><span className="font-semibold text-yellow-200">Тип:</span> <span className="text-gray-300">{excursion.isIndividual || excursion.IsIndividual ? 'Индивидуальная' : 'Групповая'}</span></p>
            {excursion.guideId && (excursion.isIndividual || excursion.IsIndividual) && (
              <p>
                <span className="font-semibold text-yellow-200">Гид:</span>{' '}
                <Link to={`/profile/${excursion.guideId}`} className="text-blue-400 hover:underline">
                  {excursion.guide?.name || 'Посмотреть профиль'}
                </Link>
              </p>
            )}
            {excursion.attractions && excursion.attractions.length > 0 && (
              <div>
                <p className="font-semibold text-yellow-200">Достопримечательности:</p>
                <ul className="list-disc pl-5 text-gray-300">
                  {excursion.attractions.map((attr, index) => (
                    <li key={index}>{attr.name || attr.Name || `Место ${index + 1}`}</li>
                  ))}
                </ul>
              </div>
            )}
            {excursion.AvailableTicketsByDate && Object.keys(excursion.AvailableTicketsByDate).length > 0 ? (
              <div>
                <p className="font-semibold text-yellow-200">Доступные билеты по датам:</p>
                <ul className="list-disc pl-5 text-gray-300">
                  {Object.entries(excursion.AvailableTicketsByDate).map(([date, categories]) => (
                    <li key={date}>
                      {new Date(date).toLocaleString()}: 
                      <ul className="list-disc pl-5">
                        {Object.entries(categories).map(([type, ticket]) => (
                          <li key={type}>
                            {type}: {ticket.Count > 0 ? `${ticket.Count} мест` : 'Мест нет'} (Цена: ${ticket.Price} {ticket.Currency})
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
          </div>
          <div className="mt-6 relative z-10">
            <h3 className="text-2xl font-semibold mb-3 text-yellow-300">Маршрут</h3>
            <MapContainer center={mapCenter} zoom={10} style={{ height: '400px', width: '100%', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }} ref={mapRef}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
              {excursion.attractions
                ?.filter(a => a.coordinates && a.coordinates.y && a.coordinates.x && !isNaN(a.coordinates.y) && !isNaN(a.coordinates.x))
                .map((a, i) => (
                  <Marker key={i} position={[a.coordinates.y, a.coordinates.x]}>
                    <Popup>{a.name || `Место ${i + 1}`}</Popup>
                  </Marker>
                ))}
              {excursion.attractions?.length > 1 && (
                <></> // Плейсхолдер для совместимости с Routing.control
              )}
            </MapContainer>
          </div>
          {hasAvailableTickets() ? (
            <button onClick={handleBookExcursion} className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition mt-6">Забронировать</button>
          ) : (
            <p className="text-center text-red-500 mt-6 font-medium">Мест нет</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExcursionDetail;