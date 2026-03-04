import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  LogOut,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
  Users,
  FileCheck,
} from "lucide-react";
import type { NoDuesRequest } from "@/types";

export default function FacultyDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchEnrollment, setSearchEnrollment] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<NoDuesRequest | null>(null);

  if (!user || user.role !== "FACULTY") {
    setLocation("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ["faculty-requests"],
    queryFn: async () => {
      try {
        const response = await authApi.faculty.getRequests();
        return response?.data as NoDuesRequest[];
      } catch (error) {
        return [];
      }
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return authApi.faculty.updateRequestStatus(requestId, {
        clearanceType: user?.department || "LIBRARY",
        status: "APPROVED",
        remarks: "Approved by faculty",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Request approved successfully",
      });
      refetch();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return authApi.faculty.updateRequestStatus(requestId, {
        clearanceType: user?.department || "LIBRARY",
        status: "REJECTED",
        remarks: "Rejected by faculty",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Request rejected successfully",
      });
      refetch();
    },
  });

  const filteredRequests = requests.filter((req) =>
    searchEnrollment === "" ||
    req.studentEnrollment?.toLowerCase().includes(searchEnrollment.toLowerCase())
  );

  const pendingCount = filteredRequests.filter((r) => r.status === "PENDING").length;
  const approvedCount = filteredRequests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = filteredRequests.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CDGI No-Dues</h1>
              <p className="text-xs text-slate-400">Management System</p>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              Faculty Dashboard
            </Button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{user?.name || "Faculty"}</span>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-red-400 hover:text-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Faculty Portal</h2>
          <p className="text-slate-400">
            Review and approve student No-Dues requests for {user?.department || "Your Department"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-500/10 border-blue-500/20 border backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Requests</p>
                <p className="text-2xl font-bold">{filteredRequests.length}</p>
              </div>
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </Card>

          <Card className="bg-yellow-500/10 border-yellow-500/20 border backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </Card>

          <Card className="bg-green-500/10 border-green-500/20 border backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Approved</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
          </Card>

          <Card className="bg-red-500/10 border-red-500/20 border backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Rejected</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
          </Card>
        </div>

        {/* Search Section */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm p-6 mb-6">
          <div className="flex gap-4 items-center">
            <Search className="w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by enrollment number..."
              value={searchEnrollment}
              onChange={(e) => setSearchEnrollment(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
        </Card>

        {/* Requests List */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              No-Dues Requests
            </h3>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
                <p className="text-slate-400 mt-4">Loading requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-white">
                          {request.studentName || "Student Name"}
                        </p>
                        <p className="text-sm text-slate-400">
                          {request.studentEnrollment || "Enrollment No."}
                        </p>
                      </div>
                      <Badge
                        className={
                          request.status === "APPROVED"
                            ? "bg-green-500/20 text-green-400"
                            : request.status === "REJECTED"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>

                    {request.status === "PENDING" && (
                      <div className="flex gap-3 mt-4">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            approveMutation.mutate(request.id);
                          }}
                          disabled={approveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        >
                          ✓ Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            rejectMutation.mutate(request.id);
                          }}
                          disabled={rejectMutation.isPending}
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20 flex-1"
                        >
                          ✗ Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
