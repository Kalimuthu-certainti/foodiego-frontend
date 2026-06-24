import { useState } from 'react';
import api from '../lib/axios';
import { useLocationStore } from '../store/locationStore';
import type { Location } from '../types/location';

export const useLocationDetector = () => {
  const setLocation = useLocationStore((s) => s.setLocation);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    setDetecting(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await api.get<{ data: Location }>('/location/nearest', {
            params: { lat: coords.latitude, lng: coords.longitude },
          });
          setLocation(res.data.data);
        } catch {
          setError('Could not find nearest location');
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setError('Location access denied');
        setDetecting(false);
      },
    );
  };

  return { detect, detecting, error };
};
