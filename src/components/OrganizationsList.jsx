import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const OrganizationsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [organizations, setOrganizations] = useState([]);
  const [excursions, setExcursions] = useState({});
  const [guides, setGuides] = useState({});
  const [managers, setManagers] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'manager') {
      navigate('/login');
      return;
    }

    const fetchOrganizations = async () => {
      try {
        const response = await api.get('/api/organizations');
        setOrganizations(response.data);

        const fetchData = async (id) => {
          await Promise.all([
            api.get(`/api/organizations/${id}/excursions`).then(res => setExcursions(prev => ({ ...prev, [id]: res.data }))),
            api.get(`/api/organizations/${id}/guides`).then(res => setGuides(prev => ({ ...prev, [id]: res.data }))),
            api.get(`/api/organizations/${id}/managers`).then(res => setManagers(prev => ({ ...prev, [id]: res.data }))),
          ]).catch(err => console.error(`Ошибка загрузки данных для организации ${id}:`, err));
        };

        response.data.forEach(org => fetchData(org.id));
      } catch (err) {
        setError('Ошибка загрузки организаций: ' + (err.response?.data?.message || err.message));
      }
    };
    fetchOrganizations();
  }, [user, navigate]);

  const cityFilter = location.state?.cityFilter || '';
  const filteredOrganizations = organizations.filter(org =>
    cityFilter ? org.city === cityFilter : true
  );

  if (error) return <div className="error">{error}</div>;
  if (!organizations.length) return <div className="text-center p-4">Нет организаций</div>;

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-12">Организации</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Два столбца */}
          {filteredOrganizations.map((org) => (
            <div key={org.id} className="card">
              <img
                src={org.image || 'https://via.placeholder.com/320x200?text=No+Image'}
                alt={org.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="card-title">{org.name}</h3>
                <p className="card-text mb-1">Город: {org.city || 'Не указан'}</p>
                <p className="card-text mb-1">Рейтинг: {org.rating || 'Нет рейтинга'}</p>
                <p className="card-text mb-1">Телефон: {org.phone || 'Не указан'}</p>
                <p className="card-text mb-1">Email: {org.email || 'Не указан'}</p>
                <p className="card-text mb-1">Часы работы: {org.workingHours || 'Не указано'}</p>
                <p className="card-text mb-4">{org.description || 'Описание отсутствует'}</p>
                <Link to={`/organization/${org.id}`}>
                  <button className="btn-primary w-full">Подробнее</button>
                </Link>
                {excursions[org.id] && excursions[org.id].length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-md font-semibold">Экскурсии:</h4>
                    <ul className="list-disc pl-5">
                      {excursions[org.id].map(exc => (
                        <li key={exc.id}>{exc.title} (Цена: {exc.price}, Рейтинг: {exc.rating})</li>
                      ))}
                    </ul>
                  </div>
                )}
                {excursions[org.id] && excursions[org.id].length === 0 && (
                  <p className="mt-4">Нет экскурсий</p>
                )}
                {guides[org.id] && guides[org.id].length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-md font-semibold">Гиды:</h4>
                    <ul className="list-disc pl-5">
                      {guides[org.id].map(guide => (
                        <li key={guide.id}>{guide.name} ({guide.email})</li>
                      ))}
                    </ul>
                  </div>
                )}
                {guides[org.id] && guides[org.id].length === 0 && (
                  <p className="mt-4">Нет гидов</p>
                )}
                {managers[org.id] && managers[org.id].length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-md font-semibold">Менеджеры:</h4>
                    <ul className="list-disc pl-5">
                      {managers[org.id].map(manager => (
                        <li key={manager.id}>{manager.name} ({manager.email})</li>
                      ))}
                    </ul>
                  </div>
                )}
                {managers[org.id] && managers[org.id].length === 0 && (
                  <p className="mt-4">Нет менеджеров</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizationsList;