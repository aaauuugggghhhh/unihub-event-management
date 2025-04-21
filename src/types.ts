import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  registeredEvents: string[];
}

export type EventCategory = 'academic' | 'social' | 'sports' | 'arts' | 'career' | 'workshop' | 'other';

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
  capacity: number;
  registeredCount: number;
  imageUrl?: string;
} 