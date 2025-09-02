import { useState } from 'react';
import { Search, Plus, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useEvents } from './hooks/useEvents';
import Timeline from './components/Timeline';
import EventModal from './components/EventModal';
import SearchFilters from './components/SearchFilters';
import './App.css';

function App() {
  const { events, loading, error, createEvent, updateEvent, deleteEvent, fetchEvents } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [scale, setScale] = useState(1);

  // Фильтрация событий по поисковому запросу
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
      } else {
        await createEvent(eventData);
      }
      // После успешного сохранения закрываем модальное окно
      setIsModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error("Ошибка при сохранении события:", error);
      // Показываем ошибку пользователю
      alert(`Ошибка при сохранении события: ${error.message}`);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    console.log('🚨 handleDeleteEvent вызван с ID:', eventId);
    if (window.confirm('Вы уверены, что хотите удалить это событие?')) {
      console.log('🚨 Пользователь подтвердил удаление');
      try {
        console.log('🚨 Вызываем deleteEvent с ID:', eventId);
        await deleteEvent(eventId);
        console.log('🚨 deleteEvent завершен успешно');
      } catch (error) {
        console.error('🚨 Ошибка при удалении события:', error);
        // Показываем ошибку пользователю
        alert(`Ошибка при удалении события: ${error.message}`);
      }
    } else {
      console.log('🚨 Пользователь отменил удаление');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Загрузка событий...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Ошибка</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Перезагрузить
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Заголовок приложения */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-800">
                Интерактивная временная шкала
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <BarChart3 className="h-4 w-4" />
                <span>{events.length} событий</span>
              </div>
              
              <Button onClick={handleCreateEvent} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Добавить событие</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Панель поиска и фильтров */}
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Поиск событий..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <SearchFilters onFilter={fetchEvents} />
            </div>
          </CardContent>
        </Card>

        {/* Временная шкала */}
        <Timeline
          events={filteredEvents}
          scale={scale}
          onScaleChange={setScale}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      </div>

      {/* Модальное окно для создания/редактирования событий */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        event={editingEvent}
      />
    </div>
  );
}

export default App;

