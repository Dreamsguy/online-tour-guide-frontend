import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';
import '../global.css';

function Home() {
  const [topExcursions, setTopExcursions] = useState([]);
  const [allExcursions, setAllExcursions] = useState([]);
  const [cities, setCities] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  console.log('User:', user);

  const [searchQuery, setSearchQuery] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [preferences, setPreferences] = useState({
    preferredCity: '',
    preferredDirection: '',
    preferredAttractions: [],
  });
  const [directions, setDirections] = useState([]);
  const [attractions, setAttractions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [topRes, allRes, citiesRes, reviewsRes] = await Promise.all([
          api.get('/api/excursions/top').catch(err => { console.log('Ошибка топ экскурсий:', err); return { data: [] }; }),
          api.get('/api/excursions').catch(err => { console.log('Ошибка всех экскурсий:', err); return { data: [] }; }),
          api.get('/api/excursions/cities').catch(err => { console.log('Ошибка городов:', err); return { data: [] }; }),
          api.get('/api/reviews/top').catch(err => { console.log('Ошибка отзывов:', err); return { data: [] }; }),
        ]);
        setTopExcursions(topRes.data || []);
        setAllExcursions(allRes.data || []);
        setCities(citiesRes.data || []);
        setReviews(reviewsRes.data || []);

        if (user?.id) {
          try {
            const prefsResponse = await api.get(`/api/excursions/preferences/${user.id}`).catch(err => { console.log('Ошибка предпочтений:', err); return { data: {} }; });
            const prefs = prefsResponse.data || {};
            if (prefs.PreferredCity) {
              const cityRecRes = await api.get('/api/excursions', { params: { city: prefs.PreferredCity } }).catch(err => { console.log('Ошибка рекомендаций по городу:', err); return { data: [] }; });
              setRecommendations(cityRecRes.data.slice(0, 3) || []);
            } else {
              const actionsRes = await api.get(`/api/useractions/${user.id}`).catch(err => { console.log('Нет данных о действиях:', err); return { data: [] }; });
              const viewedExcursionIds = actionsRes.data.map(a => a.ExcursionId);
              if (viewedExcursionIds.length > 0) {
                const recRes = await api.get('/api/excursions', { params: { ids: viewedExcursionIds.join(',') } }).catch(err => { console.log('Ошибка рекомендаций:', err); return { data: [] }; });
                setRecommendations(recRes.data || []);
              } else {
                const defaultCity = 'Минск';
                const cityRecRes = await api.get('/api/excursions', { params: { city: defaultCity } }).catch(err => { console.log('Ошибка рекомендаций по городу:', err); return { data: [] }; });
                setRecommendations(cityRecRes.data.slice(0, 3) || []);
              }
            }
          } catch (recErr) {
            console.warn('Рекомендации не доступны:', recErr);
            setRecommendations([]);
          }
        }

        const [directionsRes] = await Promise.all([
          api.get('/api/excursions/Directions').catch(err => { console.error('Ошибка загрузки направлений:', err); return { data: [] }; }),
        ]);
        setDirections(directionsRes.data || []);
      } catch (err) {
        console.error('Общая ошибка загрузки данных:', err);
        setError(err.message || 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleBookExcursion = (excursionId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'user') {
      alert('Только пользователи могут бронировать экскурсии.');
      return;
    }
    navigate(`/excursion/${excursionId}/book`);
  };

  const hasAvailableTickets = (excursion) => {
    if (!excursion.availableTicketsByDate || Object.keys(excursion.availableTicketsByDate).length === 0) return false;
    return Object.values(excursion.availableTicketsByDate).some((date) =>
      Object.values(date).some((ticket) => ticket.count > 0)
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const query = encodeURIComponent(searchQuery.trim());
      navigate(`/excursions?search=${query}`);
      setSearchQuery('');
    }
  };

  const handlePopupToggle = () => {
    setShowPopup(!showPopup);
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    if (name === 'preferredCity' || name === 'preferredDirection') {
      setPreferences((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAttractionToggle = (attractionId) => {
    setPreferences((prev) => {
      const newAttractions = prev.preferredAttractions.includes(attractionId)
        ? prev.preferredAttractions.filter(id => id !== attractionId)
        : [...prev.preferredAttractions, attractionId];
      return { ...prev, preferredAttractions: newAttractions };
    });
  };

  const handleSavePreferences = async () => {
    if (user?.id) {
      console.log('Сохранение предпочтений:', {
        UserId: user.id,
        PreferredCity: preferences.preferredCity,
        PreferredDirection: preferences.preferredDirection,
        PreferredAttractions: preferences.preferredAttractions,
      });
      try {
        const response = await api.post(`/api/preferences?userId=${user.id}`, {
          UserId: user.id,
          PreferredCity: preferences.preferredCity || null,
          PreferredDirection: preferences.preferredDirection || null,
          PreferredAttractions: preferences.preferredAttractions,
          UpdatedAt: new Date().toISOString(),
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('Ответ сервера:', response.data);
        setShowPopup(false);
        navigate(`/excursions?city=${encodeURIComponent(preferences.preferredCity || '')}&direction=${encodeURIComponent(preferences.preferredDirection || '')}&attractions=${encodeURIComponent(preferences.preferredAttractions.join(','))}`);
      } catch (err) {
        console.error('Ошибка сохранения предпочтений:', err.response ? err.response.data : err.message);
        setError('Не удалось сохранить предпочтения. Проверь данные или эндпоинт.');
      }
    }
  };

  if (loading) return <div className="text-center text-yellow-400 mt-20">Загрузка...</div>;
  if (error) return <div className="text-center text-red-500 mt-20">Ошибка: {error}. Проверь консоль для деталей.</div>;

  return (
    <div>
      <div className="relative h-screen bg-cover bg-center" style={{ backgroundImage: "url('/D6MugJFGWwZUuLQm.jpg')" }}>
        <div className="bg-black bg-opacity-40"></div>
        <div className="container mx-auto py-6">
          <div className="navbar">
            <div className="flex justify-center w-full">
              <Link to="/" className="text-2xl text-gray-800 hover:text-yellow-600 font-forum mx-4">Главная</Link>
              <Link to="/excursions" className="text-2xl text-gray-800 hover:text-yellow-600 font-forum mx-4">Экскурсии</Link>
              <Link to="/attractions" className="text-2xl text-gray-800 hover:text-yellow-600 font-forum mx-4">Достопримечательности</Link>
            </div>
            {user && (
              <div className="ml-auto flex items-center space-x-4">
                <Link to="/profile" className="profile-button-custom" data-diamond-top data-square1 data-square2 data-diamond-bottom data-square3 data-square4>
                  Профиль
                </Link>
                <button onClick={handleLogout} className="text-2xl text-red-500 hover:text-orange-500 font-forum">Выйти</button>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-4 mt-2">
            {!user && (
              <>
                <Link to="/register" className="text-xl text-white hover:text-yellow-600 font-forum bg-blue-200 bg-opacity-50 px-4 py-2 rounded-lg border-2 border-white">Регистрация</Link>
                <Link to="/login" className="text-xl text-white hover:text-yellow-600 font-forum bg-blue-200 bg-opacity-50 px-4 py-2 rounded-lg border-2 border-white">Вход</Link>
              </>
            )}
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-7xl font-forum font-normal leading-tight max-w-3xl mx-auto break-words whitespace-pre-wrap">
            <span className="block tracking-[0.35em]">БЕЛОРУССКИЕ</span>
            <span className="block tracking-[0.2em]">ЖИВОПИСНЫЕ</span>
            <span className="block tracking-[0.15em]">КРАЯ</span>
          </h1>
        </div>
        <div className="absolute top-1/6 left-1/3 transform -translate-x-1/4">
          <div className="diamond w-30 h-30 bg-glass"></div>
        </div>
        <div className="absolute top-1/4 right-1/3 transform translate-x-1/4">
          <div className="diamond w-40 h-40 bg-glass"></div>
        </div>
        <div className="absolute top-1/2 left-1/4 transform -translate-x-1/4">
          <div className="diamond w-50 h-50 bg-glass"></div>
        </div>
        <div className="absolute top-2/3 right-1/4 transform translate-x-1/4">
          <div className="diamond w-35 h-35 bg-glass"></div>
        </div>
        <div className="absolute bottom-1/6 left-1/4 transform -translate-x-1/4">
          <div className="diamond w-45 h-45 bg-glass"></div>
        </div>
        <div className="absolute bottom-1/4 right-1/3 transform translate-x-1/4">
          <div className="diamond w-30 h-30 bg-glass"></div>
        </div>
        <div className="absolute top-3/4 left-2/5 transform -translate-x-1/4">
          <div className="diamond w-40 h-40 bg-glass"></div>
        </div>

        {user && (
          <button
            onClick={handlePopupToggle}
            className="fixed bottom-4 right-4 p-3 bg-gray-800 text-yellow-400 rounded-full shadow-lg hover:bg-gray-700 focus:outline-none z-50"
            title="Настройки предпочтений"
          >
            <i className="fas fa-compass"></i>
          </button>
        )}

        {showPopup && user && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg">
              <h3 className="text-xl font-bold text-yellow-400 mb-6">Ваши предпочтения</h3>
              <div className="space-y-6">
                {error && <p className="text-red-500">{error}</p>}
                <select
                  name="preferredCity"
                  value={preferences.preferredCity}
                  onChange={handlePreferenceChange}
                  className="w-full p-3 bg-gray-700 text-gray-200 rounded-lg"
                >
                  <option value="">Выберите город</option>
                  {[...new Set(allExcursions.map(e => e.city))].map((city, index) => (
                    <option key={index} value={city}>{city || 'Не указан'}</option>
                  ))}
                </select>
                <select
                  name="preferredDirection"
                  value={preferences.preferredDirection}
                  onChange={handlePreferenceChange}
                  className="w-full p-3 bg-gray-700 text-gray-200 rounded-lg"
                >
                  <option value="">Выберите направление</option>
                  {directions.map((dir, index) => (
                    <option key={index} value={dir.Name}>{`${dir.Name} (${dir.Count || 0})`}</option>
                  ))}
                </select>
                <div className="w-full p-3 bg-gray-700 text-gray-200 rounded-lg">
                  <h4 className="text-md font-semibold mb-2">Выберите достопримечательности:</h4>
                  <p className="text-gray-400">Достопримечательности временно недоступны</p>
                </div>
                <div className="flex justify-end space-x-6">
                  <button
                    onClick={handleSavePreferences}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={handlePopupToggle}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto py-12 px-4 bg-white">
        <div className="container mx-auto py-6 px-4">
          <h2 className="text-2xl font-bold mb-4 text-black">Популярные города</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {cities.length > 0 ? (
              cities
                .sort((a, b) => (b.count || 0) - (a.count || 0))
                .slice(0, 5)
                .map((city) => (
                  <button
                    key={city.name || city}
                    onClick={() => navigate(`/excursions?city=${city.name || city}`)}
                    className="bg-gray-800 bg-opacity-70 p-3 rounded-lg border border-gray-700 hover:bg-gray-700 transition text-center text-white"
                  >
                    {city.name || city} ({city.count || 0})
                  </button>
                ))
            ) : (
              <p className="text-gray-400">Нет данных о городах</p>
            )}
          </div>
        </div>

        <div className="container mx-auto py-12 px-4">
          <h2 className="text-3xl font-bold text-center mb-6 text-black">Топ экскурсии</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topExcursions.length > 0 ? (
              topExcursions.slice(0, 5).map((excursion) => (
                <div
                  key={excursion.id}
                  className="bg-gray-800 bg-opacity-80 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-700"
                  onClick={() => navigate(`/excursion/${excursion.id}`)}
                >
                  <div className="w-full h-48 bg-gray-500 flex items-center justify-center">
                    {excursion.images && excursion.images.length > 0 && (
                      <img
                        src={`http://localhost:5248${excursion.images[0]}`}
                        alt={excursion.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2 text-yellow-300">{excursion.title || 'Без названия'}</h3>
                    <p className="text-sm mb-2 text-gray-300">Рейтинг: {excursion.rating || 0}</p>
                    {excursion.availableTicketsByDate && Object.keys(excursion.availableTicketsByDate).length > 0 ? (
                      <div className="mb-2">
                        <p className="font-semibold text-yellow-200">Доступные билеты:</p>
                        <ul className="list-disc pl-5 text-gray-300">
                          {Object.entries(excursion.availableTicketsByDate).slice(0, 1).map(([dateKey]) => (
                            <li key={dateKey}>{dateKey.split(' ')[0] || 'Дата не указана'}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-center text-red-500 font-medium">Мест нет</p>
                    )}
                    {user && user.role === 'user' && hasAvailableTickets(excursion) && (
                      <button
                        className="w-full bg-green-600 text-white p-2 rounded-lg font-medium hover:bg-green-700 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookExcursion(excursion.id);
                        }}
                      >
                        БРОНИРОВАТЬ
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Нет данных о топ-экскурсиях</p>
            )}
          </div>
        </div>

        {user && (
          <div className="container mx-auto py-12 px-4">
            <h2 className="text-3xl font-bold text-center mb-6 text-black">Рекомендации для вас</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.length > 0 ? (
                recommendations.map((excursion) => (
                  <div
                    key={excursion.id}
                    className="bg-gray-800 bg-opacity-80 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-700"
                    onClick={() => navigate(`/excursion/${excursion.id}`)}
                  >
                    <img
                      src={excursion.images && excursion.images.length > 0 ? `http://localhost:5248${excursion.images[0]}` : 'https://picsum.photos/300/400'}
                      alt={excursion.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => { e.target.src = 'https://picsum.photos/300/400'; }}
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2 text-yellow-300">{excursion.title || 'Без названия'}</h3>
                      <p className="text-sm mb-2 text-gray-300">Город: {excursion.city || 'Не указан'}</p>
                      <p className="text-sm mb-2 text-gray-300">Направление: {excursion.category || 'Без направления'}</p>
                      {excursion.availableTicketsByDate && Object.keys(excursion.availableTicketsByDate).length > 0 ? (
                        <div className="mb-2">
                          <p className="font-semibold text-yellow-200">Доступные билеты:</p>
                          <ul className="list-disc pl-5 text-gray-300">
                            {Object.entries(excursion.availableTicketsByDate).slice(0, 1).map(([dateKey]) => (
                              <li key={dateKey}>{dateKey.split(' ')[0] || 'Дата не указана'}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-center text-red-500 font-medium">Мест нет</p>
                      )}
                      {user && user.role === 'user' && hasAvailableTickets(excursion) && (
                        <button
                          className="w-full bg-green-600 text-white p-2 rounded-lg font-medium hover:bg-green-700 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookExcursion(excursion.id);
                          }}
                        >
                          БРОНИРОВАТЬ
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center">Нет рекомендаций. Попробуйте посмотреть экскурсии!</p>
              )}
            </div>
          </div>
        )}

        <div className="container mx-auto py-12 px-4">
          <h2 className="text-2xl font-bold mb-6 text-black">Отзывы пользователей</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-gray-800 bg-opacity-80 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-300">{review.text || 'Без текста'}</p>
                  <p className="text-sm text-yellow-200 mt-2">Рейтинг: {review.rating || 0}/5</p>
                  <p className="text-sm text-gray-400">— {review.userName || 'Аноним'}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Нет отзывов</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;