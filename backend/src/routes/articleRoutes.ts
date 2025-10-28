import { Router } from 'express';
import { 
  getArticles, 
  getArticleById, 
  getSources 
} from '../controllers/articleController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', getArticles);
router.get('/sources', getSources);
router.get('/:id', getArticleById);

export default router;