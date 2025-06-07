import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Добавлен Link
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
      .then(res => setExcursion(res.data))
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
    if (!excursion?.availableTicketsByDate || Object.keys(excursion.availableTicketsByDate).length === 0) return false;
    return Object.values(excursion.availableTicketsByDate).some(date =>
      Object.values(date).some(tickets => tickets > 0)
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
          <h1 className="text-4xl font-bold text-center mb-6 text-yellow-400">{excursion.title}</h1>
          <img
            src={excursion.image || 'https://picsum.photos/300/400'}
            alt={excursion.title}
            className="w-full h-80 object-cover rounded-lg mb-6"
            onError={(e) => { e.target.src = 'https://picsum.photos/300/400'; }}
          />
          <div className="space-y-3 text-base">
            <p><span className="font-semibold text-yellow-200">Описание:</span> <span className="text-gray-300">{excursion.description}</span></p>
            <p><span className="font-semibold text-yellow-200">Цена:</span> <span className="text-gray-300">{excursion.price} BYN</span></p>
            <p><span className="font-semibold text-yellow-200">Расписание:</span> <span className="text-gray-300">{new Date(excursion.schedule).toLocaleString()}</span></p>
            <p><span className="font-semibold text-yellow-200">Город:</span> <span className="text-gray-300">{excursion.city}</span></p>
            <p><span className="font-semibold text-yellow-200">Тип:</span> <span className="text-gray-300">{excursion.isIndividual ? 'Индивидуальная' : 'Групповая'}</span></p>
            {excursion.isIndividual && excursion.guideId && (
              <p>
                <span className="font-semibold text-yellow-200">Гид:</span>{' '}
                <Link to={`/profile/${excursion.guideId}`} className="text-blue-400 hover:underline">
                  {excursion.guide?.name || 'Посмотреть профиль'}
                </Link>
              </p>
            )}
            {excursion.availableTicketsByDate && Object.keys(excursion.availableTicketsByDate).length > 0 ? (
              <div>
                <p className="font-semibold text-yellow-200">Доступные билеты по датам:</p>
                <ul className="list-disc pl-5 text-gray-300">
                  {Object.entries(excursion.availableTicketsByDate).map(([date, categories]) => (
                    <li key={date}>
                      {new Date(date).toLocaleString()}: 
                      <ul className="list-disc pl-5">
                        {Object.entries(categories).map(([category, count]) => (
                          <li key={category}>
                            {category}: {count > 0 ? `${count} мест` : 'Мест нет'}
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
                ?.filter(a => a.coordinates && !isNaN(a.coordinates.y) && !isNaN(a.coordinates.x))
                .map((a, i) => (
                  <Marker key={i} position={[a.coordinates.y, a.coordinates.x]}>
                    <Popup>{a.name}</Popup>
                  </Marker>
                ))}
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