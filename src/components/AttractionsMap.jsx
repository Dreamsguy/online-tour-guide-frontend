import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import L from 'leaflet';

const AttractionsMap = () => {
  const [attractions, setAttractions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const response = await api.get('/api/admin/attractions');
        setAttractions(response.data);
      } catch (err) {
        console.error('Ошибка загрузки достопримечательностей:', err);
      }
    };
    fetchAttractions();
  }, []);

  return (
    <MapContainer center={[53.9, 27.5667]} zoom={10} style={{ height: '600px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {attractions.map((attraction) => {
        const coords = attraction.coordinates ? JSON.parse(attraction.coordinates) : null;
        if (!coords || !coords.lat || !coords.lng) return null;
        return (
          <Marker key={attraction.id} position={[coords.lat, coords.lng]}>
            <Popup>
              <h3>{attraction.name}</h3>
              <p>{attraction.city}</p>
              <button onClick={() => navigate(`/attraction/${attraction.id}`)}>Подробнее</button>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default AttractionsMap;