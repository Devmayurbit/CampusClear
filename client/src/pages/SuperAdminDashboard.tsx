import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import SuperAdminShell from "@/components/SuperAdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users, Award, Activity } from "lucide-react";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user || user.role !== "SUPER_ADMIN") {
    setLocation("/login");
    return null;
  }

  const { data: statsResponse } = useQuery<any>({
    queryKey: ["/api/v1/admin/stats"],
    queryFn: () => apiRequest("GET", "/api/v1/admin/stats"),
  });

  const { data: dashboardResponse } = useQuery<any>({
    queryKey: ["/api/v1/admin/dashboard"],
    queryFn: () => apiRequest("GET", "/api/v1/admin/dashboard"),
  });

  const stats = statsResponse || {};
  const dashboard = dashboardResponse || {};
  const pending = dashboard?.stats?.pending || 0;
  const totalStudents = stats?.users?.students || 0;
  const certificates = stats?.requests?.certificates || 0;
  const auditLogs = stats?.auditLogs || 0;

  return (
    <SuperAdminShell
      title="Super Admin (HOD) Dashboard"
      subtitle={`${user?.fullName || "Super Admin"} • ${user?.department || "All Departments"}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-yellow-500/10 border-yellow-500/20 border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-300 mb-2">Final Approvals Pending</p>
              <p className="text-3xl font-bold">{pending}</p>
            </div>
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/20 border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-300 mb-2">Total Students</p>
              <p className="text-3xl font-bold">{totalStudents}</p>
            </div>
            <Users className="w-6 h-6 text-blue-400" />
          </div>
        </Card>

        <Card className="bg-green-500/10 border-green-500/20 border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-300 mb-2">Certificates Issued</p>
              <p className="text-3xl font-bold">{certificates}</p>
            </div>
            <Award className="w-6 h-6 text-green-400" />
          </div>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/20 border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-300 mb-2">Audit Events</p>
              <p className="text-3xl font-bold">{auditLogs}</p>
            </div>
            <Activity className="w-6 h-6 text-purple-400" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold mb-2">Final Approvals</h3>
          <p className="text-slate-400 text-sm mb-4">Review and approve pending final clearances.</p>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black w-full" onClick={() => setLocation("/super-admin/approvals")}>
            Open Approvals
          </Button>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold mb-2">User Management</h3>
          <p className="text-slate-400 text-sm mb-4">Manage faculty, admin, and super admin accounts.</p>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black w-full" onClick={() => setLocation("/super-admin/users")}>
            Manage Users
          </Button>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold mb-2">Analytics</h3>
          <p className="text-slate-400 text-sm mb-4">View live reports and counts from all modules.</p>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black w-full" onClick={() => setLocation("/super-admin/analytics")}>
            View Analytics
          </Button>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold mb-2">Departments & Settings</h3>
          <p className="text-slate-400 text-sm mb-4">Maintain departments and monitor platform settings.</p>
          <div className="grid grid-cols-2 gap-3">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black" onClick={() => setLocation("/super-admin/departments")}>
              Departments
            </Button>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black" onClick={() => setLocation("/super-admin/settings")}>
              Settings
            </Button>
          </div>
        </Card>
      </div>
    </SuperAdminShell>
  );
}
