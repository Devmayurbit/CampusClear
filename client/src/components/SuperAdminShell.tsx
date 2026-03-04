import { ReactNode } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, BarChart3, Users, Activity, Settings, ChevronRight } from "lucide-react";

type MenuItem = {
  icon: any;
  label: string;
  path: string;
};

const menuItems: MenuItem[] = [
  { icon: CheckCircle2, label: "Dashboard", path: "/super-admin/dashboard" },
  { icon: Clock, label: "Approvals", path: "/super-admin/approvals" },
  { icon: BarChart3, label: "Analytics", path: "/super-admin/analytics" },
  { icon: Users, label: "Manage Users", path: "/super-admin/users" },
  { icon: Activity, label: "Departments", path: "/super-admin/departments" },
  { icon: Settings, label: "Settings", path: "/super-admin/settings" },
];

interface SuperAdminShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function SuperAdminShell({ title, subtitle, children }: SuperAdminShellProps) {
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          {subtitle && <p className="text-slate-400">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-1 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm h-fit">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">SUPER ADMIN PANEL</h3>
              <nav className="space-y-3">
                {menuItems.map((item) => {
                  const active = location === item.path || location === item.path.replace("/super-admin", "/hod");
                  return (
                    <button
                      key={item.path}
                      onClick={() => setLocation(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                        active
                          ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400"
                          : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                      {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </Card>

          <div className="lg:col-span-4 space-y-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
