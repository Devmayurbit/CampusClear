# CDGI No-Dues Management System - Backend Documentation

## 📋 Overview

A complete, production-ready Node.js/Express backend for the **Chameli Devi Group of Institutions (CDGI) No-Dues Management System**. This is a comprehensive college-level authentication SaaS that manages student no-dues applications, faculty reviews, admin approvals, and certificate generation.

**Tech Stack:**
- Node.js + Express.js with TypeScript
- MongoDB with Mongoose ODM
- JWT Authentication with bcrypt password hashing
- Nodemailer for email verification and notifications
- Error handling with comprehensive logging
- CORS-enabled REST API with /api/v1 versioning

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ or 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone and navigate to project:**
   ```bash
   cd CampusClear
   npm install
   ```

2. **Create `.env` file from template:**
   ```bash
   cp server/.env.example .env
   ```

3. **Configure environment variables** (edit `.env`):
   ```env
   # Server
   NODE_ENV=development
   PORT=3000
   BASE_URL=http://localhost:3000
   FRONTEND_URL=http://localhost:5173

   # MongoDB
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/cdgi-nodues
   # OR Local: mongodb://localhost:27017/cdgi-nodues

   # JWT
   JWT_SECRET=your_super_secret_key_here
   JWT_EXPIRES_IN=24h

   # Email (Gmail example)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your_app_specific_password
   EMAIL_FROM=CDGI No-Dues Portal <noreply@cdgi.edu.in>

   # File Uploads
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE_MB=10
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The backend will start at `http://localhost:3000`

5. **In another terminal, start frontend:**
   ```bash
   cd client
   npm run dev
   ```

   Frontend runs at `http://localhost:5173`

## 📁 Backend Architecture

### Modular Structure
```
server/
├── src/
│   ├── config/          # Configuration (env, database)
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, error handling
│   ├── services/        # Audit logging service
│   ├── utils/           # Utilities (password, JWT, email)
│   ├── types/           # TypeScript type definitions
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server bootstrap
├── .env.example        # Environment template
└── package.json
```

## 🔐 Authentication System

### User Roles & Workflows

#### **Student**
- **Register** with email verification
- **Submit** no-dues request
- **View** request status
- **Download** certificate when approved

#### **Faculty** (6 departments)
- Library, Accounts, Hostel, Lab, Training & Placement, Sports
- **View** pending requests for their department
- **Update** clearance status (CLEARED/PENDING/HOLD) with remarks
- **Dashboard** showing stats

#### **Admin**
- **Create** faculty and admin accounts
- **Approve** or **reject** requests (only if all departments cleared)
- **Generate** certificates
- **View** audit logs
- **Access** system statistics

### JWT Token Structure
```json
{
  "userId": "mongo_object_id",
  "role": "student|faculty|admin",
  "email": "user@email.com",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## 📡 API Endpoints

### Authentication

#### Register Student
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "enrollmentNo": "2023001",
  "email": "john@student.cdgi.edu",
  "password": "SecurePass123!",
  "program": "B.Tech CSE",
  "batch": "2023-2027"
}
```

**Response:** Student registered, verification email sent

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@student.cdgi.edu",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@student.cdgi.edu",
      "role": "student",
      "enrollmentNo": "2023001"
    }
  }
}
```

#### Verify Email
```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
```

#### Create Faculty/Admin (Admin only)
```http
POST /api/v1/auth/staff
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "fullName": "Dr. Priya Singh",
  "email": "priya@cdgi.edu",
  "role": "faculty",
  "department": "library",
  "password": "SecurePass123!"
}
```

### No-Dues Workflow

#### Submit Request
```http
POST /api/v1/nodues/submit
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "reason": "Graduation clearance needed"
}
```

#### Verify Request (Email Token)
```http
POST /api/v1/nodues/verify
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
```

#### Get Student's Current Request
```http
GET /api/v1/nodues/my-request
Authorization: Bearer <student_token>
```

#### Get Request History
```http
GET /api/v1/nodues/history
Authorization: Bearer <student_token>
```

### Faculty Endpoints

#### Get Dashboard
```http
GET /api/v1/faculty/dashboard
Authorization: Bearer <faculty_token>
```

#### Get Pending Requests (Filtered by Department)
```http
GET /api/v1/faculty/requests
Authorization: Bearer <faculty_token>
```

#### Get Specific Request
```http
GET /api/v1/faculty/requests/{requestId}
Authorization: Bearer <faculty_token>
```

#### Update Clearance Status
```http
PUT /api/v1/faculty/requests/{requestId}/update
Authorization: Bearer <faculty_token>
Content-Type: application/json

{
  "status": "CLEARED",
  "remarks": "No pending fines"
}
```

#### Search by Enrollment Number
```http
GET /api/v1/faculty/search?enrollmentNo=2023001
Authorization: Bearer <faculty_token>
```

### Admin Endpoints

#### Get Dashboard with Stats
```http
GET /api/v1/admin/dashboard
Authorization: Bearer <admin_token>
```

#### Get All Requests (Filtered by Status)
```http
GET /api/v1/admin/requests?status=PENDING&page=1
Authorization: Bearer <admin_token>
```

#### Approve Request
```http
PUT /api/v1/admin/requests/{requestId}/approve
Authorization: Bearer <admin_token>
```

#### Reject Request
```http
PUT /api/v1/admin/requests/{requestId}/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Missing department clearances"
}
```

#### Get Audit Logs
```http
GET /api/v1/admin/audit-logs?page=1
Authorization: Bearer <admin_token>
```

#### Get System Stats
```http
GET /api/v1/admin/stats
Authorization: Bearer <admin_token>
```

### Certificate Endpoints

#### Generate Certificate (Admin only)
```http
POST /api/v1/certificate/{requestId}/generate
Authorization: Bearer <admin_token>
```

#### Verify Certificate (Public)
```http
GET /api/v1/certificate/verify/{certificateId}
```

#### Get Student's Certificates
```http
GET /api/v1/certificate/my-certificates
Authorization: Bearer <student_token>
```

#### List All Certificates (Admin)
```http
GET /api/v1/certificate/list?page=1
Authorization: Bearer <admin_token>
```

#### Download Certificate
```http
GET /api/v1/certificate/{certificateId}/download
Authorization: Bearer <token>
```

## 📊 Database Models

### Student
```json
{
  "_id": ObjectId,
  "fullName": "String",
  "enrollmentNo": "String (unique)",
  "email": "String (unique)",
  "passwordHash": "String",
  "program": "String",
  "batch": "String",
  "role": "student",
  "verified": Boolean,
  "verificationToken": "String",
  "isActive": Boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

### Faculty
```json
{
  "_id": ObjectId,
  "fullName": "String",
  "email": "String (unique)",
  "passwordHash": "String",
  "department": "library|accounts|hostel|lab|tp|sports",
  "role": "faculty",
  "isActive": Boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

### NoDuesRequest
```json
{
  "_id": ObjectId,
  "studentId": ObjectId,
  "reason": "String",
  "departments": {
    "library": { "status": "PENDING|CLEARED|HOLD", "remarks": "String", "updatedBy": ObjectId, "updatedAt": Date },
    "accounts": { ... },
    "hostel": { ... },
    "lab": { ... },
    "tp": { ... },
    "sports": { ... }
  },
  "verified": Boolean,
  "verificationToken": "String",
  "overallStatus": "PENDING|APPROVED|REJECTED|HOLD",
  "createdAt": Date,
  "updatedAt": Date
}
```

### Certificate
```json
{
  "_id": ObjectId,
  "certificateId": "String (unique)",
  "studentId": ObjectId,
  "noDuesRequestId": ObjectId,
  "issuedAt": Date,
  "pdfPath": "String",
  "issuedBy": ObjectId,
  "createdAt": Date,
  "updatedAt": Date
}
```

### AuditLog
```json
{
  "_id": ObjectId,
  "actorId": ObjectId,
  "actorRole": "student|faculty|admin",
  "action": "String",
  "targetType": "Student|Faculty|Admin|NoDuesRequest|Certificate",
  "targetId": ObjectId,
  "timestamp": Date
}
```

## 🔒 Security Features

✅ **Password Security**
- bcrypt with salt 12
- Hashed storage, never plain text

✅ **JWT Authentication**
- 24-hour expiration (configurable)
- Role-based authorization
- Token stored in localStorage on client

✅ **Email Verification**
- Verification tokens for registration and requests
- Expires in 24 hours
- 32-byte random tokens

✅ **HTTP Security Headers**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: no-referrer

✅ **CORS Configuration**
- Restricted to frontend origin
- Credentials enabled
- Specific methods allowed

✅ **Input Validation**
- Email format validation
- Password requirements
- Enrollment number uniqueness
- Required field checks

## 🐛 Error Handling

All errors return consistent JSON format:
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message"
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - Missing or invalid fields
- `DUPLICATE` - Record already exists
- `NOT_FOUND` - Resource not found
- `INVALID_CREDENTIALS` - Login failed
- `INVALID_TOKEN` - Token expired or invalid
- `EMAIL_NOT_VERIFIED` - Student email not verified
- `NOT_APPROVED` - Request not approved yet
- `NOT_READY` - Prerequisites not met

## 📧 Email Templates

### Registration Verification
- Subject: "Verify Your Email - CDGI No-Dues Portal"
- Content: Welcome message, verification button, expiration warning

### No-Dues Request Verification
- Subject: "Verify Your No-Dues Request - CDGI Portal"
- Content: Request details, verification link, deadline

### Request Approved
- Subject: "No-Dues Certificate Approved - CDGI Portal"
- Content: Congratulations message, certificate download info

### Certificate Issued
- Subject: "Your No-Dues Certificate - CDGI Portal"
- Content: Certificate ID, issuance details, verification link

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Change `JWT_SECRET` to strong random string
   - Set `NODE_ENV=production`
   - Configure MongoDB Atlas for production DB
   - Use production Gmail app password
   - Set correct `FRONTEND_URL`

2. **Build**
   ```bash
   npm run build
   ```

3. **Start Production**
   ```bash
   npm run start
   ```

4. **Verify Health**
   ```bash
   curl http://localhost:3000/health
   ```

### MongoDB Setup

**Local Development:**
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod --dbpath ./data

# Or use Docker:
docker run -d -p 27017:27017 -v mongo_data:/data/db mongo:latest
```

**MongoDB Atlas (Cloud):**
1. Create account at mongodb.com/cloud
2. Create cluster
3. Get connection string
4. Add IP whitelist
5. Use connection string as `MONGO_URI`

### Email Configuration

**Using Gmail:**
1. Enable 2-Factor Authentication
2. Generate App Password (not your actual password)
3. Use App Password in `EMAIL_PASS`
4. Note: Gmail may block less secure apps

**Using Other Providers:**
- **SendGrid:** `SMTP_HOST=smtp.sendgrid.net`, Port 587
- **AWS SES:** `SMTP_HOST=email-smtp.region.amazonaws.com`
- **Office 365:** `SMTP_HOST=smtp.office365.com`, Port 587

## 🧪 Testing Flows

### Complete Student Registration Flow
1. Register at `/auth/register`
2. Verify email via link
3. Login with credentials
4. Submit no-dues request
5. Verify request with email token
6. View request status

### Faculty Review Flow
1. Faculty login
2. View pending requests (filtered by department)
3. Search specific student
4. Update clearance status
5. Add remarks

### Admin Approval Flow
1. Admin login
2. View all verified requests
3. Check department statuses
4. Approve (all departments cleared)
5. Generate certificate
6. View certificates

## 📚 Utilities

### Password Utility
```typescript
import { hashPassword, comparePassword } from "./utils/password";

const hash = await hashPassword("plaintext");
const matches = await comparePassword("plaintext", hash);
```

### JWT Utility
```typescript
import { signToken, verifyToken } from "./utils/jwt";

const token = signToken({ userId, role, email });
const payload = verifyToken(token);
```

### Email Utility
```typescript
import { sendEmail } from "./utils/email";

await sendEmail({
  to: "recipient@email.com",
  subject: "Welcome",
  html: "<h1>Hello</h1>"
});
```

## 🔄 Audit Logging

Every significant action is logged:
- User registration and login
- No-Dues submission and verification
- Faculty status updates
- Admin approvals and rejections
- Certificate generation

Access logs via: `GET /api/v1/admin/audit-logs`

## 📞 Support & Documentation

For issues or questions:
- Check error codes and messages
- Review audit logs for troubleshooting
- Verify environment variables
- Check MongoDB connection
- Review email configuration

## 📄 License

MIT License - Free for educational and commercial use

## 🎓 College Integration

Ready for:
- Official CDGI ERP database sync (future enhancement)
- PDF certificate generation service integration
- SMS notifications (optional)
- Additional custom workflows

---

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Built for:** Chameli Devi Group of Institutions (CDGI)
