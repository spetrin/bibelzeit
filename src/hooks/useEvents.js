import { useState, useCallback, useEffect } from 'react';

// Конфигурация API с поддержкой переменных окружения
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Получение всех событий
  const fetchEvents = useCallback(async (searchParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (searchParams.search) queryParams.append('search', searchParams.search);
      if (searchParams.year_from) queryParams.append('year_from', searchParams.year_from);
      if (searchParams.year_to) queryParams.append('year_to', searchParams.year_to);
      
      const url = `${API_BASE_URL}/events${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events);
      } else {
        throw new Error(data.error || 'Ошибка при загрузке событий');
      }
    } catch (err) {
      setError(err.message);
      console.error('Ошибка при загрузке событий:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Создание нового события
  const createEvent = useCallback(async (eventData) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // После успешного создания на сервере добавляем событие в локальный стейт
        setEvents(prev => [...prev, data.event]);
        return data.event;
      } else {
        throw new Error(data.errors ? data.errors.join(', ') : data.error || 'Ошибка при создании события');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Обновление события
  const updateEvent = useCallback(async (eventId, eventData) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // После успешного обновления на сервере обновляем локальный стейт
        setEvents(prev => prev.map(event => 
          event.id === eventId ? data.event : event
        ));
        return data.event;
      } else {
        throw new Error(data.errors ? data.errors.join(', ') : data.error || 'Ошибка при обновлении события');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Удаление события
  const deleteEvent = useCallback(async (eventId) => {
    try {
      console.log('🔥 deleteEvent хук вызван с ID:', eventId);
      setError(null);
      
      const url = `${API_BASE_URL}/events/${eventId}`;
      console.log('🔥 Отправляем DELETE запрос на:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
      });
      
      console.log('🔥 Получен ответ:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('🔥 Данные ответа:', data);
      
      if (data.success) {
        console.log('🔥 Удаление успешно, обновляем локальный стейт');
        // Только после успешного удаления на сервере обновляем локальный стейт
        setEvents(prev => prev.filter(event => event.id !== eventId));
        console.log('🔥 Локальный стейт обновлен');
        return data.deleted_event;
      } else {
        throw new Error(data.error || 'Ошибка при удалении события');
      }
    } catch (err) {
      console.error('🔥 Ошибка в deleteEvent:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Получение статистики
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/stats`);
      const data = await response.json();
      
      if (data.success) {
        return data.stats;
      } else {
        throw new Error(data.error || 'Ошибка при загрузке статистики');
      }
    } catch (err) {
      console.error('Ошибка при загрузке статистики:', err);
      return null;
    }
  }, []);

  // Загрузка событий при монтировании компонента
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchStats,
  };
};

