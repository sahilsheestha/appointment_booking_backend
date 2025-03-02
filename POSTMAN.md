# Doctor Appointment System API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Environment Variables
Create these variables in your Postman environment:
- `BASE_URL`: Your API base URL (e.g., http://localhost:3000/api)
- `TOKEN`: Store your JWT token here after login

## API Endpoints

### 1. Authentication

#### Register User
```http
POST {{BASE_URL}}/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "patient"  // Optional, defaults to "patient"
}

Response (201 Created):
{
    "status": "success",
    "token": "your_jwt_token",
    "data": {
        "user": {
            "id": "user_id",
            "name": "John Doe",
            "email": "john@example.com",
            "role": "patient"
        }
    }
}
```

#### Login
```http
POST {{BASE_URL}}/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}

Response (200 OK):
{
    "status": "success",
    "token": "your_jwt_token",
    "data": {
        "user": {
            "id": "user_id",
            "name": "John Doe",
            "email": "john@example.com",
            "role": "patient"
        }
    }
}
```

#### Forgot Password
```http
POST {{BASE_URL}}/auth/forgot-password
Content-Type: application/json

{
    "email": "john@example.com"
}

Response (200 OK):
{
    "status": "success",
    "message": "Token sent to email!"
}
```

#### Reset Password
```http
POST {{BASE_URL}}/auth/reset-password
Content-Type: application/json

{
    "token": "reset_token",
    "password": "new_password123"
}

Response (200 OK):
{
    "status": "success",
    "token": "new_jwt_token"
}
```

### 2. Doctors (Public Routes)

#### Get All Doctors
```http
GET {{BASE_URL}}/doctors

Response (200 OK):
{
    "status": "success",
    "results": 2,
    "data": {
        "doctors": [
            {
                "id": "doctor_id",
                "name": "Dr. Jane Smith",
                "specialization": "Cardiologist",
                "qualification": "MD, MBBS",
                "experience": 10,
                "location": {
                    "name": "City Hospital",
                    "address": "123 Medical St"
                },
                "fees": 100
            },
            // ... more doctors
        ]
    }
}
```

#### Get Doctor by ID
```http
GET {{BASE_URL}}/doctors/:id

Response (200 OK):
{
    "status": "success",
    "data": {
        "doctor": {
            "id": "doctor_id",
            "name": "Dr. Jane Smith",
            "specialization": "Cardiologist",
            "qualification": "MD, MBBS",
            "experience": 10,
            "location": {
                "name": "City Hospital",
                "address": "123 Medical St"
            },
            "fees": 100
        }
    }
}
```

### 3. Appointments (Protected Routes - Requires Authentication)

#### Get My Appointments
```http
GET {{BASE_URL}}/appointments/my-appointments
Authorization: Bearer {{TOKEN}}

Response (200 OK):
{
    "status": "success",
    "results": 2,
    "data": {
        "appointments": [
            {
                "id": "appointment_id",
                "doctor": {
                    "id": "doctor_id",
                    "name": "Dr. Jane Smith",
                    "specialization": "Cardiologist"
                },
                "appointmentDate": "2024-03-10T00:00:00.000Z",
                "timeSlot": "09:00-09:30",
                "status": "pending",
                "symptoms": "Fever and headache"
            },
            // ... more appointments
        ]
    }
}
```

#### Create Appointment
```http
POST {{BASE_URL}}/appointments
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
    "doctorId": "doctor_id",
    "appointmentDate": "2024-03-10",
    "timeSlot": "09:00-09:30",
    "symptoms": "Fever and headache"
}

Response (201 Created):
{
    "status": "success",
    "data": {
        "appointment": {
            "id": "appointment_id",
            "doctor": "doctor_id",
            "patient": "patient_id",
            "appointmentDate": "2024-03-10T00:00:00.000Z",
            "timeSlot": "09:00-09:30",
            "status": "pending",
            "symptoms": "Fever and headache"
        }
    }
}
```

#### Get Appointment Details
```http
GET {{BASE_URL}}/appointments/:id
Authorization: Bearer {{TOKEN}}

Response (200 OK):
{
    "status": "success",
    "data": {
        "appointment": {
            "id": "appointment_id",
            "doctor": {
                "id": "doctor_id",
                "name": "Dr. Jane Smith",
                "specialization": "Cardiologist"
            },
            "appointmentDate": "2024-03-10T00:00:00.000Z",
            "timeSlot": "09:00-09:30",
            "status": "pending",
            "symptoms": "Fever and headache"
        }
    }
}
```

#### Cancel Appointment
```http
PATCH {{BASE_URL}}/appointments/:id/cancel
Authorization: Bearer {{TOKEN}}

Response (200 OK):
{
    "status": "success",
    "data": {
        "appointment": {
            "id": "appointment_id",
            "status": "cancelled"
        }
    }
}
```

### 4. Admin Routes (Requires Admin/Superadmin Role)

#### Create Doctor
```http
POST {{BASE_URL}}/doctors
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
    "name": "Dr. Jane Smith",
    "specialization": "Cardiologist",
    "qualification": "MD, MBBS",
    "experience": 10,
    "location": "location_id",
    "availableSlots": ["09:00-09:30", "09:30-10:00"],
    "fees": 100
}

Response (201 Created):
{
    "status": "success",
    "data": {
        "doctor": {
            "id": "doctor_id",
            "name": "Dr. Jane Smith",
            "specialization": "Cardiologist",
            "qualification": "MD, MBBS",
            "experience": 10,
            "location": "location_id",
            "availableSlots": ["09:00-09:30", "09:30-10:00"],
            "fees": 100
        }
    }
}
```

#### Update Doctor
```http
PUT {{BASE_URL}}/doctors/:id
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
    "name": "Dr. Jane Smith",
    "specialization": "Cardiologist",
    "fees": 120
}

Response (200 OK):
{
    "status": "success",
    "data": {
        "doctor": {
            "id": "doctor_id",
            "name": "Dr. Jane Smith",
            "specialization": "Cardiologist",
            "fees": 120
            // ... other fields
        }
    }
}
```

#### Delete Doctor
```http
DELETE {{BASE_URL}}/doctors/:id
Authorization: Bearer {{TOKEN}}

Response (204 No Content)
```

#### Get Doctor's Appointments
```http
GET {{BASE_URL}}/doctors/:id/appointments
Authorization: Bearer {{TOKEN}}

Response (200 OK):
{
    "status": "success",
    "data": {
        "appointments": [
            {
                "id": "appointment_id",
                "patient": {
                    "name": "John Doe",
                    "email": "john@example.com"
                },
                "appointmentDate": "2024-03-10T00:00:00.000Z",
                "timeSlot": "09:00-09:30",
                "status": "pending",
                "symptoms": "Fever and headache"
            },
            // ... more appointments
        ]
    }
}
```

## Error Responses

### Validation Error (400 Bad Request)
```json
{
    "status": "fail",
    "message": "Please provide email and password!"
}
```

### Authentication Error (401 Unauthorized)
```json
{
    "status": "fail",
    "message": "You are not logged in! Please log in to get access."
}
```

### Permission Error (403 Forbidden)
```json
{
    "status": "fail",
    "message": "You do not have permission to perform this action"
}
```

### Not Found Error (404 Not Found)
```json
{
    "status": "fail",
    "message": "No doctor found with that ID"
}
```

### Server Error (500 Internal Server Error)
```json
{
    "status": "error",
    "message": "Something went wrong!"
}
```

## Available Time Slots
The following time slots are available for appointments:
```javascript
[
    "09:00-09:30", "09:30-10:00",
    "10:00-10:30", "10:30-11:00",
    "11:00-11:30", "11:30-12:00",
    "14:00-14:30", "14:30-15:00",
    "15:00-15:30", "15:30-16:00",
    "16:00-16:30", "16:30-17:00"
]
```

## Appointment Status
Possible values for appointment status:
- `pending`: Initial state when appointment is created
- `confirmed`: Approved by doctor/admin
- `cancelled`: Cancelled by patient or doctor
- `completed`: Appointment has been completed

## User Roles
- `patient`: Default role, can book and manage appointments
- `doctor`: Can view and manage their appointments
- `admin`: Can manage doctors and view all appointments
- `superadmin`: Has full system access 