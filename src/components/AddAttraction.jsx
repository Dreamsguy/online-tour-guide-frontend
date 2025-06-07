import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';
import L from 'leaflet';

const AddAttraction = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    city: '',
    lat: 53.9,
    lng: 27.5667,
    history: '',
    visitingHours: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setFormData({ ...formData, lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('Name', formData.name);
    data.append('Description', formData.description);
    if (formData.image) data.append('Image', formData.image);
    data.append('City', formData.city);
    data.append('Coordinates', JSON.stringify({ X: formData.lat, Y: formData.lng }));
    data.append('History', formData.history);
    data.append('VisitingHours', formData.visitingHours);

    try {
      const response = await api.post('/api/attractions', data);
      alert(response.data.message);
    } catch (err) {
      alert('Ошибка: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Название (обязательно):</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
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
        <label>Город:</label>
        <input type="text" name="city" value={formData.city} onChange={handleChange} />
      </div>
      <div>
        <label>История:</label>
        <textarea name="history" value={formData.history} onChange={handleChange}></textarea>
      </div>
      <div>
        <label>Время посещения:</label>
        <input type="text" name="visitingHours" value={formData.visitingHours} onChange={handleChange} />
      </div>
      <div>
        <label>Местоположение:</label>
        <MapContainer center={[formData.lat, formData.lng]} zoom={13} style={{ height: '400px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[formData.lat, formData.lng]} />
          <MapClickHandler />
        </MapContainer>
        <p>Координаты: {formData.lat}, {formData.lng}</p>
      </div>
      <button type="submit">Создать достопримечательность</button>
    </form>
  );
};

export default AddAttraction;