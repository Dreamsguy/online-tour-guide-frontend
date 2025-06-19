import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api/axios';

function TermsOfUseModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-forum text-yellow-400 mb-4">Условия использования</h2>
        <p className="text-gray-300">
          1. Пользователь обязан предоставлять достоверные данные при регистрации.<br/>
          2. Запрещено использовать платформу в коммерческих целях без согласия администрации.<br/>
          3. Все материалы, загружаемые на платформу, должны соответствовать законодательству Республики Беларусь.<br/>
          4. Администрация вправе удалить контент, нарушающий правила, без уведомления.<br/>
          5. Пользователь несёт ответственность за действия, совершённые на платформе.<br/>
          6. Любые споры решаются в соответствии с законодательством РБ.<br/>
          7. Использование платформы возможно только при соблюдении настоящих условий.<br/>
          8. Администрация не несёт ответственности за утерю данных из-за действий пользователя.<br/>
          9. Обновления условий могут быть внесены без предварительного уведомления.<br/>
          10. Пользователь соглашается с возможностью временного ограничения доступа при нарушении правил.<br/>
        </p>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}

function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const errors = {};
    if (!email) errors.email = 'Вы не указали почту.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Неверный формат email.';
    if (!name) errors.name = 'Вы не указали имя.';
    if (!password) errors.password = 'Вы не указали пароль.';
    else if (password.length < 6) errors.password = 'Пароль должен содержать минимум 6 символов.';
    if (!isPrivacyAgreed || !isTermsAgreed) errors.agreement = 'Вы должны согласиться с политикой конфиденциальности и условиями использования.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Исправьте ошибки в форме перед отправкой.');
      return;
    }
    setError('');
    setFieldErrors({});
    try {
      console.log('Sending registration:', { email, name, password });
      const response = await api.post('/api/auth/register', { email, name, password });
      if (response.data.message === 'Пользователь зарегистрирован') {
        const loginResponse = await api.post('/api/auth/login', { email, password });
        const { token, user } = loginResponse.data;
        login(token, user);
        setSuccessMessage('Регистрация завершена!');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(response.data.message || 'Ошибка регистрации');
      }
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Ошибка сервера');
    }
  };

  return (
    <div
      className="min-h-screen pt-0 bg-cover bg-center"
      style={{ backgroundImage: "url('/Города Беларуси.jpg')", backgroundSize: 'cover', minHeight: '100vh' }}
    >
      <div className="bg-black bg-opacity-40 min-h-screen">
        <div className="container mx-auto py-12 px-4">
          <h1 className="text-7xl font-forum font-normal text-center mb-12 text-white tracking-[0.2em]">
            Регистрация
          </h1>
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 mb-12 bg-opacity-80 relative" style={{ marginBottom: '4rem' }}>
            <div className="diamond w-30 h-30 bg-glass absolute" style={{ top: '-15px', left: '-15px' }}></div>
            <div className="diamond w-30 h-30 bg-glass absolute" style={{ bottom: '-15px', right: '-15px' }}></div>
            {error && (
              <p className="text-red-500 mb-4 text-xl text-center bg-red-900/30 p-4 rounded-lg">
                {error}
              </p>
            )}
            {successMessage && (
              <p className="text-green-400 mb-4 text-xl text-center bg-green-900/30 p-4 rounded-lg">
                {successMessage}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-2xl font-forum mb-2 text-yellow-400">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Введите ваш email"
                  required
                />
                {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block text-2xl font-forum mb-2 text-yellow-400">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Введите ваше имя"
                  required
                />
                {fieldErrors.name && <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-2xl font-forum mb-2 text-yellow-400">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Введите ваш пароль"
                  required
                />
                {fieldErrors.password && <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>}
              </div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={isPrivacyAgreed}
                  onChange={(e) => setIsPrivacyAgreed(e.target.checked)}
                  style={{ width: '20px !important', height: '20px !important', border: '2px solid #4B5563', backgroundColor: '#1F2937' }}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                  required
                />
                <label className="ml-2 text-lg text-gray-300 font-forum">
                  Согласен с{' '}
                  <a
                    href="https://pravo.by/document/?guid=3871&p0=H12100099"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-400 hover:underline"
                  >
                    политикой конфиденциальности
                  </a>{' '}
                  (Закон РБ № 99-З от 07.05.2021)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isTermsAgreed}
                  onChange={(e) => setIsTermsAgreed(e.target.checked)}
                  style={{ width: '20px !important', height: '20px !important', border: '2px solid #4B5563', backgroundColor: '#1F2937' }}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                  required
                />
                <label className="ml-2 text-lg text-gray-300 font-forum">
                  Согласен с{' '}
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}
                    className="text-yellow-400 hover:underline"
                  >
                    условиями использования
                  </a>
                </label>
              </div>
              {fieldErrors.agreement && <p className="text-red-500 text-sm mt-1 text-center">{fieldErrors.agreement}</p>}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-forum text-2xl"
                disabled={false} 
              >
                Зарегистрироваться
              </button>
              <div className="text-center text-xl mt-4 text-gray-400 font-forum">
                <p>
                  Уже есть аккаунт?{' '}
                  <Link to="/login" className="text-yellow-400 hover:underline">Войти</Link>
                </p>
                <p className="mt-2">
                  Забыли пароль?{' '}
                  <Link to="/forgot-password" className="text-yellow-400 hover:underline">Восстановить</Link>
                </p>
                <p className="mt-2">
                  <Link to="/" className="text-yellow-400 hover:underline">Главная</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showTermsModal && <TermsOfUseModal onClose={() => setShowTermsModal(false)} />}
    </div>
  );
}

export default Register;