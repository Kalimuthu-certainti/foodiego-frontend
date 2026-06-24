import { useState } from 'react';
import api from '../lib/axios';
import { useLocationStore } from '../store/locationStore';

export const useLocationDetector = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { setLocation, setDetecting } = useLocationStore();

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setShowModal(true);
      return;
    }

    setDetecting(true);
    setIsDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await api.get('/api/diner/location/reverse-geocode', {
            params: { lat: coords.latitude, lng: coords.longitude },
          });
          setLocation(res.data.areaName, { lat: coords.latitude, lng: coords.longitude });
        } catch {
          setLocation('Current Location', { lat: coords.latitude, lng: coords.longitude });
        } finally {
          setDetecting(false);
          setIsDetecting(false);
        }
      },
      () => {
        setError('Location access denied');
        setShowModal(true);
        setDetecting(false);
        setIsDetecting(false);
      },
      { timeout: 10000 },
    );
  };

  return { isDetecting, error, showModal, setShowModal, detectLocation };
};
