import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';

function EditExcursion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    direction: '',
    description: '',
    images: [],
    tickets: [{ date: '', time: '', total: '', type: '', price: '', currency: 'BYN' }],
    city: '',
    attractionIds: [],
    isIndividual: false,
    isForDisabled: false,
    isForChildren: false,
    organizationId: '',
    guideId: '',
    managerId: '',
  });
  const [guides, setGuides] = useState([]);
  const [managers, setManagers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [attractionCoords, setAttractionCoords] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [excursionRes, orgsRes, attractionsRes] = await Promise.all([
          api.get(`/api/excursions/${id}`),
          api.get('/api/admin/organizations'),
          api.get('/api/admin/attractions'),
        ]);
        const excursionData = excursionRes.data;
        setFormData({
          title: excursionData.title || '',
          direction: excursionData.direction || '',
          description: excursionData.description || '',
          images: excursionData.images || [],
          tickets: excursionData.availableTicketsByDate
            ? Object.entries(excursionData.availableTicketsByDate).flatMap(([date, categories]) =>
                Object.entries(categories).map(([type, ticket]) => ({
                  date: date.split(' ')[0], // Берем только дату (yyyy-MM-dd)
                  time: '', // Предполагаем, что время нужно добавить вручную
                  total: ticket.count || '',
                  type,
                  price: ticket.price || '',
                  currency: ticket.currency || 'BYN',
                }))
              )
            : [{ date: '', time: '', total: '', type: '', price: '', currency: 'BYN' }],
          city: excursionData.city || '',
          attractionIds: excursionData.attractions ? excursionData.attractions.map(a => a.id) : [],
          isIndividual: excursionData.isIndividual === true, // Явно булево
          isForDisabled: excursionData.isForDisabled || false,
          isForChildren: excursionData.isForChildren || false,
          organizationId: excursionData.organizationId?.toString() || '',
          guideId: excursionData.guideId?.toString() || '',
          managerId: excursionData.managerId?.toString() || '',
        });
        setOrganizations(orgsRes.data);
        const attrs = attractionsRes.data;
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
          return { ...acc, [attr.id]: [coord.lat || coord.x || 0, coord.lng || coord.y || 0] };
        }, {});
        setAttractionCoords(coords);
        if (excursionData.organizationId) {
          const [guidesRes, managersRes] = await Promise.all([
            api.get(`/api/admin/organizations/${excursionData.organizationId}/guides`),
            api.get(`/api/admin/organizations/${excursionData.organizationId}/managers`),
          ]);
          setGuides(guidesRes.data);
          setManagers(managersRes.data);
        }
        setLoading(false);
      } catch (err) {
        alert('Ошибка загрузки данных: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchGuidesAndManagers = async () => {
      if (formData.organizationId) {
        try {
          const [guidesRes, managersRes] = await Promise.all([
            api.get(`/api/admin/organizations/${formData.organizationId}/guides`),
            api.get(`/api/admin/organizations/${formData.organizationId}/managers`),
          ]);
          setGuides(guidesRes.data);
          setManagers(managersRes.data);
        } catch (err) {
          console.error('Ошибка загрузки гидов/менеджеров:', err);
        }
      } else {
        setGuides([]);
        setManagers([]);
      }
    };
    fetchGuidesAndManagers();
  }, [formData.organizationId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'isIndividual' ? value === 'true' : value)
    }));
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, images: Array.from(e.target.files) });
  };

  const handleTicketChange = (index, field, value) => {
    const newTickets = [...formData.tickets];
    newTickets[index][field] = value;
    setFormData({ ...formData, tickets: newTickets });
  };

  const addTicketField = () => {
    setFormData({ ...formData, tickets: [...formData.tickets, { date: '', time: '', total: '', type: '', price: '', currency: 'BYN' }] });
  };

  const handleAttractionChange = (e) => {
    const { value, checked } = e.target;
    setFormData({
      ...formData,
      attractionIds: checked
        ? [...formData.attractionIds, parseInt(value)]
        : formData.attractionIds.filter((id) => id !== parseInt(value)),
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  const data = {
    Title: formData.title || '',
    Direction: formData.direction || '',
    Description: formData.description || '',
    Tickets: formData.tickets.filter(t => t.date || t.time || t.total || t.type || t.price).length > 0
      ? formData.tickets.map(t => ({
          date: t.date || '',
          time: t.time || '',
          total: parseInt(t.total) || 0,
          type: t.type || '',
          price: parseFloat(t.price) || 0,
          currency: t.currency || 'BYN',
        }))
      : [],
    City: formData.city || '',
    AttractionIds: formData.attractionIds,
    IsIndividual: formData.isIndividual,
    IsForDisabled: formData.isForDisabled,
    IsForChildren: formData.isForChildren,
    OrganizationId: formData.organizationId ? parseInt(formData.organizationId) : null,
    GuideId: formData.guideId ? parseInt(formData.guideId) : null,
    ManagerId: formData.managerId ? parseInt(formData.managerId) : null,
  };

  try {
    const response = await api.put(`/api/admin/excursions/${id}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    alert(response.data.message);
    // Перезагружаем данные или перенаправляем для обновления
    window.location.href = `/excursion/${id}`; // Форсированный редирект
  } catch (err) {
    alert('Ошибка: ' + (err.response?.data?.message || err.message));
    console.error('Ошибка при отправке:', err.response?.data, 'Отправленные данные:', data);
  }
};

  if (loading) return <div className="min-h-screen pt-24 text-center text-lg text-gray-300">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200 flex items-center justify-center p-4">
      <div className="bg-gray-800/80 backdrop-blur-md p-6 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-6 text-yellow-400">Редактировать экскурсию</h1>
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
            <label className="block text-base font-semibold mb-2 text-yellow-200">Организация *</label>
            <select
              name="organizationId"
              value={formData.organizationId}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Выберите организацию</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
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
                {guides.map((guide) => (
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
                {managers.map((manager) => (
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
              {attractions.map((attraction) => (
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
              ))}
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
            Сохранить изменения
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditExcursion;