import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './AuthContext';
import './global.css'; // Подключение глобальных стилей (без фона)

const root = ReactDOM.createRoot(document.getElementById('root'));

// Устанавливаем стиль для body через JavaScript
document.body.style.position = 'relative';
document.body.style.minHeight = '100vh';
document.body.style.zIndex = '-2';

// Добавляем затемнение
const overlay = document.createElement('div');
overlay.style.position = 'fixed';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.height = '100%';
overlay.style.background = 'rgba(0, 0, 0, 0.6)';
overlay.style.zIndex = '-1';
document.body.appendChild(overlay);

root.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);