import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../AuthContext';

function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setNotifications(response.data.Notifications || []);
    } catch (err) {
      console.error('Ошибка загрузки уведомлений:', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Уведомления</h2>
      {notifications.length === 0 ? (
        <p>Нет уведомлений</p>
      ) : (
        <ul className="list-disc pl-5">
          {notifications.map((notif) => (
            <li key={notif.Id} className="mb-2">
              {notif.Message} ({new Date(notif.Timestamp).toLocaleString()})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;