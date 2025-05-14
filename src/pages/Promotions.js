import React, { useState } from 'react';

function Promotions() {
  const [promotions] = useState([
    {
      id: 1,
      title: 'Скидка 10% на тур по Минску',
      description: 'Скидка действует до конца месяца!',
      validUntil: '2025-05-31',
      image: 'https://picsum.photos/300/400?random=6',
    },
    {
      id: 2,
      title: 'Бесплатный гид в Гродно',
      description: 'Получите бесплатного гида при бронировании тура.',
      validUntil: '2025-06-15',
      image: 'https://picsum.photos/300/400?random=7',
    },
  ]);

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-12">Акции</h1>
        <div className="flex flex-wrap justify-center gap-8">
          {promotions.map(promo => (
            <div key={promo.id} className="card">
              <img src={promo.image} alt={promo.title} className="w-full h-250px object-cover rounded-lg mb-4" />
              <div className="card-content">
                <h3 className="text-2xl font-semibold mb-2">{promo.title}</h3>
                <p className="text-base mb-1">{promo.description}</p>
                <p className="text-base mb-2">Действует до: {promo.validUntil}</p>
                <button
                  className="p-3 rounded-lg w-full text-base font-medium mt-4"
                  onClick={() => alert(`Подробности акции: ${promo.title}`)}
                >
                  ПОДРОБНЕЕ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Promotions;