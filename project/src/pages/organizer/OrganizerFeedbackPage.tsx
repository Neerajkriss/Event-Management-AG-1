import { useState, useMemo } from 'react';
import { Star, Search, TrendingUp, ThumbsUp, MessageSquare, Calendar } from 'lucide-react';
import { useAppData, useAuth } from '@/hooks';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { StarDisplay } from '@/components/ui/StarRating';
import { formatDateTime } from '@/utils/format';
import { calculateFeedbackMetrics } from '@/utils/calculations';

export default function OrganizerFeedbackPage() {
  const { feedback, events } = useAppData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');

  // Filter events belonging to this organizer
  const myEvents = useMemo(
    () => events.filter((e) => e.organizerId === user?.id),
    [events, user],
  );

  const myEventIds = useMemo(
    () => new Set(myEvents.map((e) => e.id)),
    [myEvents],
  );

  // Filter feedback only for events belonging to this organizer
  const myFeedback = useMemo(
    () => feedback.filter((f) => myEventIds.has(f.eventId)),
    [feedback, myEventIds],
  );

  const filtered = useMemo(() => {
    return myFeedback.filter((f) => {
      const matchesSearch =
        f.userName.toLowerCase().includes(search.toLowerCase()) ||
        f.comment.toLowerCase().includes(search.toLowerCase()) ||
        f.eventTitle.toLowerCase().includes(search.toLowerCase());
      const matchesEvent = eventFilter === 'all' || f.eventId === eventFilter;
      const matchesStar = starFilter === 'all' || f.rating === starFilter;
      return matchesSearch && matchesEvent && matchesStar;
    });
  }, [myFeedback, search, eventFilter, starFilter]);

  const { avgRating, ratingDistribution, positiveCount, positivePercent } = useMemo(
    () => calculateFeedbackMetrics(myFeedback),
    [myFeedback],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Reviews & Ratings"
        description="Monitor customer feedback and star ratings submitted for your organized events."
        icon={<Star className="h-5 w-5" />}
      />

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Average Rating</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-50 text-warning-600">
              <Star className="h-5 w-5 fill-warning-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-gray-900">{avgRating}</span>
            <span className="text-sm text-gray-400">/ 5.0</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Based on {myFeedback.length} customer reviews</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Positive Reviews</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-50 text-success-600">
              <ThumbsUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-gray-900">{positivePercent}%</span>
            <span className="badge bg-success-50 text-success-700">
              <TrendingUp className="h-3 w-3" />
              {positiveCount} reviews
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Rated 4 stars and above</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Feedback</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display text-3xl font-bold text-gray-900">{myFeedback.length}</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Across {myEvents.length} events</p>
        </div>
      </div>

      {/* Rating Breakdown */}
      {myFeedback.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-gray-900">Rating Distribution</h3>
            {starFilter !== 'all' && (
              <button
                onClick={() => setStarFilter('all')}
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                Clear rating filter
              </button>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {ratingDistribution.map(({ star, count, percent }) => (
              <button
                key={star}
                type="button"
                onClick={() => setStarFilter(starFilter === star ? 'all' : star)}
                className={`flex w-full items-center gap-3 rounded-lg p-1.5 text-left text-sm transition ${
                  starFilter === star ? 'bg-brand-50/70 font-semibold' : 'hover:bg-gray-50'
                }`}
              >
                <span className="flex w-12 items-center gap-1 font-medium text-gray-700">
                  {star} <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-warning-400 to-warning-500 px-2 transition-all duration-500"
                    style={{ width: `${Math.max(percent, count > 0 ? 8 : 0)}%` }}
                  >
                    {count > 0 && <span className="text-xs font-semibold text-white">{count}</span>}
                  </div>
                </div>
                <span className="w-12 text-right text-xs text-gray-400">{percent}%</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by attendee, comment, or event..."
            className="input pl-10"
          />
        </div>
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="input sm:w-60"
        >
          <option value="all">All Events ({myEvents.length})</option>
          {myEvents.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {/* Reviews list */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Star className="h-7 w-7" />}
            title={myFeedback.length === 0 ? 'No reviews yet' : 'No matching feedback'}
            description={
              myFeedback.length === 0
                ? 'Attendees will be able to review your events after attending. Check back soon!'
                : 'Try adjusting your search query or filters to find specific feedback.'
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((fb) => (
            <div key={fb.id} className="card p-5 transition-all duration-200 hover:shadow-cardhover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
                    {fb.userName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{fb.userName}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {formatDateTime(fb.createdAt)}
                    </p>
                  </div>
                </div>
                <StarDisplay rating={fb.rating} size="lg" />
              </div>
              <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50/70 p-2.5">
                <p className="text-xs font-medium text-gray-600">
                  Event: <span className="font-semibold text-gray-900">{fb.eventTitle}</span>
                </p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{fb.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
