import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
const MapContainer = React.lazy(() => import('react-leaflet').then(mod => ({ default: mod.MapContainer })));
const TileLayer = React.lazy(() => import('react-leaflet').then(mod => ({ default: mod.TileLayer })));
const Marker = React.lazy(() => import('react-leaflet').then(mod => ({ default: mod.Marker })));

function Excursions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [excursions, setExcursions] = useState([
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
      position: [53.9, 27.5667],
      city: 'Минск',
      reviews: [{ user: 'Анна', text: 'Отличная экскурсия!', rating: 5 }],
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
      position: [53.6688, 23.8223],
      city: 'Гродно',
      reviews: [{ user: 'Петр', text: 'Замечательный гид!', rating: 4 }],
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
      position: [52.4345, 30.9754],
      city: 'Гомель',
      reviews: [],
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
      position: [53.8999, 30.3314],
      city: 'Могилев',
      reviews: [],
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
      position: [53.4513, 26.4730], // Начальная точка (Мирский замок)
      city: 'Мир-Несвиж',
      reviews: [],
    },
  ]);

  const [newExcursion, setNewExcursion] = useState({
    title: '',
    image: '',
    description: '',
    price: '',
    schedule: '',
    tags: '',
    company: '',
    guide: '',
    position: '',
    city: '',
  });

  const [editExcursionId, setEditExcursionId] = useState(null);
  const [newReview, setNewReview] = useState({ text: '', rating: 5 });
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
  }, []);

  const recommendedExcursions = location.state?.recommendedExcursions || [];
  const cityFilter = location.state?.cityFilter || '';

  const filteredExcursions = excursions.filter(excursion => {
    const matchesRecommendations = recommendedExcursions.length ? recommendedExcursions.includes(excursion.title) : true;
    const matchesCity = cityFilter ? excursion.city === cityFilter : true;
    return matchesRecommendations && matchesCity;
  });

  const handleAddReview = (excursionId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      alert('Администраторы не могут оставлять отзывы.');
      return;
    }
    if (!newReview.text || !newReview.rating) {
      alert('Пожалуйста, заполните отзыв и рейтинг.');
      return;
    }
    setExcursions(excursions.map(exc => {
      if (exc.id === excursionId) {
        return { ...exc, reviews: [...exc.reviews, { user: user.name, text: newReview.text, rating: parseInt(newReview.rating) }] };
      }
      return exc;
    }));
    setNewReview({ text: '', rating: 5 });
  };

  const handleBook = (excursionId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/booking', { state: { excursionId } });
  };

  const handleAddExcursion = () => {
    if (!newExcursion.title || !newExcursion.city) {
      alert('Заполните обязательные поля (название, город).');
      return;
    }
    const excursionToAdd = {
      ...newExcursion,
      id: excursions.length + 1,
      price: parseInt(newExcursion.price) || 0,
      tags: newExcursion.tags.length ? newExcursion.tags.split(',').map(tag => tag.trim()) : [],
      position: newExcursion.position.length ? JSON.parse(newExcursion.position) : [0, 0],
      reviews: [],
    };
    setExcursions([...excursions, excursionToAdd]);
    setNewExcursion({
      title: '',
      image: '',
      description: '',
      price: '',
      schedule: '',
      tags: '',
      company: '',
      guide: '',
      position: '',
      city: '',
    });
  };

  const handleEditExcursion = (excursion) => {
    setEditExcursionId(excursion.id);
    setNewExcursion({
      title: excursion.title,
      image: excursion.image,
      description: excursion.description,
      price: excursion.price.toString(),
      schedule: excursion.schedule,
      tags: excursion.tags.join(','),
      company: excursion.company,
      guide: excursion.guide,
      position: JSON.stringify(excursion.position),
      city: excursion.city,
    });
  };

  const handleUpdateExcursion = () => {
    setExcursions(excursions.map(exc => {
      if (exc.id === editExcursionId) {
        return {
          ...exc,
          title: newExcursion.title,
          image: newExcursion.image,
          description: newExcursion.description,
          price: parseInt(newExcursion.price) || 0,
          schedule: newExcursion.schedule,
          tags: newExcursion.tags.split(',').map(tag => tag.trim()),
          company: newExcursion.company,
          guide: newExcursion.guide,
          position: JSON.parse(newExcursion.position || '[0,0]'),
          city: newExcursion.city,
        };
      }
      return exc;
    }));
    setEditExcursionId(null);
    setNewExcursion({
      title: '',
      image: '',
      description: '',
      price: '',
      schedule: '',
      tags: '',
      company: '',
      guide: '',
      position: '',
      city: '',
    });
  };

  const handleDeleteExcursion = (id) => {
    setExcursions(excursions.filter(exc => exc.id !== id));
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-12">Экскурсии</h1>

        {user?.role === 'admin' && (
          <div className="card p-8 max-w-lg mx-auto mb-12">
            <h2 className="text-3xl font-semibold mb-6">{editExcursionId ? 'Редактировать экскурсию' : 'Добавить экскурсию'}</h2>
            <input
              type="text"
              placeholder="Название"
              value={newExcursion.title}
              onChange={(e) => setNewExcursion({ ...newExcursion, title: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <input
              type="text"
              placeholder="Город"
              value={newExcursion.city}
              onChange={(e) => setNewExcursion({ ...newExcursion, city: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <input
              type="text"
              placeholder="URL изображения"
              value={newExcursion.image}
              onChange={(e) => setNewExcursion({ ...newExcursion, image: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <textarea
              placeholder="Описание"
              value={newExcursion.description}
              onChange={(e) => setNewExcursion({ ...newExcursion, description: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
              rows="3"
            />
            <input
              type="number"
              placeholder="Цена"
              value={newExcursion.price}
              onChange={(e) => setNewExcursion({ ...newExcursion, price: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <input
              type="text"
              placeholder="Расписание (гггг-мм-дд чч:мм)"
              value={newExcursion.schedule}
              onChange={(e) => setNewExcursion({ ...newExcursion, schedule: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <input
              type="text"
              placeholder="Теги (через запятую)"
              value={newExcursion.tags}
              onChange={(e) => setNewExcursion({ ...newExcursion, tags: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <input
              type="text"
              placeholder="Компания"
              value={newExcursion.company}
              onChange={(e) => setNewExcursion({ ...newExcursion, company: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <input
              type="text"
              placeholder="Гид"
              value={newExcursion.guide}
              onChange={(e) => setNewExcursion({ ...newExcursion, guide: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <input
              type="text"
              placeholder="Координаты [широта, долгота]"
              value={newExcursion.position}
              onChange={(e) => setNewExcursion({ ...newExcursion, position: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <button
              onClick={editExcursionId ? handleUpdateExcursion : handleAddExcursion}
              className="p-4 rounded-lg w-full text-base font-medium"
            >
              {editExcursionId ? 'ОБНОВИТЬ' : 'ДОБАВИТЬ'}
            </button>
          </div>
        )}

        <div className="mb-12 relative z-10">
          <h3 className="text-3xl font-semibold mb-6">Карта</h3>
          {typeof window !== 'undefined' && (
            <Suspense fallback={<div className="text-base">Загрузка карты...</div>}>
              <MapContainer
                center={[53.9, 27.5667]}
                zoom={8}
                style={{ height: '500px', width: '100%', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)' }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {filteredExcursions.map(excursion => (
                  <Marker key={excursion.id} position={excursion.position} />
                ))}
              </MapContainer>
            </Suspense>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {filteredExcursions.map(excursion => (
            <div key={excursion.id} className="card">
              <img src={excursion.image} alt={excursion.title} className="w-full h-250px object-cover rounded-lg mb-4" />
              <div className="card-content">
                <h3 className="text-2xl font-semibold mb-2">{excursion.title}</h3>
                <p className="text-base mb-1">{excursion.description}</p>
                <p className="text-base mb-1">Цена: €{excursion.price}</p>
                <p className="text-base mb-1">Расписание: {excursion.schedule}</p>
                <p className="text-base mb-1">Город: {excursion.city}</p>
                <p className="text-base mb-1">Компания: {excursion.company}</p>
                <p className="text-base mb-2">Гид: {excursion.guide}</p>
                {user?.role === 'admin' ? (
                  <div className="flex space-x-3 mt-4">
                    <button
                      className="p-3 rounded-lg w-full text-base font-medium"
                      onClick={() => handleEditExcursion(excursion)}
                    >
                      РЕДАКТИРОВАТЬ
                    </button>
                    <button
                      className="bg-[#C8102E] text-[#FFD700] p-3 rounded-lg w-full text-base font-medium"
                      onClick={() => handleDeleteExcursion(excursion.id)}
                    >
                      УДАЛИТЬ
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex space-x-3 mt-4">
                      <Link to={`/excursion/${excursion.id}`}>
                        <button className="p-3 rounded-lg w-full text-base font-medium">
                          ПОДРОБНЕЕ
                        </button>
                      </Link>
                      <button
                        className="p-3 rounded-lg w-full text-base font-medium"
                        onClick={() => handleBook(excursion.id)}
                      >
                        ЗАБРОНИРОВАТЬ
                      </button>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-semibold text-base mb-2">Отзывы:</h4>
                      <div className="review-block">
                        {excursion.reviews.map((review, idx) => (
                          <p key={idx}>{review.user}: {review.text} (<i className="fas fa-star text-yellow-500"></i> {review.rating})</p>
                        ))}
                      </div>
                      {user && user.role !== 'admin' && (
                        <div className="mt-4">
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
                          <button
                            className="p-3 rounded-lg w-full text-base font-medium"
                            onClick={() => handleAddReview(excursion.id)}
                          >
                            ОТПРАВИТЬ ОТЗЫВ
                          </button>
                        </div>
                      )}
                    </div>
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

export default Excursions;