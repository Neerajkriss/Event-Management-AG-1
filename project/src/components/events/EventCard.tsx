import { Building2, MapPin, CalendarDays, Users } from 'lucide-react';
import type { Event } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const available = event.capacity - event.bookedCount;

  return (
    <button
      onClick={onClick}
      className="card group overflow-hidden text-left transition-all duration-200 hover:shadow-cardhover"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {available <= 50 && available > 0 && (
          <div className="absolute left-3 top-3">
            <span className="badge bg-warning-500 text-white shadow-sm">
              Only {available} left
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-base font-bold text-gray-900 group-hover:text-brand-700">
          {event.title}
        </h3>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <Building2 className="h-3.5 w-3.5 text-gray-400" />
          by {event.organizerName}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 text-gray-400" />
          {event.venue}, {event.location}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
          <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
          {formatDate(event.startDate)}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
          <div>
            <p className="font-display text-lg font-bold text-gray-900">{formatCurrency(event.price)}</p>
            <p className="text-xs text-gray-400">per ticket</p>
          </div>
          <div className="text-right">
            <p className="flex items-center gap-1 text-xs font-medium text-gray-600">
              <Users className="h-3.5 w-3.5" />
              {available} available
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
