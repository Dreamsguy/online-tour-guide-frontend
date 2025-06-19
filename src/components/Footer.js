import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Footer() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <footer className="footer">
      <div className="container mx-auto">
        <Link to="/" className="text-xl font-bold">
          Главная
        </Link>
        <div className="mt-4">
          <Link to="/excursions" className="animate-fade-in">
            Экскурсии
          </Link>
          <Link to="/attractions" className="animate-fade-in">
            Достопримечательности
          </Link>
          {/* Добавляем вкладку "Организации" для ролей manager и admin */}
          {(user?.role === 'manager' || user?.role === 'admin') && (
            <Link to="/organizations" className="animate-fade-in">
              Организации
            </Link>
          )}
          {user && (
            <>
              {user.role === 'guide' && (
                <Link to="/profile" className="animate-fade-in">
                  Панель гида
                </Link>
              )}
              {user.role === 'manager' && (
                <Link to="/manager" className="animate-fade-in">
                  Панель менеджера
                </Link>
              )}
              <Link to="/profile" className="animate-fade-in">
                Профиль
              </Link>
              <button onClick={handleLogout} className="animate-fade-in">
                Выйти
              </button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className="animate-fade-in">
                Войти
              </Link>
              <Link to="/register" className="animate-fade-in">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
       <p>© 2025 Все права защищены</p>
    </footer>
  );
}

export default Footer;