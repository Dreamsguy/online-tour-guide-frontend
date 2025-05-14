import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

function Contacts() {
  const { user } = useAuth();
  const [contactInfo, setContactInfo] = useState({
    phone: '+375 (29) 123-45-67',
    email: 'info@belarusguide.by',
    address: 'г. Минск, ул. Примерная, д. 10',
    hours: 'Пн-Пт: 9:00–18:00, Сб-Вс: выходной',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-12">Контакты</h1>
        <div className="card p-8 max-w-lg mx-auto">
          <h2 className="text-3xl font-semibold mb-6">Свяжитесь с нами</h2>
          {user?.role === 'admin' && isEditing ? (
            <>
              <div className="mb-4">
                <label className="block text-base font-semibold mb-2">Телефон</label>
                <input
                  type="text"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  className="w-full p-4 rounded-lg text-base"
                />
              </div>
              <div className="mb-4">
                <label className="block text-base font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  className="w-full p-4 rounded-lg text-base"
                />
              </div>
              <div className="mb-4">
                <label className="block text-base font-semibold mb-2">Адрес</label>
                <input
                  type="text"
                  value={contactInfo.address}
                  onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                  className="w-full p-4 rounded-lg text-base"
                />
              </div>
              <div className="mb-4">
                <label className="block text-base font-semibold mb-2">График работы</label>
                <input
                  type="text"
                  value={contactInfo.hours}
                  onChange={(e) => setContactInfo({ ...contactInfo, hours: e.target.value })}
                  className="w-full p-4 rounded-lg text-base"
                />
              </div>
              <button
                onClick={handleSave}
                className="p-4 rounded-lg w-full text-base font-medium"
              >
                СОХРАНИТЬ
              </button>
            </>
          ) : (
            <>
              <p className="text-base mb-2"><strong>Телефон:</strong> {contactInfo.phone}</p>
              <p className="text-base mb-2"><strong>Email:</strong> {contactInfo.email}</p>
              <p className="text-base mb-2"><strong>Адрес:</strong> {contactInfo.address}</p>
              <p className="text-base mb-4"><strong>График работы:</strong> {contactInfo.hours}</p>
              {user?.role === 'admin' ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-4 rounded-lg w-full text-base font-medium"
                >
                  РЕДАКТИРОВАТЬ
                </button>
              ) : (
                <button
                  className="p-4 rounded-lg w-full text-base font-medium"
                  onClick={() => alert(`Напишите нам на ${contactInfo.email}!`)}
                >
                  НАПИСАТЬ НАМ
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Contacts;