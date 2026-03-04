import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import SuperAdminShell from "@/components/SuperAdminShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

export default function SuperAdminSettings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user || user.role !== "SUPER_ADMIN") {
    setLocation("/login");
    return null;
  }

  const { data: statsResponse, isLoading } = useQuery<any>({
    queryKey: ["/api/v1/admin/stats"],
    queryFn: () => apiRequest("GET", "/api/v1/admin/stats"),
  });

  const stats = statsResponse?.data || {};

  return (
    <SuperAdminShell
      title="Super Admin (HOD) Settings"
      subtitle="Central system configuration snapshot and health overview"
    >
      <Card className="bg-slate-800/50 border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold mb-4">System Configuration</h3>
        {isLoading ? (
          <p className="text-slate-400">Loading settings...</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-500/20 text-blue-300">Students: {stats?.users?.students || 0}</Badge>
              <Badge className="bg-green-500/20 text-green-300">Faculty: {stats?.users?.faculty || 0}</Badge>
              <Badge className="bg-indigo-500/20 text-indigo-300">Admins: {stats?.users?.admins || 0}</Badge>
              <Badge className="bg-purple-500/20 text-purple-300">Super Admins: {stats?.users?.superAdmins || 0}</Badge>
            </div>

            <div className="rounded-lg border border-slate-600/60 bg-slate-700/30 p-4">
              <p className="text-slate-200">Email verification is configured for one-click flow.</p>
              <p className="text-sm text-slate-400 mt-1">
                Users receive verification link via email and can verify instantly by opening the link.
              </p>
            </div>

            <div className="rounded-lg border border-slate-600/60 bg-slate-700/30 p-4">
              <p className="text-slate-200">Data Sync Scope</p>
              <p className="text-sm text-slate-400 mt-1">
                Approvals, users, departments, and analytics are now backed by live API data shared across admin, faculty, and super-admin views.
              </p>
            </div>
          </div>
        )}
      </Card>
    </SuperAdminShell>
  );
}
