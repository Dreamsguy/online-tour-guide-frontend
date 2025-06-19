import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      setMessage(response.data.message || 'Инструкции отправлены на ваш email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка отправки запроса.');
    }
  };

  return (
    <div
      className="min-h-screen pt-0 bg-cover bg-center"
      style={{
        backgroundImage: "url('/Города Беларуси.jpg')",
        backgroundSize: 'cover',
        minHeight: '100vh',
      }}
    >
      <div className="bg-black bg-opacity-40 h-screen">
        <div className="container mx-auto py-12 px-4">
          <h1 className="text-7xl font-forum font-normal text-center mb-12 text-white tracking-[0.2em]">
            Восстановление пароля
          </h1>
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 mb-12 bg-opacity-80 relative">
            <div
              className="diamond w-30 h-30 bg-glass absolute"
              style={{ top: '-15px', left: '-15px' }}
            ></div>
            <div
              className="diamond w-30 h-30 bg-glass absolute"
              style={{ bottom: '-15px', right: '-15px' }}
            ></div>
            {error && (
              <p className="text-red-500 mb-4 text-xl text-center bg-red-900/30 p-4 rounded-lg">
                {error}
              </p>
            )}
            {message && (
              <p className="text-green-400 mb-4 text-xl text-center bg-green-900/30 p-4 rounded-lg">
                {message}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-2xl font-forum mb-2 text-yellow-400">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Введите ваш email"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-forum text-2xl"
              >
                Восстановить
              </button>
              <div className="text-center text-xl mt-4 text-gray-400 font-forum">
                <p className="mt-2">
                  <Link to="/login" className="text-yellow-400 hover:underline">
                    Вернуться к входу
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;