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
  CollectionReference
} from 'firebase/firestore';
import { db } from './config';
import { Category, Link } from '@/types';

// Collection names
const CATEGORIES_COLLECTION = 'categories';

// Types for Firestore
export interface FirestoreCategory extends Omit<Category, 'id' | 'links'> {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FirestoreLink extends Omit<Link, 'id'> {
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

  // Helpers for timestamps
  serverTimestamp: serverTimestamp,
};

// Type guards and converters
export const categoryConverter = {
  toFirestore: (category: FirestoreCategory) => {
    return {
      ...category,
      updatedAt: firestoreDb.serverTimestamp(),
      createdAt: category.createdAt || firestoreDb.serverTimestamp(),
    };
  },
  fromFirestore: (snapshot: any, options: any) => {
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
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id,
    };
  },
};