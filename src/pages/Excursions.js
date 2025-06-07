import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import Modal from 'react-modal';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

Modal.setAppElement('#root');

function Excursions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [excursions, setExcursions] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newExcursion, setNewExcursion] = useState({
    title: '',
    city: '',
    image: '',
    description: '',
    price: '',
    guideId: null, // Убрано для гида
    managerId: user?.role === 'manager' ? user.id : null,
    organizationId: '',
    category: '',
    status: 'pending',
    isIndividual: false,
    availability: [{ dateTime: '', ticketCategory: 'Стандарт', availableTickets: 0 }],
  });
  const [editExcursionId, setEditExcursionId] = useState(null);
  const [filters, setFilters] = useState({
    city: '',
    category: '',
    priceRange: '',
  });
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchExcursions = async () => {
      try {
        const response = await api.get('/api/excursions');
        setExcursions(response.data);
      } catch (err) {
        console.error('Ошибка загрузки экскурсий:', err);
        if (err.response?.status === 401) {
          alert('Сессия истекла. Пожалуйста, войдите заново.');
          navigate('/login');
        } else {
          alert('Произошла ошибка при загрузке экскурсий. Пожалуйста, попробуйте позже.');
        }
      }
    };
    fetchExcursions();
  }, [navigate]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await api.get('/api/organizations');
        setOrganizations(response.data);
      } catch (err) {
        console.error('Ошибка загрузки организаций:', err);
        alert('Не удалось загрузить список организаций.');
      }
    };
    fetchOrganizations();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      if (newExcursion.organizationId) {
        try {
          const response = await api.get(`/api/organizations/${newExcursion.organizationId}/categories`);
          setCategories(response.data || []);
        } catch (err) {
          console.error('Ошибка загрузки категорий:', err);
          setCategories([]);
          alert('Не удалось загрузить категории для выбранной организации.');
        }
      } else {
        setCategories([]);
      }
    };
    fetchCategories();
  }, [newExcursion.organizationId]);

  useEffect(() => {
    if (mapRef.current && excursions.length) {
      const map = mapRef.current;
      map.eachLayer((l) => l instanceof L.Routing.Control && map.removeControl(l));
      const waypoints = excursions
        .flatMap((e) => e.attractions)
        .filter(
          (a) =>
            a?.coordinates?.y &&
            a?.coordinates?.x &&
            !isNaN(a.coordinates.y) &&
            !isNaN(a.coordinates.x)
        )
        .map((a) => L.latLng(a.coordinates.y, a.coordinates.x));
      if (waypoints.length > 1) {
        L.Routing.control({
          waypoints,
          routeWhileDragging: true,
          show: true,
          lineOptions: { styles: [{ color: '#0078A8', weight: 4 }] },
          addWaypoints: false,
          createMarker: () => null,
        }).addTo(map);
        map.fitBounds(L.latLngBounds(waypoints));
      } else if (waypoints.length === 1) {
        map.setView(waypoints[0], 13);
      }
    }
  }, [excursions]);

  const cityFilter = location.state?.cityFilter || filters.city;
  const filteredExcursions = excursions.filter((e) => {
    const matchesCity = !cityFilter || e.city === cityFilter;
    const matchesCategory = !filters.category || e.category === filters.category;
    const price = parseFloat(e.price) || 0;
    const matchesPrice =
      !filters.priceRange ||
      (filters.priceRange === '0-100' && price <= 100) ||
      (filters.priceRange === '100-500' && price > 100 && price <= 500) ||
      (filters.priceRange === '500+' && price > 500);
    return matchesCity && matchesCategory && matchesPrice;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvailabilityChange = (index, field, value) => {
    const updatedAvailability = [...newExcursion.availability];
    updatedAvailability[index] = { ...updatedAvailability[index], [field]: value };
    setNewExcursion({ ...newExcursion, availability: updatedAvailability });
  };

  const addAvailabilityField = () => {
    setNewExcursion({
      ...newExcursion,
      availability: [
        ...newExcursion.availability,
        { dateTime: '', ticketCategory: 'Стандарт', availableTickets: 0 },
      ],
    });
  };

  const removeAvailabilityField = (index) => {
    setNewExcursion({
      ...newExcursion,
      availability: newExcursion.availability.filter((_, i) => i !== index),
    });
  };

  const handleAddExcursion = async () => {
    if (!newExcursion.title || !newExcursion.city || !newExcursion.organizationId) {
      alert('Заполните название, город и организацию');
      return;
    }

    try {
      const availability = newExcursion.availability.map((a) => ({
        dateTime: a.dateTime ? new Date(a.dateTime).toISOString() : new Date().toISOString(),
        ticketCategory: a.ticketCategory,
        availableTickets: parseInt(a.availableTickets) || 0,
      }));
      const response = await api.post('/api/excursions', {
        ...newExcursion,
        price: +newExcursion.price || 0,
        guideId: null,
        managerId: user?.role === 'manager' ? user.id : null,
        organizationId: +newExcursion.organizationId,
        category: newExcursion.category,
        createdAt: new Date(),
        rating: 0,
        availability,
      });
      setExcursions([...excursions, response.data]);
      closeAddModal();
      const newExcursionElement = document.getElementById(`excursion-${response.data.id}`);
      if (newExcursionElement) newExcursionElement.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Ошибка добавления:', err);
      alert(`Ошибка при добавлении экскурсии: ${err.response?.data?.message || 'Проверьте данные'}`);
    }
  };

  const handleEditExcursion = (e) => {
    setEditExcursionId(e.id);
    setNewExcursion({
      ...e,
      price: e.price?.toString() || '',
      guideId: null,
      managerId: e.managerId?.toString() || '',
      organizationId: e.organizationId?.toString() || '',
      category: e.category || '',
      availability: e.availableTicketsByDate
        ? Object.entries(e.availableTicketsByDate).flatMap(([date, categories]) =>
            Object.entries(categories).map(([category, tickets]) => ({
              dateTime: date,
              ticketCategory: category,
              availableTickets: tickets || 0,
            }))
          )
        : [{ dateTime: '', ticketCategory: 'Стандарт', availableTickets: 0 }],
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateExcursion = async () => {
    if (!newExcursion.title || !newExcursion.city || !newExcursion.organizationId) {
      alert('Заполните название, город и организацию');
      return;
    }

    try {
      const response = await api.put(`/api/excursions/${editExcursionId}`, {
        ...newExcursion,
        price: +newExcursion.price || 0,
        guideId: null,
        managerId: newExcursion.managerId ? +newExcursion.managerId : null,
        organizationId: +newExcursion.organizationId,
        category: newExcursion.category,
        availability: newExcursion.availability.map((a) => ({
          dateTime: a.dateTime ? new Date(a.dateTime).toISOString() : new Date().toISOString(),
          ticketCategory: a.ticketCategory,
          availableTickets: parseInt(a.availableTickets) || 0,
        })),
      });
      setExcursions(excursions.map((e) => (e.id === editExcursionId ? { ...e, ...response.data } : e)));
      closeEditModal();
    } catch (err) {
      console.error('Ошибка обновления:', err);
      alert(`Ошибка при обновлении экскурсии: ${err.response?.data?.message || 'Проверьте данные'}`);
    }
  };

  const handleDeleteExcursion = async (id) => {
    const confirmDelete = window.confirm('Вы уверены, что хотите удалить эту экскурсию? Это действие нельзя отменить.');
    if (!confirmDelete) return;

    try {
      const response = await api.delete(`/api/excursions/${id}`);
      if (response.status === 204) {
        setExcursions(excursions.filter((e) => e.id !== id));
        alert('Экскурсия успешно удалена!');
      }
    } catch (err) {
      console.error('Ошибка удаления:', err);
      const errorMessage = err.response?.data?.message || 'Произошла ошибка на сервере. Пожалуйста, попробуйте позже.';
      alert(`Ошибка при удалении экскурсии: ${errorMessage}`);
    }
  };

  const handleApproveExcursion = async (id) => {
    try {
      const response = await api.put(`/api/excursions/${id}/status`, { status: 'active' });
      if (response.status === 200) {
        setExcursions(excursions.map((e) => (e.id === id ? { ...e, status: 'active' } : e)));
        alert('Экскурсия успешно одобрена!');
      }
    } catch (err) {
      console.error('Ошибка одобрения:', err);
      alert(`Ошибка при одобрении экскурсии: ${err.response?.data?.message || 'Проблема на сервере'}`);
    }
  };

  const handleRejectExcursion = async (id) => {
    const reason = prompt('Укажите причину отклонения:');
    if (!reason) {
      alert('Необходимо указать причину отклонения.');
      return;
    }

    try {
      const response = await api.put(`/api/excursions/${id}/status`, {
        status: 'rejected',
        rejectionReason: reason,
      });
      if (response.status === 200) {
        setExcursions(
          excursions.map((e) =>
            e.id === id ? { ...e, status: 'rejected', rejectionReason: reason } : e
          )
        );
        alert('Экскурсия отклонена.');
      }
    } catch (err) {
      console.error('Ошибка отклонения:', err);
      alert(`Ошибка при отклонении экскурсии: ${err.response?.data?.message || 'Проблема на сервере'}`);
    }
  };

  const hasAvailableTickets = (excursion) => {
    if (!excursion.availableTicketsByDate || Object.keys(excursion.availableTicketsByDate).length === 0) return false;
    return Object.values(excursion.availableTicketsByDate).some((date) =>
      Object.values(date).some((tickets) => tickets > 0)
    );
  };

  const defaultCenter = [53.9, 27.5667]; // Минск
  const firstValidCoords = filteredExcursions.find(
    (e) => e.attractions?.[0]?.coordinates?.y && e.attractions?.[0]?.coordinates?.x
  );
  const mapCenter = firstValidCoords?.attractions?.[0]?.coordinates
    ? [firstValidCoords.attractions[0].coordinates.y, firstValidCoords.attractions[0].coordinates.x]
    : defaultCenter;

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewExcursion({
      title: '',
      city: '',
      image: '',
      description: '',
      price: '',
      guideId: null,
      managerId: user?.role === 'manager' ? user.id : null,
      organizationId: '',
      category: '',
      status: 'pending',
      isIndividual: false,
      availability: [{ dateTime: '', ticketCategory: 'Стандарт', availableTickets: 0 }],
    });
    setCategories([]);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditExcursionId(null);
    setNewExcursion({
      title: '',
      city: '',
      image: '',
      description: '',
      price: '',
      guideId: null,
      managerId: user?.role === 'manager' ? user.id : null,
      organizationId: '',
      category: '',
      status: 'pending',
      isIndividual: false,
      availability: [{ dateTime: '', ticketCategory: 'Стандарт', availableTickets: 0 }],
    });
    setCategories([]);
  };

  return (
    <div className="min-h-screen">
      <div className="brand">Путешествия онлайн</div>
      <div className="min-h-screen pt-20">
        <div className="container mx-auto py-12 px-4">
          <h1
            onClick={(e) => {
              e.target.classList.add('clicked');
              setTimeout(() => e.target.classList.remove('clicked'), 1600);
            }}
          >
            Экскурсии
          </h1>
          <div className="filters">
            <select name="city" value={filters.city} onChange={handleFilterChange}>
              <option value="">Все города</option>
              {[...new Set(excursions.map((e) => e.city))].map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">Все категории</option>
              {[...new Set(excursions.map((e) => e.category))].filter(Boolean).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select name="priceRange" value={filters.priceRange} onChange={handleFilterChange}>
              <option value="">Все цены</option>
              <option value="0-100">До 100</option>
              <option value="100-500">100-500</option>
              <option value="500+">Более 500</option>
            </select>
          </div>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <div className="fixed bottom-10 right-10 z-50">
              <button
                onClick={openAddModal}
                className="btn-green text-white font-medium animate-fade-in"
                disabled={user?.role !== 'admin' && user?.role !== 'manager'}
              >
                Добавить экскурсию
              </button>
            </div>
          )}
          <Modal
            isOpen={isAddModalOpen}
            onRequestClose={closeAddModal}
            style={{
              content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(245, 230, 204, 0.9)',
                border: 'none',
                borderRadius: '16px',
                padding: '20px',
                width: '400px',
                maxHeight: '70vh',
                overflowY: 'auto',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
              },
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999,
              },
            }}
          >
            <h2 className="text-xl font-semibold mb-4 text-[#2A3A2E]">Добавить экскурсию</h2>
            <div className="space-y-3">
              <select
                value={newExcursion.organizationId || ''}
                onChange={(e) => setNewExcursion({ ...newExcursion, organizationId: e.target.value || null })}
                className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
                required
              >
                <option value="">Выберите организацию</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <select
                value={newExcursion.category}
                onChange={(e) => setNewExcursion({ ...newExcursion, category: e.target.value })}
                className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
                disabled={!newExcursion.organizationId}
              >
                <option value="">Выберите категорию</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                placeholder="Название"
                value={newExcursion.title}
                onChange={(e) => setNewExcursion({ ...newExcursion, title: e.target.value })}
                className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
                required
              />
              <input
                placeholder="Город"
                value={newExcursion.city}
                onChange={(e) => setNewExcursion({ ...newExcursion, city: e.target.value })}
                className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
                required
              />
              <input
                placeholder="URL изображения"
                value={newExcursion.image}
                onChange={(e) => setNewExcursion({ ...newExcursion, image: e.target.value })}
                className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
              />
              <textarea
                placeholder="Описание"
                value={newExcursion.description}
                onChange={(e) => setNewExcursion({ ...newExcursion, description: e.target.value })}
                className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E] h-16"
              />
              <input
                placeholder="Цена"
                value={newExcursion.price}
                onChange={(e) => setNewExcursion({ ...newExcursion, price: e.target.value })}
                className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
              />
              <input
                placeholder="ID менеджера (опционально)"
                value={newExcursion.managerId || ''}
                onChange={(e) => setNewExcursion({ ...newExcursion, managerId: e.target.value || null })}
                className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
              />
              {newExcursion.availability.map((avail, index) => (
                <div key={index} className="p-2 border border-[#2A3A2E]/30 rounded bg-[rgba(245,230,204,0.7)]">
                  <input
                    type="datetime-local"
                    value={avail.dateTime}
                    onChange={(e) => handleAvailabilityChange(index, 'dateTime', e.target.value)}
                    className="w-full p-1 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E] mb-1"
                  />
                  <select
                    value={avail.ticketCategory}
                    onChange={(e) => handleAvailabilityChange(index, 'ticketCategory', e.target.value)}
                    className="w-full p-1 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E] mb-1"
                  >
                    <option value="Стандарт">Стандарт</option>
                    <option value="VIP">VIP</option>
                  </select>
                  <input
                    type="number"
                    value={avail.availableTickets}
                    onChange={(e) => handleAvailabilityChange(index, 'availableTickets', e.target.value)}
                    className="w-full p-1 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
                    min="0"
                  />
                  {newExcursion.availability.length > 1 && (
                    <button
                      onClick={() => removeAvailabilityField(index)}
                      className="text-[#C8102E] hover:text-[#E0203E] mt-1 transition-colors duration-200"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addAvailabilityField}
                className="text-[#4A90E2] hover:text-[#5AA0F2] mt-2 transition-colors duration-200"
              >
                Добавить дату и категорию
              </button>
              <div className="flex space-x-2 mt-4">
                <button onClick={handleAddExcursion} className="btn-primary" disabled={!newExcursion.organizationId}>
                  Добавить
                </button>
                <button onClick={closeAddModal} className="btn-secondary">
                  Отмена
                </button>
              </div>
            </div>
          </Modal>
          <Modal
            isOpen={isEditModalOpen}
            onRequestClose={closeEditModal}
            style={{
              content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(245, 230, 204, 0.9)',
                border: 'none',
                borderRadius: '16px',
                padding: '20px',
                width: '400px',
                maxHeight: '70vh',
                overflowY: 'auto',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
              },
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999,
              },
            }}
          >
            <h2 className="text-xl font-semibold mb-4 text-[#2A3A2E]">Редактировать экскурсию</h2>
            <div className="space-y-3">
              <select
                value={newExcursion.organizationId || ''}
                onChange={(e) => setNewExcursion({ ...newExcursion, organizationId: e.target.value || null })}
                className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
                required
              >
                <option value="">Выберите организацию</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <select
                value={newExcursion.category}
                onChange={(e) => setNewExcursion({ ...newExcursion, category: e.target.value })}
                className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
                disabled={!newExcursion.organizationId}
              >
                <option value="">Выберите категорию</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                placeholder="Название"
                value={newExcursion.title}
                onChange={(e) => setNewExcursion({ ...newExcursion, title: e.target.value })}
                className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
                required
              />
              <input
                placeholder="Город"
                value={newExcursion.city}
                onChange={(e) => setNewExcursion({ ...newExcursion, city: e.target.value })}
                className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
                required
              />
              <input
                placeholder="URL изображения"
                value={newExcursion.image}
                onChange={(e) => setNewExcursion({ ...newExcursion, image: e.target.value })}
                className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
              />
              <textarea
                placeholder="Описание"
                value={newExcursion.description}
                onChange={(e) => setNewExcursion({ ...newExcursion, description: e.target.value })}
                className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E] h-16"
              />
              <input
                placeholder="Цена"
                value={newExcursion.price}
                onChange={(e) => setNewExcursion({ ...newExcursion, price: e.target.value })}
                className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
              />
              <input
                placeholder="ID менеджера (опционально)"
                value={newExcursion.managerId || ''}
                onChange={(e) => setNewExcursion({ ...newExcursion, managerId: e.target.value || null })}
                className="w-full p-2 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
              />
              {newExcursion.availability.map((avail, index) => (
                <div key={index} className="p-2 border border-[#2A3A2E]/30 rounded bg-[rgba(245,230,204,0.7)]">
                  <input
                    type="datetime-local"
                    value={avail.dateTime}
                    onChange={(e) => handleAvailabilityChange(index, 'dateTime', e.target.value)}
                    className="w-full p-1 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E] mb-1"
                  />
                  <select
                    value={avail.ticketCategory}
                    onChange={(e) => handleAvailabilityChange(index, 'ticketCategory', e.target.value)}
                    className="w-full p-1 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E] mb-1"
                  >
                    <option value="Стандарт">Стандарт</option>
                    <option value="VIP">VIP</option>
                  </select>
                  <input
                    type="number"
                    value={avail.availableTickets}
                    onChange={(e) => handleAvailabilityChange(index, 'availableTickets', e.target.value)}
                    className="w-full p-1 rounded border border-[#2A3A2E]/30 bg-[rgba(245,230,204,0.5)] text-[#2A3A2E]"
                    min="0"
                  />
                  {newExcursion.availability.length > 1 && (
                    <button
                      onClick={() => removeAvailabilityField(index)}
                      className="text-[#C8102E] hover:text-[#E0203E] mt-1 transition-colors duration-200"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addAvailabilityField}
                className="text-[#4A90E2] hover:text-[#5AA0F2] mt-2 transition-colors duration-200"
              >
                Добавить дату и категорию
              </button>
              <div className="flex space-x-2 mt-4">
                <button onClick={handleUpdateExcursion} className="btn-primary" disabled={!newExcursion.organizationId}>
                  Обновить
                </button>
                <button onClick={closeEditModal} className="btn-secondary">
                  Отмена
                </button>
              </div>
            </div>
          </Modal>
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-6 text-[#2A3A2E]">Карта</h3>
            <MapContainer
              center={mapCenter}
              zoom={8}
              style={{ height: '400px', width: '100%', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {filteredExcursions.map((e) =>
                e.attractions?.[0]?.coordinates?.y && e.attractions?.[0]?.coordinates?.x && (
                  <Marker key={e.id} position={[e.attractions[0].coordinates.y, e.attractions[0].coordinates.x]}>
                    <Popup>
                      {e.title}
                      {e.isIndividual && e.guideId && (
                        <Link to={`/profile/${e.guideId}`} className="text-[#4A90E2]">
                          Профиль гида
                        </Link>
                      )}
                    </Popup>
                  </Marker>
                )
              )}
            </MapContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExcursions.map((e) => (
              <div
                key={e.id}
                id={`excursion-${e.id}`}
                className="card animate-fade-in"
                onClick={() => navigate(`/excursion/${e.id}`)}
              >
                <img
                  src={e.image || 'https://picsum.photos/300/400'}
                  alt={e.title}
                  onError={(e) => {
                    e.target.src = 'https://picsum.photos/300/400';
                  }}
                />
                <div className="p-4">
                  <h3 className="card-title">{e.title}</h3>
                  <p className="card-text mb-2">Рейтинг: {e.rating || 0}</p>
                  <p className="card-text mb-2">
                    Тип: {e.isIndividual ? 'Индивидуальная' : 'Групповая'} • Категория:{' '}
                    {e.category || 'Не указана'}
                    {e.isIndividual && e.guideId && (
                      <Link to={`/profile/${e.guideId}`} className="text-[#4A90E2] ml-2 hover:underline">
                        Профиль гида
                      </Link>
                    )}
                  </p>
                  {e.availableTicketsByDate && Object.keys(e.availableTicketsByDate).length > 0 ? (
                    <div className="mb-2">
                      <p className="font-semibold text-[#2A3A2E]">Доступные билеты по датам:</p>
                      <ul className="list-disc pl-5 text-[#2A3A2E]">
                        {Object.entries(e.availableTicketsByDate).map(([date, categories]) => (
                          <li key={date}>
                            {new Date(date).toLocaleString()}:
                            <ul className="list-disc pl-5">
                              {Object.entries(categories).map(([category, count]) => (
                                <li key={category}>
                                  {category}: {count > 0 ? `${count} мест` : 'Мест нет'}
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-center text-[#C8102E] font-medium">Мест нет</p>
                  )}
                  {hasAvailableTickets(e) && user?.role === 'user' && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/excursion/${e.id}/book`);
                      }}
                      className="btn-primary w-full mt-2 animate-fade-in"
                    >
                      Забронировать
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Excursions;