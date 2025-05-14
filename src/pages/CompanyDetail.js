import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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

  const handleMarkerClick = (waypointId) => {
    navigate(`/landmark/${waypointId}`); // Переход на страницу достопримечательности
  };

  if (!excursion) return <div className="min-h-screen pt-20 text-center text-base">Экскурсия с ID {id} не найдена</div>;

  const formattedPrice = `${excursion.price} ${settings.currency === 'USD' ? '$' : settings.currency === 'RUB' ? '₽' : '€'}`;

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-12">{excursion.title}</h1>
        <div className="card p-8">
          <img src={excursion.image} alt={excursion.title} className="w-full h-96 object-cover rounded-lg mb-4" />
          <p className="text-base mb-2">{excursion.description}</p>
          <p className="text-base mb-2">Цена: {formattedPrice}</p>
          <p className="text-base mb-2">Расписание: {excursion.schedule}</p>
          <p className="text-base mb-2">Город: {excursion.city}</p>
          <p className="text-base mb-2">Теги: {excursion.tags.join(', ')}</p>
          <p className="text-base mb-2">Компания: {excursion.company}</p>
          <p className="text-base mb-4">Гид: {excursion.guide}</p>
          <div className="mb-4 relative z-10">
            <h3 className="text-2xl font-semibold mb-4">Маршрут</h3>
            {typeof window !== 'undefined' && (
              <Suspense fallback={<div className="text-base">Загрузка карты...</div>}>
                <MapContainer
                  center={excursion.waypoints[0].coords}
                  zoom={10}
                  style={{ height: '500px', width: '100%', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)' }}
                  whenCreated={map => {
                    mapRef.current = map;
                    console.log('Map initialized:', map);
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
          <button className="p-4 rounded-lg w-full text-base font-medium mb-4" onClick={handleBookExcursion}>
            ЗАБРОНИРОВАТЬ
          </button>
          <div className="mb-4">
            <h3 className="text-2xl font-semibold mb-2">Отзывы</h3>
            <div className="review-block">
              {excursion.reviews.map((review, idx) => (
                <p key={idx}>{review.user}: {review.text} (<i className="fas fa-star text-yellow-500"></i> {review.rating})</p>
              ))}
            </div>
            {user && user.role !== 'admin' && (
              <div className="mt-4">
                <h4 className="font-semibold text-base mb-2">Оставить отзыв</h4>
                <input
                  type="text"
                  placeholder="Ваш отзыв"
                  className="p-4 w-full rounded-lg mb-2 text-base"
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Рейтинг (1-5)"
                  className="p-4 w-full rounded-lg mb-2 text-base"
                  min="1"
                  max="5"
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                />
                <button className="p-4 rounded-lg w-full text-base font-medium" onClick={handleAddReview}>
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