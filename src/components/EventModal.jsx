import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Slider } from '@/components/ui/slider.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx';

const EventModal = ({ isOpen, onClose, onSave, event }) => {
  const [formData, setFormData] = useState({
    title: '',
    year_start: '',
    year_end: '',
    position: 0,
    notes: '',
    is_period: false
  });
  const [errors, setErrors] = useState({});

  // Заполнение формы при редактировании
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        year_start: event.year_start?.toString() || '',
        year_end: event.year_end?.toString() || '',
        position: event.position || 0,
        notes: event.notes || '',
        is_period: event.is_period || false
      });
    } else {
      setFormData({
        title: '',
        year_start: '',
        year_end: '',
        position: 0,
        notes: '',
        is_period: false
      });
    }
    setErrors({});
  }, [event, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очистка ошибки при изменении поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название события обязательно';
    }

    if (!formData.year_start) {
      newErrors.year_start = 'Год начала события обязателен';
    } else {
      const yearStart = parseInt(formData.year_start);
      if (isNaN(yearStart)) {
        newErrors.year_start = 'Год должен быть числом';
      }
    }

    if (formData.is_period && formData.year_end) {
      const yearStart = parseInt(formData.year_start);
      const yearEnd = parseInt(formData.year_end);
      
      if (isNaN(yearEnd)) {
        newErrors.year_end = 'Год должен быть числом';
      } else if (yearEnd < yearStart) {
        newErrors.year_end = 'Год окончания не может быть раньше года начала';
      }
    }

    if (Math.abs(formData.position) > 100) {
      newErrors.position = 'Позиция должна быть от -100 до +100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const eventData = {
      title: formData.title.trim(),
      year_start: parseInt(formData.year_start),
      year_end: formData.is_period && formData.year_end ? parseInt(formData.year_end) : null,
      position: formData.position,
      notes: formData.notes.trim() || null
    };

    onSave(eventData);
  };

  const formatYear = (year) => {
    if (!year) return '';
    const num = parseInt(year);
    if (isNaN(num)) return year;
    return num < 0 ? `${Math.abs(num)} до н.э.` : num.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>{event ? 'Редактировать событие' : 'Создать событие'}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Название события */}
          <div className="space-y-2">
            <Label htmlFor="title">Название события *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Введите название события"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Год начала */}
          <div className="space-y-2">
            <Label htmlFor="year_start">Год начала *</Label>
            <Input
              id="year_start"
              type="number"
              value={formData.year_start}
              onChange={(e) => handleInputChange('year_start', e.target.value)}
              placeholder="Например: -753 (для 753 г. до н.э.) или 1492"
              className={errors.year_start ? 'border-red-500' : ''}
            />
            {formData.year_start && (
              <p className="text-sm text-slate-600">
                {formatYear(formData.year_start)}
              </p>
            )}
            {errors.year_start && (
              <p className="text-sm text-red-600">{errors.year_start}</p>
            )}
          </div>

          {/* Событие с периодом */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_period"
              checked={formData.is_period}
              onCheckedChange={(checked) => handleInputChange('is_period', checked)}
            />
            <Label htmlFor="is_period">Событие с длительностью</Label>
          </div>

          {/* Год окончания */}
          {formData.is_period && (
            <div className="space-y-2">
              <Label htmlFor="year_end">Год окончания</Label>
              <Input
                id="year_end"
                type="number"
                value={formData.year_end}
                onChange={(e) => handleInputChange('year_end', e.target.value)}
                placeholder="Год окончания события"
                className={errors.year_end ? 'border-red-500' : ''}
              />
              {formData.year_end && (
                <p className="text-sm text-slate-600">
                  {formatYear(formData.year_end)}
                </p>
              )}
              {errors.year_end && (
                <p className="text-sm text-red-600">{errors.year_end}</p>
              )}
            </div>
          )}

          {/* Позиция на шкале */}
          <div className="space-y-3">
            <Label className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Позиция на шкале: {formData.position}</span>
            </Label>
            <Slider
              value={[formData.position]}
              onValueChange={(value) => handleInputChange('position', value[0])}
              min={-100}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Левая сторона (-100)</span>
              <span>Центр (0)</span>
              <span>Правая сторона (+100)</span>
            </div>
            {errors.position && (
              <p className="text-sm text-red-600">{errors.position}</p>
            )}
          </div>

          {/* Заметки */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Заметки</span>
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Дополнительная информация о событии..."
              rows={3}
            />
          </div>

          {/* Кнопки */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">
              {event ? 'Сохранить изменения' : 'Создать событие'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;

