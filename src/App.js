import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Excursions from './pages/Excursions';
import ExcursionDetail from './pages/ExcursionDetail'; // Добавлен импорт
import Attractions from './pages/Attractions';
import AttractionDetail from './pages/AttractionDetail';
import Promotions from './pages/Promotions';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail'; // Добавлен импорт
import Contacts from './pages/Contacts';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Booking from './pages/Booking';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import GuidePanel from './pages/GuidePanel';
import ManagerPanel from './pages/ManagerPanel';
import './index.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/excursions" element={<Excursions />} />
          <Route path="/excursion/:id" element={<ExcursionDetail />} />
          <Route path="/attractions" element={<Attractions />} />
          <Route path="/attractions/:id" element={<AttractionDetail />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/company/:id" element={<CompanyDetail />} /> {/* Добавлен маршрут */}
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/guide" element={<GuidePanel />} />
          <Route path="/manager" element={<ManagerPanel />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;