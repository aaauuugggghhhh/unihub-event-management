import { supabase } from '@/lib/supabase';
import { Event } from '@/types';
import { notificationService } from './notificationService';

// Define type for registration with user details
export type RegistrationWithUser = {
  event_id: string;
  user_id: string;
  created_at: string;
  user: {
    email?: string;
    raw_user_meta_data?: { [key: string]: any };
    // Add other user fields if needed (e.g., from a profiles table)
  } | null;
};

// Helper function to format time string to HH:MM format
function formatTimeString(timeStr: string): string {
  // Try to parse common time formats
  const timeFormats: { [key: string]: RegExp } = {
    // "5 to 6" or "5-6" format
    range: /^(\d{1,2})\s*(to|-)\s*(\d{1,2})$/i,
    // "5:00" or "05:00" format
    exact: /^(\d{1,2}):(\d{2})$/,
    // "5 PM" or "5:00 PM" format
    ampm: /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i
  };

  // Remove any leading/trailing whitespace
  timeStr = timeStr.trim();

  // Check for range format
  const rangeMatch = timeStr.match(timeFormats.range);
  if (rangeMatch) {
    const startHour = parseInt(rangeMatch[1]);
    return `${startHour.toString().padStart(2, '0')}:00`;
  }

  // Check for exact time format
  const exactMatch = timeStr.match(timeFormats.exact);
  if (exactMatch) {
    const [_, hours, minutes] = exactMatch;
    return `${hours.padStart(2, '0')}:${minutes}`;
  }

  // Check for AM/PM format
  const ampmMatch = timeStr.match(timeFormats.ampm);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1]);
    const minutes = ampmMatch[2] || '00';
    const period = ampmMatch[3].toLowerCase();

    // Convert to 24-hour format
    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  // If no format matches, return a default time
  console.warn(`Invalid time format: "${timeStr}". Using default time.`);
  return '00:00';
}

// Helper function to handle Supabase errors
function handleSupabaseError(error: any, operation: string): never {
  console.error(`Error during ${operation}:`, error);
  if (error.code === 'PGRST301') {
    throw new Error('Database connection failed. Please check your connection and try again.');
  } else if (error.code === 'PGRST204') {
    throw new Error('Authentication required. Please sign in and try again.');
  } else {
    throw new Error(`Failed to ${operation}. ${error.message || 'Please try again.'}`);
  }
}

// Transform database event to frontend event
const transformDatabaseEvent = (dbEvent: any): Event => ({
  id: dbEvent.id,
  title: dbEvent.title,
  description: dbEvent.description,
  date: dbEvent.date,
  startTime: dbEvent.start_time,
  endTime: dbEvent.end_time,
  location: dbEvent.location,
  category: dbEvent.category,
  organizer: dbEvent.organizer,
  imageUrl: dbEvent.image_url,
  capacity: dbEvent.capacity,
  registeredCount: dbEvent.registered_count
});

// Transform frontend event to database event
const transformEventToDatabase = (event: Partial<Event>) => ({
  title: event.title,
  description: event.description,
  date: event.date,
  start_time: event.startTime,
  end_time: event.endTime,
  location: event.location,
  category: event.category,
  organizer: event.organizer,
  image_url: event.imageUrl,
  capacity: event.capacity,
  registered_count: event.registeredCount
});

export const eventService = {
  async getAllEvents(): Promise<Event[]> {
    console.log('Fetching all events...');
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'fetch events');
    }

    console.log('Events fetched successfully:', data?.length || 0, 'events');
    
    return data.map(transformDatabaseEvent);
  },

  async getEvent(id: string): Promise<Event> {
    console.log('Fetching event by id:', id);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      handleSupabaseError(error, 'fetch event');
    }

    if (!data) {
      console.log('No event found with id:', id);
      throw new Error('No event found');
    }

    console.log('Event fetched successfully:', data.title);

    return transformDatabaseEvent(data);
  },

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    console.log('Creating event:', event);
    
    // Ensure the date is in the correct format (YYYY-MM-DD)
    const formattedDate = new Date(event.date).toISOString().split('T')[0];
    
    // Transform the event data to match the database schema
    const dbEvent = {
      title: event.title,
      description: event.description || '', // Ensure description is not null
      date: formattedDate,
      start_time: event.startTime,
      end_time: event.endTime,
      location: event.location,
      category: event.category,
      organizer: event.organizer || '', // Ensure organizer is not null
      image_url: event.imageUrl || '', // Convert imageUrl to image_url
      capacity: event.capacity || 100, // Default capacity if not provided
      registered_count: 0 // Always start with 0 registrations
    };

    console.log('Sending to database:', dbEvent);

    const { data, error } = await supabase
      .from('events')
      .insert([dbEvent])
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'create event');
    }

    if (!data) {
      throw new Error('No data returned from insert operation');
    }

    console.log('Event created successfully:', data.title);

    return transformDatabaseEvent(data);
  },

  async updateEvent(id: string, event: Partial<Event>): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .update(transformEventToDatabase(event))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }

    const updatedEvent = transformDatabaseEvent(data);
    
    // Create notifications for registered users about the update
    await notificationService.createEventUpdateNotification(updatedEvent);

    return updatedEvent;
  },

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  },

  async registerForEvent(eventId: string, userId: string): Promise<void> {
    console.log('Starting event registration process:', { eventId, userId });
    
    // First fetch the complete event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.error('Error fetching event details:', eventError);
      throw new Error('Failed to fetch event details');
    }

    // Check if event exists
    if (!event) {
      console.error('Event not found:', eventId);
      throw new Error('Event not found');
    }

    console.log('Found event:', event);

    // Create Date objects for comparison
    const eventDateTime = new Date(`${event.date}T${event.start_time}`);
    const now = new Date();

    console.log('Time comparison:', { eventDateTime, now });

    // Check if event has already started
    if (now >= eventDateTime) {
      console.error('Event has already started');
      throw new Error('Registration closed: Event has already started');
    }

    // Check if event is at capacity
    if (event.registered_count >= event.capacity) {
      console.error('Event is at capacity');
      throw new Error('Registration closed: Event is at full capacity');
    }

    console.log('Event checks passed, proceeding with registration');

    // If we get here, proceed with registration
    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert([{ event_id: eventId, user_id: userId }]);

      if (error) {
        console.error('Error registering for event:', error);
        // If it's a trigger-raised exception, pass the message through
        if (error.message?.includes('Cannot register:')) {
          throw new Error(error.message);
        }
        throw error;
      }

      console.log('Registration successful, creating notification');

      // Create registration confirmation notification with complete event data
      const eventForNotification = transformDatabaseEvent(event);
      await notificationService.createEventRegistrationNotification(userId, eventForNotification);

      // Schedule a reminder notification for 24 hours before the event
      const reminderTime = new Date(eventDateTime.getTime() - 24 * 60 * 60 * 1000);
      if (reminderTime > now) {
        console.log('Scheduling reminder notification for:', reminderTime);
        setTimeout(async () => {
          try {
            await notificationService.createEventReminderNotification(userId, eventForNotification);
          } catch (error) {
            console.error('Error creating reminder notification:', error);
          }
        }, reminderTime.getTime() - now.getTime());
      }

      console.log('Event registration process completed successfully');
    } catch (error) {
      console.error('Error in registration process:', error);
      throw error;
    }
  },

  async unregisterFromEvent(eventId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error unregistering from event:', error);
      throw error;
    }
  },

  async getEventRegistrations(eventId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('user_id')
      .eq('event_id', eventId);

    if (error) {
      console.error('Error fetching event registrations:', error);
      handleSupabaseError(error, 'fetch event registrations');
    }
    return data.map(reg => reg.user_id);
  },

  async getUserRegisteredEvents(userId: string): Promise<Event[]> {
    const { data: registrations, error: registrationsError } = await supabase
      .from("event_registrations")
      .select("event_id")
      .eq("user_id", userId);

    if (registrationsError) {
      handleSupabaseError(registrationsError, "fetch user registrations");
    }

    if (!registrations.length) {
      return [];
    }

    const eventIds = registrations.map((reg) => reg.event_id);
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .in("id", eventIds);

    if (eventsError) {
      handleSupabaseError(eventsError, "fetch registered events");
    }

    return events.map(transformDatabaseEvent);
  },

  async getRegistrationsForEvent(eventId: string): Promise<RegistrationWithUser[]> {
    console.log(`Fetching registrations for event: ${eventId}`);
    
    // First, get all registrations for the event
    const { data: registrations, error: registrationsError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId);

    if (registrationsError) {
      console.error('Error fetching registrations:', registrationsError);
      handleSupabaseError(registrationsError, 'fetch registrations');
    }

    if (!registrations?.length) {
      console.log('No registrations found for event:', eventId);
      return [];
    }

    // Debug: Log the first registration to see its structure
    console.log('Sample registration data:', registrations[0]);

    // Then, get all user details in a single query from auth schema
    const userIds = registrations.map(reg => reg.user_id);
    
    // Using RPC call with properly structured parameters
    const { data: users, error: usersError } = await supabase
      .rpc('get_users_by_ids', {
        user_ids: userIds
      });

    if (usersError) {
      console.error('Error fetching user details:', usersError);
      handleSupabaseError(usersError, 'fetch user details');
    }

    // Create a map of user details by ID for quick lookup
    const userMap = new Map(
      (users || []).map(user => [user.id, {
        email: user.email,
        raw_user_meta_data: user.raw_user_meta_data
      }])
    );

    // Combine the data with properly formatted date
    const result = registrations.map(reg => {
      // Debug: Log the date value we're trying to format
      console.log('Registration date value:', reg.registration_date);
      
      let formattedDate = 'N/A';
      try {
        // Try to format the date, using registration_date instead of created_at
        if (reg.registration_date) {
          formattedDate = new Date(reg.registration_date).toLocaleString();
        }
      } catch (error) {
        console.error('Error formatting date:', error);
      }

      return {
        event_id: reg.event_id,
        user_id: reg.user_id,
        created_at: formattedDate,
        user: userMap.get(reg.user_id) || null
      };
    });

    console.log('Successfully fetched registrations with user details:', result.length);
    return result;
  },
}; 