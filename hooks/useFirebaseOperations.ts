'use client';

import { useState } from 'react';
import { 
  addDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  doc,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { firestoreDb, categoryConverter, linkConverter } from '@/lib/firebase/firestore';
import { Category, Link } from '@/types';

export function useFirebaseOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Category Operations
  const addCategory = async (category: Omit<Category, 'id'>) => {
    setLoading(true);
    try {
      const docRef = doc(firestoreDb.categories.getRef());
      await setDoc(docRef, categoryConverter.toFirestore({
        ...category,
        links: []
      }));
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      return false;
    }
  };

  const updateCategory = async (categoryId: string, data: Partial<Category>) => {
    setLoading(true);
    try {
      const docRef = firestoreDb.categories.getDocRef(categoryId);
      await updateDoc(docRef, categoryConverter.toFirestore(data));
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      return false;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    setLoading(true);
    try {
      const docRef = firestoreDb.categories.getDocRef(categoryId);
      await deleteDoc(docRef);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      return false;
    }
  };

  // Link Operations
  const addLink = async (categoryId: string, link: Link) => {
    setLoading(true);
    try {
      const docRef = doc(firestoreDb.categories.links.getRef(categoryId));
      await setDoc(docRef, linkConverter.toFirestore(link));
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error adding link:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      return false;
    }
  };

  const updateLink = async (categoryId: string, linkId: string, data: Partial<Link>) => {
    setLoading(true);
    try {
      const docRef = firestoreDb.categories.links.getDocRef(categoryId, linkId);
      await updateDoc(docRef, linkConverter.toFirestore(data));
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error updating link:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      return false;
    }
  };

  const deleteLink = async (categoryId: string, linkId: string) => {
    setLoading(true);
    try {
      const docRef = firestoreDb.categories.links.getDocRef(categoryId, linkId);
      await deleteDoc(docRef);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error deleting link:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      return false;
    }
  };

  return {
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    addLink,
    updateLink,
    deleteLink,
  };
}