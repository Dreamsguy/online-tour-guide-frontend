import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import api from '../api/axios';

const AddExcursion = ({ managerId, organizationId, onClose, initialData = {}, isEditMode = false }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    direction: initialData.direction || '',
    description: initialData.description || '',
    images: initialData.images || [],
    tickets: initialData.tickets || [{ date: '', time: '', total: '', type: '', price: '', currency: 'BYN' }],
    guideId: initialData.guideId || '',
    managerId: initialData.managerId || managerId || '',
    city: initialData.city || '',
    attractionIds: initialData.attractionIds || [],
    isIndividual: initialData.isIndividual || false,
    isForDisabled: initialData.isForDisabled || false,
    isForChildren: initialData.isForChildren || false,
    organizationId: initialData.organizationId || organizationId || '',
    id: initialData.id || null,
  });

  const [guides, setGuides] = useState([]);
  const [managers, setManagers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [attractionCoords, setAttractionCoords] = useState({});
  const [error, setError] = useState(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(formData.organizationId || '');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role || 'user';
        setUserRole(role);
        console.log('Decoded token payload:', payload);
        console.log('Extracted role:', role);
      } catch (e) {
        console.error('Error decoding token:', e);
        setUserRole('user');
      }
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        console.log('Fetching data with token:', token.substring(0, 10) + '...');
        const [orgsRes, attractionsRes] = await Promise.all([
          api.get('/api/admin/organizations', { headers }),
          api.get('/api/excursions/attractions', { headers }),
        ]);
        setOrganizations(orgsRes.data || []);
        console.log('Organizations loaded:', orgsRes.data);

        const attrs = attractionsRes.data || [];
        setAttractions(attrs);
        const coords = attrs.reduce((acc, attr) => {
          const coord = attr.Coordinates || attr.coordinates || { lat: 0, lng: 0 };
          if (typeof coord === 'string') {
            try {
              const parsed = JSON.parse(coord);
              return { ...acc, [attr.id]: [parsed.lat || 0, parsed.lng || 0] };
            } catch (e) {
              console.warn(`Ошибка парсинга координат для ${attr.name}:`, coord);
              return { ...acc, [attr.id]: [0, 0] };
            }
          }
          return { ...acc, [attr.id]: [coord.lat || coord.x || 0, coord.y || coord.lng || 0] };
        }, {});
        setAttractionCoords(coords);

        if (userRole === 'manager' && (managerId || organizationId)) {
          const orgId = organizationId || (await findManagerOrganization(managerId));
          setSelectedOrganizationId(orgId);
          setFormData(prev => ({ ...prev, organizationId: orgId }));
          fetchGuidesAndManagers(orgId);
        }
      } catch (err) {
        console.error('Ошибка загрузки данных:', err.response?.data, 'Status:', err.response?.status, 'Full error:', err);
        setError(`Не удалось загрузить данные. Статус: ${err.response?.status}, Сообщение: ${err.response?.data?.message || err.message}`);
      }
    };

    const findManagerOrganization = async (managerId) => {
      try {
        const token = localStorage.getItem('token');
        const orgs = await api.get('/api/admin/organizations', { headers: { Authorization: `Bearer ${token}` } });
        const org = orgs.data.find(o => o.Managers?.some(m => m.Id === parseInt(managerId)));
        return org ? org.id : null;
      } catch (err) {
        console.error('Ошибка поиска организации менеджера:', err);
        return null;
      }
    };

    fetchData();
  }, [managerId, organizationId, userRole]);

  useEffect(() => {
    if (selectedOrganizationId) {
      setFormData(prev => ({ ...prev, organizationId: selectedOrganizationId }));
      fetchGuidesAndManagers(selectedOrganizationId);
    }
  }, [selectedOrganizationId]);

  const fetchGuidesAndManagers = async (orgId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      console.log(`Fetching guides and managers for orgId: ${orgId}`);
      const [guidesRes, managersRes] = await Promise.all([
        api.get(`/api/admin/organizations/${orgId}/guides`, { headers }),
        api.get(`/api/admin/organizations/${orgId}/managers`, { headers }),
      ]);
      setGuides(guidesRes.data || []);
      setManagers(managersRes.data || []);
      console.log('Guides loaded:', guidesRes.data);
      console.log('Managers loaded:', managersRes.data);
    } catch (err) {
      console.error('Ошибка загрузки гидов/менеджеров:', err.response?.data, 'Status:', err.response?.status, 'Full error:', err);
      setError(`Не удалось загрузить гидов или менеджеров. Статус: ${err.response?.status}, Сообщение: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'organizationId' && userRole === 'admin') {
      setSelectedOrganizationId(value);
    }
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({ ...prev, images: Array.from(e.target.files) }));
  };

  const handleTicketChange = (index, field, value) => {
    const newTickets = [...formData.tickets];
    newTickets[index][field] = value;
    setFormData(prev => ({ ...prev, tickets: newTickets }));
  };

  const addTicketField = () => {
    setFormData(prev => ({ ...prev, tickets: [...formData.tickets, { date: '', time: '', total: '', type: '', price: '', currency: 'BYN' }] }));
  };

  const handleAttractionChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      attractionIds: checked
        ? [...prev.attractionIds, parseInt(value)]
        : prev.attractionIds.filter((id) => id !== parseInt(value)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      Title: formData.title || '',
      Direction: formData.direction || '',
      Description: formData.description || '',
      GuideId: formData.guideId ? parseInt(formData.guideId) : null,
      ManagerId: formData.managerId ? parseInt(formData.managerId) : null,
      City: formData.city || '',
      AttractionIds: formData.attractionIds,
      IsIndividual: formData.isIndividual,
      IsForDisabled: formData.isForDisabled,
      IsForChildren: formData.isForChildren,
      OrganizationId: formData.organizationId ? parseInt(formData.organizationId) : null,
      Id: formData.id,
      Tickets: formData.tickets && formData.tickets.length > 0 ? formData.tickets.map(t => ({
        Date: t.date || '',
        Time: t.time || '',
        Total: parseInt(t.total) || 0,
        Type: t.type || '',
        Price: parseFloat(t.price) || 0,
        Currency: t.currency || 'BYN'
      })) : []
    };

    const formDataToSend = new FormData();
    formDataToSend.append('excursion', JSON.stringify(data));
    if (formData.images && formData.images.length > 0) {
      formDataToSend.append('image', formData.images[0]);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Токен авторизации отсутствует. Пожалуйста, войдите заново.');
      window.location.href = '/login';
      return;
    }
    const url = isEditMode ? `/api/excursions/${formData.id}` : '/api/excursions';
    const method = isEditMode ? 'put' : 'post';
    console.log('Request URL:', url, 'Method:', method, 'Token:', token.substring(0, 10) + '...', 'Data:', data);

    try {
      const response = await api[method](url, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Server response:', response.data);
      alert(response.data.message || (isEditMode ? 'Экскурсия обновлена' : 'Экскурсия создана'));
      if (onClose && typeof onClose === 'function') {
        onClose(); // Вызываем onClose только если он существует и является функцией
      }
      window.location.reload();
    } catch (err) {
      console.error('Ошибка при отправке:', err.response?.data, 'Status:', err.response?.status, 'Full error:', err);
      alert('Ошибка: ' + (err.response?.data?.message || err.message));
      if (err.response?.status === 401) {
        window.location.href = '/login';
      }
    }
  };

  const filteredGuides = guides.map(g => ({ ...g, id: g.id.toString() }));
  const filteredManagers = managers.map(m => ({ ...m, id: m.id.toString() }));

  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200 flex items-center justify-center p-4">
      <div className="bg-gray-800/80 backdrop-blur-md p-6 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-6 text-yellow-400">
          {isEditMode ? 'Редактирование экскурсии' : 'Создание экскурсии'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-semibold mb-2 text-yellow-200">Название *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Введите название"
              />
            </div>
            <div>
              <label className="block text-base font-semibold mb-2 text-yellow-200">Направление</label>
              <input
                type="text"
                name="direction"
                value={formData.direction}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Введите направление"
              />
            </div>
          </div>
          <div>
            <label className="block text-base font-semibold mb-2 text-yellow-200">Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 h-24"
              placeholder="Введите описание"
            />
          </div>
          <div>
            <label className="block text-base font-semibold mb-2 text-yellow-200">Фото</label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-gray-200 file:bg-gray-600/50 file:hover:bg-gray-500"
            />
          </div>
          <div>
            <label className="block text-base font-semibold mb-2 text-yellow-200">Организация</label>
            {userRole === 'admin' ? (
              <select
                name="organizationId"
                value={selectedOrganizationId}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Выберите организацию</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name || 'Без названия'}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="organizationId"
                value={organizations.find(o => o.id === parseInt(selectedOrganizationId))?.name || 'Неизвестно'}
                disabled
                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-400 cursor-not-allowed"
              />
            )}
            {selectedOrganizationId && organizations.find(o => o.id === parseInt(selectedOrganizationId)) && (
              <>
                <p className="text-sm text-gray-400 mt-1">ИНН: {organizations.find(o => o.id === parseInt(selectedOrganizationId)).inn || 'Не указан'}</p>
                <p className="text-sm text-gray-400">Город: {organizations.find(o => o.id === parseInt(selectedOrganizationId)).city || 'Не указан'}</p>
                <p className="text-sm text-gray-400">Телефон: {organizations.find(o => o.id === parseInt(selectedOrganizationId)).phone || 'Не указан'}</p>
                <p className="text-sm text-gray-400">Email: {organizations.find(o => o.id === parseInt(selectedOrganizationId)).email || 'Не указан'}</p>
                <p className="text-sm text-gray-400">Часы работы: {organizations.find(o => o.id === parseInt(selectedOrganizationId)).workingHours || 'Не указано'}</p>
                <p className="text-sm text-gray-400">Описание: {organizations.find(o => o.id === parseInt(selectedOrganizationId)).description || 'Описание отсутствует'}</p>
              </>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-semibold mb-2 text-yellow-200">Гид</label>
              <select
                name="guideId"
                value={formData.guideId}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Выберите гида</option>
                {filteredGuides.map((guide) => (
                  <option key={guide.id} value={guide.id}>{guide.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-base font-semibold mb-2 text-yellow-200">Менеджер</label>
              <select
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Выберите менеджера</option>
                {filteredManagers.map((manager) => (
                  <option key={manager.id} value={manager.id}>{manager.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-base font-semibold mb-2 text-yellow-200">Город</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Введите город"
            />
          </div>
          <div>
            <label className="block text-base font-semibold mb-2 text-yellow-200">Билеты</label>
            {formData.tickets.map((ticket, index) => (
              <div key={index} className="grid grid-cols-6 gap-4 mb-4">
                <input
                  type="date"
                  value={ticket.date}
                  onChange={(e) => handleTicketChange(index, 'date', e.target.value)}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Дата"
                />
                <input
                  type="time"
                  value={ticket.time}
                  onChange={(e) => handleTicketChange(index, 'time', e.target.value)}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Время"
                />
                <input
                  type="number"
                  value={ticket.total}
                  onChange={(e) => handleTicketChange(index, 'total', e.target.value)}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Количество"
                />
                <input
                  type="text"
                  value={ticket.type}
                  onChange={(e) => handleTicketChange(index, 'type', e.target.value)}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Тип"
                />
                <input
                  type="number"
                  value={ticket.price}
                  onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Цена"
                  step="0.01"
                />
                <select
                  value={ticket.currency}
                  onChange={(e) => handleTicketChange(index, 'currency', e.target.value)}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="BYN">BYN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            ))}
            <button
              type="button"
              onClick={addTicketField}
              className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
            >
              + Добавить билет
            </button>
          </div>
          <div>
            <label className="block text-base font-semibold mb-2 text-yellow-200">Связанные достопримечательности</label>
            <div className="grid grid-cols-2 gap-2">
              {attractions.length > 0 ? (
                attractions.map((attraction) => (
                  <div key={attraction.id} className="flex items-center">
                    <input
                      type="checkbox"
                      value={attraction.id}
                      checked={formData.attractionIds.includes(attraction.id)}
                      onChange={handleAttractionChange}
                      className="mr-2 accent-yellow-500"
                    />
                    <label className="text-gray-200">{attraction.name}</label>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Достопримечательности не загружены</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-base font-semibold mb-2 text-yellow-200">Карта с достопримечательностями</label>
            <MapContainer center={[53.9, 27.5667]} zoom={6} style={{ height: '400px', width: '100%' }} className="rounded-lg overflow-hidden">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {formData.attractionIds.map((id) => {
                const coord = attractionCoords[id];
                const attraction = attractions.find(a => a.id === id);
                if (coord && coord.length === 2 && coord.every(c => !isNaN(c) && c !== 0)) {
                  return (
                    <Marker key={id} position={coord}>
                      <Popup>{attraction ? attraction.name : 'Неизвестно'}</Popup>
                    </Marker>
                  );
                }
                return null;
              })}
            </MapContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-base font-semibold mb-2 text-yellow-200">Индивидуальная экскурсия</label>
              <input
                type="checkbox"
                name="isIndividual"
                checked={formData.isIndividual}
                onChange={handleChange}
                className="mr-2 accent-yellow-500"
              />
            </div>
            <div>
              <label className="block text-base font-semibold mb-2 text-yellow-200">Для инвалидов</label>
              <input
                type="checkbox"
                name="isForDisabled"
                checked={formData.isForDisabled}
                onChange={handleChange}
                className="mr-2 accent-yellow-500"
              />
            </div>
            <div>
              <label className="block text-base font-semibold mb-2 text-yellow-200">Для детей</label>
              <input
                type="checkbox"
                name="isForChildren"
                checked={formData.isForChildren}
                onChange={handleChange}
                className="mr-2 accent-yellow-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-600 text-white p-3 rounded-lg font-medium hover:bg-yellow-500 transition shadow-md"
          >
            {isEditMode ? 'Сохранить изменения' : 'Создать экскурсию'}
          </button>
          <button
            type="button"
            className="w-full mt-2 bg-gray-600 text-white p-3 rounded-lg font-medium hover:bg-gray-500 transition shadow-md"
            onClick={onClose}
          >
            Отмена
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExcursion;