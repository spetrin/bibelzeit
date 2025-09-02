import { StickyNote, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx';

const NotesModal = ({ isOpen, onClose, event }) => {
  if (!event) return null;

  const formatYear = (year) => {
    if (year === 0) return 'Н.Э.';
    return year < 0 ? `${Math.abs(year)} до н.э.` : year.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <StickyNote className="h-5 w-5 text-blue-600" />
            <span>Заметки к событию</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Информация о событии */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-2">{event.title}</h3>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4" />
              <span>
                {formatYear(event.year_start)}
                {event.is_period && (
                  <>
                    {' - '}
                    {formatYear(event.year_end)}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Заметки */}
          <div className="space-y-2">
            <h4 className="font-medium text-slate-700">Заметки:</h4>
            <div className="bg-white border rounded-lg p-4 min-h-[100px]">
              {event.notes ? (
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {event.notes}
                </p>
              ) : (
                <p className="text-slate-400 italic">Заметки отсутствуют</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesModal;

