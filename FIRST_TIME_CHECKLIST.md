# ✅ CDGI No-Dues Portal - First-Time User Checklist

Use this checklist to ensure everything is working correctly after setup.

---

## 📋 Prerequisites Check

- [ ] Node.js installed (`node --version` shows v16+)
- [ ] npm installed (`npm --version` shows 9+)
- [ ] MongoDB available (local or Atlas)
- [ ] Code editor installed (VS Code recommended)
- [ ] Port 3000 available (for backend)
- [ ] Port 5173 available (for frontend)

---

## 🔧 Setup Phase

- [ ] Extracted/cloned project to folder
- [ ] Ran `npm install` (no errors)
- [ ] Created `.env` file from `server/.env.example`
- [ ] Configured `.env` with:
  - [ ] `MONGO_URI` - MongoDB connection string
  - [ ] `JWT_SECRET` - Strong random string
  - [ ] `EMAIL_USER` - Your email address
  - [ ] `EMAIL_PASS` - App-specific password (for Gmail)
  - [ ] `EMAIL_FROM` - Institution email
- [ ] Created `client/.env.local` with `VITE_API_URL=http://localhost:3000`
- [ ] MongoDB running (local or Atlas)

---

## 🚀 Startup Phase

### Backend Startup
- [ ] Open Terminal 1
- [ ] Run `npm run backend:dev`
- [ ] Server starts without errors
- [ ] See message: "🚀 CDGI No-Dues Backend Server"
- [ ] Backend running on `http://localhost:3000`
- [ ] Health check: `curl http://localhost:3000/health`

### Frontend Startup
- [ ] Open Terminal 2
- [ ] Run `cd client && npm run dev`
- [ ] Vite development server starts
- [ ] See message: "Local: http://localhost:5173"
- [ ] Frontend running on `http://localhost:5173`
- [ ] No 404 errors in console

### Both Running
- [ ] Open browser: `http://localhost:5173`
- [ ] App loads without errors
- [ ] No CORS errors in console
- [ ] Navigation works (buttons clickable)

---

## 🧪 Student Registration Flow

- [ ] Click "Register" button
- [ ] Fill registration form:
  - [ ] Full Name: Enter a name
  - [ ] Enrollment Number: e.g., "2023001"
  - [ ] Email: Use a valid email you can access
  - [ ] Password: e.g., "Test123!@"
  - [ ] Program: e.g., "B.Tech CSE"
  - [ ] Batch: e.g., "2023-2027"
- [ ] Click "Register" button
- [ ] See success message
- [ ] Check email inbox for verification link
- [ ] Click verification link in email
- [ ] See "Email verified" message
- [ ] Redirected to login page
- [ ] Login with email and password
- [ ] Dashboard loads successfully

---

## 🎓 Student Dashboard

- [ ] Dashboard page loads
- [ ] See welcome message
- [ ] Navigation menu visible
- [ ] "Submit No-Dues Request" button visible
- [ ] Profile section shows student info
- [ ] Can see enrollment number
- [ ] Can see batch information

---

## 📝 No-Dues Request Flow

- [ ] Click "Submit No-Dues Request"
- [ ] Enter reason (e.g., "Graduation clearance needed")
- [ ] Click "Submit"
- [ ] See success message
- [ ] Check email for verification link
- [ ] Click verification link
- [ ] See "Request verified" message
- [ ] View request status on dashboard
- [ ] Status shows "PENDING"
- [ ] See all 6 departments
- [ ] Each department shows "PENDING" status

---

## 👥 Faculty Setup & Testing

### Create Faculty Account (as Admin)
- [ ] Logout from student account
- [ ] You need admin account first (see Admin Setup below)
- [ ] Login as admin
- [ ] Go to Admin → Students or create faculty section
- [ ] Click "Create Faculty Account"
- [ ] Fill form:
  - [ ] Name: Dr. Priya Singh
  - [ ] Email: priya@cdgi.edu
  - [ ] Department: Library
  - [ ] Password: Faculty123!@
- [ ] Submit form
- [ ] See success message
- [ ] Logout

### Faculty Login & Dashboard
- [ ] Login with faculty email: priya@cdgi.edu
- [ ] Password: Faculty123!@
- [ ] Faculty Dashboard loads
- [ ] See department: Library
- [ ] See "Pending Requests" section
- [ ] Should see student's request (if verified)
- [ ] Can see student enrollment number
- [ ] Can see request status

### Faculty Update Status
- [ ] Click on student request
- [ ] See request details
- [ ] See clearance status options
- [ ] Select "CLEARED"
- [ ] Add remark: "No library dues"
- [ ] Click "Update Status"
- [ ] See success message
- [ ] Status changed to "CLEARED"
- [ ] See updated date/time

---

## 🏛️ Admin Setup & Testing

### Create Admin Account (Manual Database)
Since this is first-time setup, create admin in MongoDB:

```bash
# Open MongoDB shell
mongosh

# Switch to database
use cdgi-nodues

# Create admin (copy-paste one command):
db.admins.insertOne({
  fullName: "System Admin",
  email: "admin@cdgi.edu",
  passwordHash: "$2a$12$7j7NnK8QeZ5wK8vJ2qX9L.eVqB5kL2mN3oP4qR5sT6uV7wX8yZ9aB",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

# Should see: acknowledged: true, insertedId: ObjectId(...)
exit
```

**Password:** `Admin123!@` (corresponds to the hash above)

### Admin Login
- [ ] Logout from faculty
- [ ] Login with admin email: admin@cdgi.edu
- [ ] Password: Admin123!@
- [ ] Admin Dashboard loads
- [ ] See statistics:
  - [ ] Total requests count
  - [ ] Approved count
  - [ ] Pending count
  - [ ] Hold count
  - [ ] Rejected count
- [ ] See recent requests list

### Admin Create Faculty
- [ ] Go to Admin → Students section
- [ ] Click "Create Faculty Account"
- [ ] Fill form:
  - [ ] Full Name: Dr. Accounts Staff
  - [ ] Email: accounts@cdgi.edu
  - [ ] Department: Accounts
  - [ ] Password: Accounts123!@
- [ ] Click "Create"
- [ ] See success message

### Admin Manage Requests
- [ ] Go to "All Requests" section
- [ ] Should see student's request
- [ ] See all departments:
  - [ ] Library: CLEARED (if faculty updated)
  - [ ] Accounts: PENDING
  - [ ] Hostel: PENDING
  - [ ] Lab: PENDING
  - [ ] TP: PENDING
  - [ ] Sports: PENDING
- [ ] Cannot approve yet (not all departments cleared)
- [ ] Try to click other departments
- [ ] Create more faculty to update remaining departments

### Admin Approve & Generate Certificate
- [ ] After all departments marked CLEARED
- [ ] Click "Approve" button
- [ ] See success message
- [ ] Request status changes to "APPROVED"
- [ ] Click "Generate Certificate"
- [ ] See certificate ID generated
- [ ] Certificate appears in certificate list
- [ ] View certificate details

---

## 📊 Admin Dashboard Features

- [ ] Dashboard statistics visible
- [ ] View all requests with pagination
- [ ] Filter by status (PENDING, APPROVED, etc.)
- [ ] Search by enrollment number
- [ ] View audit logs
  - [ ] See all user actions
  - [ ] Sorted by timestamp
  - [ ] Shows actor, role, action, target
- [ ] System statistics:
  - [ ] Total students
  - [ ] Total faculty
  - [ ] Total admins
  - [ ] Total requests
  - [ ] Certificates issued

---

## 🔐 Security Checks

- [ ] Passwords not visible in console
- [ ] Token stored in localStorage (check DevTools)
- [ ] API calls include Authorization header
- [ ] Emails sent successfully
- [ ] Verification tokens work once only
- [ ] Cannot access admin pages without admin role
- [ ] Cannot access faculty pages without faculty role
- [ ] Logout clears auth token
- [ ] Invalid login shows error

---

## 📧 Email Verification

- [ ] Registration sends email
  - [ ] Check spam folder if not in inbox
  - [ ] Email has verification link
  - [ ] Link contains unique token
- [ ] No-Dues verification sends email
  - [ ] Same email account receives it
  - [ ] Different token than registration
- [ ] Clicking link works
- [ ] Using link twice shows error
- [ ] Expiration warning in email

---

## 🐛 Error Handling

- [ ] Try empty form submission → See error
- [ ] Try duplicate email → See "already exists" error
- [ ] Try wrong password → See "invalid credentials" error
- [ ] Try invalid token → See "invalid token" error
- [ ] Network error → Shows error message gracefully
- [ ] 404 error → Shows "not found" page
- [ ] 500 error → Check backend logs

---

## 🔄 Complete Workflow Test

```
Student Register 
  → Email Verification 
  → Student Login 
  → Submit No-Dues 
  → Request Verification
  → Faculty Login
  → Faculty Updates Status (CLEARED)
  → More Faculty Update Other Departments
  → Admin Login
  → Admin Approves Request
  → Admin Generates Certificate
  → Student Views Certificate
  → Public Verify Certificate (no login needed)
```

- [ ] All steps complete successfully
- [ ] No errors in console
- [ ] No errors in server logs

---

## 🗄️ Database Checks

In MongoDB shell:
```bash
mongosh
use cdgi-nodues

# Check collections exist
show collections

# Count documents
db.students.countDocuments()      # Should be > 0
db.faculty.countDocuments()       # Should be > 0
db.admins.countDocuments()        # Should be > 0
db.noduesrequests.countDocuments() # Should be > 0
db.certificates.countDocuments()  # Should be > 0
db.auditlogs.countDocuments()     # Should be > 0

# View sample
db.students.findOne()             # Shows student record
db.noduesrequests.findOne()       # Shows request with status

exit
```

- [ ] All collections exist
- [ ] Documents created for each action
- [ ] Data stored correctly
- [ ] Timestamps present
- [ ] References work properly

---

## 🚀 Performance Checks

- [ ] Dashboard loads in < 2 seconds
- [ ] API responses in < 1 second
- [ ] No memory leaks in console
- [ ] No performance warnings
- [ ] Multiple users can test simultaneously
- [ ] Database queries fast

---

## 🎯 Final Verification

- [ ] All 6 API modules working:
  - [ ] Auth (register, login, verify, staff)
  - [ ] No-Dues (submit, verify, get, update)
  - [ ] Faculty (dashboard, list, search, update)
  - [ ] Admin (dashboard, list, approve, reject)
  - [ ] Certificate (generate, verify, list)

- [ ] All 3 user roles working:
  - [ ] Student registration and workflow
  - [ ] Faculty review and approval
  - [ ] Admin management and certificates

- [ ] All features working:
  - [ ] Email verification
  - [ ] Role-based access
  - [ ] Department-wise tracking
  - [ ] Audit logging
  - [ ] Certificate generation

- [ ] System ready for:
  - [ ] User training
  - [ ] Deployment to production
  - [ ] Integration with college systems

---

## ✅ Ready for Production

When you've checked all boxes above, your system is:

✅ Fully functional
✅ Properly configured
✅ Secure
✅ Tested
✅ Ready for deployment

---

## 🆘 If Something's Wrong

1. **Check error message** - Most errors are descriptive
2. **Check browser console** - F12 → Console tab
3. **Check server logs** - Terminal where you ran backend
4. **Check `.env` file** - Verify all settings
5. **Restart services** - Stop and restart backend/frontend
6. **Check MongoDB** - Verify connection works
7. **Review documentation** - See SETUP_GUIDE.md or BACKEND_README.md

---

## 📞 Common First-Time Issues

### "Connection refused"
→ Make sure MongoDB is running

### "CORS error"
→ Check `FRONTEND_URL` in `.env` is correct

### "Email not sent"
→ Verify `EMAIL_USER` and `EMAIL_PASS` in `.env`

### "Port 3000 in use"
→ Change PORT in `.env` or kill process using port

### "No such file or directory"
→ Make sure you're in correct directory

---

## 🎓 Next Steps After Verification

1. ✅ Follow this checklist
2. ✅ All items checked = System working
3. → Setup production environment
4. → Configure for your college
5. → Train staff and students
6. → Go live!

---

**Estimated Time:** 30-60 minutes for complete verification

**Need Help?** Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) or [BACKEND_README.md](./BACKEND_README.md)

Good luck! 🚀
