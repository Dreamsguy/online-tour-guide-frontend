import React, { useState } from 'react';
import api from '../api/axios'; // Ваша настроенная axios-инстанция

const AddOrganization = () => {
  const [formData, setFormData] = useState({
    name: '',
    inn: '',
    email: '',
    phone: '',
    workingHours: '',
    postalCode: '',
    city: '',
    directions: [''],
    description: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleDirectionChange = (index, value) => {
    const newDirections = [...formData.directions];
    newDirections[index] = value;
    setFormData({ ...formData, directions: newDirections });
  };

  const addDirectionField = () => {
    setFormData({ ...formData, directions: [...formData.directions, ''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('Name', formData.name);
    data.append('INN', formData.inn);
    data.append('Email', formData.email);
    data.append('Phone', formData.phone);
    data.append('WorkingHours', formData.workingHours);
    data.append('PostalCode', formData.postalCode);
    data.append('City', formData.city);
    data.append('Directions', JSON.stringify(formData.directions));
    data.append('Description', formData.description);
    if (formData.image) data.append('Image', formData.image);

    try {
      const response = await api.post('/api/admin/organizations', data);
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
        <label>ИНН (обязательно):</label>
        <input type="text" name="inn" value={formData.inn} onChange={handleChange} required />
      </div>
      <div>
        <label>Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} />
      </div>
      <div>
        <label>Телефон:</label>
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
      </div>
      <div>
        <label>Время работы:</label>
        <input type="text" name="workingHours" value={formData.workingHours} onChange={handleChange} />
      </div>
      <div>
        <label>Индекс:</label>
        <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} />
      </div>
      <div>
        <label>Город:</label>
        <input type="text" name="city" value={formData.city} onChange={handleChange} />
      </div>
      <div>
        <label>Направления:</label>
        {formData.directions.map((direction, index) => (
          <div key={index}>
            <input
              type="text"
              value={direction}
              onChange={(e) => handleDirectionChange(index, e.target.value)}
              placeholder={`Направление ${index + 1}`}
            />
          </div>
        ))}
        <button type="button" onClick={addDirectionField}>+ Добавить направление</button>
      </div>
      <div>
        <label>Описание:</label>
        <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
      </div>
      <div>
        <label>Фото:</label>
        <input type="file" onChange={handleImageChange} accept="image/*" />
      </div>
      <button type="submit">Создать организацию</button>
    </form>
  );
};

export default AddOrganization;