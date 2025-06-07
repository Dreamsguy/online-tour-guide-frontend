import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function AdminGuideRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/api/auth/guide-requests');
        setRequests(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка загрузки заявок');
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      await api.post(`/api/auth/approve-guide-request/${requestId}`);
      setRequests(requests.filter(r => r.id !== requestId));
      alert('Заявка одобрена, роль обновлена!');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка одобрения заявки');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.post(`/api/auth/reject-guide-request/${requestId}`);
      setRequests(requests.filter(r => r.id !== requestId));
      alert('Заявка отклонена!');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка отклонения заявки');
    }
  };

  if (error) return <div className="min-h-screen pt-24 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen pt-24 bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-red-400">Модерация заявок на роль гида</h1>
        {requests.length === 0 ? (
          <p className="text-center text-gray-400">Нет новых заявок.</p>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div key={request.id} className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                <p className="text-lg"><span className="font-semibold text-red-300">Пользователь:</span> {request.fullName}</p>
                <p className="text-md"><span className="font-semibold text-red-300">Email:</span> {request.email}</p>
                <p className="text-md"><span className="font-semibold text-red-300">Опыт:</span> {request.experience}</p>
                <p className="text-md"><span className="font-semibold text-red-300">Проживание:</span> {request.residence}</p>
                <p className="text-md"><span className="font-semibold text-red-300">Города работы:</span> {request.cities}</p>
                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Одобрить
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminGuideRequests;