import type { Booking, Event, Feedback } from '@/types';

export interface RevenueBreakdown {
  totalRevenue: number;
  totalTickets: number;
  pendingRevenue: number;
  refundedRevenue: number;
  avgOrderValue: number;
  confirmedCount: number;
}

export function calculateRevenueMetrics(bookings: Booking[]): RevenueBreakdown {
  const confirmed = bookings.filter((b) => b.status === 'confirmed' || b.status === 'attended');
  const totalRevenue = confirmed.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalTickets = confirmed.reduce((sum, b) => sum + b.tickets, 0);
  const pendingRevenue = bookings.filter((b) => b.status === 'pending').reduce((sum, b) => sum + b.totalPrice, 0);
  const refundedRevenue = bookings.filter((b) => b.status === 'cancelled').reduce((sum, b) => sum + b.totalPrice, 0);
  const avgOrderValue = confirmed.length > 0 ? Math.round(totalRevenue / confirmed.length) : 0;

  return {
    totalRevenue,
    totalTickets,
    pendingRevenue,
    refundedRevenue,
    avgOrderValue,
    confirmedCount: confirmed.length,
  };
}

export interface OrganizerFinancialStats {
  totalEarnings: number;
  confirmedCount: number;
  pendingPayouts: number;
  pendingCount: number;
  totalTickets: number;
  avgBookingValue: number;
}

export function calculateOrganizerFinancials(bookings: Booking[]): OrganizerFinancialStats {
  const paid = bookings.filter((b) => b.status === 'confirmed' || b.status === 'attended');
  const totalEarnings = paid.reduce((s, b) => s + b.totalPrice, 0);
  const confirmedCount = paid.length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const pendingPayouts = pendingBookings.reduce((s, b) => s + b.totalPrice, 0);
  const totalTickets = paid.reduce((s, b) => s + b.tickets, 0);
  const avgBookingValue = paid.length > 0 ? Math.round(totalEarnings / paid.length) : 0;

  return {
    totalEarnings,
    confirmedCount,
    pendingPayouts,
    pendingCount: pendingBookings.length,
    totalTickets,
    avgBookingValue,
  };
}

export function calculateEventEarnings(events: Event[], bookings: Booking[]) {
  return events
    .map((evt) => {
      const evtPaid = bookings.filter(
        (b) => b.eventId === evt.id && (b.status === 'confirmed' || b.status === 'attended')
      );
      const revenue = evtPaid.reduce((s, b) => s + b.totalPrice, 0);
      const tickets = evtPaid.reduce((s, b) => s + b.tickets, 0);
      return { event: evt, revenue, tickets, bookingCount: evtPaid.length };
    })
    .filter((r) => r.bookingCount > 0)
    .sort((a, b) => b.revenue - a.revenue);
}

export function calculateFeedbackMetrics(feedback: Feedback[]) {
  const avgRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: feedback.filter((f) => f.rating === star).length,
    percent: feedback.length > 0 ? (feedback.filter((f) => f.rating === star).length / feedback.length) * 100 : 0,
  }));

  const positiveCount = feedback.filter((f) => f.rating >= 4).length;
  const positivePercent = feedback.length > 0 ? Math.round((positiveCount / feedback.length) * 100) : 0;

  return { avgRating, ratingDistribution, positiveCount, positivePercent };
}
