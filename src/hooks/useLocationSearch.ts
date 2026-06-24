import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { debounce } from '../utils/debounce';
import type { Location } from '../types/location';

export const useLocationSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const search = debounce(async (q: string) => {
      setLoading(true);
      try {
        const res = await api.get<{ data: Location[] }>('/location', { params: { q } });
        setResults(res.data.data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    search(query);
  }, [query]);

  return { query, setQuery, results, loading };
};
