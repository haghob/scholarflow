import { Router } from 'express';
import { scrapeArxiv, scrapeArxivBulk } from '../controllers/scraperController';
// import { protect } from '../middleware/auth'; // Pour production

const router = Router();

// TODO: En production, protéger ces routes avec 'protect' middleware
router.post('/arxiv', scrapeArxiv);
router.post('/arxiv/bulk', scrapeArxivBulk);

export default router;