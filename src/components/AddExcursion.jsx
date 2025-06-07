import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import api from '../api/axios';

const AddExcursion = () => {
  const [formData, setFormData] = useState({
    title: '',
    direction: '',
    description: '',
    image: null,
    price: '',
    schedule: '',
    guideId: '',
    managerId: '',
    city: '',
    totalTickets: '',
    schedules: [{ date: '', total: '' }],
    attractionIds: [],
    route: [], // [[lat, lng], ...]
    isIndividual: false,
    organizationId: '',
  });

  const [guides, setGuides] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [attractions, setAttractions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guidesRes, orgsRes, attractionsRes] = await Promise.all([
          api.get('/api/admin/users?role=guide'),
          api.get('/api/admin/organizations'),
          api.get('/api/admin/attractions'),
        ]);
        setGuides(guidesRes.data);
        setOrganizations(orgsRes.data);
        setAttractions(attractionsRes.data);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedules = [...formData.schedules];
    newSchedules[index][field] = value;
    setFormData({ ...formData, schedules: newSchedules });
  };

  const addScheduleField = () => {
    setFormData({ ...formData, schedules: [...formData.schedules, { date: '', total: '' }] });
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

  const handleRouteChange = (newRoute) => {
    setFormData({ ...formData, route: newRoute });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('Title', formData.title);
    data.append('Direction', formData.direction);
    data.append('Description', formData.description);
    if (formData.image) data.append('Image', formData.image);
    data.append('Price', formData.price);
    data.append('Schedule', formData.schedule);
    data.append('GuideId', formData.guideId);
    data.append('ManagerId', formData.managerId);
    data.append('City', formData.city);
    data.append('TotalTickets', formData.totalTickets);
    const schedulesObj = formData.schedules.reduce((acc, s) => {
      acc[s.date] = { total: parseInt(s.total), sold: 0 };
      return acc;
    }, {});
    data.append('Schedules', JSON.stringify(schedulesObj));
    data.append('AttractionIds', JSON.stringify(formData.attractionIds));
    data.append('Route', JSON.stringify(formData.route));
    data.append('IsIndividual', formData.isIndividual.toString());
    data.append('OrganizationId', formData.organizationId);

    try {
      const response = await api.post('/api/admin/excursions', data);
      alert(response.data.message);
    } catch (err) {
      alert('Ошибка: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Название (обязательно):</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
      </div>
      <div>
        <label>Направление:</label>
        <input type="text" name="direction" value={formData.direction} onChange={handleChange} />
      </div>
      <div>
        <label>Описание:</label>
        <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
      </div>
      <div>
        <label>Фото:</label>
        <input type="file" onChange={handleImageChange} accept="image/*" />
      </div>
      <div>
        <label>Цена:</label>
        <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" />
      </div>
      <div>
        <label>Основное расписание:</label>
        <input type="datetime-local" name="schedule" value={formData.schedule} onChange={handleChange} />
      </div>
      <div>
        <label>Гид:</label>
        <select name="guideId" value={formData.guideId} onChange={handleChange}>
          <option value="">Выберите гида</option>
          {guides.map((guide) => (
            <option key={guide.id} value={guide.id}>{guide.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Менеджер:</label>
        <select name="managerId" value={formData.managerId} onChange={handleChange}>
          <option value="">Выберите менеджера</option>
          {guides.map((guide) => (
            <option key={guide.id} value={guide.id}>{guide.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Город:</label>
        <input type="text" name="city" value={formData.city} onChange={handleChange} />
      </div>
      <div>
        <label>Общее количество билетов:</label>
        <input type="number" name="totalTickets" value={formData.totalTickets} onChange={handleChange} />
      </div>
      <div>
        <label>Расписание билетов:</label>
        {formData.schedules.map((schedule, index) => (
          <div key={index}>
            <input
              type="date"
              value={schedule.date}
              onChange={(e) => handleScheduleChange(index, 'date', e.target.value)}
              placeholder="Дата"
            />
            <input
              type="number"
              value={schedule.total}
              onChange={(e) => handleScheduleChange(index, 'total', e.target.value)}
              placeholder="Количество билетов"
            />
          </div>
        ))}
        <button type="button" onClick={addScheduleField}>+ Добавить расписание</button>
      </div>
      <div>
        <label>Связанные достопримечательности:</label>
        {attractions.map((attraction) => (
          <div key={attraction.id}>
            <input
              type="checkbox"
              value={attraction.id}
              checked={formData.attractionIds.includes(attraction.id)}
              onChange={handleAttractionChange}
            />
            <label>{attraction.name}</label>
          </div>
        ))}
      </div>
      <div>
        <label>Маршрут:</label>
        <MapContainer center={[53.9, 27.5667]} zoom={10} style={{ height: '400px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Polyline positions={formData.route} color="blue" />
          {/* Здесь можно добавить логику для рисования маршрута */}
        </MapContainer>
      </div>
      <div>
        <label>Индивидуальная экскурсия:</label>
        <input type="checkbox" name="isIndividual" checked={formData.isIndividual} onChange={handleChange} />
      </div>
      <div>
        <label>Организация (обязательно):</label>
        <select name="organizationId" value={formData.organizationId} onChange={handleChange} required>
          <option value="">Выберите организацию</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>{org.name}</option>
          ))}
        </select>
      </div>
      <button type="submit">Создать экскурсию</button>
    </form>
  );
};

export default AddExcursion;