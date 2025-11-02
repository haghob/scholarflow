import axios from 'axios';
import { query } from '../config/database';
import logger from '../utils/logger';

const CROSSREF_API_URL = 'https://api.crossref.org/works';
const USER_AGENT = 'ScholarFlow/1.0 (mailto:your_email@example.com)';

interface CrossRefEntry {
  doi: string;
  title: string;
  abstract: string;
  authors: string[];
  published: Date;
  journal?: string;
  citations: number;
  url: string;
  subjects: string[];
  publisher: string;
}

export class CrossRefScraper {
  /**
   * Scrape articles from CrossRef API
   */
  async scrapeArticles(
    searchQuery: string = 'machine learning',
    maxResults: number = 50
  ): Promise<number> {
    try {
      logger.info(`Scraping CrossRef for: "${searchQuery}"`);

      const response = await axios.get(CROSSREF_API_URL, {
        params: {
          query: searchQuery,
          rows: maxResults,
          sort: 'published',
          order: 'desc',
          filter: 'has-abstract:true', // Only articles with abstracts
        },
        headers: {
          'User-Agent': USER_AGENT,
        },
      });

      const items = response.data.message?.items || [];

      if (items.length === 0) {
        logger.info('No articles found on CrossRef');
        return 0;
      }

      logger.info(`Found ${items.length} articles from CrossRef`);

      let savedCount = 0;

      for (const item of items) {
        try {
          const article = this.parseCrossRefEntry(item);
          if (article) {
            await this.saveArticle(article);
            savedCount++;
          }
        } catch (error: any) {
          logger.error('Error saving CrossRef article:', error.message);
        }
      }

      logger.info(`Successfully saved ${savedCount}/${items.length} CrossRef articles`);
      return savedCount;
    } catch (error: any) {
      logger.error('Error scraping CrossRef:', error.message);
      throw error;
    }
  }

  /**
   * Parse CrossRef JSON entry
   */
  private parseCrossRefEntry(item: any): CrossRefEntry | null {
    try {
      const doi = item.DOI;
      if (!doi) return null;

      const title = Array.isArray(item.title) 
        ? item.title[0] 
        : item.title || 'No title';

      const abstract = item.abstract 
        ? item.abstract.replace(/<[^>]*>/g, '') // Remove HTML tags
        : 'No abstract available';

      const authors = item.author
        ? item.author.map((author: any) => 
            `${author.given || ''} ${author.family || ''}`.trim()
          )
        : ['Unknown Author'];

      // Parse publication date
      const datePublished = item['published-print']?.['date-parts']?.[0] 
        || item['published-online']?.['date-parts']?.[0]
        || [new Date().getFullYear(), 1, 1];
      
      const [year, month = 1, day = 1] = datePublished;
      const published = new Date(year, month - 1, day);

      const journal = Array.isArray(item['container-title'])
        ? item['container-title'][0]
        : item['container-title'] || undefined;

      const citations = item['is-referenced-by-count'] || 0;

      const url = item.URL || `https://doi.org/${doi}`;

      const subjects = item.subject || [];

      const publisher = item.publisher || 'Unknown Publisher';

      return {
        doi,
        title,
        abstract,
        authors,
        published,
        journal,
        citations,
        url,
        subjects,
        publisher,
      };
    } catch (error: any) {
      logger.error('Error parsing CrossRef entry:', error.message);
      return null;
    }
  }

  /**
   * Save article to database
   */
  private async saveArticle(article: CrossRefEntry): Promise<void> {
    try {
      // Get CrossRef source ID
      const sourceResult = await query(
        "SELECT id FROM sources WHERE name = 'CrossRef' LIMIT 1"
      );

      if (sourceResult.rows.length === 0) {
        throw new Error('CrossRef source not found in database');
      }

      const sourceId = sourceResult.rows[0].id;

      // Check if article already exists
      const existingArticle = await query(
        'SELECT id FROM articles WHERE external_id = $1 AND source_id = $2',
        [article.doi, sourceId]
      );

      if (existingArticle.rows.length > 0) {
        logger.debug(`Article ${article.doi} already exists, skipping`);
        return;
      }

      const pdfUrl = `https://doi.org/${article.doi}`;

      // Insert article
      await query(
        `INSERT INTO articles (
          source_id, external_id, title, abstract, authors,
          publication_date, pdf_url, external_url, keywords,
          research_fields, journal_name, doi, citations_count, 
          publisher, is_open_access
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          sourceId,
          article.doi,
          article.title,
          article.abstract,
          article.authors,
          article.published,
          pdfUrl,
          article.url,
          article.subjects,
          article.subjects,
          article.journal || null,
          article.doi,
          article.citations,
          article.publisher,
          false, // Not always open access
        ]
      );

      logger.debug(`Saved CrossRef article: ${article.title}`);
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
      'data science',
      'neural networks',
      'computer vision',
    ],
    articlesPerTopic: number = 20
  ): Promise<number> {
    let totalSaved = 0;

    for (const topic of topics) {
      const saved = await this.scrapeArticles(topic, articlesPerTopic);
      totalSaved += saved;
      // Wait 1 second between requests to be polite
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return totalSaved;
  }

  /**
   * Get article by DOI
   */
  async getArticleByDOI(doi: string): Promise<CrossRefEntry | null> {
    try {
      const response = await axios.get(`${CROSSREF_API_URL}/${doi}`, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });

      return this.parseCrossRefEntry(response.data.message);
    } catch (error: any) {
      logger.error(`Error fetching DOI ${doi}:`, error.message);
      return null;
    }
  }
}

export const crossrefScraper = new CrossRefScraper();