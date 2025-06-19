import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';
import '../global.css';

function Excursions() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [excursions, setExcursions] = useState([]);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExcursions = async () => {
      setLoading(true);
      setError(null);
      try {
        let appliedFilters = { ...filters };
        if (user?.id) {
          try {
            const prefsResponse = await api.get(`/api/excursions/preferences/${user.id}`);
            const prefs = prefsResponse.data || {};
            appliedFilters = {
              city: filters.city || prefs.PreferredCity || '',
              category: filters.category || prefs.PreferredDirection || '',
              search: filters.search,
            };
          } catch (prefErr) {
            console.warn('Предпочтения не найдены:', prefErr);
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
        setError(err.response?.status === 401 ? 'Сессия истекла. Пожалуйста, войдите заново.' : 'Не удалось загрузить экскурсии.');
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setExcursions([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchExcursions();
  }, [navigate, user?.id, filters.city, filters.category, filters.search]);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="text-center text-yellow-400 mt-20">Загрузка...</div>;
  if (error) return <div className="text-center text-red-500 mt-20">Ошибка: {error}</div>;

  const uniqueCities = [...new Set(excursions.map((e) => e.city))].filter(Boolean);
  const uniqueCategories = [...new Set(excursions.map((e) => e.category))].filter(Boolean);

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
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white z-10">
        <h1 className="text-7xl font-forum font-normal leading-tight max-w-3xl mx-auto break-words whitespace-pre-wrap">
          <span className="block tracking-[0.35em]">ЭКСКУРСИИ</span>
          <span className="block tracking-[0.2em]">ПО БЕЛАРУСИ</span>
        </h1>
      </div>
      <div className="absolute top-1/6 left-1/3 transform -translate-x-1/4 z-10">
        <div className="diamond w-30 h-30 bg-glass"></div>
      </div>
      <div className="absolute top-1/4 right-1/3 transform translate-x-1/4 z-10">
        <div className="diamond w-40 h-40 bg-glass"></div>
      </div>
      <div className="absolute top-1/2 left-1/4 transform -translate-x-1/4 z-10">
        <div className="diamond w-50 h-50 bg-glass"></div>
      </div>
      <div className="absolute top-2/3 right-1/4 transform translate-x-1/4 z-10">
        <div className="diamond w-35 h-35 bg-glass"></div>
      </div>
      <div className="absolute bottom-1/6 left-1/4 transform -translate-x-1/4 z-10">
        <div className="diamond w-45 h-45 bg-glass"></div>
      </div>
      <div className="absolute bottom-1/4 right-1/3 transform translate-x-1/4 z-10">
        <div className="diamond w-30 h-30 bg-glass"></div>
      </div>
      <div className="absolute top-3/4 left-2/5 transform -translate-x-1/4 z-10">
        <div className="diamond w-40 h-40 bg-glass"></div>
      </div>

      <div className="container mx-auto py-12 px-4 relative z-10">
        <h2 className="text-center mb-8 custom-title">
          <span style={{ display: 'block' }}>Доступные</span>
          <span style={{ display: 'block' }}>экскурсии</span>
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
            {uniqueCities.map((city, index) => (
              <option key={index} value={city} className="bg-gray-800">{city}</option>
            ))}
          </select>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="p-2 rounded-lg bg-transparent text-white border-0 border-b-2 border-yellow-400 focus:outline-none focus:border-white transition duration-300 mr-4"
          >
            <option value="">Все категории</option>
            {uniqueCategories.map((cat, index) => (
              <option key={index} value={cat} className="bg-gray-800">{cat}</option>
            ))}
          </select>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Поиск экскурсий..."
            className="p-2 rounded-lg bg-transparent text-white border-0 border-b-2 border-yellow-400 focus:outline-none focus:border-white transition duration-300"
          />
        </div>
        <div className="excursion-list">
          {excursions.length > 0 ? (
            excursions.map((excursion, index) => {
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
                  photoUrl = excursion.images && excursion.images.length > 0 ? `http://localhost:5248${excursion.images[0]}` : '/default.jpg';
              }

              const rating = parseFloat(excursion.rating || 0);
              const filledDiamonds = Math.min(Math.floor(rating), 5);
              const partialFill = (rating % 1) * 100;

              return (
                <div
                  key={excursion.id}
                  className="card"
                  onClick={() => navigate(`/excursion/${excursion.id}`)}
                >
                  <div className="card-overlay" style={{ backgroundImage: `url(${photoUrl})` }}>
                    <span className="card-title">{excursion.title || 'Без названия'}</span>
                    <span className="card-text">{excursion.category || 'Без направления'}</span>
                    <div className="rating-diamonds excursion-rating-diamonds" style={{ position: 'absolute', bottom: '10px', right: '10px', flexDirection: 'column', alignItems: 'flex-end' }}>
                      {Array.from({ length: 5 }, (_, i) => {
                        const fillIndex = i; // Индексация от 0 до 4, чтобы заполненные были снизу
                        if (fillIndex < 5 - filledDiamonds) {
                          return <span key={`empty-${i}`} className="diamond-rating empty-diamond"></span>;
                        } else if (fillIndex === 5 - filledDiamonds && partialFill > 0) {
                          return (
                            <span
                              key={`partial-${i}`}
                              className="diamond-rating partial-diamond"
                              style={{ '--fill-percentage': `${partialFill}%` }}
                            ></span>
                          );
                        } else {
                          return <span key={`filled-${i}`} className="diamond-rating filled-diamond"></span>;
                        }
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-400 text-center w-full">Нет доступных экскурсий</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Excursions;