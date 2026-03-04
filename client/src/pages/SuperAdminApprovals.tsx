import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import SuperAdminShell from "@/components/SuperAdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { authApi } from "@/lib/auth";
import { CheckCircle2, XCircle, DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type NoDuesItem = {
  _id: string;
  studentName: string;
  studentEmail: string;
  enrollmentNo?: string;
  program?: string;
  batch?: string;
  status: string;
  feeStatus?: string;
};

export default function SuperAdminApprovals() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (!user || user.role !== "SUPER_ADMIN") {
    setLocation("/login");
    return null;
  }

  const { data: items = [], isLoading } = useQuery<NoDuesItem[]>({
    queryKey: ["/api/v1/admin/nodues"],
    queryFn: () => apiRequest("GET", "/api/v1/admin/nodues"),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/v1/admin/nodues/${id}/approve`),
    onSuccess: () => {
      toast({ title: "Approved", description: "Request approved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/nodues"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/v1/admin/nodues/${id}/reject`),
    onSuccess: () => {
      toast({ title: "Rejected", description: "Request rejected successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/nodues"] });
    },
  });

  const feeStatusMutation = useMutation({
    mutationFn: ({ requestId, feeStatus }: { requestId: string; feeStatus: string }) =>
      authApi.admin.updateFeeStatus(requestId, feeStatus),
    onSuccess: () => {
      toast({ title: "Updated", description: "Fee status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/nodues"] });
    },
  });

  const pendingItems = (items || []).filter((item) => item.status === "PENDING");
  const allItems = items || [];

  const getFeeStatusBadge = (status: string) => {
    if (status === "PAID") return "bg-green-500/20 text-green-300";
    if (status === "WAIVED") return "bg-blue-500/20 text-blue-300";
    return "bg-red-500/20 text-red-300";
  };

  return (
    <SuperAdminShell
      title="Super Admin (HOD) Approvals"
      subtitle="Final approval queue and fee status management"
    >
      {/* Pending Approvals */}
      <Card className="bg-slate-800/50 border-slate-700/50 p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Pending Approvals ({pendingItems.length})</h3>
        {isLoading ? (
          <div className="text-slate-400">Loading approvals...</div>
        ) : pendingItems.length === 0 ? (
          <div className="text-slate-400">No pending approvals.</div>
        ) : (
          <div className="space-y-4">
            {pendingItems.map((item) => (
              <div key={item._id} className="rounded-lg border border-slate-600/60 bg-slate-700/30 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.studentName}</p>
                    <p className="text-sm text-slate-300">{item.studentEmail} • {item.enrollmentNo || "N/A"}</p>
                    <p className="text-xs text-slate-400">{item.program || ""} {item.batch ? `• ${item.batch}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-500/20 text-yellow-300">PENDING</Badge>
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(item._id)}
                      disabled={approveMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectMutation.mutate(item._id)}
                      disabled={rejectMutation.isPending}
                      className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Fee Status Management */}
      <Card className="bg-slate-800/50 border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-yellow-400" />
          Fee Status Management ({allItems.length})
        </h3>
        {isLoading ? (
          <div className="text-slate-400">Loading...</div>
        ) : allItems.length === 0 ? (
          <div className="text-slate-400">No requests found.</div>
        ) : (
          <div className="space-y-3">
            {allItems.map((item) => (
              <div key={`fee-${item._id}`} className="rounded-lg border border-slate-600/60 bg-slate-700/30 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold">{item.studentName}</p>
                    <p className="text-sm text-slate-300">{item.enrollmentNo || "N/A"} • {item.program || ""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getFeeStatusBadge(item.feeStatus || "UNPAID")}>
                      {item.feeStatus || "UNPAID"}
                    </Badge>
                    <Select
                      value={item.feeStatus || "UNPAID"}
                      onValueChange={(value) =>
                        feeStatusMutation.mutate({ requestId: item._id, feeStatus: value })
                      }
                    >
                      <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNPAID">Unpaid</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="WAIVED">Waived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </SuperAdminShell>
  );
}
