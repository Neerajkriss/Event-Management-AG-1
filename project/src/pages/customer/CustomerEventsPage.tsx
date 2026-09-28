import { useState, useMemo } from 'react';
import { CalendarDays, Search } from 'lucide-react';
import { useAppData, useAuth } from '@/hooks';
import type { Event, Offer } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { EventCard, BookingModal } from '@/components/events';

type PriceFilter = 'all' | 'under-500' | '500-2000' | 'above-2000';

export default function CustomerEventsPage() {
  const { events, categories, offers, addBooking } = useAppData();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (e.status !== 'published') return false;
      const matchesSearch =
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase()) ||
        e.organizerName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || e.categoryId === categoryFilter;
      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'under-500' && e.price < 500) ||
        (priceFilter === '500-2000' && e.price >= 500 && e.price <= 2000) ||
        (priceFilter === 'above-2000' && e.price > 2000);
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [events, search, categoryFilter, priceFilter]);

  const getEventOffers = (eventId: string): Offer[] =>
    offers.filter((o) => o.eventId === eventId && o.status === 'active');

  const handleBookingSubmit = (tickets: number, notes: string) => {
    if (!selectedEvent || !user) return;
    addBooking({
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      tickets,
      totalPrice: tickets * selectedEvent.price,
      status: 'pending',
      paid: false,
      notes,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Browse Events"
        description="Discover events, check details, and request your booking."
        icon={<CalendarDays className="h-5 w-5" />}
      />

      {/* Search bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events, cities, or organizers..."
          className="input py-3 pl-11 text-base"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              categoryFilter === 'all' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                categoryFilter === c.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Price filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Price:</span>
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition focus:border-brand-500 focus:outline-none"
          >
            <option value="all">All Prices</option>
            <option value="under-500">Under ₹500</option>
            <option value="500-2000">₹500 - ₹2,000</option>
            <option value="above-2000">Above ₹2,000</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Event cards */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<CalendarDays className="h-7 w-7" />}
            title="No events found"
            description="Try adjusting your search or filter criteria."
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              offers={getEventOffers(evt.id)}
              onClick={() => setSelectedEvent(evt)}
            />
          ))}
        </div>
      )}

      {/* Modular Booking & Details Modal */}
      <BookingModal
        open={selectedEvent !== null}
        event={selectedEvent}
        offers={selectedEvent ? getEventOffers(selectedEvent.id) : []}
        onClose={() => setSelectedEvent(null)}
        onSubmitBooking={handleBookingSubmit}
      />
    </div>
  );
}
