import { Router } from 'express';
import authRoutes from './authRoutes';
import articleRoutes from './articleRoutes';
import userRoutes from './userRoutes';
import searchRoutes from './searchRoutes';
import collectionRoutes from './collectionRoutes';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ScholarFlow API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      articles: '/articles',
      users: '/users',
      search: '/search',
      collections: '/collections',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
router.use('/users', userRoutes);
router.use('/search', searchRoutes);
router.use('/collections', collectionRoutes);

export default router;