import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5248',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request with token:', token.substring(0, 10) + '...');
    } else {
      console.warn('Токен отсутствует в localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', {
        url: error.config.url,
        status: error.response.status,
        data: error.response.data,
      });
      if (error.response.status === 401 && error.config.url !== '/api/auth/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        console.error('Доступ запрещён (403) для URL:', error.config.url);
        // Можно добавить уведомление или перенаправление, если нужно
      }
    }
    return Promise.reject(error);
  }
);

export default api;