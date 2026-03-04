/**
 * Manual Testing Checklist for CDGI No-Dues System
 * 
 * Use this checklist to manually verify all critical functionality
 */

# CDGI No-Dues System - Manual Testing Checklist

## ✅ Authentication Tests

### Student Registration
- [ ] Navigate to /register
- [ ] Fill form with valid data
- [ ] Submit form
- [ ] Verify email sent
- [ ] Click verification link
- [ ] Confirm redirect to login

### Student Login
- [ ] Navigate to /login
- [ ] Enter email and password
- [ ] Click login
- [ ] Verify redirect to /dashboard
- [ ] Check navbar shows student name
- [ ] Verify logout works

### Faculty/Admin Login
- [ ] Use faculty credentials
- [ ] Verify redirect to faculty dashboard
- [ ] Use admin credentials  
- [ ] Verify redirect to admin dashboard

## ✅ No-Dues Request Tests (Student)

### Create Request
- [ ] Login as student
- [ ] Navigate to /nodues
- [ ] Click "Submit No-Dues Request"
- [ ] Verify success message
- [ ] Check request appears on page
- [ ] All 4 clearances show PENDING

### View Request Status
- [ ] Refresh page
- [ ] Verify request persists
- [ ] Check overall status badge
- [ ] Verify all clearance cards visible

### Prevent Duplicate
- [ ] Try to submit another request
- [ ] Verify error message appears
- [ ] Confirm only one active request allowed

## ✅ Faculty Approval Tests

### View Pending Requests
- [ ] Login as faculty (department: CSE)
- [ ] Navigate to /faculty/dashboard
- [ ] Verify pending requests appear
- [ ] Check student details visible

### Approve Clearance
- [ ] Click on a pending request
- [ ] Click "Approve" for department clearance
- [ ] Add optional remarks
- [ ] Submit approval
- [ ] Verify status changes to APPROVED

### Reject Clearance
- [ ] Find another pending request
- [ ] Click "Reject"
- [ ] Enter rejection reason (required)
- [ ] Submit rejection
- [ ] Verify status changes to REJECTED

## ✅ Admin Approval Tests

### View All Requests
- [ ] Login as admin
- [ ] Navigate to /admin/dashboard
- [ ] View applications page
- [ ] Verify filter by status works

### Final Approval
- [ ] Find request with all depts approved
- [ ] Click "Approve All"
- [ ] Verify overall status = APPROVED
- [ ] Check email sent to student

### Generate Certificate
- [ ] Click "Generate Certificate"
- [ ] Verify success message
- [ ] Check certificate ID generated
- [ ] Confirm PDF created

## ✅ Certificate Tests

### Download Certificate
- [ ] Login as admin
- [ ] Navigate to certificates page
- [ ] Click download on a certificate
- [ ] Verify PDF downloads
- [ ] Open PDF and check contents:
  - [ ] Student name correct
  - [ ] Enrollment number correct
  - [ ] QR code present
  - [ ] Certificate ID visible

### Verify Certificate
- [ ] Use certificate ID
- [ ] Navigate to /certificate/verify/:id
- [ ] Verify details match
- [ ] Check "Valid" badge shows

## ✅ Super Admin Tests

### User Management
- [ ] Login as super admin
- [ ] Navigate to /super-admin/users
- [ ] Create new faculty user
- [ ] Create new admin user
- [ ] Toggle user active/inactive
- [ ] Verify changes reflect immediately

### Analytics
- [ ] Navigate to /super-admin/analytics
- [ ] Verify stats cards show data
- [ ] Check request breakdown
- [ ] Verify numbers accurate

### Department Management
- [ ] Navigate to /super-admin/departments
- [ ] Create new department
- [ ] Verify it appears in lists
- [ ] Check faculty can be assigned

## ✅ Security Tests

### Route Protection
- [ ] Try accessing /admin without login
- [ ] Verify redirect to login
- [ ] Login as student
- [ ] Try accessing /admin/dashboard
- [ ] Verify 403 or redirect

### Token Expiry
- [ ] Login
- [ ] Wait for token expiry (24h)
- [ ] Try API request
- [ ] Verify forced logout

### Role Restriction
- [ ] Login as student
- [ ] Try to access /faculty/dashboard
- [ ] Verify blocked
- [ ] Login as faculty
- [ ] Try to access /admin/dashboard
- [ ] Verify blocked

## ✅ End-to-End Workflow

### Complete Student Journey
1. [ ] Student registers
2. [ ] Verifies email
3. [ ] Logs in
4. [ ] Submits no-dues request
5. [ ] Waits for approvals

### Complete Faculty Journey
1. [ ] Faculty logs in
2. [ ] Views pending requests
3. [ ] Reviews student details
4. [ ] Approves department clearance
5. [ ] Adds remarks

### Complete Admin Journey
1. [ ] Admin logs in
2. [ ] Views all requests
3. [ ] Checks all depts approved
4. [ ] Gives final approval
5. [ ] Generates certificate
6. [ ] Sends to student

## ✅ Error Handling Tests

### Form Validation
- [ ] Submit empty registration form
- [ ] Use invalid email format
- [ ] Use short password (<8 chars)
- [ ] Verify error messages show

### API Error Handling
- [ ] Submit duplicate enrollment
- [ ] Try invalid credentials
- [ ] Access with expired token
- [ ] Verify proper error responses

## ✅ UI/UX Tests

### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (375px)
- [ ] Verify all elements visible

### Loading States
- [ ] Check loading spinners appear
- [ ] Verify button disable during submit
- [ ] Check skeleton loaders work

### Toast Notifications
- [ ] Verify success toasts show
- [ ] Check error toasts display
- [ ] Confirm auto-dismiss works

---

## 🎯 Quick Test Scenarios

### Scenario 1: Happy Path
Student → Register → Login → Submit Request → Faculty Approves → Admin Approves → Certificate Generated → Download PDF

### Scenario 2: Rejection Path
Student → Submit Request → Faculty Rejects → Student sees rejection → Cannot get certificate

### Scenario 3: Duplicate Prevention
Student → Submit Request → Try again → Error: duplicate request

---

## 📊 Test Results

Date: __________
Tester: __________

Total Tests: 60
Passed: ___ / 60
Failed: ___ / 60
Blocked: ___ / 60

Critical Issues Found:
1. ______________________
2. ______________________
3. ______________________

Notes:
__________________________
__________________________
