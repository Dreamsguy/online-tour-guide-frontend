import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 w-full text-white shadow-lg z-50">
      <div className="container mx-auto flex items-center justify-between py-5 px-6">
        <Link to="/" className="text-3xl font-bold font-['Poppins',sans-serif] hover:text-[#C8102E] transition">BelarusGuide</Link>
        <div className="space-x-6">
          <Link to="/excursions" className="text-lg hover:text-[#C8102E] font-['Poppins',sans-serif] transition">Экскурсии</Link>
          <Link to="/attractions" className="text-lg hover:text-[#C8102E] font-['Poppins',sans-serif] transition">Достопримечательности</Link>
          <Link to="/promotions" className="text-lg hover:text-[#C8102E] font-['Poppins',sans-serif] transition">Акции</Link>
          <Link to="/companies" className="text-lg hover:text-[#C8102E] font-['Poppins',sans-serif] transition">Компании</Link>
          <Link to="/contacts" className="text-lg hover:text-[#C8102E] font-['Poppins',sans-serif] transition">Контакты</Link>
          {user && user.role === 'guide' && (
            <Link to="/guide-dashboard" className="text-lg hover:text-[#C8102E] font-['Poppins',sans-serif] transition">Панель гида</Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className="text-lg hover:text-[#C8102E] font-['Poppins',sans-serif] transition">Профиль</Link>
              <Link to="/settings" className="text-lg hover:text-[#C8102E] font-['Poppins',sans-serif] transition">Настройки</Link>
              <button onClick={handleLogout} className="text-lg hover:text-[#C8102E] font-['Poppins',sans-serif] transition">Выйти</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-lg hover:text-[#C8102E] font-['Poppins',sans-serif] transition">Войти</Link>
              <Link to="/register" className="text-lg hover:text-[#C8102E] font-['Poppins',sans-serif] transition">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;