// lib/firebase/firestore.ts
import { 
  collection, 
  doc,
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  serverTimestamp,
  DocumentReference,
  CollectionReference,
  QueryDocumentSnapshot,
  SnapshotOptions
} from 'firebase/firestore';
import { db } from './config';
import { Category, Link } from '@/types';
import { Notification } from '@/types/notification';

// Collection names
const CATEGORIES_COLLECTION = 'categories';
const NOTIFICATIONS_COLLECTION = 'notifications';

// Types for Firestore
export interface FirestoreCategory extends Omit<Category, 'id' | 'links'> {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FirestoreLink extends Omit<Link, 'id'> {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FirestoreNotification extends Omit<Notification, 'id'> {
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper functions
export const firestoreDb = {
  // Categories
  categories: {
    getRef: () => collection(db, CATEGORIES_COLLECTION),
    getDocRef: (id: string) => doc(db, CATEGORIES_COLLECTION, id),
    
    // Links subcollection
    links: {
      getRef: (categoryId: string) => 
        collection(db, CATEGORIES_COLLECTION, categoryId, 'links'),
      getDocRef: (categoryId: string, linkId: string) => 
        doc(db, CATEGORIES_COLLECTION, categoryId, 'links', linkId),
    }
  },

  // Notifications
  notifications: {
    getRef: () => collection(db, NOTIFICATIONS_COLLECTION),
    getDocRef: (id: string) => doc(db, NOTIFICATIONS_COLLECTION, id),
  },

  // Helpers for timestamps
  serverTimestamp,
};

// Converters
export const categoryConverter = {
  toFirestore: (category: FirestoreCategory) => {
    return {
      ...category,
      updatedAt: firestoreDb.serverTimestamp(),
      createdAt: category.createdAt || firestoreDb.serverTimestamp(),
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ) => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id,
    };
  },
};

export const linkConverter = {
  toFirestore: (link: FirestoreLink) => {
    return {
      ...link,
      updatedAt: firestoreDb.serverTimestamp(),
      createdAt: link.createdAt || firestoreDb.serverTimestamp(),
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ) => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id,
    };
  },
};

export const notificationConverter = {
  toFirestore: (notification: FirestoreNotification) => {
    return {
      ...notification,
      updatedAt: firestoreDb.serverTimestamp(),
      createdAt: notification.createdAt || firestoreDb.serverTimestamp(),
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ) => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id,
    };
  },
};