import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
  const [feedbackList, setFeedbackList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    group: false,
    individual: false,
    russian: false,
    english: false,
    kids: false,
  });

  const navigate = useNavigate();

  const topExcursions = [
    {
      id: 1,
      title: 'Тур по Минску',
      image: 'https://picsum.photos/300/400?random=1',
      tags: ['групповая', 'русский'],
      city: 'Минск',
    },
    {
      id: 2,
      title: 'Поездка в Гродно',
      image: 'https://picsum.photos/300/400?random=2',
      tags: ['индивидуальная', 'английский'],
      city: 'Гродно',
    },
    {
      id: 3,
      title: 'Экскурсия в Гомель',
      image: 'https://picsum.photos/300/400?random=8',
      tags: ['групповая', 'русский'],
      city: 'Гомель',
    },
    {
      id: 4,
      title: 'Тур в Могилев',
      image: 'https://picsum.photos/300/400?random=9',
      tags: ['индивидуальная', 'русский'],
      city: 'Могилев',
    },
    {
      id: 5,
      title: 'Тур по замкам Беларуси',
      image: 'https://picsum.photos/300/400?random=15',
      tags: ['групповая', 'русский'],
      city: 'Мир-Несвиж',
    },
  ];

  const topAttractions = [
    {
      id: 1,
      name: 'Мирский замок',
      image: 'https://picsum.photos/300/400?random=3',
      city: 'Мир',
    },
    {
      id: 2,
      name: 'Несвижский дворец',
      image: 'https://picsum.photos/300/400?random=4',
      city: 'Несвиж',
    },
    {
      id: 3,
      name: 'Гомельский дворец',
      image: 'https://picsum.photos/300/400?random=10',
      city: 'Гомель',
    },
    {
      id: 4,
      name: 'Могилевская ратуша',
      image: 'https://picsum.photos/300/400?random=11',
      city: 'Могилев',
    },
  ];

  const topCompanies = [
    {
      id: 1,
      name: 'BelTour',
      image: 'https://picsum.photos/300/400?random=5',
      description: 'Компания, организующая туры по всей Беларуси.',
    },
    {
      id: 2,
      name: 'TravelBY',
      image: 'https://picsum.photos/300/400?random=12',
      description: 'Туристическая компания с индивидуальными маршрутами.',
    },
  ];

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackList([...feedbackList, feedback]);
    setFeedback({ name: '', email: '', message: '' });
    alert('Спасибо за ваш отзыв! Мы свяжемся с вами.');
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.checked });
  };

  const filteredExcursions = topExcursions.filter(excursion => {
    const matchesSearch = excursion.title.toLowerCase().includes(searchQuery.toLowerCase());
    return (
      matchesSearch &&
      (!filters.group || excursion.tags.includes('групповая')) &&
      (!filters.individual || excursion.tags.includes('индивидуальная')) &&
      (!filters.russian || excursion.tags.includes('русский')) &&
      (!filters.english || excursion.tags.includes('английский')) &&
      (!filters.kids || excursion.tags.includes('дети'))
    );
  });

  const handleCityFilter = (city, type) => {
    navigate(type === 'excursion' ? '/excursions' : '/attractions', { state: { cityFilter: city } });
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-12">Добро пожаловать в Руководство по Беларуси!</h1>

        {/* Поиск и фильтры */}
        <div className="mb-12">
          <h3 className="text-3xl font-semibold mb-6">Поиск экскурсий</h3>
          <input
            type="text"
            placeholder="Поиск по названию"
            className="p-4 w-full rounded-lg text-base mb-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex flex-wrap gap-6">
            <label className="filter-label">
              <input type="checkbox" name="group" onChange={handleFilterChange} className="form-checkbox h-5 w-5 text-primary rounded" />
              <span className="text-base">Групповая</span>
            </label>
            <label className="filter-label">
              <input type="checkbox" name="individual" onChange={handleFilterChange} className="form-checkbox h-5 w-5 text-primary rounded" />
              <span className="text-base">Индивидуальная</span>
            </label>
            <label className="filter-label">
              <input type="checkbox" name="russian" onChange={handleFilterChange} className="form-checkbox h-5 w-5 text-primary rounded" />
              <span className="text-base">Русский</span>
            </label>
            <label className="filter-label">
              <input type="checkbox" name="english" onChange={handleFilterChange} className="form-checkbox h-5 w-5 text-primary rounded" />
              <span className="text-base">Английский</span>
            </label>
            <label className="filter-label">
              <input type="checkbox" name="kids" onChange={handleFilterChange} className="form-checkbox h-5 w-5 text-primary rounded" />
              <span className="text-base">С детьми</span>
            </label>
          </div>
        </div>

        {/* Лучшие экскурсии */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-6">Лучшие экскурсии</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {filteredExcursions.map(excursion => (
              <div key={excursion.id} className="card">
                <img src={excursion.image} alt={excursion.title} className="w-full h-250px object-cover rounded-lg mb-4" />
                <div className="card-content">
                  <h3 className="text-2xl font-semibold mb-2">{excursion.title}</h3>
                  <p className="text-base mb-2">Город: {excursion.city}</p>
                  <Link to={`/excursion/${excursion.id}`}>
                    <button className="p-3 rounded-lg w-full text-base font-medium mt-4">
                      ПОДРОБНЕЕ
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button
              className="p-3 rounded-lg w-full text-base font-medium"
              onClick={() => handleCityFilter('Гомель', 'excursion')}
            >
              Экскурсии в Гомеле
            </button>
            <button
              className="p-3 rounded-lg w-full text-base font-medium"
              onClick={() => handleCityFilter('Могилев', 'excursion')}
            >
              Экскурсии в Могилеве
            </button>
          </div>
        </div>

        {/* Лучшие достопримечательности */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-6">Лучшие достопримечательности</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {topAttractions.map(attraction => (
              <div key={attraction.id} className="card">
                <img src={attraction.image} alt={attraction.name} className="w-full h-250px object-cover rounded-lg mb-4" />
                <div className="card-content">
                  <h3 className="text-2xl font-semibold mb-2">{attraction.name}</h3>
                  <p className="text-base mb-2">Город: {attraction.city}</p>
                  <Link to={`/attractions/${attraction.id}`}>
                    <button className="p-3 rounded-lg w-full text-base font-medium mt-4">
                      ПОДРОБНЕЕ
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button
              className="p-3 rounded-lg w-full text-base font-medium"
              onClick={() => handleCityFilter('Гомель', 'attraction')}
            >
              Достопримечательности в Гомеле
            </button>
            <button
              className="p-3 rounded-lg w-full text-base font-medium"
              onClick={() => handleCityFilter('Могилев', 'attraction')}
            >
              Достопримечательности в Могилеве
            </button>
          </div>
        </div>

        {/* Лучшие компании */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-6">Лучшие компании</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {topCompanies.map(company => (
              <div key={company.id} className="card">
                <img src={company.image} alt={company.name} className="w-full h-250px object-cover rounded-lg mb-4" />
                <div className="card-content">
                  <h3 className="text-2xl font-semibold mb-2">{company.name}</h3>
                  <p className="text-base mb-2">{company.description}</p>
                  <Link to={`/company/${company.id}`}>
                    <button className="p-3 rounded-lg w-full text-base font-medium mt-4">
                      ПОДРОБНЕЕ
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Форма обратной связи */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-6">Обратная связь</h2>
          <div className="card p-8 max-w-lg mx-auto">
            <form onSubmit={handleFeedbackSubmit}>
              <div className="mb-4">
                <label className="block text-base font-semibold mb-2">Имя</label>
                <input
                  type="text"
                  value={feedback.name}
                  onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                  className="w-full p-4 rounded-lg text-base"
                  placeholder="Введите ваше имя"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-base font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={feedback.email}
                  onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                  className="w-full p-4 rounded-lg text-base"
                  placeholder="Введите ваш email"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-base font-semibold mb-2">Сообщение</label>
                <textarea
                  value={feedback.message}
                  onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                  className="w-full p-4 rounded-lg text-base"
                  placeholder="Введите ваше сообщение"
                  rows="4"
                  required
                />
              </div>
              <button
                type="submit"
                className="p-4 rounded-lg w-full text-base font-medium"
              >
                ОТПРАВИТЬ
              </button>
            </form>
            {feedbackList.length > 0 && (
              <div className="mt-6">
                <h3 className="text-2xl font-semibold mb-4">Ваши отзывы</h3>
                {feedbackList.map((fb, idx) => (
                  <div key={idx} className="card p-4 mb-2">
                    <p className="text-base"><strong>{fb.name}</strong> ({fb.email})</p>
                    <p className="text-base">{fb.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;