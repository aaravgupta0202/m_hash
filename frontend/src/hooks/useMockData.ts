import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useMockData<T>(appName: string, initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get(`/mock/${appName}`);
      setData(response.data);
    } catch (e) {
      console.error(`Failed to fetch mock data for ${appName}`, e);
    } finally {
      setLoading(false);
    }
  }, [appName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateData = useCallback(async (newData: T) => {
    // Optimistic update
    setData(newData);
    try {
      await api.put(`/mock/${appName}`, newData);
    } catch (e) {
      console.error(`Failed to update mock data for ${appName}`, e);
      // Revert on error could be implemented here
    }
  }, [appName]);

  return { data, updateData, loading, refresh: fetchData };
}
