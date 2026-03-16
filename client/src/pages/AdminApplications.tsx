import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import gsap from "gsap";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, XCircle, FileText, RefreshCw } from "lucide-react";

interface NoDuesItem {
  _id: string;
  studentName: string;
  studentEmail: string;
  enrollmentNo?: string;
  program?: string;
  batch?: string;
  status: string;
  createdAt?: string;
}

export default function AdminApplications() {
  const { isAuthenticated } = useAuth();
  const isAdmin = useIsAdmin();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isAuthenticated || !isAdmin) {
    setLocation("/login");
    return null;
  }

  const { data, isLoading, refetch } = useQuery<{ data: NoDuesItem[] }>({
    queryKey: ["/api/v1/admin/nodues"],
    queryFn: () => apiRequest("GET", "/api/v1/admin/nodues"),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("PUT", `/api/v1/admin/nodues/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/nodues"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("PUT", `/api/v1/admin/nodues/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/nodues"] }),
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

  const statusBadge = (status: string) => {
    const base = "capitalize";
    if (status === "APPROVED") return <Badge className={base} variant="default">Approved</Badge>;
    if (status === "REJECTED") return <Badge className={base} variant="destructive">Rejected</Badge>;
    if (status === "PENDING_VERIFICATION") return <Badge className={base} variant="secondary">Pending</Badge>;
    return <Badge className={base} variant="outline">{status}</Badge>;
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8 fade-up">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Applications</h1>
            <p className="text-gray-600 mt-1">Review and approve No-Dues submissions</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        <Card className="p-6 fade-up">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-3 text-indigo-400" />
              No applications found.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-xl border bg-white/80"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{item.studentName}</p>
                    <p className="text-sm text-gray-600">
                      {item.studentEmail} • {item.enrollmentNo || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.program || ""} {item.batch ? `• ${item.batch}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusBadge(item.status)}
                    <Button
                      size="sm"
                      className="gap-1"
                      onClick={() => approveMutation.mutate(item._id)}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1"
                      onClick={() => rejectMutation.mutate(item._id)}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
