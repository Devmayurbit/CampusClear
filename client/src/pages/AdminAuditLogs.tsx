import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { ShieldCheck } from "lucide-react";

interface AuditLogItem {
  _id: string;
  action: string;
  targetType?: string;
  targetName?: string;
  createdAt?: string;
  actorEmail?: string;
}

export default function AdminAuditLogs() {
  const { isAuthenticated } = useAuth();
  const isAdmin = useIsAdmin();
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isAuthenticated || !isAdmin) {
    setLocation("/login");
    return null;
  }

  const { data, isLoading } = useQuery<{ data: AuditLogItem[] }>({
    queryKey: ["/api/v1/admin/audit-logs"],
    queryFn: () => apiRequest("GET", "/api/v1/admin/audit-logs"),
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".fade-up", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const items = data?.data || [];

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 fade-up">
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">System activity and user actions</p>
        </div>

        <Card className="p-6 fade-up">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-indigo-400" />
              No audit logs found.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((log) => (
                <div key={log._id} className="p-4 rounded-xl border bg-white/80">
                  <p className="font-semibold text-gray-900">{log.action}</p>
                  <p className="text-sm text-gray-600">
                    {log.targetType || ""} {log.targetName ? `• ${log.targetName}` : ""}
                  </p>
                  <p className="text-xs text-gray-500">
                    {log.actorEmail || "System"} • {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
