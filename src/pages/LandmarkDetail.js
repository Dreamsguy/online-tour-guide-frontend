import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function LandmarkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const landmarks = [
    { id: 'minsk-1', name: 'Площадь Независимости', description: 'Главная площадь Минска с Красным костёлом.', image: 'https://picsum.photos/300/400?random=101' },
    { id: 'minsk-2', name: 'Национальная библиотека', description: 'Современное здание в форме ромбокубооктаэдра.', image: 'https://picsum.photos/300/400?random=102' },
    { id: 'minsk-3', name: 'Парк Горького', description: 'Популярный парк для отдыха и прогулок.', image: 'https://picsum.photos/300/400?random=103' },
    { id: 'grodno-1', name: 'Старый замок', description: 'Исторический замок в Гродно.', image: 'https://picsum.photos/300/400?random=201' },
    { id: 'grodno-2', name: 'Новый замок', description: 'Резиденция королей в Гродно.', image: 'https://picsum.photos/300/400?random=202' },
    { id: 'grodno-3', name: 'Фарный костёл', description: 'Красивый костёл в центре Гродно.', image: 'https://picsum.photos/300/400?random=203' },
    { id: 'gomel-1', name: 'Гомельский дворец', description: 'Дворец Румянцевых-Паскевичей.', image: 'https://picsum.photos/300/400?random=301' },
    { id: 'gomel-2', name: 'Парк Румянцевых и Паскевичей', description: 'Живописный парк в Гомеле.', image: 'https://picsum.photos/300/400?random=302' },
    { id: 'gomel-3', name: 'Собор Петра и Павла', description: 'Православный собор в Гомеле.', image: 'https://picsum.photos/300/400?random=303' },
    { id: 'mogilev-1', name: 'Могилевская ратуша', description: 'Историческое здание ратуши.', image: 'https://picsum.photos/300/400?random=401' },
    { id: 'mogilev-2', name: 'Драматический театр', description: 'Театр в центре Могилева.', image: 'https://picsum.photos/300/400?random=402' },
    { id: 'mogilev-3', name: 'Площадь Звёзд', description: 'Площадь с памятниками знаменитостей.', image: 'https://picsum.photos/300/400?random=403' },
    { id: 'mir-1', name: 'Мирский замок', description: 'Средневековый замок, объект ЮНЕСКО.', image: 'https://picsum.photos/300/400?random=501' },
    { id: 'nesvizh-1', name: 'Несвижский дворец', description: 'Дворец Радзивиллов, объект ЮНЕСКО.', image: 'https://picsum.photos/300/400?random=502' },
  ];

  const [landmark, setLandmark] = useState(null);

  useEffect(() => {
    const foundLandmark = landmarks.find(lm => lm.id === id);
    if (foundLandmark) {
      setLandmark(foundLandmark);
    }
  }, [id]);

  if (!landmark) return <div className="min-h-screen pt-20 text-center text-base">Достопримечательность не найдена</div>;

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-12">{landmark.name}</h1>
        <div className="card p-8">
          <img src={landmark.image} alt={landmark.name} className="w-full h-96 object-cover rounded-lg mb-4" />
          <p className="text-base mb-2">{landmark.description}</p>
          <button
            className="p-4 rounded-lg w-full text-base font-medium mt-4"
            onClick={() => navigate(-1)}
          >
            НАЗАД
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandmarkDetail;