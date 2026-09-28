import { useState, useMemo } from 'react';
import {
  ClipboardList, Check, X, Search, Calendar,
  Ticket, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { useAppData } from '@/hooks';
import type { Booking } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDateTime } from '@/utils/format';

type Filter = 'all' | 'pending' | 'confirmed' | 'attended' | 'cancelled';

const statusConfig: Record<Booking['status'], { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-warning-100 text-warning-700', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-success-100 text-success-700', icon: CheckCircle2 },
  attended: { label: 'Attended', color: 'bg-brand-100 text-brand-700', icon: CheckCircle2 },
  cancelled: { label: 'Rejected', color: 'bg-error-100 text-error-700', icon: AlertCircle },
};

export default function AdminBookingsPage() {
  const { bookings, updateBooking } = useAppData();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [bookings]
  );

  const filtered = useMemo(() => {
    return sortedBookings.filter((b) => {
      const matchesFilter = filter === 'all' || b.status === filter;
      const term = search.toLowerCase();
      const matchesSearch =
        b.id.toLowerCase().includes(term) ||
        b.userName.toLowerCase().includes(term) ||
        b.userEmail.toLowerCase().includes(term) ||
        b.eventTitle.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [sortedBookings, filter, search]);

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    attended: bookings.filter((b) => b.status === 'attended').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All Bookings', count: counts.all },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'confirmed', label: 'Confirmed', count: counts.confirmed },
    { id: 'attended', label: 'Attended', count: counts.attended },
    { id: 'cancelled', label: 'Rejected / Cancelled', count: counts.cancelled },
  ];

  const handleApprove = (bookingId: string) => {
    updateBooking(bookingId, { status: 'confirmed' });
  };

  const handleReject = (bookingId: string) => {
    updateBooking(bookingId, { status: 'cancelled' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings Management"
        description="Oversee and approve all customer event ticket bookings across the platform."
        icon={<ClipboardList className="h-5 w-5" />}
      />

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.pending}</p>
              <p className="mt-0.5 text-sm text-gray-500">Pending Review</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100 text-warning-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.confirmed}</p>
              <p className="mt-0.5 text-sm text-gray-500">Confirmed</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 text-success-600">
              <Check className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.attended}</p>
              <p className="mt-0.5 text-sm text-gray-500">Attended</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.cancelled}</p>
              <p className="mt-0.5 text-sm text-gray-500">Rejected / Cancelled</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-100 text-error-600">
              <X className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
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

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, user, event..."
            className="input py-2 pl-9 text-xs"
          />
        </div>
      </div>

      {/* Bookings Table */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<ClipboardList className="h-7 w-7" />}
            title="No bookings found"
            description="There are no bookings matching the selected filter or search criteria."
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3.5">Booking ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Event</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.map((b) => {
                  const config = statusConfig[b.status];
                  const StatusIcon = config.icon;

                  return (
                    <tr key={b.id} className="transition-colors hover:bg-gray-50/60">
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-semibold text-gray-700">
                        #{b.id}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                            {b.userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{b.userName}</p>
                            <p className="text-xs text-gray-500 truncate">{b.userEmail}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-xs">{b.eventTitle}</p>
                          <p className="flex items-center gap-1 text-xs text-gray-500">
                            <Ticket className="h-3 w-3" />
                            {b.tickets} ticket{b.tickets > 1 ? 's' : ''}
                          </p>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {formatDateTime(b.createdAt)}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-semibold text-gray-900">{formatCurrency(b.totalPrice)}</p>
                        <span className={`inline-block text-[11px] ${b.paid ? 'text-success-600 font-medium' : 'text-gray-400'}`}>
                          {b.paid ? '✓ Paid' : 'Unpaid'}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={`badge ${config.color} gap-1 shrink-0`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(b.id)}
                                className="inline-flex items-center gap-1 rounded-md bg-success-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-success-700 active:scale-95"
                                title="Approve booking"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(b.id)}
                                className="inline-flex items-center gap-1 rounded-md border border-error-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-error-600 transition hover:bg-error-50 active:scale-95"
                                title="Reject booking"
                              >
                                <X className="h-3.5 w-3.5" />
                                Reject
                              </button>
                            </>
                          )}

                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => handleReject(b.id)}
                              className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-error-50 hover:text-error-600 hover:border-error-200"
                              title="Cancel / Revoke booking"
                            >
                              <X className="h-3 w-3" />
                              Cancel
                            </button>
                          )}

                          {b.status === 'cancelled' && (
                            <button
                              onClick={() => handleApprove(b.id)}
                              className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-success-50 hover:text-success-600 hover:border-success-200"
                              title="Re-approve booking"
                            >
                              <Check className="h-3 w-3" />
                              Re-approve
                            </button>
                          )}

                          {b.status === 'attended' && (
                            <span className="text-xs text-gray-400 italic">Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
