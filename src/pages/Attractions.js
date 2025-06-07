import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Attractions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const response = await api.get('/api/Attractions/attractions');
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
  }, []);

  const [error, setError] = useState(null); // Добавляем состояние для ошибок

  const cityFilter = location.state?.cityFilter || '';
  const filteredAttractions = attractions.filter(attraction =>
    cityFilter ? attraction.city === cityFilter : true
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
        name: '',
        image: '',
        description: '',
        coordinates: null,
        history: '',
        visitingHours: '',
        city: '',
        rating: null,
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
        name: '',
        image: '',
        description: '',
        coordinates: null,
        history: '',
        visitingHours: '',
        city: '',
        rating: null,
      });
    }).catch(err => console.error('Ошибка обновления:', err));
  };

  const handleDeleteAttraction = (id) => {
    api.delete(`/api/Attractions/${id}`).then(() => {
      setAttractions(attractions.filter(attr => attr.id !== id));
    }).catch(err => console.error('Ошибка удаления:', err));
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-12">Достопримечательности</h1>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        {user?.role === 'admin' && (
          <div className="card p-8 max-w-lg mx-auto mb-12">
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
                onChange={(e) =>
                  setNewAttraction({
                    ...newAttraction,
                    coordinates: newAttraction.coordinates
                      ? [parseFloat(e.target.value), newAttraction.coordinates[1]]
                      : [parseFloat(e.target.value), 0],
                  })
                }
                className="w-full p-4 rounded-lg text-base"
              />
              <input
                type="number"
                step="any"
                placeholder="Долгота"
                value={newAttraction.coordinates ? newAttraction.coordinates[1] : ''}
                onChange={(e) =>
                  setNewAttraction({
                    ...newAttraction,
                    coordinates: newAttraction.coordinates
                      ? [newAttraction.coordinates[0], parseFloat(e.target.value)]
                      : [0, parseFloat(e.target.value)],
                  })
                }
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
        <div className="mb-12 relative z-10">
          <h3 className="text-3xl font-semibold mb-6">Карта</h3>
          <MapContainer
            center={[53.4513, 26.4730]}
            zoom={8}
            style={{ height: '500px', width: '100%', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)' }}
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
              if (
                !coords ||
                !Array.isArray(coords) ||
                coords.some(coord => typeof coord !== 'number' || isNaN(coord)) ||
                coords[0] < -90 || coords[0] > 90 ||
                coords[1] < -180 || coords[1] > 180
              ) {
                console.warn(`Некорректные координаты у достопримечательности ${attraction.name}:`, attraction.coordinates);
                return null;
              }
              return (
                <Marker key={attraction.id} position={coords}>
                  <Popup>{attraction.name} <br /> {attraction.description}</Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {filteredAttractions.map(attraction => (
            <div key={attraction.id} className="card p-4 shadow-md hover:shadow-lg transition">
              <img src={attraction.image} alt={attraction.name} className="w-full h-[250px] object-cover rounded-lg mb-4" />
              <div className="card-content">
                <h3 className="text-2xl font-semibold mb-2">{attraction.name}</h3>
                <p className="text-base mb-1">Город: {attraction.city}</p>
                <p className="text-base mb-2">Рейтинг: {attraction.rating || 'Нет рейтинга'}</p>
                {user?.role === 'admin' ? (
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => handleEditAttraction(attraction)}
                      className="p-3 rounded-lg w-full text-base font-medium bg-blue-500 text-white hover:bg-blue-600"
                    >
                      РЕДАКТИРОВАТЬ
                    </button>
                    <button
                      onClick={() => handleDeleteAttraction(attraction.id)}
                      className="bg-[#C8102E] text-[#FFD700] p-3 rounded-lg w-full text-base font-medium hover:bg-red-700"
                    >
                      УДАЛИТЬ
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-3 mt-4">
                    <Link to={`/attractions/${attraction.id}`}>
                      <button className="p-3 rounded-lg w-full text-base font-medium bg-blue-500 text-white hover:bg-blue-600">
                        ПОДРОБНЕЕ
                      </button>
                    </Link>
                    <button
                      onClick={() => handleRecommendExcursions(attraction.id)}
                      className="p-3 rounded-lg w-full text-base font-medium bg-green-500 text-white hover:bg-green-600"
                    >
                      ПОДОБРАТЬ ЭКСКУРСИЮ
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Attractions;