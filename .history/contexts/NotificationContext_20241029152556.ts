// contexts/NotificationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification, NotificationContextType } from '@/types/notification';
import { firestoreDb } from '@/lib/firebase/firestore';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, writeBatch } from 'firebase/firestore';

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
      collection(firestoreDb.notifications.getRef()),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    const notificationRef = doc(firestoreDb.notifications.getRef(), id);
    await updateDoc(notificationRef, { read: true });
  };

  const markAllAsRead = async () => {
    const batch = writeBatch(firestoreDb.notifications.getRef().firestore);
    
    notifications.forEach(notification => {
      if (!notification.read) {
        const notificationRef = doc(firestoreDb.notifications.getRef(), notification.id);
        batch.update(notificationRef, { read: true });
      }
    });

    await batch.commit();
  };

  const dismissNotification = async (id: string) => {
    const notificationRef = doc(firestoreDb.notifications.getRef(), id);
    await updateDoc(notificationRef, { dismissed: true });
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount,
        markAsRead,
        markAllAsRead,
        dismissNotification
      }}
    >
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