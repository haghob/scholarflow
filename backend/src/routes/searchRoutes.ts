import { Router } from 'express';

const router = Router();

router.post('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Search articles - TODO',
    data: {
      query: req.body.query,
      results: [],
      total: 0
    }
  });
});

router.get('/suggestions', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get search suggestions - TODO',
    data: []
  });
});

export default router;