import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  CheckCheck,
  Plus,
  Edit,
  StickyNote,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types/notification';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">{notification.title}</h4>
            <p className="text-sm text-gray-400 mt-1 break-words">{notification.message}</p>
            <span className="text-xs text-gray-500 mt-2 block">
              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!notification.read && (
            <button
              onClick={onMarkAsRead}
              className="text-gray-400 hover:text-blue-400 transition-colors p-2"
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-red-400 transition-colors p-2"
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
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification } = useNotifications();

  return (
    <div className="relative">
      <Sheet>
        <SheetTrigger asChild>
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </SheetTrigger>
        <SheetContent 
          side="right" 
          className="w-full sm:max-w-md bg-gray-900 text-white border-l border-gray-800"
        >
          <SheetHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-white text-xl">Notifications</SheetTitle>
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
          </SheetHeader>

          <div className="mt-6 -mx-6">
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
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
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default NotificationMenu;