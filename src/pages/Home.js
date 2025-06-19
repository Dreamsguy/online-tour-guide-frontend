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

  const calculateCityRating = (cityName) => {
    const cityExcursions = allExcursions.filter(exc => exc.city === cityName);
    if (cityExcursions.length === 0) return 0;
    const totalRating = cityExcursions.reduce((sum, exc) => sum + (exc.rating || 0), 0);
    return (totalRating / cityExcursions.length).toFixed(1);
  };

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

  const topCities = [...new Set(allExcursions.map(exc => exc.city))]
    .filter(city => city && city !== 'Хатынь')
    .map(city => ({
      name: city,
      rating: calculateCityRating(city),
    }))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  return (
    <div>
      <div className="relative h-screen bg-cover bg-center" style={{ backgroundImage: "url('/Города Беларуси.jpg')", backgroundSize: 'cover', minHeight: '110vh' }}>
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
                <Link to="/profile" className="profile-button-custom">
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
                <Link to="/login" className="text-xl text-gray-600 hover:text-yellow-600 font-forum bg-blue-200 bg-opacity-50 px-4 py-2 rounded-lg border-2 border-white">Вход</Link>
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
                    className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative bg-light-beige">
        <div className="container mx-auto py-12 px-4 relative bg-cover bg-center w-full" style={{ backgroundImage: "url('/Города Беларуси.jpg')", backgroundSize: 'cover', minWidth: '100vw' }}>
          <h2 className="text-center mb-8 relative custom-title" style={{ color: '#000000 !important', position: 'relative', zIndex: 1 }}>
            <span style={{ display: 'block' }}>Популярные</span>
            <span style={{ display: 'block' }}>города</span>
            <span className="diamond-outer" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)', width: '150px', height: '150px', border: '2px solid #FFFFFF', opacity: '0.5', zIndex: -1 }}></span>
            <span className="diamond-inner" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)', width: '120px', height: '120px', border: '2px solid #FFFFFF', opacity: '0.5', zIndex: -1 }}></span>
          </h2>
          <div className="relative overflow-hidden">
            <div className="flex space-x-6 pb-4 city-scroll" style={{ overflowX: 'auto', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', position: 'relative' }}>
              {topCities.map((city, index) => {
                let photoUrl = '/default.jpg';
                switch (city.name) {
                  case 'Брестская обл.':
                    photoUrl = '/Брестская_область.jpg';
                    break;
                  case 'Минск':
                    photoUrl = '/Минск.jfif';
                    break;
                  case 'Брест':
                    photoUrl = '/Брест.webp';
                    break;
                  case 'Несвиж':
                    photoUrl = '/Несвиж.jpeg';
                    break;
                  case 'Мир':
                    photoUrl = '/Мирский_замок.jpg';
                    break;
                  default:
                    photoUrl = '/default.jpg';
                }

                const rating = parseFloat(city.rating);
                const filledDiamonds = Math.min(Math.floor(rating), 5);
                const partialFill = (rating % 1) * 100;

                return (
                  <div
                    key={index}
                    className="min-w-[300px] h-[400px] bg-cover bg-center rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 city-card"
                    style={{ backgroundImage: `url(${photoUrl})` }}
                    onClick={() => navigate(`/excursions?city=${encodeURIComponent(city.name)}`)}
                  >
                    <div className="relative w-full h-full bg-black bg-opacity-50 flex flex-col justify-end p-6 text-white">
                      <div className="flex justify-between items-center">
                        <span className="text-3xl font-forum font-semibold">{city.name}</span>
                        <div className="flex flex-col items-end mt-6">
                          <span className="text-xl text-white bg-black bg-opacity-75 px-2 py-1 rounded absolute -top-8 transform translate-x-1/2" style={{ right: '50%' }}>{rating}</span>
                          <div className="flex flex-col items-end rating-diamonds" style={{ gap: 0, position: 'relative' }}>
                            {Array.from({ length: 5 }, (_, i) => {
                              const fillIndex = 4 - i;
                              if (fillIndex >= filledDiamonds) {
                                if (fillIndex === filledDiamonds && partialFill > 0) {
                                  return (
                                    <span
                                      key={`partial-${i}`}
                                      className="diamond-rating partial-diamond"
                                      style={{ '--fill-percentage': `${partialFill}%` }}
                                    ></span>
                                  );
                                }
                                return <span key={`empty-${i}`} className="diamond-rating empty-diamond"></span>;
                              } else {
                                return <span key={`filled-${i}`} className="diamond-rating filled-diamond"></span>;
                              }
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Стрелки в краях контейнера */}
            {topCities.length > 1 && (
              <button
                className="absolute top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-70 text-white p-2 z-10 hover:bg-gray-600 arrow-diamond left-arrow"
                style={{ left: '0' }}
                onClick={() => document.querySelector('.city-scroll').scrollLeft -= 300}
              >
                ←
              </button>
            )}
            {topCities.length > 1 && (
              <button
                className="absolute top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-70 text-white p-2 z-10 hover:bg-gray-600 arrow-diamond right-arrow"
                style={{ right: '0' }}
                onClick={() => document.querySelector('.city-scroll').scrollLeft += 300}
              >
                →
              </button>
            )}
          </div>
        </div>

        <div className="container mx-auto py-12 px-4 relative bg-cover bg-center w-full" style={{ backgroundImage: "url('/Пляж.jpg')", backgroundSize: 'cover', minWidth: '100vw' }}>
          <h2 className="text-center mb-8 relative custom-title" style={{ color: '#000000 !important', position: 'relative', zIndex: 1 }}>
            <span style={{ display: 'block' }}>Топ</span>
            <span style={{ display: 'block' }}>экскурсии</span>
            <span className="diamond-outer" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)', width: '150px', height: '150px', border: '2px solid #FFFFFF', opacity: '0.5', zIndex: -1 }}></span>
            <span className="diamond-inner" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)', width: '120px', height: '120px', border: '2px solid #FFFFFF', opacity: '0.5', zIndex: -1 }}></span>
          </h2>
          <div className="relative overflow-hidden">
            <div className="flex space-x-6 pb-4 city-scroll" style={{ overflowX: 'auto', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', position: 'relative' }}>
              {topExcursions.length > 0 ? (
                topExcursions.slice(0, 5).map((excursion, index) => {
                  let photoUrl = '/default.jpg';
                  switch (excursion.title) {
                    case 'Музей Минска':
                      photoUrl = '/Минск.jfif';
                      break;
                    case 'Брестская крепость':
                      photoUrl = '/Брестская_область.jpg';
                      break;
                    case 'Несвижский замок':
                      photoUrl = '/Несвиж.jpeg';
                      break;
                    case 'Мирский замок':
                      photoUrl = '/Мирский_замок.jpg';
                      break;
                    case 'Эко-туры':
                      photoUrl = '/Могилев.jpg';
                      break;
                    default:
                      photoUrl = '/default.jpg';
                  }

                  const rating = parseFloat(excursion.rating || 0);
                  const filledDiamonds = Math.min(Math.floor(rating), 5);
                  const partialFill = (rating % 1) * 100;

                  return (
                    <div
                      key={index}
                      className="min-w-[300px] h-[400px] bg-cover bg-center rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 city-card"
                      style={{ backgroundImage: `url(${photoUrl})` }}
                      onClick={() => navigate(`/excursion/${excursion.id}`)}
                    >
                      <div className="relative w-full h-full bg-black bg-opacity-50 flex flex-col justify-end p-6 text-white">
                        <div className="flex justify-between items-center">
                          <span className="text-3xl font-forum font-semibold">{excursion.title || 'Без названия'}</span>
                          <div className="flex flex-col items-end mt-6">
                            <span className="text-xl text-white bg-black bg-opacity-75 px-2 py-1 rounded absolute -top-8 transform translate-x-1/2" style={{ right: '50%' }}>{rating}</span>
                            <div className="flex flex-col items-end rating-diamonds" style={{ gap: 0, position: 'relative' }}>
                              {Array.from({ length: 5 }, (_, i) => {
                                const fillIndex = 4 - i;
                                if (fillIndex >= filledDiamonds) {
                                  if (fillIndex === filledDiamonds && partialFill > 0) {
                                    return (
                                      <span
                                        key={`partial-${i}`}
                                        className="diamond-rating partial-diamond"
                                        style={{ '--fill-percentage': `${partialFill}%` }}
                                      ></span>
                                    );
                                  }
                                  return <span key={`empty-${i}`} className="diamond-rating empty-diamond"></span>;
                                } else {
                                  return <span key={`filled-${i}`} className="diamond-rating filled-diamond"></span>;
                                }
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400">Нет данных о топ-экскурсиях</p>
              )}
            </div>
            {/* Стрелки в краях контейнера */}
            {topExcursions.length > 1 && (
              <button
                className="absolute top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-70 text-white p-2 z-10 hover:bg-gray-600 arrow-diamond left-arrow"
                style={{ left: '0' }}
                onClick={() => document.querySelector('.city-scroll').scrollLeft -= 300}
              >
                ←
              </button>
            )}
            {topExcursions.length > 1 && (
              <button
                className="absolute top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-70 text-white p-2 z-10 hover:bg-gray-600 arrow-diamond right-arrow"
                style={{ right: '0' }}
                onClick={() => document.querySelector('.city-scroll').scrollLeft += 300}
              >
                →
              </button>
            )}
          </div>
        </div>

        {user && (
          <div className="container mx-auto py-12 px-4 relative bg-cover bg-center w-full" style={{ backgroundImage: "url('/Рекомендации.jpg')", backgroundSize: 'cover', minWidth: '100vw' }}>
            <h2 className="text-center mb-8 relative custom-title" style={{ color: '#000000 !important', position: 'relative', zIndex: 1 }}>
              <span style={{ display: 'block' }}>Рекомендации</span>
              <span style={{ display: 'block' }}>для вас</span>
              <span className="diamond-outer" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)', width: '150px', height: '150px', border: '2px solid #FFFFFF', opacity: '0.5', zIndex: -1 }}></span>
              <span className="diamond-inner" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)', width: '120px', height: '120px', border: '2px solid #FFFFFF', opacity: '0.5', zIndex: -1 }}></span>
            </h2>
            <div className="relative overflow-hidden">
              <div className="flex space-x-6 pb-4 city-scroll" style={{ overflowX: 'auto', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', position: 'relative' }}>
                {recommendations.length > 0 ? (
                  recommendations.map((excursion, index) => {
                    let photoUrl = '/default.jpg';
                    switch (excursion.city) {
                      case 'Брестская обл.':
                        photoUrl = '/Брестская_область.jpg';
                        break;
                      case 'Хатынь':
                        photoUrl = '/Хатынь.jpg';
                        break;
                      case 'Минск':
                        photoUrl = '/Минск.jfif';
                        break;
                      case 'Брест':
                        photoUrl = '/Брест.webp';
                        break;
                      case 'Несвиж':
                        photoUrl = '/Несвиж.jpeg';
                        break;
                      default:
                        photoUrl = '/default.jpg';
                    }

                    const rating = parseFloat(excursion.rating || 0);
                    const filledDiamonds = Math.min(Math.floor(rating), 5);
                    const partialFill = (rating % 1) * 100;

                    return (
                      <div
                        key={index}
                        className="min-w-[300px] h-[400px] bg-cover bg-center rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 city-card"
                        style={{ backgroundImage: `url(${photoUrl})` }}
                        onClick={() => navigate(`/excursion/${excursion.id}`)}
                      >
                        <div className="relative w-full h-full bg-black bg-opacity-50 flex flex-col justify-end p-6 text-white">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-3xl font-forum font-semibold block">{excursion.title || 'Без названия'}</span>
                              <span className="text-lg font-forum block mt-2">{excursion.category || 'Без направления'}</span>
                            </div>
                            <div className="flex flex-col items-end mt-6">
                              <span className="text-xl text-white bg-black bg-opacity-75 px-2 py-1 rounded absolute -top-8 transform translate-x-1/2" style={{ right: '50%' }}>{rating}</span>
                              <div className="flex flex-col items-end rating-diamonds" style={{ gap: 0, position: 'relative' }}>
                                {Array.from({ length: 5 }, (_, i) => {
                                  const fillIndex = 4 - i;
                                  if (fillIndex >= filledDiamonds) {
                                    if (fillIndex === filledDiamonds && partialFill > 0) {
                                      return (
                                        <span
                                          key={`partial-${i}`}
                                          className="diamond-rating partial-diamond"
                                          style={{ '--fill-percentage': `${partialFill}%` }}
                                        ></span>
                                      );
                                    }
                                    return <span key={`empty-${i}`} className="diamond-rating empty-diamond"></span>;
                                  } else {
                                    return <span key={`filled-${i}`} className="diamond-rating filled-diamond"></span>;
                                  }
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-center">Нет рекомендаций. Попробуйте посмотреть экскурсии!</p>
                )}
              </div>
              {/* Стрелки в краях контейнера */}
              {recommendations.length > 1 && (
                <button
                  className="absolute top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-70 text-white p-2 z-10 hover:bg-gray-600 arrow-diamond left-arrow"
                  style={{ left: '0' }}
                  onClick={() => document.querySelector('.city-scroll').scrollLeft -= 300}
                >
                  ←
                </button>
              )}
              {recommendations.length > 1 && (
                <button
                  className="absolute top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-70 text-white p-2 z-10 hover:bg-gray-600 arrow-diamond right-arrow"
                  style={{ right: '0' }}
                  onClick={() => document.querySelector('.city-scroll').scrollLeft += 300}
                >
                  →
                </button>
              )}
            </div>
          </div>
        )}

        <div className="container mx-auto py-12 px-4 relative bg-cover bg-center w-full" style={{ backgroundImage: "url('/Отзывы.jpg')", backgroundSize: 'cover', minWidth: '100vw' }}>
          <h2 className="text-center mb-8 relative custom-title" style={{ color: '#000000 !important', position: 'relative', zIndex: 1 }}>
            <span style={{ display: 'block' }}>Отзывы</span>
            <span style={{ display: 'block' }}>пользователей</span>
            <span className="diamond-outer" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)', width: '150px', height: '150px', border: '2px solid #FFFFFF', opacity: '0.5', zIndex: -1 }}></span>
            <span className="diamond-inner" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)', width: '120px', height: '120px', border: '2px solid #FFFFFF', opacity: '0.5', zIndex: -1 }}></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.length > 0 ? (
              reviews.map((review, index) => {
                const rating = parseFloat(review.rating || 0);
                const filledStars = Math.min(Math.floor(rating), 5);
                const partialFill = (rating % 1) * 100;

                return (
                  <div
                    key={index}
                    className="relative bg-light-pink p-6 rounded-lg shadow-lg border border-gray-200 max-w-sm mx-auto"
                    style={{
                      minHeight: '300px',
                      borderRadius: '20px',
                      position: 'relative',
                      paddingTop: '20px',
                    }}
                  >
                    <p className="text-gray-700 text-lg mb-4 font-forum" style={{ minHeight: '120px' }}>
                      {review.text || 'Без текста'}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <div>
                        <div className="flex flex-col items-start rating-stars" style={{ gap: 0, position: 'relative' }}>
                          {Array.from({ length: 5 }, (_, i) => {
                            const fillIndex = 4 - i;
                            if (fillIndex >= filledStars) {
                              if (fillIndex === filledStars && partialFill > 0) {
                                return (
                                  <span
                                    key={`partial-${i}`}
                                    className="star-rating partial-star"
                                    style={{ '--fill-percentage': `${partialFill}%` }}
                                  >
                                    ★
                                  </span>
                                );
                              }
                              return <span key={`empty-${i}`} className="star-rating empty-star">★</span>;
                            } else {
                              return <span key={`filled-${i}`} className="star-rating filled-star">★</span>;
                            }
                          })}
                        </div>
                        <p className="text-xl text-gray-600 font-forum mt-2">— {review.userName || 'Аноним'}</p>
                      </div>
                      <div className="w-6 h-6 bg-brown-500 rounded-full flex items-center justify-center text-white" style={{ transform: 'rotate(45deg)' }}>
                        <span style={{ transform: 'rotate(-45deg)' }}>♦</span>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 text-gray-400 text-sm">⋇⋇</div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-center">Нет отзывов</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;