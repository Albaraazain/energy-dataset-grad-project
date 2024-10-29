// components/NotificationMenu.tsx
'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  CheckCheck,
  Plus,
  Edit,
  StickyNote
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types/notification';

const NotificationItem = ({ 
  notification,
  onMarkAsRead,
  onDismiss 
}: { 
  notification: Notification;
  onMarkAsRead: () => void;
  onDismiss: () => void;
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'category_created':
      case 'link_created':
        return <Plus className="w-4 h-4 text-green-400" />;
      case 'category_updated':
      case 'link_updated':
      case 'note_updated':
        return <Edit className="w-4 h-4 text-blue-400" />;
      case 'category_deleted':
      case 'link_deleted':
        return <Trash2 className="w-4 h-4 text-red-400" />;
      case 'note_created':
        return <StickyNote className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={`p-4 ${notification.read ? 'bg-gray-800' : 'bg-gray-900'} border-b border-gray-700 hover:bg-gray-800 transition-colors`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="mt-1">{getIcon()}</div>
          <div>
            <h4 className="text-sm font-medium text-white">{notification.title}</h4>
            <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
            <span className="text-xs text-gray-500 mt-2 block">
              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!notification.read && (
            <button
              onClick={onMarkAsRead}
              className="text-gray-400 hover:text-blue-400 transition-colors"
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-red-400 transition-colors"
            title="Dismiss"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification } = useNotifications();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-gray-900 rounded-lg shadow-lg overflow-hidden z-50 border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-sm text-gray-400 hover:text-blue-400 flex items-center gap-1"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => markAsRead(notification.id)}
                    onDismiss={() => dismissNotification(notification.id)}
                  />
                ))
              ) : (
                <div className="p-4 text-center text-gray-400">
                  No notifications
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationMenu;