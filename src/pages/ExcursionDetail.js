import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Исправляем проблему с иконкой маркера
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ExcursionDetail() {
  const { id } = useParams();
  const { user, settings } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const excursions = [
    {
      id: 1,
      title: 'Тур по Минску',
      image: 'https://picsum.photos/300/400?random=1',
      description: 'Обзорная экскурсия по главным достопримечательностям Минска.',
      price: 100,
      schedule: '2025-05-15 10:00',
      tags: ['групповая', 'русский'],
      company: 'BelTour',
      guide: 'Иван Иванов',
      city: 'Минск',
      reviews: [{ user: 'Анна', text: 'Отличная экскурсия!', rating: 5 }],
      waypoints: [
        { coords: [53.9006, 27.5590], name: 'Площадь Независимости', id: 'minsk-1' },
        { coords: [53.9049, 27.5615], name: 'Национальная библиотека', id: 'minsk-2' },
        { coords: [53.9214, 27.5930], name: 'Парк Горького', id: 'minsk-3' },
      ],
    },
    {
      id: 2,
      title: 'Поездка в Гродно',
      image: 'https://picsum.photos/300/400?random=2',
      description: 'Индивидуальный тур по историческим местам Гродно.',
      price: 150,
      schedule: '2025-05-16 09:00',
      tags: ['индивидуальная', 'английский'],
      company: 'TravelBY',
      guide: 'Мария Петрова',
      city: 'Гродно',
      reviews: [{ user: 'Петр', text: 'Замечательный гид!', rating: 4 }],
      waypoints: [
        { coords: [53.6785, 23.8295], name: 'Старый замок', id: 'grodno-1' },
        { coords: [53.6845, 23.8335], name: 'Новый замок', id: 'grodno-2' },
        { coords: [53.6770, 23.8130], name: 'Фарный костёл', id: 'grodno-3' },
      ],
    },
    {
      id: 3,
      title: 'Экскурсия в Гомель',
      image: 'https://picsum.photos/300/400?random=8',
      description: 'Групповой тур по историческим местам Гомеля.',
      price: 120,
      schedule: '2025-05-17 11:00',
      tags: ['групповая', 'русский'],
      company: 'BelTour',
      guide: 'Екатерина Смирнова',
      city: 'Гомель',
      reviews: [],
      waypoints: [
        { coords: [52.4345, 30.9754], name: 'Гомельский дворец', id: 'gomel-1' },
        { coords: [52.4350, 30.9870], name: 'Парк Румянцевых и Паскевичей', id: 'gomel-2' },
        { coords: [52.4300, 30.9700], name: 'Собор Петра и Павла', id: 'gomel-3' },
      ],
    },
    {
      id: 4,
      title: 'Тур в Могилев',
      image: 'https://picsum.photos/300/400?random=9',
      description: 'Индивидуальная экскурсия по Могилеву.',
      price: 130,
      schedule: '2025-05-18 10:00',
      tags: ['индивидуальная', 'русский'],
      company: 'TravelBY',
      guide: 'Алексей Кузнецов',
      city: 'Могилев',
      reviews: [],
      waypoints: [
        { coords: [53.8999, 30.3314], name: 'Могилевская ратуша', id: 'mogilev-1' },
        { coords: [53.8940, 30.3260], name: 'Драматический театр', id: 'mogilev-2' },
        { coords: [53.9100, 30.3400], name: 'Площадь Звёзд', id: 'mogilev-3' },
      ],
    },
    {
      id: 5,
      title: 'Тур по замкам Беларуси',
      image: 'https://picsum.photos/300/400?random=15',
      description: 'Посещение Мирского замка и Несвижского дворца за один день.',
      price: 200,
      schedule: '2025-05-20 08:00',
      tags: ['групповая', 'русский'],
      company: 'BelTour',
      guide: 'Сергей Петров',
      city: 'Мир-Несвиж',
      reviews: [],
      waypoints: [
        { coords: [53.4513, 26.4730], name: 'Мирский замок', id: 'mir-1' },
        { coords: [53.2228, 26.6917], name: 'Несвижский дворец', id: 'nesvizh-1' },
      ],
    },
  ];

  const [excursion, setExcursion] = useState(null);
  const [newReview, setNewReview] = useState({ text: '', rating: 5 });

  useEffect(() => {
    const parsedId = parseInt(id);
    const foundExcursion = excursions.find(exc => exc.id === parsedId);
    if (foundExcursion) {
      setExcursion(foundExcursion);
      console.log('Excursion data loaded:', foundExcursion);
    }
  }, [id]);

  const initializeRoute = (map) => {
    if (!map || !excursion || !excursion.waypoints || excursion.waypoints.length === 0) {
      console.log('Cannot initialize route - prerequisites not met:', {
        mapReady: !!map,
        excursionExists: !!excursion,
        waypointsExist: !!excursion?.waypoints,
        waypointsCount: excursion?.waypoints?.length || 0,
      });
      return;
    }

    map.eachLayer(layer => {
      if (layer instanceof L.Routing.Control) map.removeControl(layer);
    });

    const routingControl = L.Routing.control({
      waypoints: excursion.waypoints.map(point => L.latLng(point.coords[0], point.coords[1])),
      routeWhileDragging: true,
      show: false,
      lineOptions: { styles: [{ color: '#0078A8', weight: 4 }] },
      createMarker: () => null,
    }).addTo(map);

    console.log('Routing control added:', routingControl);

    const midIndex = Math.floor(excursion.waypoints.length / 2);
    map.setView(excursion.waypoints[midIndex].coords, 10);
  };

  const handleAddReview = () => {
    if (!user) navigate('/login');
    else if (user.role === 'admin') alert('Администраторы не могут оставлять отзывы.');
    else if (!newReview.text || !newReview.rating) alert('Пожалуйста, заполните отзыв и рейтинг.');
    else {
      setExcursion({
        ...excursion,
        reviews: [...excursion.reviews, { user: user.name, text: newReview.text, rating: parseInt(newReview.rating) }],
      });
      setNewReview({ text: '', rating: 5 });
    }
  };

  const handleBookExcursion = () => {
    if (!user) navigate('/login');
    else navigate('/booking', { state: { excursionId: excursion.id } });
  };

  const handleEditExcursion = () => {
    alert('Редактирование экскурсии (доступно только администратору)');
    // Логика редактирования экскурсии
  };

  const handleViewSchedule = () => {
    alert('Просмотр расписания (доступно гиду и менеджеру)');
    // Логика просмотра расписания
  };

  const handleMarkerClick = (waypointId) => {
    navigate(`/attraction/${waypointId}`);
  };

  if (!excursion) return <div className="min-h-screen pt-20 text-center text-lg">Экскурсия с ID {id} не найдена</div>;

  const formattedPrice = `${excursion.price} ${settings.currency === 'USD' ? '$' : settings.currency === 'RUB' ? '₽' : '€'}`;

  return (
    <div className="min-h-screen pt-24 bg-gray-100">
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-10">
          <h1 className="text-5xl font-bold text-center mb-8 text-gray-800">{excursion.title}</h1>
          <img src={excursion.image} alt={excursion.title} className="w-full h-96 object-cover rounded-xl mb-6" />
          <div className="space-y-4 text-lg text-gray-700">
            <p><span className="font-semibold">Описание:</span> {excursion.description}</p>
            <p><span className="font-semibold">Цена:</span> {formattedPrice}</p>
            <p><span className="font-semibold">Расписание:</span> {excursion.schedule}</p>
            <p><span className="font-semibold">Город:</span> {excursion.city}</p>
            <p><span className="font-semibold">Теги:</span> {excursion.tags.join(', ')}</p>
            <p><span className="font-semibold">Компания:</span> {excursion.company}</p>
            <p><span className="font-semibold">Гид:</span> {excursion.guide}</p>
          </div>
          <div className="mt-8 relative z-10">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Маршрут</h3>
            {typeof window !== 'undefined' && (
              <Suspense fallback={<div className="text-lg">Загрузка карты...</div>}>
                <MapContainer
                  center={excursion.waypoints[0].coords}
                  zoom={10}
                  style={{ height: '500px', width: '100%', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)' }}
                  whenCreated={map => {
                    mapRef.current = map;
                    console.log('Map initialized:', map);
                    initializeRoute(map);
                  }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {excursion.waypoints.map((waypoint, index) => (
                    <Marker
                      key={index}
                      position={waypoint.coords}
                      eventHandlers={{
                        click: () => handleMarkerClick(waypoint.id),
                      }}
                    >
                      <Popup>{waypoint.name}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </Suspense>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              className="flex-1 bg-black text-white p-4 rounded-lg font-medium hover:bg-gray-800 transition text-lg"
              onClick={handleBookExcursion}
            >
              ЗАБРОНИРОВАТЬ
            </button>
            {user && user.role === 'admin' && (
              <button
                className="flex-1 bg-blue-600 text-white p-4 rounded-lg font-medium hover:bg-blue-700 transition text-lg"
                onClick={handleEditExcursion}
              >
                РЕДАКТИРОВАТЬ ЭКСКУРСИЮ
              </button>
            )}
            {user && (user.role === 'guide' || user.role === 'manager') && (
              <button
                className="flex-1 bg-green-600 text-white p-4 rounded-lg font-medium hover:bg-green-700 transition text-lg"
                onClick={handleViewSchedule}
              >
                ПРОСМОТР РАСПИСАНИЯ
              </button>
            )}
          </div>
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Отзывы</h3>
            <div className="space-y-3">
              {excursion.reviews.map((review, idx) => (
                <p key={idx} className="text-lg">
                  <span className="font-semibold">{review.user}:</span> {review.text} (<i className="fas fa-star text-yellow-500"></i> {review.rating})
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

export default ExcursionDetail;