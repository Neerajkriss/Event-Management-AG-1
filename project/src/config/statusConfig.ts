import type { Event, Booking, Complaint, OrganizerRequest, Role } from '@/types';

export const eventStatusConfig: Record<Event['status'], { label: string; color: string }> = {
  published: { label: 'Published', color: 'bg-success-100 text-success-700' },
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'Cancelled', color: 'bg-error-100 text-error-700' },
  completed: { label: 'Completed', color: 'bg-brand-100 text-brand-700' },
};

export const bookingStatusConfig: Record<Booking['status'], { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-warning-100 text-warning-700' },
  confirmed: { label: 'Confirmed', color: 'bg-success-100 text-success-700' },
  attended: { label: 'Attended', color: 'bg-brand-100 text-brand-700' },
  cancelled: { label: 'Cancelled', color: 'bg-error-100 text-error-700' },
};

export const complaintStatusConfig: Record<Complaint['status'], { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-error-100 text-error-700' },
  'in-progress': { label: 'In Progress', color: 'bg-warning-100 text-warning-700' },
  resolved: { label: 'Resolved', color: 'bg-success-100 text-success-700' },
  dismissed: { label: 'Dismissed', color: 'bg-gray-100 text-gray-600' },
};

export const complaintPriorityConfig: Record<Complaint['priority'], { label: string; color: string }> = {
  high: { label: 'High Priority', color: 'bg-error-50 text-error-600' },
  medium: { label: 'Medium Priority', color: 'bg-warning-50 text-warning-600' },
  low: { label: 'Low Priority', color: 'bg-gray-100 text-gray-600' },
};

export const complaintCategoryLabels: Record<Complaint['category'], string> = {
  payment: 'Payment Issue',
  'event-quality': 'Event Quality',
  organizer: 'Organizer Issue',
  venue: 'Venue Issue',
  other: 'Other',
};

export const organizerRequestStatusConfig: Record<OrganizerRequest['status'], { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-warning-100 text-warning-700' },
  accepted: { label: 'Accepted', color: 'bg-success-100 text-success-700' },
  rejected: { label: 'Rejected', color: 'bg-error-100 text-error-700' },
};

export const roleConfig: Record<Role, { label: string; color: string }> = {
  admin: { label: 'Administrator', color: 'bg-error-100 text-error-700' },
  organizer: { label: 'Event Organizer', color: 'bg-accent-100 text-accent-700' },
  customer: { label: 'Customer', color: 'bg-brand-100 text-brand-700' },
};

export const genericStatusColors: Record<string, string> = {
  confirmed: 'bg-success-100 text-success-700',
  pending: 'bg-warning-100 text-warning-700',
  cancelled: 'bg-error-100 text-error-700',
  attended: 'bg-brand-100 text-brand-700',
  active: 'bg-success-100 text-success-700',
  expired: 'bg-gray-100 text-gray-600',
  open: 'bg-error-100 text-error-700',
  'in-progress': 'bg-warning-100 text-warning-700',
  resolved: 'bg-success-100 text-success-700',
  dismissed: 'bg-gray-100 text-gray-600',
  published: 'bg-success-100 text-success-700',
  draft: 'bg-gray-100 text-gray-600',
  completed: 'bg-brand-100 text-brand-700',
  accepted: 'bg-success-100 text-success-700',
  rejected: 'bg-error-100 text-error-700',
};
