# CampusClear Architecture Documentation

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│                    http://localhost:5173                      │
├─────────────────────────────────────────────────────────────┤
│  Components | Hooks | Pages | Types | Utilities | Styles    │
│                                                               │
│  • Authentication (Login, Register, Verify, Reset)          │
│  • Student Dashboard (No-Dues Management)                    │
│  • Faculty Dashboard (Request Review & Approval)             │
│  • Admin Dashboard (System Management)                       │
│  • Role-Based Routing (ProtectedRoute)                       │
│  • React Query (Data Fetching & Caching)                     │
│  • Shadcn/UI (Component Library)                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
            ┌──────────────────────────────┐
            │      HTTP/REST API           │
            │   /api/v1/* endpoints        │
            │   JWT Authentication         │
            │   JSON Payloads              │
            └──────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Express)                        │
│                    http://localhost:3000                      │
├─────────────────────────────────────────────────────────────┤
│  Routes | Controllers | Models | Middleware | Services      │
│                                                               │
│  • Authentication (Login, Register, JWT, OAuth)             │
│  • Authorization (Role-Based Access Control)                │
│  • No-Dues Workflow (Create, Approve, Reject)              │
│  • Faculty Management (Request Review)                       │
│  • Admin Operations (System Oversight)                       │
│  • Audit Logging (Action Tracking)                          │
│  • Email Notifications (Verification, Reset, Updates)       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   MongoDB Database                            │
│                   Campus Clear DB                            │
├─────────────────────────────────────────────────────────────┤
│  Collections:                                                │
│  • students (Student accounts & profile)                    │
│  • faculty (Faculty accounts & assignments)                 │
│  • admins (Administrator accounts)                          │
│  • noduesrequests (Clearance requests)                      │
│  • auditlogs (Activity tracking)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 Data Flow Architecture

### 1. Authentication Flow

```
User Input (Login Form)
        ↓
React Hook Form Validation
        ↓
useAuth.login() Hook
        ↓
authApi.auth.login() Call
        ↓
fetch() to /api/v1/auth/login
        ↓
Backend: verifyPassword() → generateToken()
        ↓
Response: { token, user }
        ↓
Store: localStorage['auth_token'] & localStorage['auth_user']
        ↓
AuthContext Updated
        ↓
Role-based Redirect (useLocation)
```

### 2. API Request Flow

```
Component calls authApi.nodues.getMe()
        ↓
apiRequest('GET', '/api/v1/nodues/me')
        ↓
Build Headers: { Authorization: Bearer {token} }
        ↓
fetch(API_BASE_URL + '/api/v1/nodues/me')
        ↓
Backend: authenticateJWT() → authorizeRole()
        ↓
Execute Controller Logic
        ↓
Query Database
        ↓
Response: { success: true, data: {...} }
        ↓
Frontend: Extract data
        ↓
React Query: Cache & Render
```

### 3. Form Submission Flow

```
User fills form
        ↓
React Hook Form validation (Zod schema)
        ↓
onSubmit Handler triggered
        ↓
useMutation: mutate(data)
        ↓
API Request via authApi
        ↓
Backend validation & processing
        ↓
Success: Toast notification + Redirect
OR
Error: Show error toast + Form errors
        ↓
Loading state: Show spinner
        ↓
Refetch data if needed
```

---

## 🔐 Security Architecture

### Frontend Security
```
1. JWT Token Management
   ├── Store in localStorage['auth_token']
   ├── Include in Authorization header
   ├── Auto-include via queryClient
   └── Clear on logout

2. Route Protection
   ├── ProtectedRoute component
   ├── Role-based access control
   ├── Redirect unauthorized users
   └── Auth context checks

3. Input Validation
   ├── Zod schema validation
   ├── Form-level validation
   ├── Display error messages
   └── Prevent invalid submission

4. XSS Prevention
   ├── React escaping by default
   ├── No innerHTML usage
   ├── DOMPurify if needed
   └── Content Security Policy
```

### Backend Security
```
1. Password Security
   ├── bcryptjs hashing (12 rounds)
   ├── Never store plaintext
   ├── Compare on login
   └── Reset tokens hashed

2. JWT Security
   ├── RS256 signing (or HS256)
   ├── 24-hour expiry
   ├── Token verification
   └── Signature validation

3. Authorization
   ├── Middleware checks role
   ├── normalizeRole() function
   ├── Permission validation
   └── Audit logging

4. Data Protection
   ├── Input sanitization
   ├── SQL injection prevention (Mongoose)
   ├── Rate limiting ready
   └── CORS configuration
```

---

## 📊 Data Models

### User Model Hierarchy

```
User (Abstract)
├── Student
│   ├── enrollmentNo (unique)
│   ├── email (unique)
│   ├── password (hashed)
│   ├── emailVerified (boolean)
│   ├── verificationToken (optional)
│   ├── authProvider (LOCAL | GOOGLE)
│   ├── passwordReset
│   │   ├── token (hashed)
│   │   └── expiresAt
│   └── timestamps
│
├── Faculty
│   ├── email (unique)
│   ├── password (hashed)
│   ├── department (assigned)
│   ├── role (LIBRARY | ACCOUNTS | HOSTEL | LAB | TP | SPORTS)
│   ├── permissions (based on department)
│   └── timestamps
│
└── Admin
    ├── email (unique)
    ├── password (hashed)
    ├── permissions (full system access)
    └── timestamps
```

### NoDuesRequest Model

```
NoDuesRequest
├── studentId (reference to Student)
├── overallStatus (PENDING | APPROVED | REJECTED)
├── libraryClearance
│   ├── status
│   ├── remarks
│   ├── updatedAt
│   └── updatedBy (facultyId)
├── accountClearance
│   ├── status
│   ├── remarks
│   ├── updatedAt
│   └── updatedBy
├── hostelClearance
│   ├── status
│   ├── remarks
│   ├── updatedAt
│   └── updatedBy
├── departmentClearance
│   ├── status
│   ├── remarks
│   ├── updatedAt
│   └── updatedBy
├── createdAt
└── updatedAt
```

### AuditLog Model

```
AuditLog
├── actorId (user who performed action)
├── actorRole (STUDENT | FACULTY | ADMIN)
├── action (CREATE | APPROVE | REJECT | UPDATE)
├── targetId (resource affected)
├── targetType (NODUES_REQUEST | USER)
├── changes (what was changed)
├── metadata (additional context)
├── ipAddress
├── userAgent
└── timestamp
```

---

## 🔀 Component Architecture

### Page Component Hierarchy

```
App
├── Router (wouter)
│
├── Public Routes
│   ├── Home
│   ├── Login
│   ├── Register
│   ├── VerifyEmail
│   ├── ForgotPassword
│   └── ResetPassword
│
├── Protected Routes
│   ├── StudentRoute
│   │   ├── Dashboard
│   │   ├── NoDues
│   │   └── Profile
│   │
│   ├── FacultyRoute
│   │   └── FacultyDashboard
│   │
│   ├── AdminRoute
│   │   ├── AdminDashboard
│   │   ├── AdminApplications
│   │   ├── AdminStudents
│   │   ├── AdminDepartments
│   │   └── AdminAuditLogs
│   │
│   └── AnyAuthRoute
│       └── Profile
│
└── Global
    ├── Navbar
    ├── Footer
    └── Toaster
```

### Reusable Components

```
UI Components (shadcn/ui)
├── Button
├── Card, CardContent, CardHeader
├── Input, Textarea
├── Label, Badge
├── Table
├── Form, FormField, FormItem
├── Dialog, AlertDialog
├── Toast, Alert
└── Select, Checkbox, Radio

Custom Components
├── ProtectedRoute
│   ├── AdminRoute
│   ├── FacultyRoute
│   └── StudentRoute
├── StatusBadge
│   └── ClearanceBadge
├── NoDuesCard
├── RequestTable
├── Navbar
└── Footer
```

---

## 🔌 API Endpoint Structure

### Authentication Endpoints

```
POST /api/v1/auth/register
├── Body: { fullName, enrollmentNo, email, password }
├── Returns: { token, user }
└── No Auth Required

POST /api/v1/auth/login
├── Body: { email, password }
├── Returns: { token, user }
└── No Auth Required

POST /api/v1/auth/verify-email
├── Body: { token }
├── Returns: { success, message }
└── No Auth Required

POST /api/v1/auth/forgot-password
├── Body: { email }
├── Returns: { success, message }
└── No Auth Required

POST /api/v1/auth/reset-password
├── Body: { token, newPassword }
├── Returns: { success, message }
└── No Auth Required

POST /api/v1/auth/google
├── Body: { idToken }
├── Returns: { token, user }
└── No Auth Required
```

### No-Dues Endpoints

```
POST /api/v1/nodues/create
├── Auth: STUDENT
├── Body: { remarks? }
└── Returns: NoDuesRequest

GET /api/v1/nodues/me
├── Auth: STUDENT
└── Returns: NoDuesRequest

GET /api/v1/nodues/all
├── Auth: ADMIN
├── Query: ?page=1&status=PENDING
└── Returns: { data: NoDuesRequest[], total }

PUT /api/v1/nodues/approve/:id
├── Auth: FACULTY | ADMIN
├── Body: { clearanceType, remarks? }
└── Returns: NoDuesRequest

PUT /api/v1/nodues/reject/:id
├── Auth: FACULTY | ADMIN
├── Body: { clearanceType, remarks? }
└── Returns: NoDuesRequest
```

### Faculty Endpoints

```
GET /api/v1/faculty/dashboard
├── Auth: FACULTY
└── Returns: { pendingCount, approvedCount, ... }

GET /api/v1/faculty/requests
├── Auth: FACULTY
├── Query: ?page=1
└── Returns: NoDuesRequest[]

GET /api/v1/faculty/requests/:id
├── Auth: FACULTY
└── Returns: NoDuesRequest

PUT /api/v1/faculty/requests/:id/update
├── Auth: FACULTY
├── Body: { clearanceType, status, remarks? }
└── Returns: NoDuesRequest

GET /api/v1/faculty/search
├── Auth: FACULTY
├── Query: ?enrollmentNo=12345
└── Returns: NoDuesRequest[]
```

### Admin Endpoints

```
GET /api/v1/admin/dashboard
├── Auth: ADMIN
└── Returns: { totalRequests, totalApproved, ... }

GET /api/v1/admin/requests
├── Auth: ADMIN
├── Query: ?page=1&status=PENDING
└── Returns: { data: NoDuesRequest[], total }

PUT /api/v1/admin/requests/:id/approve
├── Auth: ADMIN
├── Body: { remarks? }
└── Returns: NoDuesRequest

PUT /api/v1/admin/requests/:id/reject
├── Auth: ADMIN
├── Body: { remarks? }
└── Returns: NoDuesRequest

GET /api/v1/admin/audit-logs
├── Auth: ADMIN
├── Query: ?page=1&actor=userId
└── Returns: AuditLog[]

GET /api/v1/admin/stats
├── Auth: ADMIN
└── Returns: { totalStudents, totalRequests, ... }
```

---

## 🎯 State Management Strategy

### Frontend State Levels

```
1. Global State (Context)
   ├── AuthContext
   │   ├── user: User
   │   ├── isAuthenticated: boolean
   │   ├── userRole: UserRole
   │   ├── login(): Promise<void>
   │   ├── logout(): void
   │   └── googleSignIn(): Promise<void>
   │
   └── AuthProvider
       └── Wraps entire App

2. Server State (React Query)
   ├── Queries
   │   ├── nodues.getMe (cached)
   │   ├── faculty.getRequests (paginated)
   │   ├── admin.getRequests (paginated)
   │   └── etc.
   │
   └── Mutations
       ├── login
       ├── register
       ├── approveRequest
       └── etc.

3. Local State (useState)
   ├── Form inputs
   ├── Modal/Dialog open state
   ├── Selected items
   ├── Filter/sort state
   └── UI toggles

4. URL State (useLocation/wouter)
   ├── Current page
   ├── Query parameters
   └── Route parameters
```

---

## 📈 Performance Optimization

### Frontend Optimizations

```
1. Code Splitting
   ├── Lazy route loading
   ├── Dynamic imports
   └── Component splitting

2. Caching Strategy
   ├── React Query cache
   ├── Browser cache headers
   ├── LocalStorage for auth
   └── IndexedDB if needed

3. Rendering Optimization
   ├── useCallback for callbacks
   ├── useMemo for expensive computations
   ├── Proper dependency arrays
   └── Key props on lists

4. Bundle Size
   ├── Tree shaking enabled
   ├── Minification & compression
   ├── Image optimization
   └── Lazy load heavy libraries
```

### Backend Optimizations

```
1. Database
   ├── Indexes on frequently queried fields
   ├── Lean queries for read-only
   ├── Connection pooling
   └── Query optimization

2. Caching
   ├── Redis ready (optional)
   ├── In-memory caching
   ├── API response caching
   └── User session caching

3. Rate Limiting
   ├── Per-user limits
   ├── Per-IP limits
   ├── Burst handling
   └── Graceful degradation

4. Scalability
   ├── Stateless design
   ├── Horizontal scaling ready
   ├── Load balancer compatible
   └── Database replication ready
```

---

## 🧪 Testing Strategy

### Frontend Testing Approach

```
Unit Tests (Jest)
├── Utility functions
├── Custom hooks
├── Component logic
└── Type checking

Integration Tests
├── API interactions
├── Form submissions
├── Authentication flow
└── Role-based routing

E2E Tests (Cypress/Playwright)
├── Complete user journeys
├── Cross-browser testing
├── Performance testing
└── Accessibility testing

Manual Testing
├── All workflows
├── All browsers
├── Mobile devices
└── Error scenarios
```

### Backend Testing Approach

```
Unit Tests
├── Controller functions
├── Service methods
├── Utility functions
└── Middleware

Integration Tests
├── API endpoint testing
├── Database interactions
├── Email sending
└── JWT generation

Load Tests
├── Concurrent requests
├── Database load
├── Email queue
└── Memory usage
```

---

## 📦 Deployment Architecture

### Frontend Deployment

```
Local Development
  ↓ (npm run build)
Build Output (dist/)
  ↓
Static Hosting
├── Vercel
├── Netlify
├── GitHub Pages
├── AWS S3 + CloudFront
└── Nginx

Environment: Production
├── VITE_API_URL=https://api.campus-clear.com
└── Google Analytics enabled
```

### Backend Deployment

```
Local Development
  ↓
Git Repository
  ↓
CI/CD Pipeline (GitHub Actions)
  ├── Run tests
  ├── Build Docker image
  └── Push to registry

Container Registry
  ↓
Hosting Platform
├── Heroku
├── Railway
├── AWS EC2
├── DigitalOcean
├── Google Cloud Run
└── Azure Container Apps

Environment: Production
├── MONGO_URI=<production-db>
├── JWT_SECRET=<secure-secret>
├── Email configured
└── SSL/TLS enabled
```

---

## 🔄 CI/CD Pipeline (Ready to Setup)

```yaml
GitHub Actions Workflow
├── Trigger: On push to main
├── Steps:
│   ├── Checkout code
│   ├── Setup Node.js
│   ├── Install dependencies
│   ├── Run tests
│   ├── Build frontend
│   ├── Build backend
│   ├── Run linting
│   └── Deploy to production
└── Artifacts: Docker images
```

---

This comprehensive architecture provides:
- ✅ Clear separation of concerns
- ✅ Scalable component structure
- ✅ Robust error handling
- ✅ Type-safe development
- ✅ Performance optimization
- ✅ Security best practices
- ✅ Easy maintenance & extension
