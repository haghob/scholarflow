import axios from 'axios';
import { query } from '../config/database';
import logger from '../utils/logger';

const CORE_API_URL = 'https://api.core.ac.uk/v3';
const CORE_API_KEY = process.env.CORE_API_KEY || ''; // Get free API key from https://core.ac.uk/services/api

interface COREEntry {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  published: Date;
  downloadUrl?: string;
  sourceUrl: string;
  subjects: string[];
  publisher?: string;
  doi?: string;
}

export class COREAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'COREAPIError';
  }
}

export class COREScraper {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || CORE_API_KEY;
    if (!this.apiKey) {
      logger.warn('CORE API key not set. Set CORE_API_KEY environment variable.');
    }
  }

  /**
   * Scrape articles from CORE API
   */
  async scrapeArticles(
    searchQuery: string = 'machine learning',
    maxResults: number = 50
  ): Promise<number> {
    try {
      if (!this.apiKey) {
        throw new COREAPIError('CORE API key is required. Get one at https://core.ac.uk/services/api');
      }

      logger.info(`Scraping CORE for: "${searchQuery}"`);

      const response = await axios.post(
        `${CORE_API_URL}/search/works`,
        {
          q: searchQuery,
          limit: maxResults,
          sort: 'yearPublished:desc',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const results = response.data.results || [];

      if (results.length === 0) {
        logger.info('No articles found on CORE');
        return 0;
      }

      logger.info(`Found ${results.length} articles from CORE`);

      let savedCount = 0;

      for (const result of results) {
        try {
          const article = this.parseCOREEntry(result);
          if (article) {
            await this.saveArticle(article);
            savedCount++;
          }
        } catch (error: any) {
          logger.error('Error saving CORE article:', error.message);
        }
      }

      logger.info(`Successfully saved ${savedCount}/${results.length} CORE articles`);
      return savedCount;
    } catch (error: any) {
      if (error.response?.status === 401) {
        logger.error('CORE API authentication failed. Check your API key.');
      } else if (error.response?.status === 429) {
        logger.error('CORE API rate limit exceeded. Wait before retrying.');
      } else {
        logger.error('Error scraping CORE:', error.message);
      }
      throw error;
    }
  }

  /**
   * Parse CORE JSON entry
   */
  private parseCOREEntry(item: any): COREEntry | null {
    try {
      const id = item.id?.toString() || `core_${Date.now()}`;
      
      const title = item.title || 'No title';
      
      const abstract = item.abstract || item.description || 'No abstract available';

      const authors = item.authors 
        ? item.authors.map((author: any) => 
            typeof author === 'string' ? author : author.name || 'Unknown'
          )
        : ['Unknown Author'];

      // Parse publication date
      const year = item.yearPublished || new Date().getFullYear();
      const published = new Date(`${year}-01-01`);

      const downloadUrl = item.downloadUrl || undefined;
      
      const sourceUrl = item.sourceFulltextUrls?.[0] 
        || item.links?.[0]?.url 
        || `https://core.ac.uk/works/${id}`;

      const subjects = item.subjects || item.fieldOfStudy || [];

      const publisher = item.publisher || item.journals?.[0]?.title || undefined;

      const doi = item.doi || undefined;

      return {
        id,
        title,
        abstract,
        authors,
        published,
        downloadUrl,
        sourceUrl,
        subjects,
        publisher,
        doi,
      };
    } catch (error: any) {
      logger.error('Error parsing CORE entry:', error.message);
      return null;
    }
  }

  /**
   * Save article to database
   */
  private async saveArticle(article: COREEntry): Promise<void> {
    try {
      // Get CORE source ID
      const sourceResult = await query(
        "SELECT id FROM sources WHERE name = 'CORE' LIMIT 1"
      );

      if (sourceResult.rows.length === 0) {
        throw new Error('CORE source not found in database');
      }

      const sourceId = sourceResult.rows[0].id;

      // Check if article already exists
      const existingArticle = await query(
        'SELECT id FROM articles WHERE external_id = $1 AND source_id = $2',
        [article.id, sourceId]
      );

      if (existingArticle.rows.length > 0) {
        logger.debug(`Article ${article.id} already exists, skipping`);
        return;
      }

      const pdfUrl = article.downloadUrl || article.sourceUrl;

      // Insert article
      await query(
        `INSERT INTO articles (
          source_id, external_id, title, abstract, authors,
          publication_date, pdf_url, external_url, keywords,
          research_fields, publisher, doi, is_open_access, citations_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          sourceId,
          article.id,
          article.title,
          article.abstract,
          article.authors,
          article.published,
          pdfUrl,
          article.sourceUrl,
          article.subjects,
          article.subjects,
          article.publisher || null,
          article.doi || null,
          true, // CORE is mostly open access
          0,
        ]
      );

      logger.debug(`Saved CORE article: ${article.title}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Scrape multiple topics
   */
  async scrapeMultipleTopics(
    topics: string[] = [
      'machine learning',
      'artificial intelligence',
      'data mining',
      'computational biology',
      'quantum computing',
    ],
    articlesPerTopic: number = 20
  ): Promise<number> {
    let totalSaved = 0;

    for (const topic of topics) {
      const saved = await this.scrapeArticles(topic, articlesPerTopic);
      totalSaved += saved;
      // Wait 2 seconds between requests to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return totalSaved;
  }

  /**
   * Search with advanced filters
   */
  async searchWithFilters(
    searchQuery: string,
    options: {
      yearFrom?: number;
      yearTo?: number;
      openAccessOnly?: boolean;
      limit?: number;
    } = {}
  ): Promise<number> {
    try {
      if (!this.apiKey) {
        throw new COREAPIError('CORE API key is required');
      }

      logger.info(`Searching CORE with filters: "${searchQuery}"`);

      const requestBody: any = {
        q: searchQuery,
        limit: options.limit || 50,
        sort: 'yearPublished:desc',
      };

      if (options.yearFrom || options.yearTo) {
        requestBody.yearPublished = {};
        if (options.yearFrom) requestBody.yearPublished.gte = options.yearFrom;
        if (options.yearTo) requestBody.yearPublished.lte = options.yearTo;
      }

      if (options.openAccessOnly) {
        requestBody.isOpenAccess = true;
      }

      const response = await axios.post(
        `${CORE_API_URL}/search/works`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const results = response.data.results || [];
      let savedCount = 0;

      for (const result of results) {
        const article = this.parseCOREEntry(result);
        if (article) {
          await this.saveArticle(article);
          savedCount++;
        }
      }

      logger.info(`Saved ${savedCount} articles from filtered search`);
      return savedCount;
    } catch (error: any) {
      logger.error('Error in filtered search:', error.message);
      throw error;
    }
  }
}

export const coreScraper = new COREScraper();