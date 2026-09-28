export interface Offer {
  id: string;
  title: string;
  description: string;
  eventId: string;
  eventTitle: string;
  discountPercent: number;
  code: string;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  usedCount: number;
  status: 'active' | 'expired' | 'disabled';
  createdAt: string;
}
