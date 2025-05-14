import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
const MapContainer = React.lazy(() => import('react-leaflet').then(mod => ({ default: mod.MapContainer })));
const TileLayer = React.lazy(() => import('react-leaflet').then(mod => ({ default: mod.TileLayer })));
const Marker = React.lazy(() => import('react-leaflet').then(mod => ({ default: mod.Marker })));

function Attractions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [attractions, setAttractions] = useState([
    {
      id: 1,
      name: 'Мирский замок',
      image: 'https://picsum.photos/300/400?random=3',
      description: 'Мирский замок — выдающийся памятник архитектуры XVI века, включенный в список Всемирного наследия ЮНЕСКО.',
      relatedExcursions: ['Тур в Мирский замок'],
      isFavorite: false,
      position: [53.4513, 26.4730],
      history: 'Построен в начале XVI века Юрием Ильиничем, затем перешел к Радзивиллам.',
      visitingHours: 'Ежедневно с 10:00 до 18:00',
      entryFee: '10 BYN',
      city: 'Мир',
    },
    {
      id: 2,
      name: 'Несвижский дворец',
      image: 'https://picsum.photos/300/400?random=4',
      description: 'Несвижский дворец — резиденция Радзивиллов, шедевр архитектуры XVI-XVII веков.',
      relatedExcursions: ['Поездка в Несвиж'],
      isFavorite: false,
      position: [53.2228, 26.6917],
      history: 'Основан в 1583 году Николаем Радзивиллом Черным.',
      visitingHours: 'Ежедневно с 09:00 до 17:00',
      entryFee: '12 BYN',
      city: 'Несвиж',
    },
    {
      id: 3,
      name: 'Гомельский дворец',
      image: 'https://picsum.photos/300/400?random=10',
      description: 'Гомельский дворец — памятник архитектуры XVIII века.',
      relatedExcursions: ['Экскурсия в Гомель'],
      isFavorite: false,
      position: [52.4345, 30.9754],
      history: 'Построен в XVIII веке.',
      visitingHours: 'Ежедневно с 10:00 до 17:00',
      entryFee: '8 BYN',
      city: 'Гомель',
    },
    {
      id: 4,
      name: 'Могилевская ратуша',
      image: 'https://picsum.photos/300/400?random=11',
      description: 'Могилевская ратуша — символ города.',
      relatedExcursions: ['Тур в Могилев'],
      isFavorite: false,
      position: [53.8999, 30.3314],
      history: 'Построена в XVII веке.',
      visitingHours: 'Ежедневно с 09:00 до 16:00',
      entryFee: '5 BYN',
      city: 'Могилев',
    },
  ]);

  const [newAttraction, setNewAttraction] = useState({
    name: '',
    image: '',
    description: '',
    relatedExcursions: [],
    position: [],
    history: '',
    visitingHours: '',
    entryFee: '',
    city: '',
  });

  const [editAttractionId, setEditAttractionId] = useState(null);

  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
  }, []);

  const cityFilter = location.state?.cityFilter || '';

  const filteredAttractions = attractions.filter(attraction => {
    return cityFilter ? attraction.city === cityFilter : true;
  });

  const toggleFavorite = (attractionId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      alert('Администраторы не могут добавлять достопримечательности в избранное.');
      return;
    }
    setAttractions(attractions.map(attr => {
      if (attr.id === attractionId) {
        return { ...attr, isFavorite: !attr.isFavorite };
      }
      return attr;
    }));
  };

  const handleRecommendExcursions = (attractionId) => {
    const attraction = attractions.find(attr => attr.id === attractionId);
    navigate('/excursions', { state: { recommendedExcursions: attraction.relatedExcursions } });
  };

  const handleAddAttraction = () => {
    if (!newAttraction.name || !newAttraction.city) {
      alert('Заполните обязательные поля (название, город).');
      return;
    }
    const attractionToAdd = {
      ...newAttraction,
      id: attractions.length + 1,
      relatedExcursions: newAttraction.relatedExcursions.length ? newAttraction.relatedExcursions.split(',').map(exc => exc.trim()) : [],
      position: newAttraction.position.length ? JSON.parse(newAttraction.position) : [0, 0],
      isFavorite: false,
    };
    setAttractions([...attractions, attractionToAdd]);
    setNewAttraction({
      name: '',
      image: '',
      description: '',
      relatedExcursions: [],
      position: [],
      history: '',
      visitingHours: '',
      entryFee: '',
      city: '',
    });
  };

  const handleEditAttraction = (attraction) => {
    setEditAttractionId(attraction.id);
    setNewAttraction({
      name: attraction.name,
      image: attraction.image,
      description: attraction.description,
      relatedExcursions: attraction.relatedExcursions.join(','),
      position: JSON.stringify(attraction.position),
      history: attraction.history,
      visitingHours: attraction.visitingHours,
      entryFee: attraction.entryFee,
      city: attraction.city,
    });
  };

  const handleUpdateAttraction = () => {
    setAttractions(attractions.map(attr => {
      if (attr.id === editAttractionId) {
        return {
          ...attr,
          name: newAttraction.name,
          image: newAttraction.image,
          description: newAttraction.description,
          relatedExcursions: newAttraction.relatedExcursions.split(',').map(exc => exc.trim()),
          position: JSON.parse(newAttraction.position || '[0,0]'),
          history: newAttraction.history,
          visitingHours: newAttraction.visitingHours,
          entryFee: newAttraction.entryFee,
          city: newAttraction.city,
        };
      }
      return attr;
    }));
    setEditAttractionId(null);
    setNewAttraction({
      name: '',
      image: '',
      description: '',
      relatedExcursions: [],
      position: [],
      history: '',
      visitingHours: '',
      entryFee: '',
      city: '',
    });
  };

  const handleDeleteAttraction = (id) => {
    setAttractions(attractions.filter(attr => attr.id !== id));
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-12">Достопримечательности</h1>

        {/* Форма добавления/редактирования достопримечательностей для админа */}
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
            <input
              type="text"
              placeholder="Связанные экскурсии (через запятую)"
              value={newAttraction.relatedExcursions}
              onChange={(e) => setNewAttraction({ ...newAttraction, relatedExcursions: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <input
              type="text"
              placeholder="Координаты [широта, долгота]"
              value={newAttraction.position}
              onChange={(e) => setNewAttraction({ ...newAttraction, position: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
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
            <input
              type="text"
              placeholder="Стоимость входа"
              value={newAttraction.entryFee}
              onChange={(e) => setNewAttraction({ ...newAttraction, entryFee: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <button
              onClick={editAttractionId ? handleUpdateAttraction : handleAddAttraction}
              className="p-4 rounded-lg w-full text-base font-medium"
            >
              {editAttractionId ? 'ОБНОВИТЬ' : 'ДОБАВИТЬ'}
            </button>
          </div>
        )}

        <div className="mb-12 relative z-10">
          <h3 className="text-3xl font-semibold mb-6">Карта</h3>
          {typeof window !== 'undefined' && (
            <Suspense fallback={<div className="text-base">Загрузка карты...</div>}>
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
                {filteredAttractions.map(attraction => (
                  <Marker key={attraction.id} position={attraction.position} />
                ))}
              </MapContainer>
            </Suspense>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {filteredAttractions.map(attraction => (
            <div key={attraction.id} className="card">
              <img src={attraction.image} alt={attraction.name} className="w-full h-250px object-cover rounded-lg mb-4" />
              <div className="card-content">
                <h3 className="text-2xl font-semibold mb-2">{attraction.name}</h3>
                <p className="text-base mb-1">Город: {attraction.city}</p>
                <p className="text-base mb-2">Экскурсии: {attraction.relatedExcursions.join(', ')}</p>
                {user?.role === 'admin' ? (
                  <div className="flex space-x-3 mt-4">
                    <button
                      className="p-3 rounded-lg w-full text-base font-medium"
                      onClick={() => handleEditAttraction(attraction)}
                    >
                      РЕДАКТИРОВАТЬ
                    </button>
                    <button
                      className="bg-[#C8102E] text-[#FFD700] p-3 rounded-lg w-full text-base font-medium"
                      onClick={() => handleDeleteAttraction(attraction.id)}
                    >
                      УДАЛИТЬ
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex space-x-3 mt-4">
                      <Link to={`/attractions/${attraction.id}`}>
                        <button className="p-3 rounded-lg w-full text-base font-medium">
                          ПОДРОБНЕЕ
                        </button>
                      </Link>
                      <button
                        className={`p-3 rounded-lg ${attraction.isFavorite ? 'bg-yellow-500' : 'bg-gray-300'} hover:bg-yellow-600 text-base font-medium`}
                        onClick={() => toggleFavorite(attraction.id)}
                      >
                        {attraction.isFavorite ? '★' : '☆'}
                      </button>
                    </div>
                    <button
                      className="p-3 rounded-lg w-full text-base font-medium mt-4"
                      onClick={() => handleRecommendExcursions(attraction.id)}
                    >
                      ПОДОБРАТЬ ЭКСКУРСИЮ
                    </button>
                  </>
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