import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../global.css';

function Attractions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [attractions, setAttractions] = useState([]);
  const [newAttraction, setNewAttraction] = useState({
    name: '',
    image: '',
    description: '',
    coordinates: null,
    history: '',
    visitingHours: '',
    city: '',
    rating: null,
  });
  const [editAttractionId, setEditAttractionId] = useState(null);
  const mapRef = useRef(null);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    search: searchParams.get('search') || '',
  });

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const response = await api.get('/api/Attractions/attractions', {
          params: { city: filters.city, search: filters.search },
        });
        console.log('Полученные достопримечательности:', response.data);
        setAttractions(response.data);
      } catch (err) {
        console.error('Ошибка загрузки достопримечательностей:', err);
        setError('Ошибка загрузки достопримечательностей: ' + err.message);
      }
    };
    fetchAttractions();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [filters.city, filters.search]);

  const [error, setError] = useState(null);

  const cityFilter = location.state?.cityFilter || '';
  const filteredAttractions = attractions.filter(attraction =>
    (cityFilter ? attraction.city === cityFilter : true) &&
    (!filters.city || attraction.city === filters.city) &&
    (!filters.search || attraction.name.toLowerCase().includes(filters.search.toLowerCase()))
  );

  const handleRecommendExcursions = (attractionId) => {
    const attraction = attractions.find(attr => attr.id === attractionId);
    const relatedExcursions = attraction.excursions?.map(exc => exc.title) || [];
    navigate('/excursions', { state: { recommendedExcursions: relatedExcursions } });
  };

  const handleAddAttraction = () => {
    if (!newAttraction.name || !newAttraction.city) {
      alert('Заполните обязательные поля (название, город).');
      return;
    }
    api.post('/api/Attractions', {
      ...newAttraction,
      coordinates: newAttraction.coordinates ? { x: newAttraction.coordinates[0], y: newAttraction.coordinates[1] } : null,
      rating: newAttraction.rating || null,
    }).then(res => {
      setAttractions([...attractions, res.data]);
      setNewAttraction({
        name: '', image: '', description: '', coordinates: null, history: '', visitingHours: '', city: '', rating: null,
      });
    }).catch(err => console.error('Ошибка добавления:', err));
  };

  const handleEditAttraction = (attraction) => {
    setEditAttractionId(attraction.id);
    setNewAttraction({
      name: attraction.name,
      image: attraction.image || '',
      description: attraction.description || '',
      coordinates: attraction.coordinates ? [attraction.coordinates.y, attraction.coordinates.x] : null,
      history: attraction.history || '',
      visitingHours: attraction.visitingHours || '',
      city: attraction.city || '',
      rating: attraction.rating || null,
    });
  };

  const handleUpdateAttraction = () => {
    api.put(`/api/Attractions/${editAttractionId}`, {
      ...newAttraction,
      coordinates: newAttraction.coordinates ? { x: newAttraction.coordinates[1], y: newAttraction.coordinates[0] } : null,
      rating: newAttraction.rating || null,
    }).then(res => {
      setAttractions(attractions.map(attr => attr.id === editAttractionId ? res.data : attr));
      setEditAttractionId(null);
      setNewAttraction({
        name: '', image: '', description: '', coordinates: null, history: '', visitingHours: '', city: '', rating: null,
      });
    }).catch(err => console.error('Ошибка обновления:', err));
  };

  const handleDeleteAttraction = (id) => {
    api.delete(`/api/Attractions/${id}`).then(() => {
      setAttractions(attractions.filter(attr => attr.id !== id));
    }).catch(err => console.error('Ошибка удаления:', err));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setSearchParams(newFilters);
  };

  const handleAttractionDetail = (id) => {
    navigate(`/attractions/${id}`);
  };

  const customIcon = L.icon({
    iconUrl: '/marker-icon.webp', // Убедись, что иконка доступна
    iconSize: [40, 60],
    iconAnchor: [20, 60],
    popupAnchor: [0, -60],
  });

  return (
    <div className="relative min-h-screen" style={{ backgroundImage: "url('/Города Беларуси.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="bg-black bg-opacity-40 absolute inset-0"></div>
      <div className="container mx-auto py-6 relative z-10">
        <div className="navbar">
          <div className="flex justify-center w-full">
            <Link to="/" className="text-2xl text-gray-800 hover:text-yellow-600 font-forum mx-4">Главная</Link>
            <Link to="/excursions" className="text-2xl text-gray-800 hover:text-yellow-600 font-forum mx-4">Экскурсии</Link>
            <Link to="/attractions" className="text-2xl text-gray-800 hover:text-yellow-600 font-forum mx-4">Достопримечательности</Link>
          </div>
          {user && (
            <div className="ml-auto flex items-center space-x-4">
              <Link to="/profile" className="profile-button-custom">Профиль</Link>
              <button onClick={() => navigate('/login')} className="text-2xl text-red-500 hover:text-orange-500 font-forum">Выйти</button>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-4 mt-2">
          {!user && (
            <>
              <Link to="/register" className="text-xl text-white hover:text-yellow-600 font-forum bg-blue-200 bg-opacity-50 px-4 py-2 rounded-lg border-2 border-white">Регистрация</Link>
              <Link to="/login" className="text-xl text-gray-600 hover:text-yellow-600 font-forum bg-blue-200 bg-opacity-50 px-4 py-2 rounded-lg border-2 border-white">Вход</Link>
            </>
          )}
        </div>
      </div>
      <div className="container mx-auto py-12 px-4 relative z-10">
        <h2 className="text-center mb-8 custom-title">
          <span style={{ display: 'block' }}>Доступные</span>
          <span style={{ display: 'block' }}>достопримечательности</span>
          <span className="diamond-outer" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)', width: '150px', height: '150px', border: '2px solid #FFFFFF', opacity: '0.5', zIndex: -1 }}></span>
          <span className="diamond-inner" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)', width: '120px', height: '120px', border: '2px solid #FFFFFF', opacity: '0.5', zIndex: -1 }}></span>
        </h2>
        <div className="filter-bar mb-6">
          <select
            name="city"
            value={filters.city}
            onChange={handleFilterChange}
            className="p-2 rounded-lg bg-transparent text-white border-0 border-b-2 border-yellow-400 focus:outline-none focus:border-white transition duration-300 mr-4"
          >
            <option value="">Все города</option>
            {[...new Set(attractions.map(attr => attr.city))].filter(Boolean).map((city, index) => (
              <option key={index} value={city} className="bg-gray-800">{city}</option>
            ))}
          </select>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Поиск достопримечательностей..."
            className="p-2 rounded-lg bg-transparent text-white border-0 border-b-2 border-yellow-400 focus:outline-none focus:border-white transition duration-300"
          />
        </div>
        <div className="mb-12 relative z-10">
          <h3 className="text-3xl font-semibold mb-6 text-center text-white">Карта достопримечательностей</h3>
          <div className="w-full" style={{ height: '600px' }}> {/* Отдельный контейнер для карты */}
            <MapContainer
              center={[53.4513, 26.4730]}
              zoom={8}
              style={{ height: '100%', width: '100%', borderRadius: '16px' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredAttractions.map(attraction => {
                const coords = attraction.coordinates
                  ? [attraction.coordinates.y, attraction.coordinates.x]
                  : null;
                if (!coords || !Array.isArray(coords) || coords.some(coord => typeof coord !== 'number' || isNaN(coord)) ||
                    coords[0] < -90 || coords[0] > 90 || coords[1] < -180 || coords[1] > 180) {
                  console.warn(`Некорректные координаты для ${attraction.name}:`, coords);
                  return null;
                }
                return (
                  <Marker key={attraction.id} position={coords} icon={customIcon}>
                    <Popup className="custom-popup">
                      <div>
                        <h4 className="text-lg font-bold cursor-pointer" onClick={() => handleAttractionDetail(attraction.id)}>{attraction.name}</h4>
                        <p className="text-sm text-gray-600">Город: {attraction.city}</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
        <div className="excursion-list">
          {filteredAttractions.map(attraction => (
            <div
              key={attraction.id}
              className="card"
              onClick={() => handleAttractionDetail(attraction.id)}
            >
              <div className="card-overlay" style={{ backgroundImage: `url(${attraction.image || '/default.jpg'})` }}>
                <span className="card-title">{attraction.name || 'Без названия'}</span>
                <span className="card-text">Город: {attraction.city || 'Без города'}</span>
                <div className="mt-4 flex justify-end space-x-2">
                  {user?.role === 'admin' ? (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditAttraction(attraction); }}
                        className="btn-primary p-2 rounded-lg text-sm font-medium"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteAttraction(attraction.id); }}
                        className="btn-secondary p-2 rounded-lg text-sm font-medium"
                      >
                        Удалить
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRecommendExcursions(attraction.id); }}
                      className="btn-green p-2 rounded-lg text-sm font-medium"
                    >
                      Подобрать экскурсию
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {user?.role === 'admin' && (
          <div className="card p-8 max-w-lg mx-auto mt-12">
            <h2 className="text-3xl font-semibold mb-6">{editAttractionId ? 'Редактировать достопримечательность' : 'Добавить достопримечательность'}</h2>
            <input
              type="text"
              placeholder="Название"
              value={newAttraction.name}
              onChange={(e) => setNewAttraction({ ...newAttraction, name: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <input
              type="text"
              placeholder="Город"
              value={newAttraction.city}
              onChange={(e) => setNewAttraction({ ...newAttraction, city: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <input
              type="text"
              placeholder="URL изображения"
              value={newAttraction.image}
              onChange={(e) => setNewAttraction({ ...newAttraction, image: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <textarea
              placeholder="Описание"
              value={newAttraction.description}
              onChange={(e) => setNewAttraction({ ...newAttraction, description: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
              rows="3"
            />
            <div className="flex space-x-4 mb-4">
              <input
                type="number"
                step="any"
                placeholder="Широта"
                value={newAttraction.coordinates ? newAttraction.coordinates[0] : ''}
                onChange={(e) => setNewAttraction({
                  ...newAttraction,
                  coordinates: newAttraction.coordinates
                    ? [parseFloat(e.target.value), newAttraction.coordinates[1]]
                    : [parseFloat(e.target.value), 0],
                })}
                className="w-full p-4 rounded-lg text-base"
              />
              <input
                type="number"
                step="any"
                placeholder="Долгота"
                value={newAttraction.coordinates ? newAttraction.coordinates[1] : ''}
                onChange={(e) => setNewAttraction({
                  ...newAttraction,
                  coordinates: newAttraction.coordinates
                    ? [newAttraction.coordinates[0], parseFloat(e.target.value)]
                    : [0, parseFloat(e.target.value)],
                })}
                className="w-full p-4 rounded-lg text-base"
              />
            </div>
            <textarea
              placeholder="История"
              value={newAttraction.history}
              onChange={(e) => setNewAttraction({ ...newAttraction, history: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
              rows="3"
            />
            <input
              type="text"
              placeholder="Часы посещения"
              value={newAttraction.visitingHours}
              onChange={(e) => setNewAttraction({ ...newAttraction, visitingHours: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <button
              onClick={editAttractionId ? handleUpdateAttraction : handleAddAttraction}
              className="p-4 rounded-lg w-full text-base font-medium bg-blue-500 text-white hover:bg-blue-600"
            >
              {editAttractionId ? 'ОБНОВИТЬ' : 'ДОБАВИТЬ'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Attractions;