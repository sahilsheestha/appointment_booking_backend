import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  specialization: {
    type: String,
    required: true
  },
  clinicFee: {
    type: Number,
    required: true
  },
  homeVisitFee: {
    type: Number
  },
  location: {
    type: String,
    required: true
  },
  availableFrom: {
    type: String,
    required: true
  },
  availableTo: {
    type: String,
    required: true
  },
  availableDays: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return v.every(day => day >= 0 && day <= 6);
      },
      message: 'Available days must be between 0 and 6'
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Doctor', doctorSchema);