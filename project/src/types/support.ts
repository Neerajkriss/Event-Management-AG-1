export interface Complaint {
  id: string;
  subject: string;
  description: string;
  category: 'payment' | 'event-quality' | 'organizer' | 'venue' | 'other';
  userId: string;
  userName: string;
  userEmail: string;
  eventId?: string;
  eventTitle?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'dismissed';
  response?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizerRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
}
