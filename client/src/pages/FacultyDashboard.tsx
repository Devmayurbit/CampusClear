import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth, useIsFaculty } from "@/hooks/use-auth";
import { authApi } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RequestTable } from "@/components/RequestTable";
import { NoDuesCard } from "@/components/NoDuesCard";
import type { NoDuesRequest } from "@/types";

export default function FacultyDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchEnrollment, setSearchEnrollment] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<NoDuesRequest | null>(null);
  const [remarks, setRemarks] = useState("");

  const isFaculty = useIsFaculty();

  // Fetch faculty requests
  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ["faculty-requests"],
    queryFn: async () => {
      const response = await authApi.faculty.getRequests();
      return response?.data as NoDuesRequest[];
    },
    enabled: !!user && user.role === "FACULTY",
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return authApi.faculty.updateRequestStatus(requestId, {
        clearanceType: user?.department || "LIBRARY",
        status: "APPROVED",
        remarks,
      });
    },
    onSuccess: () => {
      toast({
        title: "Request approved",
        description: "The student request has been approved.",
      });
      setRemarks("");
      setSelectedRequest(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Approval failed",
        description: error.message || "Unable to approve request",
        variant: "destructive",
      });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return authApi.faculty.updateRequestStatus(requestId, {
        clearanceType: user?.department || "LIBRARY",
        status: "REJECTED",
        remarks,
      });
    },
    onSuccess: () => {
      toast({
        title: "Request rejected",
        description: "The student request has been rejected.",
      });
      setRemarks("");
      setSelectedRequest(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Rejection failed",
        description: error.message || "Unable to reject request",
        variant: "destructive",
      });
    },
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async () => {
      return authApi.faculty.search(searchEnrollment);
    },
    onSuccess: (data) => {
      if (data?.data && (data.data as NoDuesRequest[]).length > 0) {
        setSelectedRequest((data.data as NoDuesRequest[])[0]);
      } else {
        toast({
          title: "No results",
          description: "No student found with that enrollment number.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Search failed",
        description: error.message || "Unable to search",
        variant: "destructive",
      });
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isFaculty) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Only faculty members can access this page. Please log in as faculty.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Review and approve no-dues requests from students in your department
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search Student</CardTitle>
          <CardDescription>Find a specific student by enrollment number</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter enrollment number..."
              value={searchEnrollment}
              onChange={(e) => setSearchEnrollment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  searchMutation.mutate();
                }
              }}
            />
            <Button
              onClick={() => searchMutation.mutate()}
              disabled={!searchEnrollment || searchMutation.isPending}
            >
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Request Detail */}
      {selectedRequest && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Selected Request</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRequest(null)}
                className="absolute top-4 right-4"
              >
                Close
              </Button>
            </CardHeader>
            <CardContent>
              <NoDuesCard request={selectedRequest} />

              {selectedRequest.overallStatus === "PENDING" && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Remarks (Optional)</label>
                    <Textarea
                      placeholder="Add any remarks or conditions for approval/rejection..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => selectedRequest.id && approveMutation.mutate(selectedRequest.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {approveMutation.isPending ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      onClick={() => selectedRequest.id && rejectMutation.mutate(selectedRequest.id)}
                      disabled={rejectMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>All students waiting for your approval</CardDescription>
        </CardHeader>
        <CardContent>
          {requests && requests.length > 0 ? (
            <RequestTable
              requests={requests.filter((r) => r.overallStatus === "PENDING")}
              onApprove={(requestId) => {
                const request = requests.find((r) => r._id === requestId || r.id === requestId);
                if (request) {
                  setSelectedRequest(request);
                }
              }}
              showActions={false}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No pending requests</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
