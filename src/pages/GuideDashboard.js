import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function GuideDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [excursions] = useState([
    {
      id: 1,
      title: 'Тур по Минску',
      schedule: '2025-05-15 10:00',
      participants: [
        { id: 1, name: 'Анна', email: 'anna@example.com', reviews: [], rating: 0 },
        { id: 2, name: 'Петр', email: 'petr@example.com', reviews: [], rating: 0 },
      ],
    },
    {
      id: 2,
      title: 'Поездка в Гродно',
      schedule: '2025-05-16 09:00',
      participants: [
        { id: 3, name: 'Мария', email: 'maria@example.com', reviews: [], rating: 0 },
      ],
    },
  ]);

  if (!user || user.role !== 'guide') {
    return <div className="min-h-screen pt-20 text-center text-[#5A6A5F] text-sm font-['Roboto',sans-serif]">Доступ только для гидов</div>;
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#2A3A2E] font-['Roboto',sans-serif]">Панель гида</h1>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-[#2A3A2E] font-['Roboto',sans-serif]">Ваши экскурсии</h2>
          {excursions.map(excursion => (
            <div key={excursion.id} className="border-b py-4">
              <h3 className="text-xl font-semibold text-[#2A3A2E] font-['Roboto',sans-serif]">{excursion.title}</h3>
              <p className="text-[#5A6A5F] text-sm font-['Roboto',sans-serif]"><strong>Дата и время:</strong> {excursion.schedule}</p>
              <h4 className="text-lg font-semibold mt-2 text-[#2A3A2E] font-['Roboto',sans-serif]">Участники:</h4>
              {excursion.participants.map(participant => (
                <div key={participant.id} className="ml-4 mt-2">
                  <p className="text-[#5A6A5F] text-sm font-['Roboto',sans-serif]">{participant.name} ({participant.email})</p>
                  <Link to={`/profile/${participant.id}`}>
                    <button className="bg-[#2A3A2E] text-white p-2 rounded mt-1 hover:bg-[#3B4A3F] transition text-sm font-['Roboto',sans-serif]">
                      Перейти в профиль
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GuideDashboard;