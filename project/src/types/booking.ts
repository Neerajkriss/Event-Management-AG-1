export interface Booking {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  tickets: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  paid: boolean;
  notes: string;
  createdAt: string;
}
