# CDGI No-Dues Portal - API Testing Guide

This guide provides curl commands and examples to test all API endpoints.

## Quick Start

Make sure backend is running at `http://localhost:3000`

---

## 🔐 Authentication Endpoints

### 1. Register Student

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "enrollmentNo": "2023001",
    "email": "john@test.com",
    "password": "Test123!@",
    "program": "B.Tech CSE",
    "batch": "2023-2027"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Student registered. Please check your email to verify.",
  "data": {
    "id": "507f1f77bcf86cd799439011"
  }
}
```

### 2. Verify Email

```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "verification_token_from_email"
  }'
```

### 3. Login (All Roles)

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "Test123!@"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@test.com",
      "role": "student",
      "enrollmentNo": "2023001"
    }
  }
}
```

**Save the token for authenticated requests:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Create Faculty (Admin only)

```bash
curl -X POST http://localhost:3000/api/v1/auth/staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fullName": "Dr. Priya Singh",
    "email": "priya@cdgi.edu",
    "role": "faculty",
    "department": "library",
    "password": "Faculty123!@"
  }'
```

---

## 📋 No-Dues Endpoints

### 5. Submit No-Dues Request (Student only)

```bash
curl -X POST http://localhost:3000/api/v1/nodues/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{
    "reason": "Graduation clearance needed"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Request submitted. Check your email to verify.",
  "data": {
    "id": "507f1f77bcf86cd799439012"
  }
}
```

### 6. Verify No-Dues Request

```bash
curl -X POST http://localhost:3000/api/v1/nodues/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "nodues_verification_token_from_email"
  }'
```

### 7. Get Student's Current Request

```bash
curl -X GET http://localhost:3000/api/v1/nodues/my-request \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

### 8. Get Request History

```bash
curl -X GET http://localhost:3000/api/v1/nodues/history \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

---

## 👥 Faculty Endpoints

### 9. Get Faculty Dashboard

```bash
curl -X GET http://localhost:3000/api/v1/faculty/dashboard \
  -H "Authorization: Bearer $FACULTY_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "faculty": {
      "id": "507f1f77bcf86cd799439013",
      "name": "Dr. Priya Singh",
      "email": "priya@cdgi.edu",
      "department": "library"
    },
    "stats": {
      "totalRequests": 15,
      "cleared": 5,
      "pending": 8,
      "hold": 2
    }
  }
}
```

### 10. Get Pending Requests (Filtered by Department)

```bash
curl -X GET http://localhost:3000/api/v1/faculty/requests \
  -H "Authorization: Bearer $FACULTY_TOKEN"
```

### 11. Get Specific Request

```bash
curl -X GET http://localhost:3000/api/v1/faculty/requests/REQUEST_ID \
  -H "Authorization: Bearer $FACULTY_TOKEN"
```

### 12. Update Clearance Status

```bash
curl -X PUT http://localhost:3000/api/v1/faculty/requests/REQUEST_ID/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FACULTY_TOKEN" \
  -d '{
    "status": "CLEARED",
    "remarks": "No pending fines or dues"
  }'
```

**Status values:** `CLEARED`, `PENDING`, `HOLD`

### 13. Search Student by Enrollment Number

```bash
curl -X GET "http://localhost:3000/api/v1/faculty/search?enrollmentNo=2023001" \
  -H "Authorization: Bearer $FACULTY_TOKEN"
```

---

## 🏛️ Admin Endpoints

### 14. Get Admin Dashboard

```bash
curl -X GET http://localhost:3000/api/v1/admin/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 50,
      "approved": 10,
      "pending": 25,
      "hold": 10,
      "rejected": 5
    },
    "recentRequests": [...],
    "certificatesIssued": 10
  }
}
```

### 15. Get All Requests (with Filtering)

```bash
# All requests
curl -X GET http://localhost:3000/api/v1/admin/requests \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Filter by status
curl -X GET "http://localhost:3000/api/v1/admin/requests?status=PENDING&page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 16. Approve Request

```bash
curl -X PUT http://localhost:3000/api/v1/admin/requests/REQUEST_ID/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Note:** Can only approve if all departments have status "CLEARED"

### 17. Reject Request

```bash
curl -X PUT http://localhost:3000/api/v1/admin/requests/REQUEST_ID/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "reason": "Missing required documents"
  }'
```

### 18. Get Audit Logs

```bash
curl -X GET "http://localhost:3000/api/v1/admin/audit-logs?page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 19. Get System Statistics

```bash
curl -X GET http://localhost:3000/api/v1/admin/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 📜 Certificate Endpoints

### 20. Generate Certificate (Admin only)

```bash
curl -X POST http://localhost:3000/api/v1/certificate/REQUEST_ID/generate \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate generated",
  "data": {
    "certificateId": "ND-TIMESTAMP-RANDOM",
    "studentId": "507f1f77bcf86cd799439011",
    "issuedAt": "2025-02-01T12:00:00.000Z",
    "pdfPath": "/certificates/ND-TIMESTAMP-RANDOM.pdf"
  }
}
```

### 21. Verify Certificate (Public - No Auth Required)

```bash
curl -X GET http://localhost:3000/api/v1/certificate/verify/ND-TIMESTAMP-RANDOM
```

### 22. Get Student's Certificates

```bash
curl -X GET http://localhost:3000/api/v1/certificate/my-certificates \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

### 23. List All Certificates (Admin)

```bash
curl -X GET "http://localhost:3000/api/v1/certificate/list?page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 24. Download Certificate

```bash
curl -X GET http://localhost:3000/api/v1/certificate/CERTIFICATE_ID/download \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧪 Complete Test Flow Script

Save this as `test-flow.sh` and run: `bash test-flow.sh`

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== CDGI No-Dues Portal - Complete Test Flow ===${NC}\n"

# 1. Register Student
echo -e "${YELLOW}1. Registering student...${NC}"
REGISTER=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Student",
    "enrollmentNo": "2023999",
    "email": "test'$(date +%s)'@test.com",
    "password": "Test123!@",
    "program": "B.Tech CSE",
    "batch": "2023-2027"
  }')
echo "$REGISTER" | grep -q '"success":true' && echo -e "${GREEN}✓ Student registered${NC}" || echo -e "${RED}✗ Failed${NC}"

# 2. Login
echo -e "\n${YELLOW}2. Testing login...${NC}"
LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!@"
  }')
TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ ! -z "$TOKEN" ]; then
  echo -e "${GREEN}✓ Login successful, token received${NC}"
else
  echo -e "${RED}✗ Login failed${NC}"
  exit 1
fi

# 3. Submit No-Dues Request
echo -e "\n${YELLOW}3. Submitting no-dues request...${NC}"
NODUES=$(curl -s -X POST $BASE_URL/nodues/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "reason": "Graduation clearance"
  }')
echo "$NODUES" | grep -q '"success":true' && echo -e "${GREEN}✓ Request submitted${NC}" || echo -e "${RED}✗ Failed${NC}"

# 4. Get Request Status
echo -e "\n${YELLOW}4. Checking request status...${NC}"
STATUS=$(curl -s -X GET $BASE_URL/nodues/my-request \
  -H "Authorization: Bearer $TOKEN")
echo "$STATUS" | grep -q '"success":true' && echo -e "${GREEN}✓ Status retrieved${NC}" || echo -e "${RED}✗ Failed${NC}"

echo -e "\n${GREEN}=== Test Complete ===${NC}\n"
```

---

## 🛠️ Common Issues & Solutions

### 401 Unauthorized
- **Problem:** Invalid or missing token
- **Solution:** Make sure to use valid JWT token from login response

### 403 Forbidden
- **Problem:** Insufficient permissions
- **Solution:** Use token from appropriate role (admin, faculty, or student)

### 404 Not Found
- **Problem:** Resource doesn't exist
- **Solution:** Check ID is correct, request might be deleted

### 500 Internal Server Error
- **Problem:** Server error
- **Solution:** Check backend logs for details

### CORS Error
- **Problem:** Frontend can't call backend
- **Solution:** Ensure FRONTEND_URL in backend .env matches your frontend URL

---

## 📊 Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Create new collection
3. Add requests using URLs above
4. Set authorization header: `Authorization: Bearer <token>`
5. Test and save requests
6. Share collection with team

---

## 🔍 Testing with cURL Variables

Create a `.env.test` file:
```bash
BASE_URL=http://localhost:3000/api/v1
STUDENT_EMAIL=student@test.com
STUDENT_PASS=Test123!@
FACULTY_EMAIL=faculty@cdgi.edu
FACULTY_PASS=Faculty123!@
ADMIN_EMAIL=admin@cdgi.edu
ADMIN_PASS=Admin123!@
```

Source it:
```bash
source .env.test
echo $BASE_URL  # Should print your base URL
```

---

**Need Help?** Check [BACKEND_README.md](./BACKEND_README.md) for detailed endpoint documentation.
