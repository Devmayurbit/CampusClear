# Frontend Integration Guide

## Quick Start

### 1. Setup Environment Variables

Create a `.env` file in the `client/` directory:

```bash
VITE_API_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
cd client
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

The client will be available at `http://localhost:5173` (or whatever port Vite assigns).

---

## API Endpoints Reference

### Authentication (`/api/v1/auth/...`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/register` | POST | No | Student registration |
| `/login` | POST | No | Login any role |
| `/verify-email` | POST | No | Email verification |
| `/forgot-password` | POST | No | Request password reset |
| `/reset-password` | POST | No | Reset password with token |
| `/google` | POST | No | Google Sign-in |
| `/staff` | POST | Yes (Admin) | Create faculty/admin |

### No-Dues (`/api/v1/nodues/...`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/create` | POST | Yes (Student) | Create request |
| `/me` | GET | Yes (Student) | Get own request |
| `/all` | GET | Yes (Admin) | List all requests |
| `/approve/:id` | PUT | Yes (Faculty/Admin) | Approve clearance |
| `/reject/:id` | PUT | Yes (Faculty/Admin) | Reject clearance |

### Faculty (`/api/v1/faculty/...`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/dashboard` | GET | Yes (Faculty) | Faculty stats |
| `/requests` | GET | Yes (Faculty) | List requests |
| `/requests/:id` | GET | Yes (Faculty) | Get request details |
| `/requests/:id/update` | PUT | Yes (Faculty) | Update status |
| `/search` | GET | Yes (Faculty) | Search by enrollment |

### Admin (`/api/v1/admin/...`)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/dashboard` | GET | Yes (Admin) | Admin stats |
| `/requests` | GET | Yes (Admin) | List all requests |
| `/requests/:id/approve` | PUT | Yes (Admin) | Approve request |
| `/requests/:id/reject` | PUT | Yes (Admin) | Reject request |
| `/audit-logs` | GET | Yes (Admin) | View audit logs |
| `/stats` | GET | Yes (Admin) | System statistics |

---

## Common Issues & Solutions

### 1. CORS Errors

**Problem**: Frontend requests are blocked by CORS policy

**Solution**: Ensure backend is running and CORS is configured:
```typescript
// In backend server setup
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
```

### 2. 401 Unauthorized Errors

**Problem**: API returns 401 on protected endpoints

**Solution**: 
- Verify JWT token is stored correctly: `localStorage.getItem('auth_token')`
- Check if token is expired (24-hour expiry)
- Try logging out and logging back in

### 3. Invalid Token Format

**Problem**: Backend rejects the token

**Solution**:
- Ensure token is sent with `Bearer ` prefix in Authorization header
- Verify token from login response is stored directly (without "Bearer " prefix)
- Check `queryClient.ts` handles token correctly

### 4. Form Validation Issues

**Problem**: Form shows validation errors for valid input

**Solution**:
- Check Zod schema matches input format
- Example: enrollment number must be at least 5 characters
- Review error messages for specific constraints

---

## Type System

### Key Types to Know

```typescript
// User with uppercase role
interface User {
  id: string;
  fullName: string;
  email: string;
  role: "STUDENT" | "FACULTY" | "ADMIN";
  enrollmentNo?: string;
  department?: string;
}

// No-Dues request with clearance breakdown
interface NoDuesRequest {
  _id: string;
  overallStatus: "PENDING" | "APPROVED" | "REJECTED";
  libraryClearance: Clearance;
  accountClearance: Clearance;
  hostelClearance: Clearance;
  departmentClearance: Clearance;
}

// Individual clearance status
interface Clearance {
  status: "PENDING" | "APPROVED" | "REJECTED";
  remarks: string;
  updatedAt?: string;
  updatedBy?: string;
}
```

---

## Component Usage Examples

### Using ProtectedRoute

```typescript
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";

// Route with specific role requirement
<ProtectedRoute requiredRoles={["STUDENT"]}>
  <StudentDashboard />
</ProtectedRoute>

// Convenience component for admin
<AdminRoute>
  <AdminDashboard />
</AdminRoute>
```

### Using useAuth Hook

```typescript
import { useAuth, useIsAdmin } from "@/hooks/use-auth";

export function MyComponent() {
  const { user, userRole, logout, isAuthenticated } = useAuth();
  const isAdmin = useIsAdmin();

  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return (
    <div>
      <p>Welcome {user?.fullName}</p>
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

### Using Status Badge

```typescript
import { StatusBadge } from "@/components/StatusBadge";

<StatusBadge status="PENDING" />
<StatusBadge status="APPROVED" />
<StatusBadge status="REJECTED" />
```

### Using Request Table

```typescript
import { RequestTable } from "@/components/RequestTable";

<RequestTable
  requests={requests}
  onApprove={(id) => handleApprove(id)}
  onReject={(id) => handleReject(id)}
  showActions={true}
/>
```

---

## Authentication Flow

### Student Registration & Login

1. User fills registration form with `fullName`, `enrollmentNo`, `email`, `password`
2. Backend creates Student user and sends verification email
3. User clicks email link with token → `/verify-email?token=...`
4. Frontend posts token to `/api/v1/auth/verify-email`
5. Student account is now verified and can log in
6. Login returns JWT token + User object
7. Frontend stores token in localStorage and redirects to `/dashboard`

### Student No-Dues Workflow

1. Student clicks "Submit No-Dues Request" on `/nodues`
2. Creates request with `/api/v1/nodues/create`
3. Request starts with status PENDING, all clearances PENDING
4. Faculty reviews and approves/rejects individual clearances
5. When all clearances APPROVED, overall status becomes APPROVED
6. Student can then download no-dues certificate

### Faculty Approval

1. Faculty logs in → redirected to `/faculty/dashboard`
2. Views list of pending requests
3. Can search by enrollment number
4. Clicks request to view details
5. Adds remarks and clicks Approve/Reject
6. Backend updates their assigned clearance type
7. If all clearances approved, request is fully approved

---

## Development Tips

### Debug Token Issues

```javascript
// In browser console
localStorage.getItem('auth_token')  // Check token
localStorage.getItem('auth_user')   // Check user data
```

### Monitor API Calls

```javascript
// React Query DevTools will show all queries/mutations
// Check Network tab in browser DevTools for actual HTTP requests
```

### Test Role-Based Routing

1. Create multiple test accounts with different roles
2. Login with each role and verify correct dashboard loads
3. Try accessing unauthorized routes (should redirect)

### Common Test Scenarios

- Register new student → Verify email → Login
- Login as student → Create No-Dues request
- Login as faculty → Approve request
- Login as admin → View all requests and stats
- Test password reset flow
- Test logout and re-login

---

## Build for Production

```bash
cd client
npm run build
```

Output will be in `client/dist/` directory.

### Environment Variables for Production

```bash
VITE_API_URL=https://your-api-domain.com
```

---

## Support

For issues or questions:
1. Check the Network tab in browser DevTools for API responses
2. Review error messages in browser console
3. Verify backend is running on correct port
4. Check TypeScript types match actual API response
