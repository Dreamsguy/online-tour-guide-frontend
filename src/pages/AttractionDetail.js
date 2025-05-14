import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function AttractionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const attractions = [
    { id: 'minsk-1', name: 'Площадь Независимости', description: 'Главная площадь Минска с Красным костёлом.', image: 'https://picsum.photos/300/400?random=101', position: [53.9006, 27.5590], history: 'Основана в XIX веке.', visitingHours: 'Круглосуточно', entryFee: 'Бесплатно', reviews: [{ user: 'Анна', text: 'Очень красиво!', rating: 5 }], relatedExcursions: [{ id: 1, title: 'Тур по Минску', price: 100, schedule: '2025-05-15 10:00' }] },
    { id: 'minsk-2', name: 'Национальная библиотека', description: 'Современное здание в форме ромбокубооктаэдра.', image: 'https://picsum.photos/300/400?random=102', position: [53.9049, 27.5615], history: 'Открыта в 2006 году.', visitingHours: 'Пн-Пт: 10:00-21:00', entryFee: '5 BYN', reviews: [], relatedExcursions: [{ id: 1, title: 'Тур по Минску', price: 100, schedule: '2025-05-15 10:00' }] },
    { id: 'minsk-3', name: 'Парк Горького', description: 'Популярный парк для отдыха и прогулок.', image: 'https://picsum.photos/300/400?random=103', position: [53.9214, 27.5930], history: 'Основан в 1930-х годах.', visitingHours: 'Круглосуточно', entryFee: 'Бесплатно', reviews: [], relatedExcursions: [{ id: 1, title: 'Тур по Минску', price: 100, schedule: '2025-05-15 10:00' }] },
    { id: 'grodno-1', name: 'Старый замок', description: 'Исторический замок в Гродно.', image: 'https://picsum.photos/300/400?random=201', position: [53.6785, 23.8295], history: 'Построен в XI веке.', visitingHours: 'Ср-Вс: 10:00-18:00', entryFee: '8 BYN', reviews: [], relatedExcursions: [{ id: 2, title: 'Поездка в Гродно', price: 150, schedule: '2025-05-16 09:00' }] },
    { id: 'grodno-2', name: 'Новый замок', description: 'Резиденция королей в Гродно.', image: 'https://picsum.photos/300/400?random=202', position: [53.6845, 23.8335], history: 'Построен в XVIII веке.', visitingHours: 'Ср-Вс: 10:00-18:00', entryFee: '8 BYN', reviews: [], relatedExcursions: [{ id: 2, title: 'Поездка в Гродно', price: 150, schedule: '2025-05-16 09:00' }] },
    { id: 'grodno-3', name: 'Фарный костёл', description: 'Красивый костёл в центре Гродно.', image: 'https://picsum.photos/300/400?random=203', position: [53.6770, 23.8130], history: 'Построен в 1705 году.', visitingHours: 'Ежедневно: 08:00-20:00', entryFee: 'Бесплатно', reviews: [], relatedExcursions: [{ id: 2, title: 'Поездка в Гродно', price: 150, schedule: '2025-05-16 09:00' }] },
    { id: 'gomel-1', name: 'Гомельский дворец', description: 'Дворец Румянцевых-Паскевичей.', image: 'https://picsum.photos/300/400?random=301', position: [52.4345, 30.9754], history: 'Построен в XVIII веке.', visitingHours: 'Вт-Вс: 10:00-18:00', entryFee: '10 BYN', reviews: [], relatedExcursions: [{ id: 3, title: 'Экскурсия в Гомель', price: 120, schedule: '2025-05-17 11:00' }] },
    { id: 'gomel-2', name: 'Парк Румянцевых и Паскевичей', description: 'Живописный парк в Гомеле.', image: 'https://picsum.photos/300/400?random=302', position: [52.4350, 30.9870], history: 'Создан в XIX веке.', visitingHours: 'Круглосуточно', entryFee: 'Бесплатно', reviews: [], relatedExcursions: [{ id: 3, title: 'Экскурсия в Гомель', price: 120, schedule: '2025-05-17 11:00' }] },
    { id: 'gomel-3', name: 'Собор Петра и Павла', description: 'Православный собор в Гомеле.', image: 'https://picsum.photos/300/400?random=303', position: [52.4300, 30.9700], history: 'Построен в 1824 году.', visitingHours: 'Ежедневно: 08:00-20:00', entryFee: 'Бесплатно', reviews: [], relatedExcursions: [{ id: 3, title: 'Экскурсия в Гомель', price: 120, schedule: '2025-05-17 11:00' }] },
    { id: 'mogilev-1', name: 'Могилевская ратуша', description: 'Историческое здание ратуши.', image: 'https://picsum.photos/300/400?random=401', position: [53.8999, 30.3314], history: 'Построена в XVII веке.', visitingHours: 'Ср-Вс: 10:00-18:00', entryFee: '6 BYN', reviews: [], relatedExcursions: [{ id: 4, title: 'Тур в Могилев', price: 130, schedule: '2025-05-18 10:00' }] },
    { id: 'mogilev-2', name: 'Драматический театр', description: 'Театр в центре Могилева.', image: 'https://picsum.photos/300/400?random=402', position: [53.8940, 30.3260], history: 'Открыт в 1888 году.', visitingHours: 'По расписанию спектаклей', entryFee: '10-30 BYN', reviews: [], relatedExcursions: [{ id: 4, title: 'Тур в Могилев', price: 130, schedule: '2025-05-18 10:00' }] },
    { id: 'mogilev-3', name: 'Площадь Звёзд', description: 'Площадь с памятниками знаменитостей.', image: 'https://picsum.photos/300/400?random=403', position: [53.9100, 30.3400], history: 'Создано в 2008 году.', visitingHours: 'Круглосуточно', entryFee: 'Бесплатно', reviews: [], relatedExcursions: [{ id: 4, title: 'Тур в Могилев', price: 130, schedule: '2025-05-18 10:00' }] },
    { id: 'mir-1', name: 'Мирский замок', description: 'Средневековый замок, объект ЮНЕСКО.', image: 'https://picsum.photos/300/400?random=501', position: [53.4513, 26.4730], history: 'Построен в начале XVI века Юрием Ильиничем.', visitingHours: 'Ежедневно: 10:00-18:00', entryFee: '10 BYN', reviews: [{ user: 'Анна', text: 'Очень красиво!', rating: 5 }], relatedExcursions: [{ id: 5, title: 'Тур по замкам Беларуси', price: 200, schedule: '2025-05-20 08:00' }] },
    { id: 'nesvizh-1', name: 'Несвижский дворец', description: 'Дворец Радзивиллов, объект ЮНЕСКО.', image: 'https://picsum.photos/300/400?random=502', position: [53.2228, 26.6917], history: 'Основан в 1583 году Николаем Радзивиллом Черным.', visitingHours: 'Ежедневно: 09:00-17:00', entryFee: '12 BYN', reviews: [{ user: 'Петр', text: 'Великолепное место!', rating: 5 }], relatedExcursions: [{ id: 5, title: 'Тур по замкам Беларуси', price: 200, schedule: '2025-05-20 08:00' }] },
  ];

  const [attraction, setAttraction] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [newReview, setNewReview] = useState({ text: '', rating: 5 });

  useEffect(() => {
    const foundAttraction = attractions.find(attr => attr.id === id);
    if (foundAttraction) {
      setAttraction(foundAttraction);
      setIsFavorite(foundAttraction.isFavorite || false);
    }
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
  }, [id]);

  const toggleFavorite = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsFavorite(!isFavorite);
  };

  const handleAddReview = () => {
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
    setAttraction({
      ...attraction,
      reviews: [...attraction.reviews, { user: user.name, text: newReview.text, rating: parseInt(newReview.rating) }],
    });
    setNewReview({ text: '', rating: 5 });
  };

  const handleBookExcursion = (excursionId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/booking', { state: { excursionId } });
  };

  const handleEditAttraction = () => {
    alert('Редактирование достопримечательности (доступно только администратору)');
    // Логика редактирования достопримечательности
  };

  if (!attraction) return <div className="min-h-screen pt-24 text-center text-lg">Достопримечательность не найдена</div>;

  return (
    <div className="min-h-screen pt-24 bg-gray-100">
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-10">
          <h1 className="text-5xl font-bold text-center mb-8 text-gray-800">{attraction.name}</h1>
          <img src={attraction.image} alt={attraction.name} className="w-full h-96 object-cover rounded-xl mb-6" />
          <div className="space-y-4 text-lg text-gray-700">
            <p><span className="font-semibold">Описание:</span> {attraction.description}</p>
            <p><span className="font-semibold">История:</span> {attraction.history}</p>
            <p><span className="font-semibold">Часы работы:</span> {attraction.visitingHours}</p>
            <p><span className="font-semibold">Стоимость входа:</span> {attraction.entryFee}</p>
          </div>
          <div className="mt-8 relative z-10">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Карта</h3>
            {typeof window !== 'undefined' && (
              <Suspense fallback={<div className="text-lg">Загрузка карты...</div>}>
                <MapContainer
                  center={attraction.position}
                  zoom={13}
                  style={{ height: '500px', width: '100%', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)' }}
                  ref={mapRef}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={attraction.position} />
                </MapContainer>
              </Suspense>
            )}
          </div>
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Связанные экскурсии</h3>
            {attraction.relatedExcursions.map((exc, idx) => (
              <div key={idx} className="p-4 border-b text-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold">{exc.title}</p>
                  <p>Цена: €{exc.price}</p>
                  <p>Расписание: {exc.schedule}</p>
                </div>
                <button
                  className="bg-black text-white p-3 rounded-lg font-medium hover:bg-gray-800 transition text-lg"
                  onClick={() => handleBookExcursion(exc.id)}
                >
                  ЗАБРОНИРОВАТЬ
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              className={`flex-1 p-4 rounded-lg font-medium text-lg transition ${isFavorite ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-300 hover:bg-gray-400'}`}
              onClick={toggleFavorite}
            >
              {isFavorite ? '★ Удалить из избранного' : '☆ Добавить в избранное'}
            </button>
            {user && user.role === 'admin' && (
              <button
                className="flex-1 bg-blue-600 text-white p-4 rounded-lg font-medium hover:bg-blue-700 transition text-lg"
                onClick={handleEditAttraction}
              >
                РЕДАКТИРОВАТЬ ДОСТОПРИМЕЧАТЕЛЬНОСТЬ
              </button>
            )}
          </div>
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Отзывы</h3>
            <div className="space-y-3">
              {attraction.reviews.map((review, idx) => (
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

export default AttractionDetail;