# CDGI No-Dues Management System

## 🎓 Production-Grade SaaS Academic Operations Platform

A comprehensive digital solution for automating student No-Dues clearance processes across multiple departments with role-based access control for Admin, Faculty, and Students.

---

## ✨ Features

### 🔐 3-Role Authentication System
- **Admin**: Full system control, approvals, certificate generation, audit logs
- **Faculty**: Department-level clearance management and student approvals
- **Student**: Application submission, tracking, and certificate download

### 📋 No-Dues Workflow
- Email-verified application submission
- Department-wise clearance tracking
- Real-time status updates
- PDF certificate generation with QR codes
- Automatic audit logging

### 🛡️ Security Features
- JWT-based authentication with token refresh
- Bcrypt password hashing
- Email verification flow
- Password reset functionality
- Comprehensive audit logging
- CORS protection
- Input validation

### 📊 Admin Dashboard
- Student management
- Application approvals/rejections
- Certificate issuance
- Department configuration
- Audit log viewing
- System statistics

---

## 🏗️ Architecture

### Database Models

**User**
- Unified user model with role-based fields
- Support for student, faculty, and admin roles
- Profile completeness tracking

**NoDues**
- Department-wise clearance status
- Email verification tokens
- Multi-stage approval workflow
- Certificate reference

**Department**
- Clearance requirements
- Faculty assignments
- Contact information

**Certificate**
- Public certificate IDs
- QR code data
- PDF storage
- Revocation support

**AuditLog**
- Complete action tracking
- User activity logging
- Change tracking

---

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Email**: Nodemailer (Gmail)
- **PDF Generation**: PDFKit
- **QR Codes**: QRCode.js
- **File Upload**: Multer

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: Radix UI / shadcn/ui
- **State Management**: React Query
- **Routing**: Wouter
- **Icons**: Lucide React

---

## 📦 Installation

### Prerequisites
- Node.js >= 16
- MongoDB Atlas account
- Gmail account with App Password
- npm or yarn

### Backend Setup

```bash
# Install dependencies
npm install

# Create .env file
cat > .env << EOF
# Server
NODE_ENV=development
PORT=3000

# MongoDB
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/cdgi-nodues

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Frontend URL
FRONTEND_URL=http://localhost:5173
EOF

# Run development server
npm run dev
```

### Frontend Setup

The frontend is in the `client/` directory and runs on the same monorepo.

```bash
# Install deps (already done with npm install)
# Frontend will be served via Vite dev server

# Development
npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/api/v1/health

---

## 📚 API Endpoints

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/verify/:token
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password/:token
```

### Profile
```
GET    /api/v1/profile
PUT    /api/v1/profile
POST   /api/v1/profile/photo
POST   /api/v1/auth/change-password
```

### No-Dues (Student)
```
POST   /api/v1/nodues
GET    /api/v1/nodues/verify/:token
GET    /api/v1/nodues/student
GET    /api/v1/nodues/:id
```

### Faculty
```
GET    /api/v1/faculty/nodues
PUT    /api/v1/faculty/nodues/:noDuesId/approve
PUT    /api/v1/faculty/nodues/:noDuesId/reject
```

### Admin
```
GET    /api/v1/admin/nodues
PUT    /api/v1/admin/nodues/:noDuesId/approve
PUT    /api/v1/admin/nodues/:noDuesId/reject
POST   /api/v1/admin/certificate/generate/:noDuesId
GET    /api/v1/certificate/verify/:certificateId
GET    /api/v1/admin/dashboard/stats
GET    /api/v1/admin/students
GET    /api/v1/admin/audit-logs
POST   /api/v1/admin/departments
GET    /api/v1/admin/departments
```

---

## 🔄 Workflow

### Student Journey
1. **Register** → Email verification
2. **Submit No-Dues** → Email verification of application
3. **Track Status** → View department-wise clearance
4. **Receive Certificate** → Download PDF with QR code

### Faculty Journey
1. **Login** → View assigned department
2. **Review Applications** → See student details
3. **Approve/Reject** → Add remarks and requirements
4. **Update Status** → Automatic notifications

### Admin Journey
1. **Dashboard** → Overview of all statistics
2. **Manage Applications** → Final approval/rejection
3. **Generate Certificates** → Create PDF with verification
4. **Audit Trail** → View all system activities
5. **Department Management** → Configure clearance requirements

---

## 🔒 Security Considerations

### Password Security
- Minimum 8 characters
- Bcrypt hashing with salt rounds = 12
- Secure reset tokens with expiry

### Token Management
- JWT access tokens: 24-hour expiry
- Refresh tokens: 7-day expiry
- Token refresh endpoint for seamless UX

### Email Verification
- 24-hour verification tokens
- Crypto-secure random tokens
- Email templates with security notices

### API Security
- Authorization header validation
- Role-based access control
- CORS protection
- Input validation & sanitization
- Rate limiting ready (can be added via express-rate-limit)

### Data Protection
- Audit logging of all actions
- User activity tracking
- IP address logging
- Change tracking for sensitive operations

---

## 📧 Email Templates

All emails include:
- Professional HTML templates
- Verification links with expiry
- Security warnings for sensitive actions
- Responsive design
- Brand logo and footer

Supported emails:
- Account verification
- Password reset
- No-Dues submission confirmation
- Department approval notifications
- System alerts

---

## 🗄️ Database Indexes

Optimized indexes for performance:
- User: email, role, enrollmentNo
- NoDues: studentId, status, verificationToken
- Certificate: certificateId, studentId, noDuesId
- AuditLog: actorId, action, timestamp

---

## 📁 Folder Structure

```
CampusClear/
├── server/
│   ├── models/
│   │   ├── User.ts (unified user model)
│   │   ├── NoDues.ts
│   │   ├── Department.ts
│   │   ├── Certificate.ts
│   │   └── AuditLog.ts
│   ├── middleware/
│   │   ├── auth.ts (JWT & role-based)
│   │   ├── audit.ts (logging)
│   │   └── errorHandler.ts (centralized)
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── nodues.ts
│   │   └── admin.ts
│   ├── db.ts
│   ├── mailer.ts
│   └── index.ts
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── FacultyDashboard.tsx
│   │   │   ├── dashboard.tsx (student)
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── hooks/
│   │   │   ├── use-auth.tsx (3-role support)
│   │   │   └── use-toast.ts
│   │   ├── lib/
│   │   │   └── auth.ts
│   │   └── components/
│   │       └── ui/
│   │
├── shared/
│   └── schema.ts (unified types)
│
├── package.json
├── tsconfig.json
└── .env.example
```

---

## 🧪 Testing

### Manual Testing
1. Create test accounts for each role
2. Submit No-Dues and track status
3. Test approval/rejection flow
4. Generate and verify certificate
5. Check audit logs

### Email Testing
- Use MailHog for local email testing
- Or check Gmail spam folder for test emails

---

## 📈 Scalability

### Ready for Production
- Database indexing optimized
- Connection pooling via Mongoose
- Stateless API design
- Ready for horizontal scaling

### Performance Optimizations
- Lean queries for reduced memory
- Pagination on list endpoints
- Async operations for heavy tasks
- CDN-ready static files

---

## 🔧 Configuration

### Environment Variables
```env
NODE_ENV=development|production
PORT=3000
MONGO_URL=your-mongodb-uri
JWT_SECRET=min-32-character-secret-key
EMAIL_USER=gmail@gmail.com
EMAIL_PASS=app-specific-password
FRONTEND_URL=http://localhost:5173
```

### Gmail Setup
1. Enable 2-factor authentication
2. Generate App Password (Security → App passwords)
3. Use generated 16-char password as EMAIL_PASS

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Check MONGO_URL in .env
- Ensure IP is whitelisted in MongoDB Atlas
- Verify credentials are correct

### Email Not Sending
- Check EMAIL_USER and EMAIL_PASS
- Verify Gmail App Password is correct
- Check spam folder
- Review server logs for errors

### Token Invalid/Expired
- Clear localStorage and login again
- Check JWT_SECRET matches between runs
- Verify system time is synchronized

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👥 Support

For issues or questions:
1. Check troubleshooting section
2. Review API documentation
3. Check server logs
4. Contact development team

---

## 🚀 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Payment gateway integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API rate limiting
- [ ] WebSocket real-time updates
- [ ] Document upload for departments
- [ ] Automated certificate renewal
- [ ] Integration with college ERP

---

**Built with ❤️ for CDGI - Chameli Devi Group of Institutions**
