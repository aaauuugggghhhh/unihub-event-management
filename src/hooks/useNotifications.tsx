import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'event_reminder' | 'registration_confirmation' | 'event_update' | 'system';
};

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('none');

  useEffect(() => {
    console.log('[Notifications] Provider mounted/updated. User:', user?.id);
    
    if (user) {
      // Load existing notifications
      loadNotifications();

      // Subscribe to new notifications
      console.log('[Notifications] Setting up subscription for user:', user.id);
      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen for all changes
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('[Notifications] Received change event:', {
              eventType: payload.eventType,
              payload
            });
            
            try {
              if (payload.eventType === 'INSERT') {
                const newNotification = transformDatabaseNotification(payload.new);
                console.log('[Notifications] Adding new notification:', newNotification);
                setNotifications((prev) => {
                  console.log('[Notifications] Previous notifications:', prev.length);
                  return [newNotification, ...prev];
                });
              } else if (payload.eventType === 'DELETE') {
                console.log('[Notifications] Removing notification:', payload.old.id);
                setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
              } else if (payload.eventType === 'UPDATE') {
                console.log('[Notifications] Updating notification:', payload.new);
                setNotifications((prev) =>
                  prev.map((n) =>
                    n.id === payload.new.id ? transformDatabaseNotification(payload.new) : n
                  )
                );
              }
            } catch (error) {
              console.error('[Notifications] Error processing change event:', error);
            }
          }
        )
        .subscribe((status) => {
          console.log('[Notifications] Subscription status:', status);
          setSubscriptionStatus(status);
          
          if (status === 'SUBSCRIBED') {
            console.log('[Notifications] Successfully subscribed to changes');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('[Notifications] Channel error occurred');
          } else if (status === 'TIMED_OUT') {
            console.error('[Notifications] Subscription timed out');
          }
        });

      // Test the subscription
      console.log('[Notifications] Testing subscription...');
      setTimeout(() => {
        console.log('[Notifications] Current subscription status:', subscriptionStatus);
      }, 2000);

      return () => {
        console.log('[Notifications] Cleaning up subscription');
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    console.log('Loading notifications for user:', user.id);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notifications:', error);
        throw error;
      }

      console.log('Loaded notifications:', data?.length || 0);
      setNotifications(data.map(transformDatabaseNotification));
    } catch (error) {
      console.error('Error in loadNotifications:', error);
    }
  };

  const transformDatabaseNotification = (dbNotification: any): Notification => ({
    id: dbNotification.id,
    userId: dbNotification.user_id,
    title: dbNotification.title,
    message: dbNotification.message,
    isRead: dbNotification.is_read,
    createdAt: dbNotification.created_at,
    type: dbNotification.type,
  });

  const markAsRead = async (notificationId: string) => {
    console.log('Marking notification as read:', notificationId);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error in markAsRead:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    console.log('Marking all notifications as read');
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      throw error;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    console.log('Deleting notification:', notificationId);
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        throw error;
      }

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      throw error;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}; 