import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen pt-24 text-center text-gray-300">Загрузка...</div>;
  }

  if (!user || !user.role) {
    console.log('ProtectedRoute: Пользователь не авторизован, перенаправление на /login');
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role.toLowerCase())) {
    console.log(`ProtectedRoute: Роль ${user.role} не разрешена, перенаправление на /`);
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;