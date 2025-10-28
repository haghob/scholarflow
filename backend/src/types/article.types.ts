export interface Article {
  id: string;
  source_id: string;
  external_id: string;
  title: string;
  abstract: string;
  authors: string[];
  publication_date: Date;
  journal?: string;
  doi?: string;
  pdf_url?: string;
  external_url?: string;
  citations_count: number;
  keywords?: string[];
  research_fields?: string[];
  is_open_access: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ArticleFilters {
  search?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
  minCitations?: number;
  researchFields?: string[];
  openAccessOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface ArticleResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}