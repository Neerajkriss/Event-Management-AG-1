export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  organizerId: string;
  organizerName: string;
  location: string;
  venue: string;
  startDate: string;
  endDate: string;
  price: number;
  capacity: number;
  bookedCount: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  image: string;
  tags: string[];
  createdAt: string;
}
