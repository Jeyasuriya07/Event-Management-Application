export interface Event {
  id?: string;
  type: EventType;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  ticketCount: number;
  registrationFee: number;
  organizerId: string;
  organizerName: string;
  createdAt: Date;
  imageUrl: string;
  registeredUsers: string[];
}

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null; // Added phoneNumber property
}

export interface Registration {
  id?: string;
  eventId: string;
  userId: string;
  ticketCount: number;
  registeredAt: Date;
  paymentAmount: number;
  paymentMethod: PaymentMethod;
  status?: 'confirmed' | 'pending' | 'cancelled';
  attendeePhone: string;
}

export type EventType = 'Wedding' | 'Business Meeting' | 'Party' | 'Conference';

export type PaymentMethod = 'GPay' | 'UPI' | 'Card';

export interface EventTypeInfo {
  type: EventType;
  price: number;
  icon: string;
}
