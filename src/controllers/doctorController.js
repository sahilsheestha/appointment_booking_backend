import { AppError } from '../middleware/errorHandler.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

export const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find();
    
    res.status(200).json({
      status: 'success',
      data: { doctors }
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return next(new AppError('No doctor found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { doctor }
    });
  } catch (error) {
    next(error);
  }
};

export const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      specialization,
      clinicFee,
      homeVisitFee,
      location,
      availableFrom,
      availableTo,
      availableDays
    } = req.body;

    // Check if doctor with email already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return next(new AppError('Doctor with this email already exists', 400));
    }

    const doctor = await Doctor.create({
      name,
      email,
      specialization,
      clinicFee,
      homeVisitFee,
      location,
      availableFrom,
      availableTo,
      availableDays
    });

    res.status(201).json({
      status: 'success',
      data: { doctor }
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!doctor) {
      return next(new AppError('No doctor found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { doctor }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    // First, find all appointments for this doctor
    const appointments = await Appointment.find({ doctor: req.params.id });

    // If there are appointments, update their status to cancelled
    if (appointments.length > 0) {
      await Appointment.updateMany(
        { doctor: req.params.id },
        { 
          $set: { 
            status: 'cancelled',
            notes: 'Doctor is no longer available in the system'
          }
        }
      );
    }

    // Now delete the doctor
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return next(new AppError('No doctor found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate({
      path: 'appointments',
      populate: {
        path: 'patient',
        select: 'name email'
      }
    });

    if (!doctor) {
      return next(new AppError('No doctor found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        appointments: doctor.appointments
      }
    });
  } catch (error) {
    next(error);
  }
}; 