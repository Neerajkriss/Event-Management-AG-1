import { useState, useMemo } from 'react';
import { Star, Search, TrendingUp, ThumbsUp, MessageSquare, Calendar } from 'lucide-react';
import { useAppData } from '@/hooks';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { StarDisplay } from '@/components/ui/StarRating';
import { formatDateTime } from '@/utils/format';
import { calculateFeedbackMetrics } from '@/utils/calculations';

export default function AdminFeedbackPage() {
  const { feedback, events } = useAppData();
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return feedback.filter((f) => {
      const matchesSearch =
        f.userName.toLowerCase().includes(search.toLowerCase()) ||
        f.comment.toLowerCase().includes(search.toLowerCase()) ||
        f.eventTitle.toLowerCase().includes(search.toLowerCase());
      const matchesEvent = eventFilter === 'all' || f.eventId === eventFilter;
      return matchesSearch && matchesEvent;
    });
  }, [feedback, search, eventFilter]);

  const { avgRating, ratingDistribution, positiveCount, positivePercent } = useMemo(
    () => calculateFeedbackMetrics(feedback),
    [feedback]
  );

  const eventOptions = events.filter((e) => feedback.some((f) => f.eventId === e.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback & Ratings"
        description="Review user-submitted ratings and feedback for events across the platform."
        icon={<Star className="h-5 w-5" />}
      />

      {/* Summary stats */}
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
          <p className="mt-1 text-xs text-gray-500">Based on {feedback.length} reviews</p>
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
            <span className="font-display text-3xl font-bold text-gray-900">{feedback.length}</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Across {eventOptions.length} events</p>
        </div>
      </div>

      {/* Rating breakdown */}
      <div className="card p-5">
        <h3 className="font-display text-base font-bold text-gray-900">Rating Distribution</h3>
        <div className="mt-4 space-y-2">
          {ratingDistribution.map(({ star, count, percent }) => (
            <div key={star} className="flex items-center gap-3 text-sm">
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
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feedback..."
            className="input pl-10"
          />
        </div>
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="input sm:w-56"
        >
          <option value="all">All Events</option>
          {eventOptions.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
      </div>

      {/* Feedback cards */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Star className="h-7 w-7" />}
            title="No feedback found"
            description="User feedback and ratings will appear here once submitted."
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((fb) => (
            <div key={fb.id} className="card p-5 transition-all duration-200 hover:shadow-cardhover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
                    {fb.userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
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
              <div className="mt-3 rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500">{fb.eventTitle}</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{fb.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
