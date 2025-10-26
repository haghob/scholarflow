export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  institution?: string | null;
  researchFields?: string[] | null;
}

export interface Article {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  publicationDate: string;
  doi?: string;
  pdfUrl?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  articleCount: number;
}