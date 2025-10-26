import { Router } from 'express';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Get all articles - TODO',
    data: [] 
  });
});

router.get('/:id', (req, res) => {
  res.json({ 
    success: true, 
    message: `Get article ${req.params.id} - TODO`,
    data: null
  });
});

router.post('/', protect, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Create article - TODO' 
  });
});

router.put('/:id', protect, (req, res) => {
  res.json({ 
    success: true, 
    message: `Update article ${req.params.id} - TODO` 
  });
});

router.delete('/:id', protect, (req, res) => {
  res.json({ 
    success: true, 
    message: `Delete article ${req.params.id} - TODO` 
  });
});

export default router;