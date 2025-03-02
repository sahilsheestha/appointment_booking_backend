import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  getMyAppointments,
  createAppointment,
  cancelAppointment,
  getAppointment,
  getAllAppointments,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/all', restrictTo('admin'), getAllAppointments);
router.patch('/:id/status', restrictTo('admin'), updateAppointmentStatus);

// Patient routes
router.get('/my-appointments', getMyAppointments);
router.post('/', createAppointment);
router.get('/:id', getAppointment);
router.patch('/:id/cancel', cancelAppointment);

export default router;