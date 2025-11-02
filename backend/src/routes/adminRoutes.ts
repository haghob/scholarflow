import express, { Request, Response } from 'express';
import { protect } from '../middleware/auth';
import { runDailyScraping } from '../jobs/dailyScraper';
import logger from '../utils/logger';

const router = express.Router();

const isAdmin = async (req: Request, res: Response, next: Function) => {
  try {
    const user = (req as any).user;
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking admin status'
    });
  }
};

router.post('/scrape', protect, isAdmin, async (req: Request, res: Response) => {
  try {
    logger.info('Manual scraping triggered by admin');
    
    runDailyScraping()
      .then(() => {
        logger.info('Manual scraping completed successfully');
      })
      .catch((error) => {
        logger.error('Manual scraping failed:', error.message);
      });
    
    res.status(200).json({
      success: true,
      message: 'Scraping job started in background',
      status: 'running'
    });
  } catch (error: any) {
    logger.error('Error starting scraping:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to start scraping job',
      error: error.message
    });
  }
});

router.get('/scrape/status', protect, isAdmin, async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Scraping status endpoint',
    status: 'not implemented'});
});

export default router;