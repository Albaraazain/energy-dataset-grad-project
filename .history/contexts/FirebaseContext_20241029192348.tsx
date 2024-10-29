// contexts/FirebaseContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { firestoreDb, categoryConverter } from '@/lib/firebase/firestore';
import { Category, Link } from '@/types';
import { 
  collection, 
  doc,
  getDocs,
  onSnapshot,
  query,
  collectionGroup
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
  const [linksMap, setLinksMap] = useState<Record<string, Link[]>>({});

  useEffect(() => {
    // Subscribe to categories collection
    const categoriesQuery = query(firestoreDb.categories.getRef());
    
    // Subscribe to all links using collectionGroup
    const linksQuery = query(collectionGroup(db, 'links'));

    // Create a map to store category data
    const categoryData = new Map<string, Category>();
    
    // Subscribe to categories
    const unsubscribeCategories = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        snapshot.docs.forEach(doc => {
          const category = categoryConverter.fromFirestore(doc, {});
          categoryData.set(doc.id, {
            ...category,
            links: linksMap[doc.id] || []
          });
        });
        updateCategories();
      },
      (err) => {
        console.error('Categories subscription error:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Subscribe to links
    const unsubscribeLinks = onSnapshot(
      linksQuery,
      (snapshot) => {
        const newLinksMap: Record<string, Link[]> = {};
        
        snapshot.docs.forEach(doc => {
          const categoryId = doc.ref.parent.parent?.id;
          if (categoryId) {
            if (!newLinksMap[categoryId]) {
              newLinksMap[categoryId] = [];
            }
            newLinksMap[categoryId].push({
              ...doc.data(),
              id: doc.id
            } as Link);
          }
        });

        setLinksMap(newLinksMap);
        
        // Update categories with new links
        categoryData.forEach((category, id) => {
          categoryData.set(id, {
            ...category,
            links: newLinksMap[id] || []
          });
        });
        
        updateCategories();
      },
      (err) => {
        console.error('Links subscription error:', err);
        setError(err);
        setLoading(false);
      }
    );

    function updateCategories() {
      const updatedCategories = Array.from(categoryData.values());
      setCategories(updatedCategories);
      setLoading(false);
    }

    // Cleanup subscriptions
    return () => {
      unsubscribeCategories();
      unsubscribeLinks();
    };
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