import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function Home() {
  const [topExcursions, setTopExcursions] = useState([]);
  const [topAttractions, setTopAttractions] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get('/api/excursions/top').then(res => setTopExcursions(res.data)).catch(err => console.error('Ошибка загрузки экскурсий:', err));
    api.get('/api/attractions/top').then(res => setTopAttractions(res.data)).catch(err => console.error('Ошибка загрузки достопримечательностей:', err));
  }, []);

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
    return Object.values(excursion.availableTicketsByDate).some(date =>
      Object.values(date).some(tickets => tickets > 0)
    );
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-900 text-gray-200">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-12 text-yellow-400 drop-shadow-lg">Добро пожаловать в OnlineTourGuide!</h1>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-6 text-yellow-300">Лучшие экскурсии</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topExcursions.map(excursion => (
              <div
                key={excursion.id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-700"
                onClick={() => navigate(`/excursion/${excursion.id}`)}
              >
                <img
                  src={excursion.image || 'https://picsum.photos/300/400'}
                  alt={excursion.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => { e.target.src = 'https://picsum.photos/300/400'; }}
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2 text-yellow-300">{excursion.title}</h3>
                  <p className="text-sm mb-2 text-gray-400">Рейтинг: {excursion.rating || 0}</p>
                  {excursion.availableTicketsByDate && Object.keys(excursion.availableTicketsByDate).length > 0 ? (
                    <div className="mb-2">
                      <p className="font-semibold text-yellow-200">Доступные билеты по датам:</p>
                      <ul className="list-disc pl-5 text-gray-300">
                        {Object.entries(excursion.availableTicketsByDate).map(([date, categories]) => (
                          <li key={date}>
                            {new Date(date).toLocaleString()}: 
                            <ul className="list-disc pl-5">
                              {Object.entries(categories).map(([category, count]) => (
                                <li key={category}>
                                  {category}: {count > 0 ? `${count} мест` : 'Мест нет'}
                                </li>
                              ))}
                            </ul>
                          </li>
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
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-6 text-yellow-300">Лучшие достопримечательности</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topAttractions.map(attraction => (
              <div
                key={attraction.id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                onClick={() => navigate(`/attractions/${attraction.id}`)}
              >
                <img
                  src={attraction.image || 'https://picsum.photos/300/400'}
                  alt={attraction.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => { e.target.src = 'https://picsum.photos/300/400'; }}
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2 text-white">{attraction.name}</h3>
                  <p className="text-sm mb-2 text-gray-400">Рейтинг: {attraction.rating || 0}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;