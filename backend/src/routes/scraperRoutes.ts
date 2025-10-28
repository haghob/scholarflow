import { Router } from 'express';
import { scrapeArxiv, scrapeArxivBulk } from '../controllers/scraperController';
// import { protect } from '../middleware/auth'; // For production

const router = Router();

// TODO: In production, protect these routes with 'protect' middleware
router.post('/arxiv', scrapeArxiv);
router.post('/arxiv/bulk', scrapeArxivBulk);

export default router;