import { Router } from 'express';
import { bookingController } from '../controllers/BookingController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, bookingController.createBooking.bind(bookingController));
router.get('/my', authMiddleware, bookingController.getMyBookings.bind(bookingController));
router.get('/:id', authMiddleware, bookingController.getBookingById.bind(bookingController));
router.post('/:id/checkin', authMiddleware, bookingController.checkin.bind(bookingController));
router.post('/:id/end', authMiddleware, bookingController.endUsage.bind(bookingController));
router.post('/:id/cleanup', authMiddleware, bookingController.confirmCleanup.bind(bookingController));
router.post('/:id/cancel', authMiddleware, bookingController.cancelBooking.bind(bookingController));

export default router;
