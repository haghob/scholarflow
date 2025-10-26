import { Router } from 'express';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/profile', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get user profile - TODO',
    data: null
  });
});

router.put('/profile', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Update user profile - TODO' 
  });
});

router.get('/preferences', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get user preferences - TODO',
    data: null
  });
});

router.put('/preferences', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Update user preferences - TODO' 
  });
});

export default router;