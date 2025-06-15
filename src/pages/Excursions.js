import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function Excursions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [excursions, setExcursions] = useState([]);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
  });
  const mapRef = useRef(null);

  useEffect(() => {
  const fetchExcursions = async () => {
    try {
      let appliedFilters = { ...filters };
      if (user?.id) {
        try {
          const prefsResponse = await api.get(`/api/excursions/preferences/${user.id}`).catch(err => { console.log('Ошибка предпочтений:', err); return { data: {} }; });
          const prefs = prefsResponse.data || {};
          appliedFilters = {
            city: filters.city || prefs.PreferredCity || '',
            category: filters.category || prefs.PreferredDirection || '', // Исправлено на PreferredDirection
            search: filters.search,
          };
        } catch (prefErr) {
          console.warn('Предпочтения не найдены, используем фильтры:', prefErr);
        }
      }

      const response = await api.get('/api/excursions', {
        params: {
          city: appliedFilters.city,
          category: appliedFilters.category,
          search: appliedFilters.search,
        },
      });
      const data = response.data || [];
      const sortedExcursions = data.sort((a, b) => {
        const aMatches = (!appliedFilters.city || a.city === appliedFilters.city) && (!appliedFilters.category || a.category === appliedFilters.category);
        const bMatches = (!appliedFilters.city || b.city === appliedFilters.city) && (!appliedFilters.category || b.category === appliedFilters.category);
        return aMatches === bMatches ? 0 : aMatches ? -1 : 1;
      });
      setExcursions(sortedExcursions);
    } catch (err) {
      console.error('Ошибка загрузки экскурсий:', err);
      if (err.response?.status === 401) {
        alert('Сессия истекла. Пожалуйста, войдите заново.');
        navigate('/login');
      } else {
        setExcursions([]); // Выводим пустой список вместо ошибки
      }
    }
  };
  fetchExcursions();
}, [navigate, user?.id, filters.city, filters.category, filters.search]);

  useEffect(() => {
    if (mapRef.current && excursions.length) {
      const map = mapRef.current;
      map.eachLayer((l) => l instanceof L.Routing.Control && map.removeControl(l));

      const waypoints = excursions
        .flatMap((e) => e.attractions?.[0] || [])
        .filter((a) => a?.coordinates?.y && a?.coordinates?.x && !isNaN(a.coordinates.y) && !isNaN(a.coordinates.x))
        .map((a) => L.latLng(a.coordinates.y, a.coordinates.x));

      if (waypoints.length > 0) {
        map.fitBounds(L.latLngBounds(waypoints));
      } else {
        map.setView([53.9, 27.5667], 8);
      }
    }
  }, [excursions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setSearchParams(newFilters);
  };

  const hasAvailableTickets = (excursion) => {
    if (!excursion.availableTicketsByDate || Object.keys(excursion.availableTicketsByDate).length === 0) return false;
    return Object.values(excursion.availableTicketsByDate).some((date) =>
      Object.values(date).some((ticket) => ticket.count > 0)
    );
  };

  const defaultCenter = [53.9, 27.5667];
  const firstValidCoords = excursions.find((e) => e.attractions?.[0]?.coordinates?.y && e.attractions?.[0]?.coordinates?.x);
  const mapCenter = firstValidCoords?.attractions?.[0]?.coordinates
    ? [firstValidCoords.attractions[0].coordinates.y, firstValidCoords.attractions[0].coordinates.x]
    : defaultCenter;

  const styles = `
    .brand { font-size: 24px; font-weight: bold; color: #FFD700; text-align: center; padding: 10px; }
    .card { background: #1F2937; border-radius: 8px; overflow: hidden; cursor: pointer; transition: transform 0.2s; }
    .card:hover { transform: scale(1.02); }
    .card-title { font-size: 18px; font-weight: bold; color: #FBBF24; }
    .card-text { font-size: 14px; color: #D1D5DB; }
    .clicked { animation: pulse 1.6s ease-out; }
    @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
  `;

  return (
    <div className="min-h-screen">
      <style>{styles}</style>
      <div className="brand">Путешествия онлайн</div>
      <div className="min-h-screen pt-20">
        <div className="container mx-auto py-12 px-4">
          <h1
            onClick={(e) => {
              e.target.classList.add('clicked');
              setTimeout(() => e.target.classList.remove('clicked'), 1600);
            }}
            className="text-4xl font-bold text-center mb-6 text-yellow-400"
          >
            Экскурсии
          </h1>
          <div className="filters flex gap-4 mb-6">
            <select
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              className="p-2 rounded-lg bg-gray-700 text-gray-200"
            >
              <option value="">Все города</option>
              {[...new Set(excursions.map((e) => e.city))].map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="p-2 rounded-lg bg-gray-700 text-gray-200"
            >
              <option value="">Все категории</option>
              {[...new Set(excursions.map((e) => e.category))].filter(Boolean).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Поиск..."
              className="p-2 rounded-lg bg-gray-700 text-gray-200"
            />
          </div>
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-6 text-[#2A3A2E]">Карта</h3>
            <MapContainer
              center={mapCenter}
              zoom={8}
              style={{ height: '400px', width: '100%', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {excursions.map((e) =>
                e.attractions?.[0]?.coordinates?.y && e.attractions?.[0]?.coordinates?.x && (
                  <Marker key={e.id} position={[e.attractions[0].coordinates.y, e.attractions[0].coordinates.x]}>
                    <Popup>{e.title}</Popup>
                  </Marker>
                )
              )}
            </MapContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {excursions.length > 0 ? (
              excursions.map((e) => (
                <div
                  key={e.id}
                  id={`excursion-${e.id}`}
                  className="card"
                  onClick={() => navigate(`/excursion/${e.id}`)}
                >
                  <div
                    className="w-full h-48 bg-gray-500 flex items-center justify-center rounded-t-lg"
                    style={{ backgroundColor: '#1F2937' }} // Пустой прямоугольник
                  >
                    {e.images && e.images.length > 0 && (
                      <img
                        src={`http://localhost:5248${e.images[0]}`}
                        alt={e.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="card-title">{e.title}</h3>
                    <p className="card-text mb-2">Рейтинг: {e.rating || 0}</p>
                    <p className="card-text mb-2">
                      Места: {hasAvailableTickets(e) ? 'Есть' : 'Нет'}
                    </p>
                    <p className="card-text mb-2">Категория: {e.category || 'Не указана'}</p>
                    {user && user.role === 'user' && hasAvailableTickets(e) && (
                      <button
                        className="w-full bg-green-600 text-white p-2 rounded-lg font-medium hover:bg-green-700 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/excursion/${e.id}/book`);
                        }}
                      >
                        БРОНИРОВАТЬ
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center">Нет доступных экскурсий</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Excursions;