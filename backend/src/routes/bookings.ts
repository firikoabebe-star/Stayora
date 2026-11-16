import express from 'express';
import { authenticate, authorize } from '@/middleware/auth';
import { BookingController } from '@/controllers/bookingController';

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

// Guest routes
router.get('/', BookingController.getUserBookings);
router.post('/', BookingController.createBooking);
router.get('/stats', BookingController.getBookingStats);
router.get('/:id', BookingController.getBookingById);
router.put('/:id', BookingController.updateBooking);
router.patch('/:id/cancel', BookingController.cancelBooking);

// Host routes
router.get('/host/all', authorize('HOST', 'ADMIN'), BookingController.getHostBookings);

export default router;