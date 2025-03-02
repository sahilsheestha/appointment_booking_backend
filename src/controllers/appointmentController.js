import { AppError } from '../middleware/errorHandler.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import { sendAppointmentStatusEmail, sendNewAppointmentEmails } from '../utils/emailService.js';

// Get all appointments for the logged-in patient
export const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'name email specialization clinicFee homeVisitFee location availableFrom availableTo availableDays')
      .sort('-appointmentDate');

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: { appointments }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new appointment
export const createAppointment = async (req, res, next) => {
  try {
    const { doctor, date, timeSlot, type, symptoms } = req.body;

    // Check if doctor exists
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return next(new AppError('No doctor found with that ID', 404));
    }

    // Check if slot is available
    const slotTaken = await Appointment.findOne({
      doctor,
      date,
      timeSlot,
      status: { $ne: 'cancelled' }
    });

    if (slotTaken) {
      return next(new AppError('This time slot is already booked', 400));
    }

    // Create appointment
    const appointment = await Appointment.create({
      doctor,
      patient: req.user.id,
      date,
      timeSlot,
      type,
      symptoms,
      status: 'pending'
    });

    // Populate doctor and patient details for email
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'name email specialization location')
      .populate('patient', 'name email');

    // Send notification emails
    await sendNewAppointmentEmails(populatedAppointment);

    res.status(201).json({
      status: 'success',
      data: { appointment }
    });
  } catch (error) {
    next(error);
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
    }).populate('doctor', 'name email specialization location')
      .populate('patient', 'name email');

    if (!appointment) {
      return next(new AppError('No appointment found with that ID', 404));
    }

    if (appointment.status === 'cancelled') {
      return next(new AppError('This appointment is already cancelled', 400));
    }

    // Check if appointment is in the past
    if (new Date(appointment.date) < new Date()) {
      return next(new AppError('Cannot cancel past appointments', 400));
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // Send cancellation email
    await sendAppointmentStatusEmail(appointment);

    res.status(200).json({
      status: 'success',
      data: { appointment }
    });
  } catch (error) {
    next(error);
  }
};

// Get appointment details
export const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user.id
    }).populate('doctor', 'name specialization');

    if (!appointment) {
      return next(new AppError('No appointment found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { appointment }
    });
  } catch (error) {
    next(error);
  }
};

// Get all appointments for admin
export const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('doctor', 'name email specialization clinicFee homeVisitFee location availableFrom availableTo availableDays')
      .populate('patient', 'name email');

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: { appointments }
    });
  } catch (error) {
    next(error);
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status value', 400));
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name email specialization location')
      .populate('patient', 'name email');

    if (!appointment) {
      return next(new AppError('No appointment found with that ID', 404));
    }

    // Check if the status update is valid
    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return next(new AppError(`Cannot update ${appointment.status} appointment`, 400));
    }

    // Update status
    appointment.status = status;
    await appointment.save();

    // Send email notification
    await sendAppointmentStatusEmail(appointment);

    res.status(200).json({
      status: 'success',
      data: { appointment }
    });
  } catch (error) {
    next(error);
  }
};


