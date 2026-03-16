import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Award,
  LogOut,
} from "lucide-react";

async function apiRequest(method: string, path: string, body?: any) {
  const response = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error((await response.json()).message);
  }

  return response;
}

export default function AdminDashboard() {
  const { isAuthenticated, userRole, logout } = useAuth();
  const [, setLocation] = useLocation();
  const isAdmin = useIsAdmin();

  if (!isAuthenticated || !isAdmin) {
    setLocation("/login");
    return null;
  }

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/v1/admin/dashboard/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/v1/admin/dashboard/stats");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statsData = stats?.data || {};

  const statCards = [
    {
      title: "Total Students",
      value: statsData.totalStudents || 0,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Applications",
      value: statsData.totalApplications || 0,
      icon: FileText,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Pending Review",
      value: statsData.pendingApplications || 0,
      icon: BarChart3,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Approved",
      value: statsData.approvedApplications || 0,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Rejected",
      value: statsData.rejectedApplications || 0,
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Certificates Issued",
      value: statsData.certificatesGenerated || 0,
      icon: Award,
      color: "bg-indigo-50 text-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">System Overview & Management</p>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="gap-2"
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      {stat.title}
                    </p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8 text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setLocation("/admin/applications")}>
            <FileText size={32} className="mx-auto text-purple-600 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Manage Applications</h3>
            <p className="text-gray-600 mb-4">
              Review and approve student No-Dues applications
            </p>
            <Button className="w-full">View All</Button>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setLocation("/admin/students")}>
            <Users size={32} className="mx-auto text-blue-600 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Student Directory</h3>
            <p className="text-gray-600 mb-4">
              Manage student profiles and accounts
            </p>
            <Button className="w-full">View All</Button>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setLocation("/admin/departments")}>
            <BarChart3 size={32} className="mx-auto text-green-600 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Departments</h3>
            <p className="text-gray-600 mb-4">
              Manage departments and clearance requirements
            </p>
            <Button className="w-full">Configure</Button>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setLocation("/admin/audit-logs")}>
            <Award size={32} className="mx-auto text-indigo-600 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Audit Logs</h3>
            <p className="text-gray-600 mb-4">
              View system activity and user actions
            </p>
            <Button className="w-full">View Logs</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
