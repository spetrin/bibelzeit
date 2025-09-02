import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card } from '@/components/ui/card.jsx';
import EventCard from './EventCard';

const Timeline = ({ events, scale, onScaleChange, onEditEvent, onDeleteEvent }) => {
  const timelineRef = useRef(null);
  const [timelineHeight, setTimelineHeight] = useState(0);

  // Вычисление временного диапазона
  const getTimeRange = () => {
    if (events.length === 0) return { min: 0, max: 2024 };
    
    const years = events.flatMap(event => [
      event.year_start,
      event.year_end || event.year_start
    ]);
    
    const min = Math.min(...years);
    const max = Math.max(...years);
    
    // Добавляем отступы
    const padding = Math.max(100, (max - min) * 0.1);
    return { min: min - padding, max: max + padding };
  };

  const { min: minYear, max: maxYear } = getTimeRange();
  const totalYears = maxYear - minYear;

  // Вычисление позиции события на шкале с точной привязкой к меткам
  const getEventPosition = (year) => {
    const relativeYear = year - minYear;
    return (relativeYear / totalYears) * 100;
  };

  // Получение точной позиции метки времени для привязки событий
  const getMarkerPosition = (year) => {
    return getEventPosition(year);
  };

  // Обработка масштабирования
  const handleZoomIn = () => {
    onScaleChange(Math.min(scale * 1.5, 1000));
  };

  const handleZoomOut = () => {
    onScaleChange(Math.max(scale / 1.5, 0.1));
  };

  // Обновление высоты временной шкалы
  useEffect(() => {
    if (timelineRef.current) {
      const baseHeight = 800;
      setTimelineHeight(baseHeight * scale);
    }
  }, [scale, events]);

  // Цветовая палитра для событий
  const eventColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
  ];

  // Группировка событий по позиции с вычислением смещений и цветов
  const groupEventsByPosition = () => {
    const grouped = { left: [], right: [] };
    
    events.forEach((event, index) => {
      const side = event.position < 0 ? 'left' : 'right';
      grouped[side].push({
        ...event,
        index,
        yPosition: getMarkerPosition(event.year_start) // Точная привязка к метке времени
      });
    });

    // Сортировка по году для правильного отображения
    grouped.left.sort((a, b) => a.year_start - b.year_start);
    grouped.right.sort((a, b) => a.year_start - b.year_start);

    // Вычисление смещений для пересекающихся событий
    const calculateOffsets = (sideEvents) => {
      const processedEvents = [];
      
      sideEvents.forEach((event) => {
        // Находим события, которые пересекаются по времени с текущим
        const overlappingEvents = processedEvents.filter(processedEvent => {
          const eventStart = event.year_start;
          const eventEnd = event.year_end || event.year_start;
          const processedStart = processedEvent.year_start;
          const processedEnd = processedEvent.year_end || processedEvent.year_start;
          
          // Проверяем пересечение временных интервалов
          return !(eventEnd < processedStart || eventStart > processedEnd);
        });
        
        // Находим группы событий с близкими yPosition (в пределах 5%)
        const nearbyEvents = processedEvents.filter(processedEvent => {
          const yDiff = Math.abs(event.yPosition - processedEvent.yPosition);
          return yDiff < 5; // События считаются близкими, если разница позиций < 5%
        });
        
        // Определяем offsetIndex на основе пересекающихся и близких событий
        const conflictingEvents = [...new Set([...overlappingEvents, ...nearbyEvents])];
        const usedOffsets = conflictingEvents.map(e => e.offsetIndex || 0);
        
        let offsetIndex = 0;
        while (usedOffsets.includes(offsetIndex)) {
          offsetIndex++;
        }
        
        // Назначаем цвет на основе offsetIndex
        const colorIndex = offsetIndex % eventColors.length;
        
        processedEvents.push({
          ...event,
          offsetIndex,
          color: eventColors[colorIndex],
          isOverflowing: offsetIndex >= 3 // Флаг для событий, которые нужно скрыть в popover
        });
      });
      
      return processedEvents;
    };

    return {
      left: calculateOffsets(grouped.left),
      right: calculateOffsets(grouped.right)
    };
  };

  const groupedEvents = groupEventsByPosition();

  // Генерация меток времени
  const generateTimeMarkers = () => {
    const markers = [];
    const yearStep = Math.max(1, Math.floor(totalYears / (20 / scale)));
    
    for (let year = Math.ceil(minYear / yearStep) * yearStep; year <= maxYear; year += yearStep) {
      markers.push({
        year,
        position: getEventPosition(year),
        isEra: year === 0,
        isCentury: year % 100 === 0,
        isDecade: year % 10 === 0
      });
    }
    
    return markers;
  };

  const timeMarkers = generateTimeMarkers();

  return (
    <div className="relative">
      {/* Панель управления масштабом */}
      <Card className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30 p-2">
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 1000}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <div className="text-xs text-center text-slate-600 px-2">
            {Math.round(scale * 100)}%
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.1}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Временная шкала */}
      <div 
        ref={timelineRef}
        className="relative mx-auto max-w-6xl"
        style={{ height: `${timelineHeight}px`, minHeight: '800px' }}
      >
        {/* Отладочная информация */}
        <div className="fixed bottom-2 left-2 bg-white p-2 text-xs border rounded shadow-sm z-50">
          <div>Height: {timelineHeight}px</div>
          <div>Scale: {Math.round(scale * 100)}%</div>
          <div>Events: {events.length}</div>
        </div>
        {/* Центральная линия */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-blue-400 to-blue-600 h-full rounded-full shadow-lg">
          {/* Декоративные элементы на линии */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full shadow-lg"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full shadow-lg"></div>
        </div>

        {/* Метки времени */}
        {timeMarkers.map((marker) => (
          <div
            key={marker.year}
            className="absolute left-1/2 transform -translate-x-1/2 flex items-center"
            style={{ top: `${marker.position}%` }}
          >
            {/* Линия метки */}
            <div 
              className={`h-px bg-slate-300 ${
                marker.isEra ? 'w-32' : marker.isCentury ? 'w-24' : marker.isDecade ? 'w-16' : 'w-12'
              }`}
            />
            
            {/* Текст года */}
            <div 
              className={`ml-4 text-sm font-medium ${
                marker.isEra ? 'text-red-600 font-bold' : 
                marker.isCentury ? 'text-blue-600 font-semibold' : 
                'text-slate-600'
              }`}
            >
              {marker.year === 0 ? 'Н.Э.' : 
               marker.year < 0 ? `${Math.abs(marker.year)} до н.э.` : 
               marker.year}
            </div>
          </div>
        ))}

        {/* События слева - с учетом смещений */}
        <div className="absolute left-0 w-5/12 h-full" style={{ top: 0, bottom: 0 }}>
          {groupedEvents.left.map((event, index) => {
            // Вычисляем смещение влево для левой стороны
            const offsetX = event.offsetIndex * 20;
            
            // Показываем только первые 3 события, остальные в popover
            if (event.offsetIndex >= 3) return null;
            
            return (
              <div
                key={event.id}
                className="absolute flex items-center justify-end z-20"
                style={{ 
                  top: `${event.yPosition}%`,
                  right: `${16 + offsetX}px`, // Смещение влево (увеличиваем right)
                  transform: 'translateY(-50%)', // Центрирование карточки относительно позиции
                }}
              >
                <EventCard
                  event={event}
                  side="left"
                  onEdit={onEditEvent}
                  onDelete={onDeleteEvent}
                  color={event.color}
                />
                
                {/* Соединительная линия до центральной шкалы */}
                <div 
                  className="absolute top-1/2 h-px bg-slate-400 transform -translate-y-px"
                  style={{ 
                    right: `-${16 + offsetX}px`,
                    width: `${16 + offsetX}px`
                  }}
                ></div>
              </div>
            );
          })}
          
          {/* Отображение переполненных событий слева */}
          {groupedEvents.left.some(event => event.offsetIndex >= 3) && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {/* TODO: Добавить popover с переполненными событиями */}
            </div>
          )}
        </div>

        {/* События справа - с учетом смещений */}
        <div className="absolute right-0 w-5/12 h-full" style={{ top: 0, bottom: 0 }}>
          {groupedEvents.right.map((event, index) => {
            // Вычисляем смещение вправо для правой стороны
            const offsetX = event.offsetIndex * 20;
            
            // Показываем только первые 3 события, остальные в popover
            if (event.offsetIndex >= 3) return null;
            
            return (
              <div
                key={event.id}
                className="absolute flex items-center justify-start z-20"
                style={{ 
                  top: `${event.yPosition}%`,
                  left: `${16 + offsetX}px`, // Смещение вправо (увеличиваем left)
                  transform: 'translateY(-50%)', // Центрирование карточки относительно позиции
                }}
              >
                <EventCard
                  event={event}
                  side="right"
                  onEdit={onEditEvent}
                  onDelete={onDeleteEvent}
                  color={event.color}
                />
                
                {/* Соединительная линия до центральной шкалы */}
                <div 
                  className="absolute top-1/2 h-px bg-slate-400 transform -translate-y-px"
                  style={{ 
                    left: `-${16 + offsetX}px`,
                    width: `${16 + offsetX}px`
                  }}
                ></div>
              </div>
            );
          })}
          
          {/* Отображение переполненных событий справа */}
          {groupedEvents.right.some(event => event.offsetIndex >= 3) && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              {/* TODO: Добавить popover с переполненными событиями */}
            </div>
          )}
        </div>

        {/* Полоски для событий с длительностью между карточками */}
        {events.filter(event => event.is_period).map((event) => {
          const startPos = getEventPosition(event.year_start);
          const endPos = getEventPosition(event.year_end);
          const height = Math.abs(endPos - startPos);
          const side = event.position < 0 ? 'left' : 'right';
          
          // Находим соответствующее событие в группированных данных для получения смещения и цвета
          const groupedEvent = groupedEvents[side].find(e => e.id === event.id);
          const offsetX = groupedEvent ? groupedEvent.offsetIndex * 20 : 0;
          const eventColor = groupedEvent ? groupedEvent.color : 'bg-amber-500';
          
          // Показываем полоску только если событие не скрыто (offsetIndex < 3)
          if (groupedEvent && groupedEvent.offsetIndex >= 3) return null;
          
          // Преобразуем цвет из bg-color-500 в соответствующие градиенты
          const getGradientColors = (color) => {
            const colorMap = {
              'bg-blue-500': { from: 'from-blue-400', to: 'to-blue-600', solid: 'bg-blue-500' },
              'bg-green-500': { from: 'from-green-400', to: 'to-green-600', solid: 'bg-green-500' },
              'bg-purple-500': { from: 'from-purple-400', to: 'to-purple-600', solid: 'bg-purple-500' },
              'bg-red-500': { from: 'from-red-400', to: 'to-red-600', solid: 'bg-red-500' },
              'bg-yellow-500': { from: 'from-yellow-400', to: 'to-yellow-600', solid: 'bg-yellow-500' },
              'bg-pink-500': { from: 'from-pink-400', to: 'to-pink-600', solid: 'bg-pink-500' },
              'bg-indigo-500': { from: 'from-indigo-400', to: 'to-indigo-600', solid: 'bg-indigo-500' },
              'bg-teal-500': { from: 'from-teal-400', to: 'to-teal-600', solid: 'bg-teal-500' },
              'bg-orange-500': { from: 'from-orange-400', to: 'to-orange-600', solid: 'bg-orange-500' },
              'bg-cyan-500': { from: 'from-cyan-400', to: 'to-cyan-600', solid: 'bg-cyan-500' }
            };
            return colorMap[color] || { from: 'from-amber-400', to: 'to-amber-600', solid: 'bg-amber-500' };
          };
          
          const gradientColors = getGradientColors(eventColor);
          
          return (
            <div
              key={`period-${event.id}`}
              className={`absolute w-1 bg-gradient-to-b ${gradientColors.from} ${gradientColors.to} rounded-full opacity-80 shadow-md z-10`}
              style={{
                top: `${Math.min(startPos, endPos)}%`,
                height: `${height}%`,
                minHeight: '8px',
                [side === 'left' ? 'right' : 'left']: side === 'left' 
                  ? `calc(50% + 8px + ${offsetX}px)` 
                  : `calc(50% + 8px + ${offsetX}px)`
              }}
            >
              {/* Маркеры начала и конца с соответствующим цветом */}
              <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 ${gradientColors.solid} rounded-full border-2 border-white shadow-sm`}></div>
              <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 ${gradientColors.solid} rounded-full border-2 border-white shadow-sm`}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;

