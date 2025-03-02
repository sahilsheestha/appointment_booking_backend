import nodemailer from "nodemailer"

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Accept self-signed certificates
    ciphers: 'SSLv3'
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Email templates for different appointment statuses
const emailTemplates = {
  confirmed: (appointment) => ({
    subject: 'Appointment Confirmed',
    text: `Dear ${appointment.patient.name},

Your appointment with Dr. ${appointment.doctor.name} has been confirmed for ${appointment.date} at ${appointment.timeSlot}.

Type: ${appointment.type}
Location: ${appointment.doctor.location}

Please arrive 10 minutes before your scheduled time.

Best regards,
Medical Team`,
  }),
  cancelled: (appointment) => ({
    subject: 'Appointment Cancelled',
    text: `Dear ${appointment.patient.name},

Your appointment with Dr. ${appointment.doctor.name} scheduled for ${appointment.date} at ${appointment.timeSlot} has been cancelled.

If you would like to reschedule, please book a new appointment through our system.

Best regards,
Medical Team`,
  }),
  completed: (appointment) => ({
    subject: 'Appointment Completed',
    text: `Dear ${appointment.patient.name},

Thank you for visiting Dr. ${appointment.doctor.name}. Your appointment on ${appointment.date} at ${appointment.timeSlot} has been marked as completed.

We hope you had a good experience. If you need any follow-up appointments, please feel free to book through our system.

Best regards,
Medical Team`,
  }),
  created: (appointment) => ({
    subject: 'New Appointment Request',
    text: `Dear ${appointment.patient.name},

Your appointment request with Dr. ${appointment.doctor.name} has been received for ${appointment.date} at ${appointment.timeSlot}.

Type: ${appointment.type}
Location: ${appointment.doctor.location}
Symptoms: ${appointment.symptoms || 'Not specified'}

Your appointment is currently pending confirmation. We will notify you once it is confirmed.

Best regards,
Medical Team`,
  }),
  doctorNotification: (appointment) => ({
    subject: 'New Appointment Request',
    text: `Dear Dr. ${appointment.doctor.name},

A new appointment has been requested:

Patient: ${appointment.patient.name}
Date: ${appointment.date}
Time: ${appointment.timeSlot}
Type: ${appointment.type}
Symptoms: ${appointment.symptoms || 'Not specified'}

Please review and confirm the appointment through the system.

Best regards,
Medical Team`,
  }),
};

// Send email function
const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Send appointment status email
const sendAppointmentStatusEmail = async (appointment) => {
  try {
    if (!emailTemplates[appointment.status]) {
      console.log('No email template found for status:', appointment.status);
      return false;
    }

    const { subject, text } = emailTemplates[appointment.status](appointment);
    return await sendEmail(appointment.patient.email, subject, text);
  } catch (error) {
    console.error('Error sending appointment status email:', error);
    return false;
  }
};

// Send new appointment notification emails
const sendNewAppointmentEmails = async (appointment) => {
  try {
    // Send email to patient
    const patientTemplate = emailTemplates.created(appointment);
    await sendEmail(appointment.patient.email, patientTemplate.subject, patientTemplate.text);

    // Send email to doctor
    const doctorTemplate = emailTemplates.doctorNotification(appointment);
    await sendEmail(appointment.doctor.email, doctorTemplate.subject, doctorTemplate.text);

    return true;
  } catch (error) {
    console.error('Error sending new appointment emails:', error);
    return false;
  }
};

export {
  sendEmail,
  sendAppointmentStatusEmail,
  sendNewAppointmentEmails
};