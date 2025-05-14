import React from 'react';
import { useAuth } from '../AuthContext';

function GuidePanel() {
  const { user } = useAuth();

  const schedule = [
    { id: 1, excursion: 'Тур по Минску', date: '2025-05-15 10:00', guide: 'Иван Иванов' },
    { id: 2, excursion: 'Поездка в Гродно', date: '2025-05-16 09:00', guide: 'Мария Петрова' },
    { id: 3, excursion: 'Экскурсия в Гомель', date: '2025-05-17 11:00', guide: 'Екатерина Смирнова' },
    { id: 4, excursion: 'Тур в Могилев', date: '2025-05-18 10:00', guide: 'Алексей Кузнецов' },
    { id: 5, excursion: 'Тур по замкам Беларуси', date: '2025-05-20 08:00', guide: 'Сергей Петров' },
  ];

  // Фильтруем расписание, показывая только экскурсии текущего гида
  const filteredSchedule = schedule.filter(event => event.guide === user.name);

  if (!user || user.role !== 'guide') {
    return <div className="min-h-screen bg-gray-100 font-sans pt-20 text-center text-gray-500 text-sm">Доступ запрещен</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Панель гида - Руководство по Беларуси</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Ваше расписание</h2>
          {filteredSchedule.length > 0 ? (
            filteredSchedule.map(event => (
              <div key={event.id} className="p-2 border-b text-sm">
                <p>{event.excursion} - {event.date}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">У вас пока нет запланированных экскурсий.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GuidePanel;