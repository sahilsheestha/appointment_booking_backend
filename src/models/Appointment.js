import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Appointment must belong to a doctor']
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Appointment must belong to a patient']
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    enum: [
      '09:00-09:30', '09:30-10:00',
      '10:00-10:30', '10:30-11:00',
      '11:00-11:30', '11:30-12:00',
      '14:00-14:30', '14:30-15:00',
      '15:00-15:30', '15:30-16:00',
      '16:00-16:30', '16:30-17:00'
    ]
  },
  type: {
    type: String,
    enum: ['clinic', 'home'],
    required: [true, 'Appointment type is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  symptoms: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Prevent duplicate appointments
appointmentSchema.index(
  { doctor: 1, date: 1, timeSlot: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } }
);

// Validate appointment date is in the future
appointmentSchema.pre('save', function(next) {
  if (this.date < new Date()) {
    next(new Error('Appointment date must be in the future'));
  }
  next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;