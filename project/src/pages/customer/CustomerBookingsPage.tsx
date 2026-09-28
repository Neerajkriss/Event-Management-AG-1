import { useState, useMemo } from 'react';
import {
  Ticket, Check, X, Clock, IndianRupee,
  CheckCircle2, Download, Calendar, MapPin,
} from 'lucide-react';
import { useAppData, useAuth } from '@/hooks';
import type { Booking } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { PaymentModal, ReceiptModal } from '@/components/bookings';
import { formatCurrency, formatDateTime, formatDate } from '@/utils/format';

type Filter = 'all' | 'pending' | 'confirmed' | 'attended' | 'cancelled';

const statusConfig: Record<Booking['status'], { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-warning-100 text-warning-700', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-success-100 text-success-700', icon: CheckCircle2 },
  attended: { label: 'Attended', color: 'bg-brand-100 text-brand-700', icon: CheckCircle2 },
  cancelled: { label: 'Rejected', color: 'bg-error-100 text-error-700', icon: X },
};

export default function CustomerBookingsPage() {
  const { bookings, events, updateBooking } = useAppData();
  const { user } = useAuth();

  const [filter, setFilter] = useState<Filter>('all');
  const [payBooking, setPayBooking] = useState<Booking | null>(null);
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);

  const myBookings = useMemo(
    () => bookings.filter((b) => b.userId === user?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [bookings, user],
  );

  const filtered = myBookings.filter((b) => filter === 'all' || b.status === filter);

  const counts = {
    all: myBookings.length,
    pending: myBookings.filter((b) => b.status === 'pending').length,
    confirmed: myBookings.filter((b) => b.status === 'confirmed').length,
    attended: myBookings.filter((b) => b.status === 'attended').length,
    cancelled: myBookings.filter((b) => b.status === 'cancelled').length,
  };

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'confirmed', label: 'Confirmed', count: counts.confirmed },
    { id: 'attended', label: 'Attended', count: counts.attended },
    { id: 'cancelled', label: 'Rejected', count: counts.cancelled },
  ];

  const getEvent = (eventId: string) => events.find((e) => e.id === eventId);

  const handleConfirmPayment = (bookingId: string) => {
    updateBooking(bookingId, { paid: true, status: 'confirmed' });
    const target = myBookings.find((b) => b.id === bookingId);
    if (target) {
      setReceiptBooking({ ...target, paid: true, status: 'confirmed' });
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    updateBooking(bookingId, { status: 'cancelled' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        description="Track your event ticket bookings, make payments, and view receipts."
        icon={<Ticket className="h-5 w-5" />}
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === f.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>{f.label}</span>
            <span className={`badge ${filter === f.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-600'}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Ticket className="h-7 w-7" />}
            title="No bookings found"
            description="You don't have any bookings matching this filter."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const evt = getEvent(b.eventId);
            const config = statusConfig[b.status];
            const StatusIcon = config.icon;

            return (
              <div key={b.id} className="card p-5 transition-all duration-200 hover:shadow-cardhover">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-400">#{b.id}</span>
                      <span className={`badge ${config.color} shrink-0`}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </span>
                      {b.paid && (
                        <span className="badge bg-success-50 text-success-700">
                          <Check className="h-3 w-3" />
                          Paid
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-lg font-bold text-gray-900">{b.eventTitle}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      {evt && (
                        <>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {formatDate(evt.startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            {evt.venue}, {evt.location}
                          </span>
                        </>
                      )}
                      <span className="flex items-center gap-1">
                        <Ticket className="h-3.5 w-3.5 text-gray-400" />
                        {b.tickets} ticket{b.tickets > 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5 text-gray-400" />
                        {formatCurrency(b.totalPrice)}
                      </span>
                    </div>

                    {b.notes && (
                      <p className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
                        <span className="font-medium">Note:</span> {b.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    {/* Pay button: shown for confirmed but unpaid */}
                    {b.status === 'confirmed' && !b.paid && (
                      <button className="btn-primary text-xs" onClick={() => setPayBooking(b)}>
                        <IndianRupee className="h-3.5 w-3.5" />
                        Pay Now ({formatCurrency(b.totalPrice)})
                      </button>
                    )}

                    {/* View Receipt button: shown if paid */}
                    {b.paid && (
                      <button className="btn-secondary text-xs" onClick={() => setReceiptBooking(b)}>
                        <Download className="h-3.5 w-3.5" />
                        View Receipt
                      </button>
                    )}

                    {/* Cancel button: pending bookings can be cancelled */}
                    {b.status === 'pending' && (
                      <button className="btn-danger text-xs" onClick={() => handleCancelBooking(b.id)}>
                        <X className="h-3.5 w-3.5" />
                        Cancel Request
                      </button>
                    )}

                    <span className="text-xs text-gray-400">Booked {formatDateTime(b.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modular Payment Modal */}
      <PaymentModal
        booking={payBooking}
        open={payBooking !== null}
        onClose={() => setPayBooking(null)}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Modular Receipt Modal */}
      <ReceiptModal
        booking={receiptBooking}
        open={receiptBooking !== null}
        onClose={() => setReceiptBooking(null)}
      />
    </div>
  );
}
