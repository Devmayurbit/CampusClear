import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import SuperAdminShell from "@/components/SuperAdminShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Users, ClipboardCheck, Award, Shield } from "lucide-react";

export default function SuperAdminAnalytics() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user || user.role !== "SUPER_ADMIN") {
    setLocation("/login");
    return null;
  }

  const { data: statsResponse, isLoading: isStatsLoading } = useQuery<any>({
    queryKey: ["/api/v1/admin/stats"],
    queryFn: () => apiRequest("GET", "/api/v1/admin/stats"),
  });

  const { data: dashboardResponse, isLoading: isDashboardLoading } = useQuery<any>({
    queryKey: ["/api/v1/admin/dashboard"],
    queryFn: () => apiRequest("GET", "/api/v1/admin/dashboard"),
  });

  const stats = statsResponse?.data || {};
  const dashboard = dashboardResponse?.data || {};

  return (
    <SuperAdminShell
      title="Super Admin (HOD) Analytics"
      subtitle="Live system analytics across students, users, requests, and certificates"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-500/10 border-blue-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Total Users</p>
              <p className="text-3xl font-bold">{(stats?.users?.students || 0) + (stats?.users?.faculty || 0) + (stats?.users?.admins || 0) + (stats?.users?.superAdmins || 0)}</p>
            </div>
            <Users className="w-6 h-6 text-blue-400" />
          </div>
        </Card>

        <Card className="bg-yellow-500/10 border-yellow-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Total Requests</p>
              <p className="text-3xl font-bold">{stats?.requests?.total || 0}</p>
            </div>
            <ClipboardCheck className="w-6 h-6 text-yellow-400" />
          </div>
        </Card>

        <Card className="bg-green-500/10 border-green-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Certificates Issued</p>
              <p className="text-3xl font-bold">{stats?.requests?.certificates || 0}</p>
            </div>
            <Award className="w-6 h-6 text-green-400" />
          </div>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Audit Events</p>
              <p className="text-3xl font-bold">{stats?.auditLogs || 0}</p>
            </div>
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold mb-4">Request Status Breakdown</h3>
        {isDashboardLoading || isStatsLoading ? (
          <div className="text-slate-400">Loading analytics...</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-500/20 text-blue-300">Total: {dashboard?.stats?.total || 0}</Badge>
            <Badge className="bg-green-500/20 text-green-300">Approved: {dashboard?.stats?.approved || 0}</Badge>
            <Badge className="bg-yellow-500/20 text-yellow-300">Pending: {dashboard?.stats?.pending || 0}</Badge>
            <Badge className="bg-red-500/20 text-red-300">Rejected: {dashboard?.stats?.rejected || 0}</Badge>
          </div>
        )}
      </Card>
    </SuperAdminShell>
  );
}
