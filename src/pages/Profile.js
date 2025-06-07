import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [guideBookings, setGuideBookings] = useState([]);
  const [excursions, setExcursions] = useState([]);
  const [allExcursions, setAllExcursions] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: '',
    email: '',
    fullName: '',
    experience: '',
    residence: '',
    cities: '',
    ideas: '',
    photosDescription: '',
    otherInfo: '',
  });
  const [editingBooking, setEditingBooking] = useState(null);
  const [editBookingForm, setEditBookingForm] = useState({ ticketCategory: '', dateTime: '', quantity: 1 });
  const [reviewForm, setReviewForm] = useState({ rating: 0, text: '' });
  const [availableOptions, setAvailableOptions] = useState({ categories: [], dates: [], availableTicketsByDate: {} });
  const [filters, setFilters] = useState({
    excursion: { title: '', city: '' },
    attraction: { name: '', city: '' },
    organization: { name: '' },
    user: { name: '', email: '' },
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await api.get('/api/auth/me');
        const userData = res.data || {};
        setProfile(userData);
        setEditProfileForm({
          name: userData.name || '',
          email: userData.email || '',
          fullName: userData.fullName || '',
          experience: userData.experience || '',
          residence: userData.residence || '',
          cities: userData.cities || '',
          ideas: userData.ideas || '',
          photosDescription: userData.photosDescription || '',
          otherInfo: userData.otherInfo || '',
        });
      } catch (err) {
        setError('Ошибка загрузки профиля: ' + (err.response?.data?.message || err.message));
      }
    };

    const loadUserBookings = async () => {
      try {
        const res = await api.get(`/api/bookings/user/${user.id}`);
        const updatedBookings = res.data.map(booking => {
          const bookingDate = new Date(booking.dateTime);
          const now = new Date();
          if (booking.status.toLowerCase() === 'pending' && bookingDate < now) {
            return { ...booking, status: 'Completed' };
          }
          return booking;
        });
        setUserBookings(updatedBookings);
      } catch (err) {
        setError('Ошибка загрузки бронирований: ' + (err.response?.data?.message || err.message));
      }
    };

    const loadGuideData = async () => {
      if (user.role.includes('guide')) {
        try {
          const res = await api.get('/api/excursions');
          const guideExcursions = res.data.filter(e => e.guideId === user.id && e.isIndividual);
          setExcursions(guideExcursions);

          const bookingsRes = await api.get('/api/bookings');
          const guideBookings = bookingsRes.data.filter(b => guideExcursions.some(e => e.id === b.excursionId));
          setGuideBookings(guideBookings);
        } catch (err) {
          setError('Ошибка загрузки данных гида: ' + (err.response?.data?.message || err.message));
        }
      }
    };

    const loadAdminData = async () => {
      if (user.role === 'admin') {
        try {
          const [excursionsRes, attractionsRes, organizationsRes, usersRes] = await Promise.all([
            api.get('/api/admin/excursions'),
            api.get('/api/admin/attractions'),
            api.get('/api/admin/organizations'),
            api.get('/api/admin/users'),
          ]);
          setAllExcursions(excursionsRes.data);
          setAttractions(attractionsRes.data);
          setOrganizations(organizationsRes.data);
          setUsers(usersRes.data);
        } catch (err) {
          setError('Ошибка загрузки данных админа: ' + (err.response?.data?.message || err.message));
        }
      }
    };

    loadProfile();
    if (user.role !== 'admin') {
      loadUserBookings();
      if (user.role.includes('guide')) {
        loadGuideData();
      }
    } else {
      loadAdminData();
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    setEditingProfile(true);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditProfileForm({ ...editProfileForm, [name]: value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/auth/me', editProfileForm);
      setProfile({ ...profile, ...editProfileForm });
      setEditingProfile(false);
      alert('Профиль обновлен.');
    } catch (err) {
      setError('Ошибка обновления профиля: ' + (err.response?.data?.message || err.message));
    }
  };

  const translateStatus = (status) => {
    const statusMap = {
      pending: 'Забронировано',
      cancelled: 'Отменено',
      completed: 'Завершено',
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await api.delete(`/api/bookings/${bookingId}`);
      setUserBookings(userBookings.filter(b => b.id !== bookingId));
      alert('Бронирование отменено.');
    } catch (err) {
      setError('Ошибка отмены бронирования: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditBooking = async (booking) => {
    setEditingBooking(booking.id);
    setEditBookingForm({
      ticketCategory: booking.ticketCategory,
      dateTime: booking.dateTime,
      quantity: booking.quantity || 1,
    });

    try {
      const res = await api.get(`/api/excursions/${booking.excursionId}`);
      setAvailableOptions({
        categories: ['Стандарт', 'VIP'],
        dates: res.data.availableTicketsByDate ? Object.keys(res.data.availableTicketsByDate) : [],
        availableTicketsByDate: res.data.availableTicketsByDate || {},
      });
    } catch (err) {
      setError('Ошибка загрузки данных экскурсии: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateBooking = async (bookingId) => {
    try {
      const originalBooking = userBookings.find(b => b.id === bookingId);
      const updatedData = {
        ticketCategory: editBookingForm.ticketCategory || originalBooking.ticketCategory,
        dateTime: editBookingForm.dateTime ? new Date(editBookingForm.dateTime).toISOString() : originalBooking.dateTime,
        quantity: editBookingForm.quantity ? parseInt(editBookingForm.quantity) : originalBooking.quantity || 1,
        status: originalBooking.status,
      };

      await api.put(`/api/bookings/${bookingId}`, updatedData);
      const updatedBookings = userBookings.map(b => (b.id === bookingId ? { ...b, ...updatedData } : b));
      setUserBookings(updatedBookings);
      setEditingBooking(null);
      alert('Бронирование обновлено.');
    } catch (err) {
      setError('Ошибка обновления бронирования: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStarClick = (rating) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handleReviewSubmit = async (booking) => {
    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      setError('Рейтинг должен быть от 1 до 5.');
      return;
    }

    try {
      const reviewData = {
        excursionId: booking.excursionId,
        userId: user.id,
        rating: reviewForm.rating,
        text: reviewForm.text || '',
        companyId: null,
        attractionId: null,
      };
      await api.post('/api/reviews', reviewData);
      setReviewForm({ rating: 0, text: '' });
      alert('Отзыв отправлен.');
    } catch (err) {
      setError('Ошибка отправки отзыва: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddExcursion = () => navigate('/admin/add-excursion');
  const handleEditExcursion = (excursionId) => navigate(`/admin/edit-excursion/${excursionId}`);
  const handleDeleteExcursion = async (excursionId) => {
  try {
    await api.delete(`/api/admin/excursions/${excursionId}`);
    setAllExcursions(allExcursions.filter(e => e.id !== excursionId));
    alert('Экскурсия удалена.');
  } catch (err) {
    setError('Ошибка удаления экскурсии: ' + (err.response?.data?.message || err.message));
  }
};
  const handleAddAttraction = () => navigate('/admin/add-attraction');
  const handleEditAttraction = (attractionId) => navigate(`/admin/edit-attraction/${attractionId}`);
  const handleDeleteAttraction = async (attractionId) => {
  try {
    await api.delete(`/api/admin/attractions/${attractionId}`);
    setAttractions(attractions.filter(a => a.id !== attractionId));
    alert('Достопримечательность удалена.');
  } catch (err) {
    setError('Ошибка удаления достопримечательности: ' + (err.response?.data?.message || err.message));
  }
};

  const handleAddOrganization = () => navigate('/admin/add-organization');
  const handleEditOrganization = (organizationId) => navigate(`/admin/edit-organization/${organizationId}`);
  const handleDeleteOrganization = async (organizationId) => {
  try {
    await api.delete(`/api/admin/organizations/${organizationId}`);
    setOrganizations(organizations.filter(o => o.id !== organizationId));
    alert('Организация удалена.');
  } catch (err) {
    setError('Ошибка удаления организации: ' + (err.response?.data?.message || err.message));
  }
};

  const handleAddUser = () => navigate('/admin/add-user');
  const handleEditUser = (userId) => navigate(`/admin/edit-user/${userId}`);
 const handleDeleteUser = async (userId) => {
  try {
    await api.delete(`/api/admin/users/${userId}`);
    setUsers(users.filter(u => u.id !== userId));
    alert('Пользователь удален.');
  } catch (err) {
    setError('Ошибка удаления пользователя: ' + (err.response?.data?.message || err.message));
  }
};

  const handleFilterChange = (section, field, value) => {
    setFilters(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const filteredExcursions = allExcursions.filter(e =>
    e.title.toLowerCase().includes(filters.excursion.title.toLowerCase()) &&
    e.city.toLowerCase().includes(filters.excursion.city.toLowerCase())
  );

  const filteredAttractions = attractions.filter(a =>
    a.name.toLowerCase().includes(filters.attraction.name.toLowerCase()) &&
    a.city.toLowerCase().includes(filters.attraction.city.toLowerCase())
  );

  const filteredOrganizations = organizations.filter(o =>
    o.name.toLowerCase().includes(filters.organization.name.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(filters.user.name.toLowerCase()) ||
    u.email.toLowerCase().includes(filters.user.email.toLowerCase())
  );

  if (!user) return <div className="min-h-screen pt-24 text-center text-lg text-gray-300">Загрузка...</div>;
  if (error) return <div className="min-h-screen pt-24 text-center text-lg text-red-500">{error}</div>;
  if (!profile) return <div className="min-h-screen pt-24 text-center text-lg text-gray-300">Загрузка профиля...</div>;

  return (
    <div className={`min-h-screen pt-24 ${user.role === 'admin' ? 'bg-red-900' : 'bg-gray-900'} text-gray-200`}>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Профиль</h1>
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-300">
            {user.role === 'admin' ? 'Панель администратора' : 'Информация о пользователе'}
          </h2>
          {user.role === 'admin' ? (
            <>
              <p className="text-base mb-2"><span className="font-semibold text-yellow-200">Имя:</span> <span className="text-gray-300">{profile?.name || 'Не указано'}</span></p>
              <p className="text-base mb-2"><span className="font-semibold text-yellow-200">Email:</span> <span className="text-gray-300">{profile?.email || 'Не указано'}</span></p>
              <p className="text-base mb-2"><span className="font-semibold text-yellow-200">Роль:</span> <span className="text-gray-300">{profile?.role || 'Не указано'}</span></p>
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition mt-4"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              {editingProfile ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label className="block text-base font-semibold mb-2 text-yellow-200">Имя</label>
                    <input
                      type="text"
                      name="name"
                      value={editProfileForm.name}
                      onChange={handleProfileChange}
                      className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-base font-semibold mb-2 text-yellow-200">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editProfileForm.email}
                      onChange={handleProfileChange}
                      className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
                      required
                    />
                  </div>
                  {user.role.includes('guide') && (
                    <>
                      <div>
                        <label className="block text-base font-semibold mb-2 text-yellow-200">ФИО</label>
                        <input
                          type="text"
                          name="fullName"
                          value={editProfileForm.fullName}
                          onChange={handleProfileChange}
                          className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-semibold mb-2 text-yellow-200">Опыт работы</label>
                        <textarea
                          name="experience"
                          value={editProfileForm.experience}
                          onChange={handleProfileChange}
                          className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
                          rows="3"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-semibold mb-2 text-yellow-200">Место проживания</label>
                        <input
                          type="text"
                          name="residence"
                          value={editProfileForm.residence}
                          onChange={handleProfileChange}
                          className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-semibold mb-2 text-yellow-200">Города работы</label>
                        <input
                          type="text"
                          name="cities"
                          value={editProfileForm.cities}
                          onChange={handleProfileChange}
                          className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-semibold mb-2 text-yellow-200">Интересные идеи</label>
                        <textarea
                          name="ideas"
                          value={editProfileForm.ideas}
                          onChange={handleProfileChange}
                          className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
                          rows="3"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-semibold mb-2 text-yellow-200">Описание фотографий</label>
                        <textarea
                          name="photosDescription"
                          value={editProfileForm.photosDescription}
                          onChange={handleProfileChange}
                          className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
                          rows="3"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-semibold mb-2 text-yellow-200">Дополнительная информация</label>
                        <textarea
                          name="otherInfo"
                          value={editProfileForm.otherInfo}
                          onChange={handleProfileChange}
                          className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
                          rows="3"
                        />
                      </div>
                    </>
                  )}
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="w-full bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-base mb-2"><span className="font-semibold text-yellow-200">Имя:</span> <span className="text-gray-300">{profile?.name || 'Не указано'}</span></p>
                  <p className="text-base mb-2"><span className="font-semibold text-yellow-200">Email:</span> <span className="text-gray-300">{profile?.email || 'Не указано'}</span></p>
                  <p className="text-base mb-2"><span className="font-semibold text-yellow-200">Роль:</span> <span className="text-gray-300">{profile?.role || 'Не указано'}</span></p>
                  {profile?.status === 'pending' && (
                    <p className="text-base mb-2"><span className="font-semibold text-yellow-200">Статус заявки на роль гида:</span> <span className="text-yellow-300">На модерации</span></p>
                  )}
                  {profile?.status === 'rejected' && (
                    <p className="text-base mb-2"><span className="font-semibold text-yellow-200">Статус заявки на роль гида:</span> <span className="text-red-400">Отклонена</span></p>
                  )}
                  {user.role.includes('guide') && (
                    <>
                      <p className="text-base mb-2"><span className="font-semibold text-yellow-200">ФИО:</span> <span className="text-gray-300">{profile?.fullName || 'Не указано'}</span></p>
                      <p className="text-base mb-2"><span className="font-semibold text-yellow-200">Опыт:</span> <span className="text-gray-300">{profile?.experience || 'Не указано'}</span></p>
                      <p className="text-base mb-2"><span className="font-semibold text-yellow-200">Проживание:</span> <span className="text-gray-300">{profile?.residence || 'Не указано'}</span></p>
                      <p className="text-base mb-2"><span className="font-semibold text-yellow-200">Города работы:</span> <span className="text-gray-300">{profile?.cities || 'Не указано'}</span></p>
                      <p className="text-base mb-2"><span className="font-semibold text-yellow-200">Идеи:</span> <span className="text-gray-300">{profile?.ideas || 'Не указано'}</span></p>
                      <p className="text-base mb-2"><span className="font-semibold text-yellow-200">Описание фотографий:</span> <span className="text-gray-300">{profile?.photosDescription || 'Не указано'}</span></p>
                      <p className="text-base mb-2"><span className="font-semibold text-yellow-200">Дополнительно:</span> <span className="text-gray-300">{profile?.otherInfo || 'Не указано'}</span></p>
                      <div className="mt-4">
                        <h3 className="text-xl font-semibold mb-2 text-yellow-300">Мои экскурсии</h3>
                        {excursions.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {excursions.map(e => (
                              <li key={e.id} className="text-gray-300">{e.title}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400">У вас пока нет экскурсий.</p>
                        )}
                      </div>
                      <div className="mt-4">
                        <h3 className="text-xl font-semibold mb-2 text-yellow-300">Заказы на мои экскурсии</h3>
                        {guideBookings.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {guideBookings.map(b => (
                              <li key={b.id} className="text-gray-300">
                                {b.ticketCategory}, {new Date(b.dateTime).toLocaleString()}, Кол-во: {b.quantity}, Пользователь: <Link to={`/user/${b.userId}`} className="text-blue-400">{b.userId}</Link>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400">Нет заказов.</p>
                        )}
                      </div>
                    </>
                  )}
                  <button
                    onClick={handleEditProfile}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition mt-4"
                  >
                    Редактировать профиль
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition mt-4"
                  >
                    Выйти
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {user.role === 'admin' && (
          <div className="max-w-4xl mx-auto mt-12">
            <Tabs>
              <TabList className="flex space-x-4 mb-4 bg-gray-800 p-2 rounded-lg">
                <Tab className="cursor-pointer p-2 text-yellow-200 hover:bg-gray-700 rounded">Экскурсии</Tab>
                <Tab className="cursor-pointer p-2 text-yellow-200 hover:bg-gray-700 rounded">Достопримечательности</Tab>
                <Tab className="cursor-pointer p-2 text-yellow-200 hover:bg-gray-700 rounded">Организации</Tab>
                <Tab className="cursor-pointer p-2 text-yellow-200 hover:bg-gray-700 rounded">Пользователи</Tab>
              </TabList>

              <TabPanel>
                <div className="mb-4 flex space-x-4">
                  <input
                    type="text"
                    placeholder="По названию"
                    value={filters.excursion.title}
                    onChange={(e) => handleFilterChange('excursion', 'title', e.target.value)}
                    className="p-2 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
                  />
                  <input
                    type="text"
                    placeholder="По городу"
                    value={filters.excursion.city}
                    onChange={(e) => handleFilterChange('excursion', 'city', e.target.value)}
                    className="p-2 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
                  />
                </div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleAddExcursion}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Добавить экскурсию
                  </button>
                </div>
                {filteredExcursions.length > 0 ? (
                  <ul className="space-y-4">
                    {filteredExcursions.map(excursion => (
                      <li key={excursion.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-300">Название: {excursion.title}</p>
                        <p className="text-gray-300">Город: {excursion.city}</p>
                        <p className="text-gray-300">Цена: {excursion.price} BYN</p>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleEditExcursion(excursion.id)}
                            className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDeleteExcursion(excursion.id)}
                            className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                          >
                            Удалить
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">Экскурсий нет.</p>
                )}
              </TabPanel>

              <TabPanel>
                <div className="mb-4 flex space-x-4">
                  <input
                    type="text"
                    placeholder="По названию"
                    value={filters.attraction.name}
                    onChange={(e) => handleFilterChange('attraction', 'name', e.target.value)}
                    className="p-2 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
                  />
                  <input
                    type="text"
                    placeholder="По городу"
                    value={filters.attraction.city}
                    onChange={(e) => handleFilterChange('attraction', 'city', e.target.value)}
                    className="p-2 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
                  />
                </div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleAddAttraction}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Добавить достопримечательность
                  </button>
                </div>
                {filteredAttractions.length > 0 ? (
                  <ul className="space-y-4">
                    {filteredAttractions.map(attraction => (
                      <li key={attraction.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-300">Название: {attraction.name}</p>
                        <p className="text-gray-300">Город: {attraction.city}</p>
                        <p className="text-gray-300">Рейтинг: {attraction.rating || 'Нет'}</p>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleEditAttraction(attraction.id)}
                            className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDeleteAttraction(attraction.id)}
                            className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                          >
                            Удалить
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">Достопримечательностей нет.</p>
                )}
              </TabPanel>

              <TabPanel>
                <div className="mb-4 flex space-x-4">
                  <input
                    type="text"
                    placeholder="По названию"
                    value={filters.organization.name}
                    onChange={(e) => handleFilterChange('organization', 'name', e.target.value)}
                    className="p-2 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
                  />
                </div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleAddOrganization}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Добавить организацию
                  </button>
                </div>
                {filteredOrganizations.length > 0 ? (
                  <ul className="space-y-4">
                    {filteredOrganizations.map(organization => (
                      <li key={organization.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-300">Название: {organization.name}</p>
                        <p className="text-gray-300">Рейтинг: {organization.rating || 'Нет'}</p>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleEditOrganization(organization.id)}
                            className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDeleteOrganization(organization.id)}
                            className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                          >
                            Удалить
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">Организаций нет.</p>
                )}
              </TabPanel>

              <TabPanel>
                <div className="mb-4 flex space-x-4">
                  <input
                    type="text"
                    placeholder="По имени"
                    value={filters.user.name}
                    onChange={(e) => handleFilterChange('user', 'name', e.target.value)}
                    className="p-2 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
                  />
                  <input
                    type="text"
                    placeholder="По email"
                    value={filters.user.email}
                    onChange={(e) => handleFilterChange('user', 'email', e.target.value)}
                    className="p-2 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
                  />
                </div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleAddUser}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Добавить пользователя
                  </button>
                </div>
                {filteredUsers.length > 0 ? (
                  <ul className="space-y-4">
                    {filteredUsers.map(u => (
                      <li key={u.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-300">Имя: {u.name}</p>
                        <p className="text-gray-300">Email: {u.email}</p>
                        <p className="text-gray-300">Роль: {u.role}</p>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleEditUser(u.id)}
                            className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                          >
                            Удалить
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">Пользователей нет.</p>
                )}
              </TabPanel>
            </Tabs>
          </div>
        )}

        {user.role !== 'admin' && (
          <div className="max-w-2xl mx-auto mt-12">
            <h2 className="text-3xl font-bold text-center mb-6 text-yellow-300">История бронирований</h2>
            {userBookings.length > 0 ? (
              <div className="space-y-4">
                {userBookings.map(booking => (
                  <div key={booking.id} className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
                    <p className="text-base"><span className="font-semibold text-yellow-200">Экскурсия:</span> <span className="text-gray-300">{booking.excursion?.title || 'Не указано'}</span></p>
                    <p className="text-base"><span className="font-semibold text-yellow-200">Категория:</span> <span className="text-gray-300">{booking.ticketCategory}</span></p>
                    <p className="text-base"><span className="font-semibold text-yellow-200">Дата и время:</span> <span className="text-gray-300">{new Date(booking.dateTime).toLocaleString()}</span></p>
                    <p className="text-base"><span className="font-semibold text-yellow-200">Количество билетов:</span> <span className="text-gray-300">{booking.quantity}</span></p>
                    <p className="text-base"><span className="font-semibold text-yellow-200">Статус:</span> <span className="text-gray-300">{translateStatus(booking.status)}</span></p>
                    <p className="text-base"><span className="font-semibold text-yellow-200">Сумма:</span> <span className="text-gray-300">{booking.total} BYN</span></p>

                    {booking.status.toLowerCase() === 'pending' && new Date(booking.dateTime) > new Date() && (
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
                        >
                          Отменить
                        </button>
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          Редактировать
                        </button>
                      </div>
                    )}

                    {editingBooking === booking.id && (
                      <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 text-yellow-300">Редактировать бронирование</h3>
                        <select
                          name="ticketCategory"
                          value={editBookingForm.ticketCategory}
                          onChange={(e) => setEditBookingForm({ ...editBookingForm, ticketCategory: e.target.value })}
                          className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 mb-2"
                        >
                          <option value="">Выберите категорию</option>
                          {availableOptions.categories.map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <select
                          name="dateTime"
                          value={editBookingForm.dateTime}
                          onChange={(e) => setEditBookingForm({ ...editBookingForm, dateTime: e.target.value })}
                          className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 mb-2"
                        >
                          <option value="">Выберите дату и время</option>
                          {availableOptions.dates.map((date, idx) => (
                            <option key={idx} value={date}>{new Date(date).toLocaleString()}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          name="quantity"
                          value={editBookingForm.quantity}
                          onChange={(e) => {
                            const maxTickets = availableOptions.availableTicketsByDate[editBookingForm.dateTime]?.[editBookingForm.ticketCategory] || 0;
                            const currentQuantity = userBookings.find(b => b.id === editingBooking)?.quantity || 0;
                            const available = maxTickets + currentQuantity;
                            const newValue = Math.min(parseInt(e.target.value) || 1, available);
                            setEditBookingForm({ ...editBookingForm, quantity: newValue });
                          }}
                          min="1"
                          max={availableOptions.availableTicketsByDate[editBookingForm.dateTime]?.[editBookingForm.ticketCategory] ? (availableOptions.availableTicketsByDate[editBookingForm.dateTime][editBookingForm.ticketCategory] + (userBookings.find(b => b.id === editingBooking)?.quantity || 0)) : 1}
                          className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 mb-2"
                          placeholder="Количество билетов"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateBooking(booking.id)}
                            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                          >
                            Сохранить
                          </button>
                          <button
                            onClick={() => setEditingBooking(null)}
                            className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    )}

                    {booking.status.toLowerCase() === 'completed' && (
                      <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 text-yellow-300">Оставить отзыв</h3>
                        <div className="mb-2">
                          <span className="text-yellow-400">Рейтинг: </span>
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`cursor-pointer text-2xl ${i < reviewForm.rating ? 'text-yellow-400' : 'text-gray-500'}`}
                              onClick={() => handleStarClick(i + 1)}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <textarea
                          value={reviewForm.text}
                          onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                          className="w-full p-2 rounded-lg border border-gray-300 text-gray-800 mb-2"
                          placeholder="Ваш комментарий (опционально)"
                          rows="3"
                        />
                        <button
                          onClick={() => handleReviewSubmit(booking)}
                          className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                          disabled={!reviewForm.rating}
                        >
                          Отправить отзыв
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400">У вас пока нет бронирований.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;