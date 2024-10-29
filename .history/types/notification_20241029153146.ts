// lib/notifications.ts
import { addDoc } from 'firebase/firestore';
import { firestoreDb, notificationConverter } from './firebase/firestore';
import { Notification, NotificationType } from '@/types/notification';

interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  metadata?: {
    categoryId?: string;
    categoryTitle?: string;
    linkId?: string;
    linkTitle?: string;
  };
}

export const createNotification = async ({
  type,
  title,
  message,
  metadata
}: CreateNotificationParams) => {
  try {
    const notificationData: Omit<Notification, 'id'> = {
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      metadata
    };

    const docRef = await addDoc(
      firestoreDb.notifications.getRef(),
      notificationConverter.toFirestore(notificationData)
    );

    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Helper functions to create specific types of notifications
export const createCategoryNotification = {
  created: async (categoryTitle: string, categoryId: string) => {
    return createNotification({
      type: 'category_created',
      title: 'New Category Created',
      message: `Category "${categoryTitle}" has been created`,
      metadata: {
        categoryId,
        categoryTitle
      }
    });
  },

  updated: async (categoryTitle: string, categoryId: string) => {
    return createNotification({
      type: 'category_updated',
      title: 'Category Updated',
      message: `Category "${categoryTitle}" has been updated`,
      metadata: {
        categoryId,
        categoryTitle
      }
    });
  },

  deleted: async (categoryTitle: string) => {
    return createNotification({
      type: 'category_deleted',
      title: 'Category Deleted',
      message: `Category "${categoryTitle}" has been deleted`,
      metadata: {
        categoryTitle
      }
    });
  }
};

export const createLinkNotification = {
  created: async (linkTitle: string, categoryTitle: string, categoryId: string, linkId: string) => {
    return createNotification({
      type: 'link_created',
      title: 'New Link Added',
      message: `Link "${linkTitle}" has been added to ${categoryTitle}`,
      metadata: {
        categoryId,
        categoryTitle,
        linkId,
        linkTitle
      }
    });
  },

  updated: async (linkTitle: string, categoryTitle: string, categoryId: string, linkId: string) => {
    return createNotification({
      type: 'link_updated',
      title: 'Link Updated',
      message: `Link "${linkTitle}" in ${categoryTitle} has been updated`,
      metadata: {
        categoryId,
        categoryTitle,
        linkId,
        linkTitle
      }
    });
  },

  deleted: async (linkTitle: string, categoryTitle: string) => {
    return createNotification({
      type: 'link_deleted',
      title: 'Link Deleted',
      message: `Link "${linkTitle}" has been removed from ${categoryTitle}`,
      metadata: {
        categoryTitle,
        linkTitle
      }
    });
  }
};

export const createNoteNotification = {
  created: async (linkTitle: string, categoryTitle: string, categoryId: string, linkId: string) => {
    return createNotification({
      type: 'note_created',
      title: 'New Note Added',
      message: `A note has been added to "${linkTitle}" in ${categoryTitle}`,
      metadata: {
        categoryId,
        categoryTitle,
        linkId,
        linkTitle
      }
    });
  },

  updated: async (linkTitle: string, categoryTitle: string, categoryId: string, linkId: string) => {
    return createNotification({
      type: 'note_updated',
      title: 'Note Updated',
      message: `The note for "${linkTitle}" in ${categoryTitle} has been updated`,
      metadata: {
        categoryId,
        categoryTitle,
        linkId,
        linkTitle
      }
    });
  }
};