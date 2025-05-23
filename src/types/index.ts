export interface User {
  id: string;
  name: string;
  email: string;
  registeredEvents: string[];
}

export type EventCategory = "academic" | "social" | "sports" | "arts" | "career" | "workshop" | "other";

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: EventCategory;
  organizer: string;
  imageUrl: string;
  capacity: number;
  registeredCount: number;
}
