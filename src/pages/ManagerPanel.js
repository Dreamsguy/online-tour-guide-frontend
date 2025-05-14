import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

function ManagerPanel() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([
    { id: 1, name: 'BelTour', managers: 2, tours: 5, description: 'BelTour - ведущая туристическая компания в Беларуси, специализирующаяся на групповых экскурсиях.', contact: 'info@beltour.by', founded: '2010' },
    { id: 2, name: 'TravelBY', managers: 1, tours: 3, description: 'TravelBY предлагает индивидуальные туры по историческим местам Беларуси.', contact: 'support@travelby.by', founded: '2015' },
  ]);
  const [promotions, setPromotions] = useState([
    { id: 1, text: 'Скидка 10% до конца месяца', validUntil: '2025-05-31', excursion: 'Тур по Минску' },
  ]);
  const [newPromoText, setNewPromoText] = useState('');
  const [newPromoValidUntil, setNewPromoValidUntil] = useState('');
  const [newPromoExcursion, setNewPromoExcursion] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);

  const handleAddPromotion = () => {
    if (!newPromoText || !newPromoValidUntil || !newPromoExcursion) {
      alert('Пожалуйста, заполните все поля для акции.');
      return;
    }
    setPromotions([...promotions, {
      id: promotions.length + 1,
      text: newPromoText,
      validUntil: newPromoValidUntil,
      excursion: newPromoExcursion,
    }]);
    setNewPromoText('');
    setNewPromoValidUntil('');
    setNewPromoExcursion('');
  };

  if (!user || user.role !== 'manager') {
    return <div className="min-h-screen bg-gray-100 font-sans pt-24 text-center text-gray-500 text-lg">Доступ запрещен</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans pt-24">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Панель менеджера - Руководство по Беларуси</h1>
        
        {/* Список компаний */}
        {!selectedCompany ? (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Компании</h2>
            {companies.map(company => (
              <div
                key={company.id}
                className="p-4 border-b text-lg cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setSelectedCompany(company)}
              >
                <p className="font-semibold">{company.name}</p>
                <p>Менеджеры: {company.managers}</p>
                <p>Туры: {company.tours}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-10">
              <button
                className="mb-6 text-blue-600 hover:underline text-lg"
                onClick={() => setSelectedCompany(null)}
              >
                ← Назад к списку компаний
              </button>
              <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">{selectedCompany.name}</h2>
              <div className="space-y-4 text-lg text-gray-700">
                <p><span className="font-semibold">Описание:</span> {selectedCompany.description}</p>
                <p><span className="font-semibold">Контакты:</span> {selectedCompany.contact}</p>
                <p><span className="font-semibold">Год основания:</span> {selectedCompany.founded}</p>
                <p><span className="font-semibold">Менеджеры:</span> {selectedCompany.managers}</p>
                <p><span className="font-semibold">Туры:</span> {selectedCompany.tours}</p>
              </div>
            </div>
          </div>
        )}

        {/* Управление акциями */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Добавить акцию</h2>
          <input
            type="text"
            placeholder="Текст акции"
            className="p-3 w-full border rounded mb-3 text-lg"
            value={newPromoText}
            onChange={(e) => setNewPromoText(e.target.value)}
          />
          <input
            type="date"
            className="p-3 w-full border rounded mb-3 text-lg"
            value={newPromoValidUntil}
            onChange={(e) => setNewPromoValidUntil(e.target.value)}
          />
          <input
            type="text"
            placeholder="Экскурсия"
            className="p-3 w-full border rounded mb-3 text-lg"
            value={newPromoExcursion}
            onChange={(e) => setNewPromoExcursion(e.target.value)}
          />
          <button
            className="bg-black text-white p-4 rounded w-full hover:bg-gray-800 transition text-lg font-medium"
            onClick={handleAddPromotion}
          >
            ДОБАВИТЬ АКЦИЮ
          </button>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Текущие акции</h2>
          {promotions.map(promo => (
            <div key={promo.id} className="p-4 border-b text-lg">
              <p className="text-red-500 font-semibold">{promo.text}</p>
              <p>Для экскурсии: {promo.excursion}</p>
              <p>Действует до: {promo.validUntil}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ManagerPanel;