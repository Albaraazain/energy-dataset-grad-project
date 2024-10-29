// contexts/NotificationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification, NotificationContextType } from '@/types/notification';
import { firestoreDb } from '@/lib/firebase/firestore';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  dismissNotification: async () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Subscribe to notifications collection
    const q = query(
      firestoreDb.notifications.getRef(),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Notification))
        .filter(notification => !notification.dismissed);

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const notificationRef = firestoreDb.notifications.getDocRef(id);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      
      notifications.forEach(notification => {
        if (!notification.read) {
          const notificationRef = firestoreDb.notifications.getDocRef(notification.id);
          batch.update(notificationRef, { read: true });
        }
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const dismissNotification = async (id: string) => {
    try {
      const notificationRef = firestoreDb.notifications.getDocRef(id);
      await updateDoc(notificationRef, { dismissed: true });
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}