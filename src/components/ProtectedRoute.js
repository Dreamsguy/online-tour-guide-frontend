import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen pt-24 text-center text-gray-300">Загрузка...</div>;
  }

  if (!user || !user.role) {
    console.log('ProtectedRoute: Пользователь не авторизован или роль отсутствует, перенаправление на /login', { user });
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role.toLowerCase();
  if (!allowedRoles.includes(userRole)) {
    console.log(`ProtectedRoute: Роль ${userRole} не разрешена для маршрута, перенаправление на /`, { allowedRoles, user });
    return <Navigate to="/" replace />;
  }

  console.log(`ProtectedRoute: Доступ разрешён для роли ${userRole}`, { allowedRoles, user });
  return children;
}

export default ProtectedRoute;