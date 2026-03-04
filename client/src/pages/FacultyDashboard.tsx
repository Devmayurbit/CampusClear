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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  FileCheck,
  Download,
  Filter,
  CheckSquare,
  MessageSquare,
  User,
  Trash2,
} from "lucide-react";
import type { NoDuesRequest } from "@/types";

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [batchFilter, setBatchFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [remarksDialogOpen, setRemarksDialogOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [studentDetailsOpen, setStudentDetailsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  if (!user || user.role !== "FACULTY") {
    setLocation("/login");
    return null;
  }

  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ["faculty-filtered-requests", statusFilter, batchFilter, programFilter, sortBy, sortOrder, searchQuery],
    queryFn: async () => {
      try {
        const response = await authApi.faculty.getFilteredRequests({
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          batch: batchFilter || undefined,
          program: programFilter || undefined,
          sortBy,
          sortOrder,
          search: searchQuery || undefined,
        });
        return response || [];
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

  const bulkMutation = useMutation({
    mutationFn: async ({ requestIds, status, remarks }: { requestIds: string[], status: "APPROVED" | "REJECTED", remarks?: string }) => {
      return authApi.faculty.bulkUpdate(requestIds, status, remarks);
    },
    onSuccess: (response: any) => {
      toast({
        title: "Success",
        description: response?.message || "Bulk update completed",
      });
      setSelectedRequests([]);
      refetch();
    },
  });

  const remarksMutation = useMutation({
    mutationFn: async ({ requestId, remarks }: { requestId: string, remarks: string }) => {
      return authApi.faculty.addRemarks(requestId, remarks);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Remarks added successfully",
      });
      setRemarksDialogOpen(false);
      setRemarks("");
      refetch();
    },
  });

  const handleExport = async () => {
    try {
      await authApi.faculty.exportRequests({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      });
      toast({
        title: "Success",
        description: "Requests exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export requests",
        variant: "destructive",
      });
    }
  };

  const handleViewStudent = async (studentId: string) => {
    try {
      const response = await authApi.faculty.getStudentDetails(studentId);
      setSelectedStudent(response);
      setStudentDetailsOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load student details",
        variant: "destructive",
      });
    }
  };

  const handleBulkApprove = () => {
    if (selectedRequests.length === 0) {
      toast({
        title: "Warning",
        description: "Please select at least one request",
        variant: "destructive",
      });
      return;
    }
    bulkMutation.mutate({
      requestIds: selectedRequests,
      status: "APPROVED",
      remarks: "Bulk approved by faculty",
    });
  };

  const handleBulkReject = () => {
    if (selectedRequests.length === 0) {
      toast({
        title: "Warning",
        description: "Please select at least one request",
        variant: "destructive",
      });
      return;
    }
    bulkMutation.mutate({
      requestIds: selectedRequests,
      status: "REJECTED",
      remarks: "Bulk rejected by faculty",
    });
  };

  const handleToggleSelect = (requestId: string) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    const pendingRequests = filteredRequests
      .filter((r: any) => (r?.departmentStatus?.status || "PENDING") === "PENDING")
      .map((r: any) => r._id || r.id);
    
    if (selectedRequests.length === pendingRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(pendingRequests);
    }
  };

  const filteredRequests = requests.filter((req: any) => {
    return true; // Filtering is now done on backend
  });

  const pendingCount = filteredRequests.filter((r: any) => (r?.departmentStatus?.status || "PENDING") === "PENDING").length;
  const approvedCount = filteredRequests.filter((r: any) => (r?.departmentStatus?.status || "PENDING") === "APPROVED").length;
  const rejectedCount = filteredRequests.filter((r: any) => (r?.departmentStatus?.status || "PENDING") === "REJECTED").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Faculty Portal</h2>
          <p className="text-slate-400">
            Review and approve student No-Dues requests for {user?.department || "Your Department"}
          </p>
        </div>

        {/* Stats Cards */}
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

        {/* Filters and Actions */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm p-6 mb-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-4 items-center">
              <Search className="w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name, enrollment number, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Batch</label>
                <Input
                  type="text"
                  placeholder="e.g. 2024"
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Program</label>
                <Input
                  type="text"
                  placeholder="e.g. B.Tech"
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date</SelectItem>
                    <SelectItem value="enrollmentNo">Enrollment No</SelectItem>
                    <SelectItem value="fullName">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Order</label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              <Button
                size="sm"
                onClick={handleExport}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              
              {selectedRequests.length > 0 && (
                <>
                  <Button
                    size="sm"
                    onClick={handleBulkApprove}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Selected ({selectedRequests.length})
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleBulkReject}
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Selected ({selectedRequests.length})
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setSelectedRequests([])}
                    variant="ghost"
                    className="text-slate-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Selection
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Status Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
          <TabsList className="bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="ALL">All ({filteredRequests.length})</TabsTrigger>
            <TabsTrigger value="PENDING">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="APPROVED">Approved ({approvedCount})</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected ({rejectedCount})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Requests List */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                No-Dues Requests
              </h3>
              {pendingCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAll}
                  className="border-slate-600"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  {selectedRequests.length === pendingCount ? "Deselect All" : "Select All Pending"}
                </Button>
              )}
            </div>

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
                {filteredRequests.map((request: any) => (
                  <div
                    key={request._id || request.id}
                    className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    {(() => {
                      const requestAny = request as any;
                      const requestId = request._id || request.id || "";
                      const studentId = requestAny?.studentId?._id || requestAny?.studentId?.id || "";
                      const studentName = requestAny?.studentId?.fullName || request?.studentInfo?.fullName || "Student Name";
                      const studentEnrollment = requestAny?.studentId?.enrollmentNo || request?.studentInfo?.enrollmentNo || "Enrollment No.";
                      const studentProgram = requestAny?.studentId?.program || request?.studentInfo?.program || "";
                      const studentBatch = requestAny?.studentId?.batch || request?.studentInfo?.batch || "";
                      const deptStatus = requestAny?.departmentStatus?.status || "PENDING";
                      const deptRemarks = requestAny?.departmentStatus?.remarks || "";

                      return (
                        <>
                          <div className="flex items-start gap-4">
                            {deptStatus === "PENDING" && (
                              <Checkbox
                                checked={selectedRequests.includes(requestId)}
                                onCheckedChange={() => handleToggleSelect(requestId)}
                                className="mt-1"
                              />
                            )}
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="font-semibold text-white flex items-center gap-2">
                                    {studentName}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => studentId && handleViewStudent(studentId)}
                                      className="h-6 px-2 text-blue-400 hover:bg-blue-500/20"
                                    >
                                      <User className="w-3 h-3 mr-1" />
                                      View Details
                                    </Button>
                                  </p>
                                  <p className="text-sm text-slate-400">
                                    {studentEnrollment} • {studentProgram} • Batch {studentBatch}
                                  </p>
                                  {deptRemarks && (
                                    <p className="text-sm text-slate-500 mt-1 italic">
                                      Remarks: {deptRemarks}
                                    </p>
                                  )}
                                </div>
                                <Badge
                                  className={
                                    deptStatus === "APPROVED"
                                      ? "bg-green-500/20 text-green-400"
                                      : deptStatus === "REJECTED"
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-yellow-500/20 text-yellow-400"
                                  }
                                >
                                  {deptStatus}
                                </Badge>
                              </div>

                              {deptStatus === "PENDING" && (
                                <div className="flex gap-3 mt-4">
                                  <Button
                                    size="sm"
                                    onClick={() => requestId && approveMutation.mutate(requestId)}
                                    disabled={approveMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => requestId && rejectMutation.mutate(requestId)}
                                    disabled={rejectMutation.isPending}
                                    variant="outline"
                                    className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setCurrentRequestId(requestId);
                                      setRemarksDialogOpen(true);
                                    }}
                                    variant="ghost"
                                    className="text-slate-400"
                                  >
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    Add Remarks
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </main>

      {/* Remarks Dialog */}
      <Dialog open={remarksDialogOpen} onOpenChange={setRemarksDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Add Remarks</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add detailed remarks to this request
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter your remarks here..."
            className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemarksDialogOpen(false)}
              className="border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (currentRequestId && remarks.trim()) {
                  remarksMutation.mutate({ requestId: currentRequestId, remarks });
                }
              }}
              disabled={!remarks.trim() || remarksMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Remarks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog open={studentDetailsOpen} onOpenChange={setStudentDetailsOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Full Name</p>
                  <p className="font-semibold">{selectedStudent.student?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Enrollment No</p>
                  <p className="font-semibold">{selectedStudent.student?.enrollmentNo}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="font-semibold">{selectedStudent.student?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Program</p>
                  <p className="font-semibold">{selectedStudent.student?.program}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Batch</p>
                  <p className="font-semibold">{selectedStudent.student?.batch}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Phone</p>
                  <p className="font-semibold">{selectedStudent.student?.phone || "N/A"}</p>
                </div>
              </div>
              
              {selectedStudent.noDuesHistory && selectedStudent.noDuesHistory.length > 0 && (
                <div>
                  <p className="text-sm text-slate-400 mb-2">No-Dues History</p>
                  <div className="space-y-2">
                    {selectedStudent.noDuesHistory.map((req: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-700/30 rounded border border-slate-600/50">
                        <div className="flex items-center justify-between">
                          <p className="text-sm">Request #{idx + 1}</p>
                          <Badge>{req.overallStatus}</Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Created: {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStudentDetailsOpen(false)}
              className="border-slate-600"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
