import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Footer from './components/Footer';
import Home from './pages/Home';
import Excursions from './pages/Excursions';
import Attractions from './pages/Attractions';
import Login from './pages/Login';
import Profile from './pages/Profile';
import UserProfile from './components/UserProfile';
import ExcursionDetail from './pages/ExcursionDetail';
import AttractionDetail from './pages/AttractionDetail';
import ManagerPanel from './pages/ManagerPanel';
import ErrorBoundary from './components/ErrorBoundary';
import Register from './pages/Register';
import Notifications from './components/Notifications';
import ProtectedRoute from './components/ProtectedRoute';
import ExcursionBook from './pages/ExcursionBook';
import ForGuides from './pages/ForGuides';
import Organizations from './pages/Organizations';
import OrganizationsList from './components/OrganizationsList';
import AddExcursion from './components/AddExcursion';
import EditExcursion from './components/EditExcursion';
import AddOrganization from './components/AddOrganization';
import EditOrganization from './components/EditOrganization';
import AddUser from './components/AddUser';
import EditUser from './components/EditUser';
import UserProfileEdit from './components/UserProfileEdit'; // Новый компонент

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <ErrorBoundary>
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/excursions" element={<Excursions />} />
              <Route path="/attractions" element={<Attractions />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['user', 'admin', 'manager']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/:id"
                element={
                  <ProtectedRoute allowedRoles={['user', 'admin', 'manager']}>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserProfileEdit />
                  </ProtectedRoute>
                }
              />
              <Route path="/excursion/:id" element={<ExcursionDetail />} />
              <Route path="/attractions/:id" element={<AttractionDetail />} />
              <Route
                path="/manager"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Organizations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizations-list"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <OrganizationsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={['user', 'admin', 'manager']}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route path="/excursion/:id/book" element={<ExcursionBook />} />
              <Route path="/for-guides" element={<ForGuides />} />
              <Route
                path="/admin/add-excursion"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AddExcursion />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/edit-excursion/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EditExcursion />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/add-organization"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AddOrganization />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/edit-organization/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EditOrganization />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/add-user"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AddUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/edit-user/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EditUser />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </ErrorBoundary>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;