import { Request, Response, NextFunction } from 'express';
import { arxivScraper } from '../services/arxivScraper';
import logger from '../utils/logger';

// @desc    Scrape articles from ArXiv
// @route   POST /api/v1/scraper/arxiv
// @access  Private (Admin only for production)
export const scrapeArxiv = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query: searchQuery, maxResults } = req.body;

    logger.info('Starting ArXiv scraping...');

    const savedCount = await arxivScraper.scrapeArticles(
      searchQuery || 'machine learning',
      maxResults || 50
    );

    res.status(200).json({
      success: true,
      message: `Successfully scraped and saved ${savedCount} articles`,
      data: {
        savedCount,
      },
    });
  } catch (error) {
    logger.error('Error in scrapeArxiv controller:', error);
    next(error);
  }
};

// @desc    Scrape articles from multiple topics
// @route   POST /api/v1/scraper/arxiv/bulk
// @access  Private (Admin only for production)
export const scrapeArxivBulk = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { topics, articlesPerTopic } = req.body;

    logger.info('Starting bulk ArXiv scraping...');

    const savedCount = await arxivScraper.scrapeMultipleTopics(
      topics,
      articlesPerTopic || 20
    );

    res.status(200).json({
      success: true,
      message: `Successfully scraped and saved ${savedCount} articles across multiple topics`,
      data: {
        savedCount,
      },
    });
  } catch (error) {
    logger.error('Error in scrapeArxivBulk controller:', error);
    next(error);
  }
};