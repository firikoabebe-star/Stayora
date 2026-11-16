import express from 'express';
import { register, login, logout, refreshToken, getMe } from '@/controllers/authController';
import { authenticate } from '@/middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/me', authenticate, getMe);

export default router;