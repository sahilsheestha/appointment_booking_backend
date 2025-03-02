# Doctor Appointment System Backend

A robust and secure backend system for managing doctor appointments, built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Doctor profile management
- Appointment scheduling and management
- Location-based doctor search
- Email notifications
- Rate limiting and security features
- Error handling and logging
- Superadmin initialization on first startup

## Prerequisites

- Node.js >= 14.0.0
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/doctor-appointment
JWT_SECRET=your_jwt_secret_key

# Email configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

# Superadmin credentials (used only on first startup)
SUPERADMIN_EMAIL=admin@example.com
SUPERADMIN_PASSWORD=your_secure_password
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## First Time Setup

On first startup, the system will automatically create a superadmin user if one doesn't exist. The credentials will be:
- Email: Value of SUPERADMIN_EMAIL in .env (defaults to admin@example.com)
- Password: Value of SUPERADMIN_PASSWORD in .env (defaults to admin123)

**Important**: Please change the superadmin password after first login.

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - User login
- POST /api/auth/forgot-password - Request password reset
- POST /api/auth/reset-password - Reset password

### Doctors (Admin/Superadmin only)
- GET /api/doctors - Get all doctors
- GET /api/doctors/:id - Get doctor by ID
- POST /api/doctors - Add new doctor
- PUT /api/doctors/:id - Update doctor
- DELETE /api/doctors/:id - Delete doctor
- GET /api/doctors/:id/appointments - Get doctor's appointments

### Appointments
- GET /api/appointments - Get user's appointments
- POST /api/appointments - Create new appointment
- PUT /api/appointments/:id - Update appointment
- DELETE /api/appointments/:id - Cancel appointment

### Locations
- GET /api/locations - Get all locations
- POST /api/locations - Add new location (Admin only)
- PUT /api/locations/:id - Update location (Admin only)
- DELETE /api/locations/:id - Delete location (Admin only)

## Security Features

- CORS protection
- Rate limiting
- XSS protection
- NoSQL injection prevention
- Security headers (Helmet)
- Request sanitization
- JWT authentication
- Role-based access control

## Error Handling

The application includes comprehensive error handling:
- Operational errors (400, 401, 403, 404)
- Programming errors (500)
- Unhandled rejections and exceptions
- Validation errors
- Database errors

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 