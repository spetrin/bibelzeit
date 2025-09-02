import { useState } from 'react';
import { Edit2, Trash2, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import NotesModal from './NotesModal';

const EventCard = ({ event, side, onEdit, onDelete, color }) => {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatYear = (year) => {
    if (year === 0) return 'Н.Э.';
    return year < 0 ? `${Math.abs(year)} до н.э.` : year.toString();
  };

  const getEventPeriod = () => {
    if (!event.is_period) return formatYear(event.year_start);
    return `${formatYear(event.year_start)} - ${formatYear(event.year_end)}`;
  };

  // Получаем цвет для карточки
  const getCardColor = () => {
    if (color) {
      // Преобразуем bg-color-500 в соответствующие классы
      const colorName = color.replace('bg-', '').replace('-500', '');
      return {
        background: event.is_period ? `${colorName}-50` : 'white',
        border: `${colorName}-200`,
        accent: `${colorName}-500`
      };
    }
    
    // Дефолтные цвета
    return {
      background: event.is_period ? 'amber-50' : 'white',
      border: event.is_period ? 'amber-200' : 'slate-200',
      accent: event.is_period ? 'amber-500' : 'blue-500'
    };
  };

  const cardColors = getCardColor();

  return (
    <>
      {/* Компактная карточка события */}
      <div 
        className={`
          relative flex items-center px-3 py-1 rounded-md text-sm
          transition-all duration-200 cursor-pointer group
          ${isHovered ? 'shadow-md scale-105 z-10' : 'shadow-sm'}
          hover:shadow-md hover:scale-105
          max-w-xs
        `}
        style={{
          backgroundColor: color ? `rgb(var(--${cardColors.background}))` : (event.is_period ? '#fefbf3' : 'white'),
          borderColor: color ? `rgb(var(--${cardColors.border}))` : (event.is_period ? '#fed7aa' : '#e2e8f0'),
          borderWidth: '1px',
          borderStyle: 'solid',
          minHeight: '28px' // Примерно одна строка текста 14px + padding
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Цветовой индикатор */}
        {color && (
          <div 
            className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${color}`}
          />
        )}
        {/* Основное содержимое карточки */}
        <div className="flex-1 min-w-0">
          {/* Название события */}
          <div className="font-medium text-slate-800 truncate text-sm leading-tight">
            {event.title}
          </div>
          
          {/* Период/год */}
          <div className="text-xs text-slate-600 truncate">
            {getEventPeriod()}
          </div>
        </div>

        {/* Кнопки управления - появляются при наведении */}
        <div className={`
          flex items-center space-x-1 ml-2 transition-opacity duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          {/* Кнопка заметок */}
          {event.notes && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsNotesOpen(true);
              }}
              className="h-5 w-5 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              <StickyNote className="h-3 w-3" />
            </Button>
          )}
          
          {/* Кнопка редактирования */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(event);
            }}
            className="h-5 w-5 p-0 text-slate-600 hover:text-slate-700 hover:bg-slate-100"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          
          {/* Кнопка удаления */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              console.log('🗑️ Клик по кнопке удаления, event.id:', event.id);
              e.stopPropagation();
              console.log('🗑️ Вызываем onDelete с ID:', event.id);
              onDelete(event.id);
              console.log('🗑️ onDelete вызван');
            }}
            className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Индикатор события с длительностью */}
        {event.is_period && (
          <div className={`
            absolute ${side === 'left' ? '-right-1' : '-left-1'} top-1/2 transform -translate-y-1/2 
            w-1 h-4 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full opacity-70
          `}></div>
        )}
      </div>

      {/* Модальное окно заметок */}
      <NotesModal
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        event={event}
      />
    </>
  );
};

export default EventCard;

