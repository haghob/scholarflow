import { arxivScraper } from '../services/arxivScraper';
import logger from '../utils/logger';

export async function runDailyScraping() {
  try {
    logger.info('Running daily scraping job...');
    
    const topics = [
      'machine learning',
      'deep learning',
      'computer vision',
      'natural language processing',
      'artificial intelligence',
      'data science',
      'robotics',
      'bioinformatics',
      'quantum computing',
      'cybersecurity',
      'renewable energy',
      'climate change',
      'sustainable development',
      'blockchain',
      'internet of things',
      'augmented reality',
      'virtual reality',
      '5G technology',
      'edge computing',
      'cloud computing',
      'quantum computing',
      'human-computer interaction',
      'big data',
      'autonomous vehicles',
      'smart cities',
      'digital health',
      'genomics',
      'nanotechnology',
      'space exploration',
      'financial technology',
      'educational technology',
      'social media analysis',
      'e-commerce',
      'supply chain management',
      'wearable technology',
      '3D printing',
      'renewable energy technologies',
      'environmental monitoring',
      'telecommunications',
      'photovoltaics',
      'energy storage',
      'smart grids',
      'urban planning',
      'public health',
      'epidemiology',
      'mental health technologies',
      'telemedicine',
      'digital therapeutics',
      'computational biology',
      'synthetic biology',
      'drug discovery',
      'precision medicine',
      'medical imaging',
      'health informatics',
      'robotic surgery',
      'assistive technologies',
      'food technology',
      'agricultural technology',
      'climate modeling',
      'oceanography',
      'geospatial technologies',
      'disaster management',
      'crisis informatics',
      'humanitarian technology',
      'digital inclusion',
      'technology policy',
      'ethics in technology'
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