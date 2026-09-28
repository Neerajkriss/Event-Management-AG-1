import { useState } from 'react';
import {
  Send, MapPin, BadgePercent, Ticket,
} from 'lucide-react';
import type { Event, Offer } from '@/types';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/utils/format';

interface BookingModalProps {
  event: Event | null;
  offers: Offer[];
  open: boolean;
  onClose: () => void;
  onSubmitBooking: (tickets: number, notes: string) => void;
}

export default function BookingModal({
  event,
  offers,
  open,
  onClose,
  onSubmitBooking,
}: BookingModalProps) {
  const [bookingForm, setBookingForm] = useState({ tickets: 1, notes: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  if (!event) return null;

  const available = event.capacity - event.bookedCount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingForm.tickets < 1) {
      setBookingError('Please select at least 1 ticket.');
      return;
    }
    if (bookingForm.tickets > available) {
      setBookingError(`Only ${available} tickets available for this event.`);
      return;
    }
    onSubmitBooking(bookingForm.tickets, bookingForm.notes.trim());
    setBookingSuccess(true);
  };

  const handleClose = () => {
    setBookingSuccess(false);
    setBookingError('');
    setBookingForm({ tickets: 1, notes: '' });
    onClose();
  };

  if (bookingSuccess) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        title="Booking Requested!"
        description="Your booking request has been sent to the organizer."
        size="sm"
        footer={
          <button className="btn-primary" onClick={handleClose}>
            Done
          </button>
        }
      >
        <div className="flex flex-col items-center py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-100 text-success-600">
            <Ticket className="h-8 w-8" />
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Your request is now <span className="font-semibold text-warning-600">Pending</span>. The organizer will review and respond. You'll be able to pay once your booking is accepted.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Check "My Bookings" to track the status of your request.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={event.title}
      size="lg"
      footer={
        <button className="btn-primary" type="submit" form="booking-form">
          <Send className="h-4 w-4" />
          Request Booking
        </button>
      }
    >
      <div className="space-y-5">
        {/* Hero image */}
        <div className="relative h-48 overflow-hidden rounded-xl">
          <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-400">Date</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">{formatDate(event.startDate)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-400">Price</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">{formatCurrency(event.price)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-400">Available</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">{available}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-400">Capacity</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">{event.capacity}</p>
          </div>
        </div>

        {/* Organizer info */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-brand-50/30 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700">
            {event.organizerName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-xs text-gray-400">Organized by</p>
            <p className="text-sm font-semibold text-gray-900">{event.organizerName}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700">About This Event</h4>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{event.description}</p>
        </div>

        {/* Venue */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400" />
          {event.venue}, {event.location}
        </div>

        {/* Active offers */}
        {offers.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <BadgePercent className="h-4 w-4 text-accent-600" />
              Active Offers
            </h4>
            <div className="mt-2 space-y-2">
              {offers.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg border border-dashed border-accent-200 bg-accent-50/30 p-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{o.title}</p>
                    <p className="text-xs text-gray-500">{o.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold tracking-wider text-accent-700">{o.code}</span>
                    <p className="text-xs font-medium text-accent-600">{o.discountPercent}% off</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span key={tag} className="badge bg-gray-100 text-gray-600">#{tag}</span>
            ))}
          </div>
        )}

        {/* Booking form */}
        <div className="border-t border-gray-100 pt-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Ticket className="h-4 w-4" />
            Request Booking
          </h4>
          <form id="booking-form" onSubmit={handleSubmit} className="mt-3 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="bk-tickets">Number of Tickets</label>
                <input
                  id="bk-tickets"
                  type="number"
                  min="1"
                  max={available}
                  value={bookingForm.tickets}
                  onChange={(e) => setBookingForm((f) => ({ ...f, tickets: Number(e.target.value) }))}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="bk-date">Event Date</label>
                <input
                  id="bk-date"
                  type="text"
                  value={formatDate(event.startDate)}
                  disabled
                  className="input bg-gray-50 text-gray-500"
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="bk-notes">Notes (optional)</label>
              <textarea
                id="bk-notes"
                value={bookingForm.notes}
                onChange={(e) => setBookingForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="input resize-none"
                placeholder="Any special requests or notes for the organizer..."
              />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-brand-50 p-3">
              <span className="text-sm font-medium text-gray-600">Total Amount:</span>
              <span className="font-display text-lg font-bold text-brand-700">
                {formatCurrency(bookingForm.tickets * event.price)}
              </span>
            </div>
            {bookingError && <p className="text-sm text-error-600">{bookingError}</p>}
          </form>
        </div>
      </div>
    </Modal>
  );
}
