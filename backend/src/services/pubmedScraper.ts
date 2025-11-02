import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { query } from '../config/database';
import logger from '../utils/logger';

const PUBMED_API_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const EMAIL = 'your_email@example.com'; // Requis par PubMed
const TOOL = 'scholarflow';

interface PubMedEntry {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  published: Date;
  journal: string;
  doi?: string;
  pmid: string;
  keywords: string[];
}

export class PubMedScraper {
  /**
   * Scrape articles from PubMed API
   */
  async scrapeArticles(
    searchQuery: string = 'machine learning',
    maxResults: number = 50
  ): Promise<number> {
    try {
      logger.info(`Scraping PubMed for: "${searchQuery}"`);

      // Step 1: Search for article IDs
      const searchResponse = await axios.get(`${PUBMED_API_URL}/esearch.fcgi`, {
        params: {
          db: 'pubmed',
          term: searchQuery,
          retmax: maxResults,
          retmode: 'json',
          sort: 'date',
          email: EMAIL,
          tool: TOOL,
        },
      });

      const idList = searchResponse.data.esearchresult.idlist || [];
      
      if (idList.length === 0) {
        logger.info('No articles found on PubMed');
        return 0;
      }

      logger.info(`Found ${idList.length} articles from PubMed`);

      // Step 2: Fetch details for each article
      const fetchResponse = await axios.get(`${PUBMED_API_URL}/efetch.fcgi`, {
        params: {
          db: 'pubmed',
          id: idList.join(','),
          retmode: 'xml',
          email: EMAIL,
          tool: TOOL,
        },
      });

      const parsed = await parseStringPromise(fetchResponse.data);
      const articles = parsed.PubmedArticleSet?.PubmedArticle || [];

      let savedCount = 0;

      for (const article of articles) {
        try {
          const entry = this.parsePubMedEntry(article);
          await this.saveArticle(entry);
          savedCount++;
        } catch (error: any) {
          logger.error('Error saving PubMed article:', error.message);
        }
      }

      logger.info(`Successfully saved ${savedCount}/${articles.length} PubMed articles`);
      return savedCount;
    } catch (error: any) {
      logger.error('Error scraping PubMed:', error.message);
      throw error;
    }
  }

  /**
   * Parse PubMed XML entry
   */
  private parsePubMedEntry(article: any): PubMedEntry {
    try {
      const medlineCitation = article.MedlineCitation[0];
      const articleData = medlineCitation.Article[0];
      
      const pmid = medlineCitation.PMID[0]._;
      
      const title = articleData.ArticleTitle?.[0] || 'No title';
      
      const abstract = articleData.Abstract?.[0]?.AbstractText
        ? Array.isArray(articleData.Abstract[0].AbstractText)
          ? articleData.Abstract[0].AbstractText.map((text: any) => 
              typeof text === 'string' ? text : text._
            ).join(' ')
          : typeof articleData.Abstract[0].AbstractText === 'string'
            ? articleData.Abstract[0].AbstractText
            : articleData.Abstract[0].AbstractText._
        : 'No abstract available';

      const authors = articleData.AuthorList?.[0]?.Author
        ? articleData.AuthorList[0].Author.map((author: any) => {
            const lastName = author.LastName?.[0] || '';
            const foreName = author.ForeName?.[0] || '';
            return `${foreName} ${lastName}`.trim();
          })
        : ['Unknown Author'];

      const journal = articleData.Journal?.[0]?.Title?.[0] || 'Unknown Journal';

      const pubDate = articleData.Journal?.[0]?.JournalIssue?.[0]?.PubDate?.[0];
      const year = pubDate?.Year?.[0] || new Date().getFullYear();
      const month = pubDate?.Month?.[0] || '01';
      const day = pubDate?.Day?.[0] || '01';
      const published = new Date(`${year}-${month}-${day}`);

      // Extract DOI if available
      const articleIds = article.PubmedData?.[0]?.ArticleIdList?.[0]?.ArticleId || [];
      const doiObj = articleIds.find((id: any) => id.$.IdType === 'doi');
      const doi = doiObj?._ || undefined;

      // Extract keywords/MeSH terms
      const meshHeadings = medlineCitation.MeshHeadingList?.[0]?.MeshHeading || [];
      const keywords = meshHeadings.map((mesh: any) => 
        mesh.DescriptorName?.[0]?._ || ''
      ).filter(Boolean);

      return {
        id: pmid,
        title,
        abstract,
        authors,
        published,
        journal,
        doi,
        pmid,
        keywords,
      };
    } catch (error: any) {
      logger.error('Error parsing PubMed entry:', error.message);
      throw error;
    }
  }

  /**
   * Save article to database
   */
  private async saveArticle(article: PubMedEntry): Promise<void> {
    try {
      // Get PubMed source ID
      const sourceResult = await query(
        "SELECT id FROM sources WHERE name = 'PubMed' LIMIT 1"
      );

      if (sourceResult.rows.length === 0) {
        throw new Error('PubMed source not found in database');
      }

      const sourceId = sourceResult.rows[0].id;

      // Check if article already exists
      const existingArticle = await query(
        'SELECT id FROM articles WHERE external_id = $1 AND source_id = $2',
        [article.pmid, sourceId]
      );

      if (existingArticle.rows.length > 0) {
        logger.debug(`Article ${article.pmid} already exists, skipping`);
        return;
      }

      const externalUrl = `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`;
      const pdfUrl = article.doi 
        ? `https://doi.org/${article.doi}` 
        : externalUrl;

      // Insert article
      await query(
        `INSERT INTO articles (
          source_id, external_id, title, abstract, authors,
          publication_date, pdf_url, external_url, keywords,
          research_fields, journal_name, doi, is_open_access, citations_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          sourceId,
          article.pmid,
          article.title,
          article.abstract,
          article.authors,
          article.published,
          pdfUrl,
          externalUrl,
          article.keywords,
          article.keywords,
          article.journal,
          article.doi || null,
          false, // PubMed articles are not always open access
          0,
        ]
      );

      logger.debug(`Saved PubMed article: ${article.title}`);
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
      'bioinformatics',
      'genomics',
      'medical imaging',
      'drug discovery',
    ],
    articlesPerTopic: number = 20
  ): Promise<number> {
    let totalSaved = 0;

    for (const topic of topics) {
      const saved = await this.scrapeArticles(topic, articlesPerTopic);
      totalSaved += saved;
      // Wait 1 second between requests (PubMed allows 3 requests/second)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return totalSaved;
  }
}

export const pubmedScraper = new PubMedScraper();