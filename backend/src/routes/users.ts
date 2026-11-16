import express from 'express';
import { authenticate, authorize } from '@/middleware/auth';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

router.get('/profile', (req, res) => {
  res.json({ message: 'Get user profile - Coming soon' });
});

router.put('/profile', (req, res) => {
  res.json({ message: 'Update user profile - Coming soon' });
});

router.get('/wishlist', (req, res) => {
  res.json({ message: 'Get user wishlist - Coming soon' });
});

router.post('/wishlist/:propertyId', (req, res) => {
  res.json({ message: 'Add to wishlist - Coming soon' });
});

router.delete('/wishlist/:propertyId', (req, res) => {
  res.json({ message: 'Remove from wishlist - Coming soon' });
});

// Admin only routes
router.get('/all', authorize('ADMIN'), (req, res) => {
  res.json({ message: 'Get all users - Admin only - Coming soon' });
});

export default router;