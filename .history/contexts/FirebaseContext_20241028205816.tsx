'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { firestoreDb, categoryConverter } from '@/lib/firebase/firestore';
import { Category, Link } from '@/types';
import { 
  collection, 
  doc,
  getDocs,  // Add this import
  onSnapshot,
  query
} from 'firebase/firestore';

interface FirebaseContextType {
  categories: Category[];
  loading: boolean;
  error: Error | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  categories: [],
  loading: true,
  error: null,
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Subscribe to categories collection
    const categoriesQuery = query(firestoreDb.categories.getRef());
    
    const unsubscribe = onSnapshot(
      categoriesQuery,
      async (snapshot) => {
        try {
          const categoriesData: Category[] = [];
          
          // Get all categories
          for (const categoryDoc of snapshot.docs) {
            const category = categoryConverter.fromFirestore(categoryDoc, {});
            
            // Get links for this category
            const linksQuery = query(firestoreDb.categories.links.getRef(categoryDoc.id));
            const linksSnapshot = await getDocs(linksQuery);
            
            const links = linksSnapshot.docs.map(linkDoc => ({
              ...linkDoc.data(),
              id: linkDoc.id
            })) as Link[];
            
            categoriesData.push({
              ...category,
              links
            });
          }
          
          setCategories(categoriesData);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching data:', err);
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setLoading(false);
        }
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ categories, loading, error }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}