import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function Organizations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchOrganizations = async () => {
      try {
        const response = await api.get('/api/organizations');
        const orgs = response.data;
        const orgsWithDetails = await Promise.all(
          orgs.map(async org => {
            const excursionsRes = await api.get(`/api/organizations/${org.id}/excursions`);
            const guidesRes = await api.get(`/api/organizations/${org.id}/guides`);
            const managersRes = await api.get(`/api/organizations/${org.id}/managers`);
            return {
              ...org,
              excursions: excursionsRes.data,
              guides: guidesRes.data,
              managers: managersRes.data,
            };
          })
        );

        setOrganizations(orgsWithDetails);
      } catch (err) {
        setError('Ошибка загрузки организаций: ' + (err.response?.data?.message || err.message));
      }
    };
    fetchOrganizations();
  }, [user, navigate]);

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту организацию?')) {
      try {
        await api.delete(`/api/organizations/${id}`);
        setOrganizations(organizations.filter(org => org.id !== id));
      } catch (err) {
        setError('Ошибка удаления: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-12">Организации</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Два столбца */}
          {organizations.map(org => (
            <div key={org.id} className="card">
              <h2 className="card-title">{org.name}</h2>
              <p className="card-text mb-1">ИНН: {org.inn || 'Не указан'}</p>
              <p className="card-text mb-1">Город: {org.city || 'Не указан'}</p>
              <p className="card-text mb-1">Почтовый индекс: {org.postalCode || 'Не указан'}</p>
              <p className="card-text mb-1">Рейтинг: {org.rating || 'Нет рейтинга'}</p>
              <p className="card-text mb-1">Телефон: {org.phone || 'Не указан'}</p>
              <p className="card-text mb-1">Email: {org.email || 'Не указан'}</p>
              <p className="card-text mb-1">Часы работы: {org.workingHours || 'Не указано'}</p>
              <p className="card-text mb-4">{org.description || 'Описание отсутствует'}</p>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Экскурсии:</h3>
                {org.excursions?.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {org.excursions.map(exc => (
                      <li key={exc.id}>
                        <Link to={`/excursion/${exc.id}`} className="text-blue-400 hover:underline">{exc.title}</Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Нет экскурсий</p>
                )}
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Гиды:</h3>
                {org.guides?.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {org.guides.map(guide => (
                      <li key={guide.id}>
                        <Link to={`/profile/${guide.id}`} className="text-blue-400 hover:underline">{guide.name}</Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Нет гидов</p>
                )}
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Менеджеры:</h3>
                {org.managers?.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {org.managers.map(manager => (
                      <li key={manager.id}>
                        <Link to={`/profile/${manager.id}`} className="text-blue-400 hover:underline">{manager.name}</Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Нет менеджеров</p>
                )}
              </div>
              <div className="flex gap-2">
                <Link to={`/admin/edit-organization/${org.id}`}>
                  <button className="btn-primary">Редактировать</button>
                </Link>
                <button onClick={() => handleDelete(org.id)} className="btn-secondary">Удалить</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Organizations;