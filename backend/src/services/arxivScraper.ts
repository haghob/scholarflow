import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { query, transaction } from '../config/database';
import logger from '../utils/logger';

const ARXIV_API_URL = 'http://export.arxiv.org/api/query';

interface ArxivEntry {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: Date;
  categories: string[];
  pdfUrl: string;
}

export class ArxivScraper {
  /**
   * Scrape articles from ArXiv API
   */
  async scrapeArticles(
    searchQuery: string = 'machine learning',
    maxResults: number = 50
  ): Promise<number> {
    try {
      logger.info(`Scraping ArXiv for: "${searchQuery}"`);

      const response = await axios.get(ARXIV_API_URL, {
        params: {
          search_query: `all:${searchQuery}`,
          start: 0,
          max_results: maxResults,
          sortBy: 'submittedDate',
          sortOrder: 'descending',
        },
      });

      const parsed = await parseStringPromise(response.data);
      const entries = parsed.feed.entry || [];

      logger.info(`Found ${entries.length} articles from ArXiv`);

      let savedCount = 0;

      for (const entry of entries) {
        try {
          const article = this.parseArxivEntry(entry);
          await this.saveArticle(article);
          savedCount++;
        } catch (error) {
          logger.error('Error saving article:', error);
        }
      }

      logger.info(`Successfully saved ${savedCount}/${entries.length} articles`);
      return savedCount;
    } catch (error) {
      logger.error('Error scraping ArXiv:', error);
      throw error;
    }
  }

  /**
   * Parse ArXiv XML entry
   */
  private parseArxivEntry(entry: any): ArxivEntry {
    const id = entry.id[0].split('/abs/')[1];
    const title = entry.title[0].trim().replace(/\s+/g, ' ');
    const summary = entry.summary[0].trim().replace(/\s+/g, ' ');
    const published = new Date(entry.published[0]);

    const authors = entry.author.map((author: any) => author.name[0]);

    const categories = entry.category
      ? entry.category.map((cat: any) => cat.$.term)
      : [];

    const pdfUrl = entry.id[0].replace('abs', 'pdf') + '.pdf';

    return {
      id,
      title,
      summary,
      authors,
      published,
      categories,
      pdfUrl,
    };
  }

  /**
   * Save article to database
   */
  private async saveArticle(article: ArxivEntry): Promise<void> {
    try {
      // Get ArXiv source ID
      const sourceResult = await query(
        "SELECT id FROM sources WHERE name = 'ArXiv' LIMIT 1"
      );

      if (sourceResult.rows.length === 0) {
        throw new Error('ArXiv source not found in database');
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

      // Insert article
      await query(
        `INSERT INTO articles (
          source_id, external_id, title, abstract, authors,
          publication_date, pdf_url, external_url, keywords,
          research_fields, is_open_access, citations_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          sourceId,
          article.id,
          article.title,
          article.summary,
          article.authors,
          article.published,
          article.pdfUrl,
          `https://arxiv.org/abs/${article.id}`,
          article.categories,
          article.categories,
          true, // ArXiv is always open access
          0, // Initial citations count
        ]
      );

      logger.debug(`Saved article: ${article.title}`);
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
      'deep learning',
      'artificial intelligence',
      'natural language processing',
      'computer vision',
    ],
    articlesPerTopic: number = 20
  ): Promise<number> {
    let totalSaved = 0;

    for (const topic of topics) {
      const saved = await this.scrapeArticles(topic, articlesPerTopic);
      totalSaved += saved;
      // Wait 3 seconds between requests to respect ArXiv rate limits
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    return totalSaved;
  }
}

export const arxivScraper = new ArxivScraper();