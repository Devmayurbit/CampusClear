import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  Award,
  Settings,
  GraduationCap,
  Activity,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user || user.role !== "ADMIN") {
    setLocation("/login");
    return null;
  }

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [dashboard, systemStats] = await Promise.all([
        authApi.admin.getDashboard(),
        authApi.admin.getStats(),
      ]);

      return {
        dashboard: dashboard || {},
        systemStats: systemStats || {},
      };
    },
  });

  const dashboardData: any = stats?.dashboard || {};
  const systemStatsData: any = stats?.systemStats || {};
  const requestStats = dashboardData?.stats || {};
  const userStats = systemStatsData?.users || {};

  const statCards = [
    {
      title: "Total Students",
      value: userStats.students || 0,
      icon: Users,
      color: "bg-blue-500/10 border-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      title: "Total Applications",
      value: requestStats.total || 0,
      icon: FileText,
      color: "bg-purple-500/10 border-purple-500/20",
      iconColor: "text-purple-400",
    },
    {
      title: "Pending Review",
      value: requestStats.pending || 0,
      icon: BarChart3,
      color: "bg-yellow-500/10 border-yellow-500/20",
      iconColor: "text-yellow-400",
    },
    {
      title: "Approved",
      value: requestStats.approved || 0,
      icon: CheckCircle2,
      color: "bg-green-500/10 border-green-500/20",
      iconColor: "text-green-400",
    },
    {
      title: "Rejected",
      value: requestStats.rejected || 0,
      icon: XCircle,
      color: "bg-red-500/10 border-red-500/20",
      iconColor: "text-red-400",
    },
    {
      title: "Certificates Issued",
      value: dashboardData?.certificatesIssued || 0,
      icon: Award,
      color: "bg-indigo-500/10 border-indigo-500/20",
      iconColor: "text-indigo-400",
    },
  ];

  const menuItems = [
    { label: "Manage Applications", icon: FileText, path: "/admin/applications", color: "text-purple-400" },
    { label: "Student Directory", icon: Users, path: "/admin/students", color: "text-blue-400" },
    { label: "Departments", icon: BarChart3, path: "/admin/departments", color: "text-green-400" },
    { label: "Audit Logs", icon: Activity, path: "/admin/audit-logs", color: "text-indigo-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Admin Panel</h2>
          <p className="text-slate-400">System Overview & Management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className={`${stat.color} border backdrop-blur-sm p-6 hover:shadow-lg transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                onClick={() => setLocation(item.path)}
                className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm p-8 text-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <Icon className={`w-10 h-10 mx-auto mb-4 ${item.color}`} />
                <h3 className="text-lg font-semibold mb-2">{item.label}</h3>
                <p className="text-slate-400 mb-6 text-sm">
                  {item.label === "Manage Applications" && "Review and approve student No-Dues applications"}
                  {item.label === "Student Directory" && "Manage student profiles and accounts"}
                  {item.label === "Departments" && "Manage departments and clearance requirements"}
                  {item.label === "Audit Logs" && "View system activity and user actions"}
                </p>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                  Access →
                </Button>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
