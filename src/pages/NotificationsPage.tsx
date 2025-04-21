import React from 'react';
import Layout from '@/components/Layout';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Trash2, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_reminder':
        return '🔔';
      case 'registration_confirmation':
        return '✅';
      case 'event_update':
        return '📝';
      case 'system':
        return '⚙️';
      default:
        return '📌';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {notifications.length > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsRead()}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notifications yet
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.isRead ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl" role="img" aria-label="notification type">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-sm text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage; 