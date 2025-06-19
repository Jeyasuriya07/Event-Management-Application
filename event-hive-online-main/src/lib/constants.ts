import { EventTypeInfo } from "@/types";

// Event Types with prices and default images
export const EVENT_TYPES: EventTypeInfo[] = [
  {
    type: "Wedding",
    price: 5000,
    icon: "💍",
    defaultImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1170"
  },
  {
    type: "Business Meeting",
    price: 1500,
    icon: "💼",
    defaultImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1170"
  },
  {
    type: "Party",
    price: 3000,
    icon: "🎉",
    defaultImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=1170"
  },
  {
    type: "Conference",
    price: 7000,
    icon: "🎤",
    defaultImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1170"
  }
];

// Payment methods
export const PAYMENT_METHODS = ["GPay", "UPI", "Card"];

// Maximum ticket count per event
export const MAX_TICKET_COUNT = 500;

// Toast notification duration in milliseconds
export const TOAST_DURATION = 5000;
