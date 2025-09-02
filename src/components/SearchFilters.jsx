import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.jsx';

const SearchFilters = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    year_from: '',
    year_to: ''
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    const filterParams = {};
    
    if (filters.year_from) {
      filterParams.year_from = parseInt(filters.year_from);
    }
    
    if (filters.year_to) {
      filterParams.year_to = parseInt(filters.year_to);
    }
    
    onFilter(filterParams);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      year_from: '',
      year_to: ''
    });
    onFilter({});
    setIsOpen(false);
  };

  const hasActiveFilters = filters.year_from || filters.year_to;

  const formatYear = (year) => {
    if (!year) return '';
    const num = parseInt(year);
    if (isNaN(num)) return year;
    return num < 0 ? `${Math.abs(num)} до н.э.` : num.toString();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={`flex items-center space-x-2 ${hasActiveFilters ? 'border-blue-500 text-blue-600' : ''}`}
        >
          <Filter className="h-4 w-4" />
          <span>Фильтры</span>
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Фильтры поиска</h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-slate-500 hover:text-slate-700"
              >
                <X className="h-3 w-3 mr-1" />
                Очистить
              </Button>
            )}
          </div>

          {/* Фильтр по году начала */}
          <div className="space-y-2">
            <Label htmlFor="year_from">С года</Label>
            <Input
              id="year_from"
              type="number"
              value={filters.year_from}
              onChange={(e) => handleFilterChange('year_from', e.target.value)}
              placeholder="Например: -753 или 1492"
            />
            {filters.year_from && (
              <p className="text-xs text-slate-600">
                {formatYear(filters.year_from)}
              </p>
            )}
          </div>

          {/* Фильтр по году окончания */}
          <div className="space-y-2">
            <Label htmlFor="year_to">По год</Label>
            <Input
              id="year_to"
              type="number"
              value={filters.year_to}
              onChange={(e) => handleFilterChange('year_to', e.target.value)}
              placeholder="Например: 2024"
            />
            {filters.year_to && (
              <p className="text-xs text-slate-600">
                {formatYear(filters.year_to)}
              </p>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex space-x-2 pt-2">
            <Button onClick={applyFilters} className="flex-1">
              Применить
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchFilters;

