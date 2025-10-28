import { arxivScraper } from '../services/arxivScraper';
import logger from '../utils/logger';

export async function runDailyScraping() {
  try {
    logger.info('🤖 Running daily scraping job...');
    
    const topics = [
      'machine learning',
      'deep learning',
      'computer vision',
      'natural language processing',
    ];
    
    for (const topic of topics) {
      await arxivScraper.scrapeArticles(topic, 10);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    logger.info('Daily scraping completed');
  } catch (error) {
    logger.error('Daily scraping failed:', error);
  }
}