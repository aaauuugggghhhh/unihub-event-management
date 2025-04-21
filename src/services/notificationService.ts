import { supabase } from '@/lib/supabase';
import { Event } from '@/types';

export const notificationService = {
  async createNotification(userId: string, notification: {
    title: string;
    message: string;
    type: 'event_reminder' | 'registration_confirmation' | 'event_update' | 'system';
  }) {
    console.log('Creating notification:', { userId, notification });
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        throw new Error(`Failed to create notification: ${error.message}`);
      }

      console.log('Notification created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createNotification:', error);
      throw error;
    }
  },

  async createEventRegistrationNotification(userId: string, event: Event) {
    console.log('Creating registration notification for event:', event.title);
    try {
      await this.createNotification(userId, {
        title: 'Event Registration Confirmed',
        message: `You have successfully registered for "${event.title}" on ${event.date} at ${event.startTime}.`,
        type: 'registration_confirmation',
      });
    } catch (error) {
      console.error('Error creating registration notification:', error);
      throw error;
    }
  },

  async createEventUpdateNotification(event: Event) {
    console.log('Creating update notification for event:', event.title);
    try {
      // Get all users registered for this event
      const { data: registrations, error } = await supabase
        .from('event_registrations')
        .select('user_id')
        .eq('event_id', event.id);

      if (error) {
        console.error('Error fetching event registrations:', error);
        return;
      }

      console.log('Found registrations:', registrations.length);

      // Create notifications for all registered users
      for (const registration of registrations) {
        await this.createNotification(registration.user_id, {
          title: 'Event Update',
          message: `The event "${event.title}" has been updated. Please check the event details.`,
          type: 'event_update',
        });
      }
    } catch (error) {
      console.error('Error creating update notifications:', error);
      throw error;
    }
  },

  async createEventReminderNotification(userId: string, event: Event) {
    console.log('Creating reminder notification for event:', event.title);
    try {
      await this.createNotification(userId, {
        title: 'Event Reminder',
        message: `Reminder: "${event.title}" is starting soon on ${event.date} at ${event.startTime}.`,
        type: 'event_reminder',
      });
    } catch (error) {
      console.error('Error creating reminder notification:', error);
      throw error;
    }
  },
}; 