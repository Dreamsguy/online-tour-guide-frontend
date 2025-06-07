import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Настройка иконок Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function CompanyDetail() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [error, setError] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    api.get(`/api/companies/${id}`)
      .then(res => setCompany(res.data))
      .catch(err => setError('Ошибка загрузки компании: ' + err.message));

    // Очистка карты при размонтировании
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [id]);

  if (error) return <div className="min-h-screen pt-24 text-center text-red-500">{error}</div>;
  if (!company) return <div className="min-h-screen pt-24 text-center">Загрузка...</div>;

  return (
    <div className="min-h-screen pt-24 bg-gray-100">
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-10">
          <h1 className="text-5xl font-bold text-center mb-8 text-gray-800">{company.name}</h1>
          <div className="space-y-4 text-lg text-gray-700">
            <p><span className="font-semibold">Описание:</span> {company.description}</p>
            <p><span className="font-semibold">Email:</span> {company.contactEmail}</p>
            <p><span className="font-semibold">Телефон:</span> {company.contactPhone}</p>
            <p><span className="font-semibold">Рейтинг:</span> {company.rating}</p>
          </div>
          {company.position && (
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Карта</h3>
              <MapContainer
                center={company.position}
                zoom={13}
                style={{ height: '500px', width: '100%', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)' }}
                whenCreated={map => {
                  mapRef.current = map;
                }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={company.position} />
              </MapContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompanyDetail;