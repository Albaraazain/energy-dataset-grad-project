import { firestoreDb, categoryConverter, linkConverter } from './firestore';
import { Category, Link } from '@/types';
import { setDoc, writeBatch, doc } from 'firebase/firestore';

export async function migrateDataToFirestore(categories: Category[]) {
  try {
    // Process categories in batches to avoid hitting Firestore limits
    const batchSize = 500;
    let operationsCount = 0;
    let currentBatch = writeBatch(firestoreDb.categories.getRef().firestore);

    for (const category of categories) {
      // Create category document reference
      const categoryRef = firestoreDb.categories.getDocRef(category.id.toString());
      
      // Prepare category data (excluding links array)
      const { links, ...categoryData } = category;
      
      // Add category to batch
      currentBatch.set(categoryRef, categoryConverter.toFirestore(categoryData));
      operationsCount++;

      // Process links for this category
      for (const link of links) {
        // Create a document reference for the link using a consistent ID
        const linkRef = firestoreDb.categories.links.getDocRef(
          category.id.toString(),
          // Use a slug-like ID derived from the title
          link.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        );
        
        // Add link to batch
        currentBatch.set(linkRef, linkConverter.toFirestore({
          ...link,
          // Add default notes structure if not present
          notes: link.notes || {
            content: '',
            lastUpdated: new Date().toISOString()
          }
        }));
        operationsCount++;

        // If we've hit the batch limit, commit and start a new batch
        if (operationsCount >= batchSize) {
          await currentBatch.commit();
          currentBatch = writeBatch(firestoreDb.categories.getRef().firestore);
          operationsCount = 0;
        }
      }
    }

    // Commit any remaining operations
    if (operationsCount > 0) {
      await currentBatch.commit();
    }

    console.log('Migration completed successfully');
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}

// Helper function to validate data before migration
export function validateMigrationData(categories: Category[]): boolean {
  if (!Array.isArray(categories)) {
    console.error('Invalid categories data: not an array');
    return false;
  }

  for (const category of categories) {
    if (!category.id || !category.title || !category.icon || !category.description) {
      console.error('Invalid category data:', category);
      return false;
    }

    if (!Array.isArray(category.links)) {
      console.error('Invalid links data for category:', category.title);
      return false;
    }

    for (const link of category.links) {
      if (!link.title || !link.url || !link.type) {
        console.error('Invalid link data in category:', category.title, link);
        return false;
      }
    }
  }

  return true;
}

// Function to clean up any incomplete or failed migrations
export async function cleanupFailedMigration(categories: Category[]) {
  try {
    const batch = writeBatch(firestoreDb.categories.getRef().firestore);
    
    for (const category of categories) {
      const categoryRef = firestoreDb.categories.getDocRef(category.id.toString());
      batch.delete(categoryRef);
    }
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Cleanup error:', error);
    return false;
  }
}