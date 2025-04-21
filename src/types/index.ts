
export interface User {
  id: string;
  name: string;
  email: string;
  registeredEvents: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: EventCategory;
  organizer: string;
  imageUrl: string;
  capacity?: number;
  registeredCount?: number;
}

export type EventCategory = 
  | "academic" 
  | "social" 
  | "sports" 
  | "arts" 
  | "career" 
  | "workshop" 
  | "other";
