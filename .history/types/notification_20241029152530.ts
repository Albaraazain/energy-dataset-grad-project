// types/notification.ts

export type NotificationType = 
  | 'category_created'
  | 'category_updated'
  | 'category_deleted'
  | 'link_created'
  | 'link_updated'
  | 'link_deleted'
  | 'note_created'
  | 'note_updated'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  metadata?: {
    categoryId?: string;
    categoryTitle?: string;
    linkId?: string;
    linkTitle?: string;
  };
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
}