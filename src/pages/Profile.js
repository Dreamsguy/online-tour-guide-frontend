import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    id: id || user?.id,
    name: 'Анна',
    email: 'anna@example.com',
    role: 'user',
    reviews: [],
    rating: 0,
  });

  const [newReview, setNewReview] = useState({ text: '', rating: 5 });

  const handleAddReview = () => {
    if (!user || user.role !== 'guide') {
      alert('Только гиды могут оставлять отзывы.');
      return;
    }
    if (!newReview.text || !newReview.rating) {
      alert('Пожалуйста, заполните отзыв и рейтинг.');
      return;
    }
    const updatedReviews = [...profile.reviews, { user: user.name, text: newReview.text, rating: parseInt(newReview.rating) }];
    const newRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
    setProfile({ ...profile, reviews: updatedReviews, rating: newRating });
    setNewReview({ text: '', rating: 5 });
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-12">Профиль пользователя</h1>
        <div className="card p-8 max-w-lg mx-auto">
          <h2 className="text-3xl font-semibold mb-6">{profile.name}</h2>
          <p className="text-base mb-2"><strong>Email:</strong> {profile.email}</p>
          <p className="text-base mb-2"><strong>Роль:</strong> {profile.role}</p>
          <p className="text-base mb-4"><strong>Рейтинг:</strong> {profile.rating.toFixed(1)}</p>
          <h3 className="text-2xl font-semibold mb-2">Отзывы</h3>
          {profile.reviews.length > 0 ? (
            profile.reviews.map((review, idx) => (
              <div key={idx} className="review-block mb-2">
                <p><strong>{review.user}:</strong> {review.text} (<i className="fas fa-star text-yellow-500"></i> {review.rating})</p>
              </div>
            ))
          ) : (
            <p className="text-base">Отзывов пока нет.</p>
          )}
          {user.role === 'guide' && parseInt(id) !== user.id && (
            <div className="mt-4">
              <h3 className="text-2xl font-semibold mb-2">Оставить отзыв</h3>
              <textarea
                placeholder="Ваш отзыв"
                value={newReview.text}
                onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                className="w-full p-4 rounded-lg text-base mb-4"
                rows="3"
              />
              <input
                type="number"
                placeholder="Рейтинг (1-5)"
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                className="w-full p-4 rounded-lg text-base mb-4"
                min="1"
                max="5"
              />
              <button
                onClick={handleAddReview}
                className="p-4 rounded-lg w-full text-base font-medium"
              >
                ОТПРАВИТЬ ОТЗЫВ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;