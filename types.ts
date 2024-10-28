// types.ts
export type LinkType = 'ieee' | 'arxiv' | 'mdpi' | 'tool' | 'database' | 'dataset' | 'specification' | 'article';

// Updated Link interface with notes
export interface Link {
  title: string;
  url: string;
  type: LinkType;
  notes?: {
    content: string;
    lastUpdated: string;
  };
}

export interface Category {
  id: number;
  title: string;
  icon: string;
  description: string;
  links: Link[];
}

export interface Categories {
  categories: Category[];
}