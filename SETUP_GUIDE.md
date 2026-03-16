# CDGI No-Dues Portal - Complete Setup & Deployment Guide

## 🎯 Project Overview

This is a **complete, production-ready college-level authentication SaaS** for managing no-dues applications at Chameli Devi Group of Institutions (CDGI), Indore.

**Key Features:**
- ✅ Student registration with email verification
- ✅ Role-based access (Student, Faculty, Admin)
- ✅ Complete No-Dues workflow
- ✅ Faculty department-wise clearance management
- ✅ Admin approval and certificate generation
- ✅ Comprehensive audit logging
- ✅ Secure JWT authentication
- ✅ Email notifications
- ✅ Responsive React frontend
- ✅ MongoDB backend with REST API

---

## 📋 Prerequisites

Before starting, ensure you have:

1. **Node.js** (version 16 or higher)
   ```bash
   node --version  # Should be v16.0.0 or higher
   ```

2. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

3. **MongoDB** (local or cloud)
   - Local: [Install MongoDB Community](https://docs.mongodb.com/manual/installation/)
   - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (recommended for production)

4. **Git** (optional, for version control)

5. **Code Editor** (VS Code recommended)

---

## 🚀 Step-by-Step Setup

### Step 1: Clone/Extract Project

```bash
cd CampusClear
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all Node.js dependencies for both frontend and backend.

### Step 3: Setup Environment Variables

Create a `.env` file in the root directory:

```bash
cp server/.env.example .env
```

Edit `.env` with your configuration:

```env
# ===== SERVER CONFIGURATION =====
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# ===== DATABASE CONFIGURATION =====
# Option 1: Local MongoDB
MONGO_URI=mongodb://localhost:27017/cdgi-nodues

# Option 2: MongoDB Atlas (Recommended)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cdgi-nodues?retryWrites=true&w=majority

# ===== JWT CONFIGURATION =====
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h

# ===== EMAIL CONFIGURATION (Gmail Example) =====
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=CDGI No-Dues Portal <noreply@cdgi.edu.in>

# ===== FILE UPLOAD CONFIGURATION =====
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
```

### Step 4: Setup MongoDB

#### Option A: Local MongoDB

**On Windows:**
1. Download MongoDB Community from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run installer, follow setup
3. MongoDB service starts automatically
4. Verify: Open PowerShell and run `mongosh` or `mongo`

**On macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**On Linux:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

#### Option B: MongoDB Atlas (Cloud) - Recommended

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a new project
4. Create a cluster (M0 free tier is fine for testing)
5. Create a database user (note username & password)
6. Get connection string (it looks like: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)
7. Add your IP to whitelist (Security → Network Access)
8. Paste connection string in `.env` as `MONGO_URI`

### Step 5: Setup Email Service

#### Using Gmail (Recommended for Testing)

1. Enable 2-Factor Authentication on your Google account
2. Generate an **App Password** (not your regular password):
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password
3. Put this password in `.env` as `EMAIL_PASS` (without spaces)

**Important:** Gmail will NOT accept your actual password, you must use the App Password.

#### Using Other Email Services

- **SendGrid:** Change `EMAIL_HOST` to `smtp.sendgrid.net`
- **Office 365:** Change `EMAIL_HOST` to `smtp.office365.com`
- **AWS SES:** Use your SES SMTP credentials

---

## 🏃 Running the Application

### Development Mode (Recommended for Testing)

Open two terminals:

**Terminal 1: Start Backend**
```bash
npm run backend:dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 CDGI No-Dues Backend Server
Running on: http://localhost:3000
```

**Terminal 2: Start Frontend**
```bash
cd client
npm run dev
```

You should see:
```
Local: http://localhost:5173
```

### Access the Application

Open your browser and go to: **http://localhost:5173**

---

## 🧪 Testing the System

### 1. Create Test Admin (First Time Setup)

Since no admin exists yet, create one directly in MongoDB:

```bash
# Open MongoDB shell
mongosh

# Or if using old mongo:
mongo

# In the shell:
use cdgi-nodues

db.admins.insertOne({
  fullName: "System Admin",
  email: "admin@cdgi.edu",
  passwordHash: "$2a$12$7j7Nn....", // This needs to be hashed
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

exit
```

**Better Option:** Use admin registration form once backend handles it.

### 2. Test Student Registration

1. Go to **http://localhost:5173/register**
2. Fill in the form:
   - Name: John Doe
   - Enrollment No: 2023001
   - Email: john@test.com
   - Password: Test123!@
   - Program: B.Tech CSE
   - Batch: 2023-2027
3. Click "Register"
4. Check email (should receive verification link)
5. Click verification link in email
6. Login with email and password

### 3. Test Faculty Login

1. As admin, create a faculty account at **/admin/students**
2. Fill faculty form:
   - Name: Dr. Priya
   - Email: priya@cdgi.edu
   - Department: Library
   - Password: Faculty123!@
3. Logout
4. Login with faculty email/password
5. View **Faculty Dashboard**

### 4. Test No-Dues Workflow

**As Student:**
1. Login with student account
2. Go to **Dashboard**
3. Submit No-Dues request with reason
4. Click verification link in email
5. View request status

**As Faculty:**
1. Login as faculty
2. Go to **Faculty Dashboard**
3. View student requests
4. Update clearance status to "CLEARED"

**As Admin:**
1. Login as admin
2. Go to **Admin Dashboard**
3. View all requests
4. Check if all departments are cleared
5. Click "Approve" to generate certificate
6. View generated certificate

---

## 📦 Project Structure Explained

```
CampusClear/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/             # React components
│   │   ├── pages/                  # Page components
│   │   ├── hooks/                  # Custom hooks (useAuth, etc.)
│   │   ├── lib/                    # Utilities (auth, API calls)
│   │   ├── App.tsx                 # Main app component
│   │   └── main.tsx                # Entry point
│   ├── .env.local                  # Frontend environment (VITE_API_URL)
│   └── package.json
│
├── server/                          # Backend
│   ├── src/
│   │   ├── config/                 # Environment & Database config
│   │   ├── models/                 # MongoDB schemas
│   │   ├── controllers/            # Business logic
│   │   ├── routes/                 # API endpoints
│   │   ├── middleware/             # Auth & Error handling
│   │   ├── services/               # Audit logging
│   │   ├── utils/                  # Password, JWT, Email
│   │   ├── app.ts                  # Express app setup
│   │   └── server.ts               # Server start script
│   ├── .env.example                # Environment template
│   └── package.json
│
├── shared/                          # Shared types/schemas
├── .env                             # Environment variables
└── package.json                     # Root package.json
```

---

## 🔐 Default Credentials (Change After Setup!)

After initial setup, use these to test:

**Admin:**
- Email: `admin@cdgi.edu`
- Password: `Admin123!@`

**Faculty (Created by Admin):**
- Created through admin panel
- Department-specific access

**Student:**
- Registers through registration form
- Email verification required

---

## 🛠️ Useful Commands

### Backend Commands

```bash
# Start backend development
npm run backend:dev

# Start backend production
npm run backend:start

# Fix database indexes
npm run db:fix-indexes

# Type check
npm run check
```

### Database Commands

```bash
# Open MongoDB shell (local)
mongosh
# or
mongo

# List databases
show dbs

# Switch to cdgi-nodues database
use cdgi-nodues

# View collections
show collections

# Clear all data (WARNING - destructive!)
db.dropDatabase()

# Count documents
db.students.countDocuments()
db.faculty.countDocuments()
db.admins.countDocuments()
db.noduesrequests.countDocuments()
db.certificates.countDocuments()

# View sample document
db.students.findOne()
```

---

## 🐛 Troubleshooting

### Problem: "MONGO_URI not set"
**Solution:** Make sure `.env` file has `MONGO_URI` configured correctly

### Problem: "Connection refused" on localhost:27017
**Solution:** 
- Make sure MongoDB is running: `mongosh` or check Services
- Or use MongoDB Atlas connection string instead

### Problem: Email not sending
**Solution:**
- Verify `EMAIL_USER` and `EMAIL_PASS` are correct
- For Gmail, ensure you're using App Password (not regular password)
- Check if less secure apps are allowed
- Test with `curl` to backend email endpoint

### Problem: "JWT_SECRET not properly configured"
**Solution:** Change `JWT_SECRET` to a strong random string in `.env`

### Problem: CORS errors in frontend
**Solution:** 
- Make sure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check `client/.env.local` has correct `VITE_API_URL`

### Problem: Port already in use
**Solution:**
- Backend: Change `PORT` in `.env` (e.g., PORT=3001)
- Frontend: Specify different port: `npm run dev -- --port 5174`

### Problem: Database index errors
**Solution:**
- Run: `npm run db:fix-indexes`
- This clears old indexes and recreates them

---

## 📊 Database Backup & Restore

### MongoDB Atlas Backup (Recommended)
- Automatic daily backups enabled
- Go to Backup section in MongoDB Atlas dashboard
- Can restore to any point

### Manual Backup (Local MongoDB)
```bash
# Backup all databases
mongodump --out ./backup

# Backup specific database
mongodump --db cdgi-nodues --out ./backup

# Restore
mongorestore ./backup
```

---

## 🚀 Production Deployment

### Before Deploying

1. ✅ Change `NODE_ENV` to `production`
2. ✅ Change `JWT_SECRET` to strong random value
3. ✅ Use MongoDB Atlas (not local)
4. ✅ Enable 2FA for all accounts
5. ✅ Setup proper email service (not Gmail testing)
6. ✅ Configure HTTPS (production)
7. ✅ Set proper CORS origins
8. ✅ Enable rate limiting (future enhancement)

### Hosting Options

**Backend Hosting:**
- **Heroku** - Easy, free tier available
- **AWS EC2** - Full control, pay-as-you-go
- **Railway** - Modern, simple deployment
- **Render** - Similar to Heroku
- **DigitalOcean** - Affordable VPS

**Frontend Hosting:**
- **Vercel** - Optimized for React
- **Netlify** - Free tier with CI/CD
- **AWS S3 + CloudFront** - Scalable
- **GitHub Pages** - Free, for static sites

**Database Hosting:**
- **MongoDB Atlas** - Official MongoDB cloud (recommended)
- **AWS DocumentDB** - AWS managed MongoDB
- **Self-hosted** - Full control, needs maintenance

### Example: Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secure_secret
heroku config:set MONGO_URI=mongodb+srv://...
# (repeat for all env vars)

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

---

## 📈 Performance Tips

1. **Enable MongoDB indexes** - Already done in models
2. **Implement caching** - Add Redis for frequently accessed data
3. **Optimize images** - Compress profile photos
4. **Enable compression** - Add gzip middleware
5. **Database queries** - Use lean() for read-only operations
6. **Connection pooling** - MongoDB handles automatically

---

## 🔒 Security Checklist

- ✅ Passwords hashed with bcrypt (salt 12)
- ✅ JWT tokens with 24h expiration
- ✅ Email verification required for registration
- ✅ CORS configured properly
- ✅ HTTP security headers enabled
- ✅ Input validation on all routes
- ✅ SQL injection prevented (using MongoDB)
- ✅ XSS protection enabled
- ✅ HTTPS ready (configure in production)

---

## 📞 Support & Help

**Common Issues:**
- Check [BACKEND_README.md](./BACKEND_README.md) for API documentation
- Review error messages in browser console
- Check server logs in terminal
- Review MongoDB data with `mongosh`

**For College Integration:**
- Contact development team
- Provide specific requirements
- Plan ERP sync if needed

---

## 🎉 Success Indicators

You'll know everything is working when:
1. ✅ Backend starts without errors
2. ✅ Frontend loads at localhost:5173
3. ✅ Can register new student account
4. ✅ Verification email arrives
5. ✅ Can login with student account
6. ✅ Can submit no-dues request
7. ✅ Faculty can review requests
8. ✅ Admin can approve and generate certificates

---

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [JWT.io](https://jwt.io/)
- [Nodemailer](https://nodemailer.com/)

---

**Version:** 1.0.0  
**Created for:** CDGI, Indore  
**Last Updated:** January 2026

---

### Next Steps

1. ✅ Follow setup steps above
2. ✅ Run both backend and frontend
3. ✅ Test all user flows
4. ✅ Customize for your institution
5. ✅ Deploy to production
6. ✅ Train users on system

Good luck! 🚀
