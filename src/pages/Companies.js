import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Companies() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([
    {
      id: 1,
      name: 'BelTour',
      image: 'https://picsum.photos/300/400?random=5',
      description: 'Компания, организующая туры по всей Беларуси.',
      managers: [
        { name: 'Иван Иванов', email: 'ivan@beltour.by' },
      ],
      rating: 4.7,
      reviews: [{ user: 'Анна', text: 'Отличная компания!', rating: 5 }],
    },
    {
      id: 2,
      name: 'TravelBY',
      image: 'https://picsum.photos/300/400?random=12',
      description: 'Туристическая компания с индивидуальными маршрутами.',
      managers: [
        { name: 'Мария Петрова', email: 'maria@travelby.by' },
      ],
      rating: 4.5,
      reviews: [{ user: 'Петр', text: 'Хороший сервис!', rating: 4 }],
    },
  ]);

  const [newCompany, setNewCompany] = useState({
    name: '',
    image: '',
    description: '',
    managers: [],
  });

  const [editCompanyId, setEditCompanyId] = useState(null);
  const [newReview, setNewReview] = useState({ text: '', rating: 5 });

  const handleAddReview = (companyId) => {
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
    setCompanies(companies.map(comp => {
      if (comp.id === companyId) {
        const newReviews = [...comp.reviews, { user: user.name, text: newReview.text, rating: parseInt(newReview.rating) }];
        const newRating = newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length;
        return { ...comp, reviews: newReviews, rating: newRating };
      }
      return comp;
    }));
    setNewReview({ text: '', rating: 5 });
  };

  const handleAddCompany = () => {
    if (!newCompany.name || !newCompany.description) {
      alert('Заполните обязательные поля (название, описание).');
      return;
    }
    const companyToAdd = {
      ...newCompany,
      id: companies.length + 1,
      managers: newCompany.managers.length ? [{ name: newCompany.managers.split(',')[0].trim(), email: newCompany.managers.split(',')[1]?.trim() || '' }] : [],
      rating: 0,
      reviews: [],
    };
    setCompanies([...companies, companyToAdd]);
    setNewCompany({ name: '', image: '', description: '', managers: [] });
  };

  const handleEditCompany = (company) => {
    setEditCompanyId(company.id);
    setNewCompany({
      name: company.name,
      image: company.image,
      description: company.description,
      managers: company.managers.length ? `${company.managers[0].name},${company.managers[0].email}` : '',
    });
  };

  const handleUpdateCompany = () => {
    setCompanies(companies.map(comp => {
      if (comp.id === editCompanyId) {
        return {
          ...comp,
          name: newCompany.name,
          image: newCompany.image,
          description: newCompany.description,
          managers: newCompany.managers.length ? [{ name: newCompany.managers.split(',')[0].trim(), email: newCompany.managers.split(',')[1]?.trim() || '' }] : [],
        };
      }
      return comp;
    }));
    setEditCompanyId(null);
    setNewCompany({ name: '', image: '', description: '', managers: [] });
  };

  const handleDeleteCompany = (id) => {
    setCompanies(companies.filter(comp => comp.id !== id));
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-12">Компании</h1>

        {/* Форма добавления/редактирования компаний для админа */}
        {user?.role === 'admin' && (
          <div className="card p-8 max-w-lg mx-auto mb-12">
            <h2 className="text-3xl font-semibold mb-6">{editCompanyId ? 'Редактировать компанию' : 'Добавить компанию'}</h2>
            <input
              type="text"
              placeholder="Название"
              value={newCompany.name}
              onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <input
              type="text"
              placeholder="URL изображения"
              value={newCompany.image}
              onChange={(e) => setNewCompany({ ...newCompany, image: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <textarea
              placeholder="Описание"
              value={newCompany.description}
              onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
              rows="3"
            />
            <input
              type="text"
              placeholder="Менеджер (имя,email через запятую)"
              value={newCompany.managers}
              onChange={(e) => setNewCompany({ ...newCompany, managers: e.target.value })}
              className="w-full p-4 rounded-lg text-base mb-4"
            />
            <button
              onClick={editCompanyId ? handleUpdateCompany : handleAddCompany}
              className="p-4 rounded-lg w-full text-base font-medium"
            >
              {editCompanyId ? 'ОБНОВИТЬ' : 'ДОБАВИТЬ'}
            </button>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-8">
          {companies.map(company => (
            <div key={company.id} className="card">
              <img src={company.image} alt={company.name} className="w-full h-250px object-cover rounded-lg mb-4" />
              <div className="card-content">
                <h3 className="text-2xl font-semibold mb-2">{company.name}</h3>
                <p className="text-base mb-1">{company.description}</p>
                <p className="text-base mb-1">Рейтинг: {company.rating}</p>
                <p className="text-base mb-1">Менеджеры:</p>
                {company.managers.map((manager, idx) => (
                  <div key={idx}>
                    <p className="text-base">{manager.name} ({manager.email})</p>
                  </div>
                ))}
                {user?.role === 'admin' ? (
                  <div className="flex space-x-3 mt-4">
                    <button
                      className="p-3 rounded-lg w-full text-base font-medium"
                      onClick={() => handleEditCompany(company)}
                    >
                      РЕДАКТИРОВАТЬ
                    </button>
                    <button
                      className="bg-[#C8102E] text-[#FFD700] p-3 rounded-lg w-full text-base font-medium"
                      onClick={() => handleDeleteCompany(company.id)}
                    >
                      УДАЛИТЬ
                    </button>
                  </div>
                ) : (
                  <>
                    <Link to={`/company/${company.id}`}>
                      <button
                        className="p-3 rounded-lg w-full text-base font-medium mt-4"
                      >
                        ПОДРОБНЕЕ
                      </button>
                    </Link>
                    <div className="mt-4">
                      <h4 className="font-semibold text-base mb-2">Отзывы:</h4>
                      <div className="review-block">
                        {company.reviews.map((review, idx) => (
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
                            onClick={() => handleAddReview(company.id)}
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

export default Companies;