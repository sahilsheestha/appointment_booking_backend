import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  getAllDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorAppointments
} from '../controllers/doctorController.js';

const router = express.Router();

// Public routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctor);

// Protected routes
router.use(protect);

// Admin only routes
router.use(restrictTo('admin', 'superadmin'));
router.post('/', createDoctor);
router.put('/:id', updateDoctor);
router.delete('/:id', deleteDoctor);
router.get('/:id/appointments', getDoctorAppointments);

export default router;