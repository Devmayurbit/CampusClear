import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClearanceBadge, StatusBadge } from "@/components/StatusBadge";
import { Download } from "lucide-react";
import type { NoDuesRequest } from "@/types";

const API_BASE_URL = (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

export default function NoDuesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Fetch student's No-Dues request
  const { data: noDuesData, isLoading: isLoadingNoDues, refetch } = useQuery({
    queryKey: ["nodues-me"],
    queryFn: async () => {
      return (await authApi.nodues.getMe()) as NoDuesRequest | null;
    },
    enabled: !!user && user.role === "STUDENT",
  });

  // Create No-Dues request mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      return authApi.nodues.create({ remarks: "" });
    },
    onSuccess: () => {
      setHasSubmitted(true);
      toast({
        title: "Application submitted",
        description: "Your No-Dues clearance request has been created. Please wait for faculty to review.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "Unable to submit No-Dues request",
        variant: "destructive",
      });
    },
  });

  // Delete No-Dues request mutation
  const deleteMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return authApi.nodues.delete(requestId);
    },
    onSuccess: () => {
      toast({
        title: "Request deleted",
        description: "Your No-Dues request has been deleted. You can now submit a new one.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Unable to delete No-Dues request",
        variant: "destructive",
      });
    },
  });

  if (authLoading || isLoadingNoDues) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "STUDENT") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Only students can access the No-Dues page. Please log in as a student.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">No-Dues Clearance</h1>
        <p className="text-gray-600 mt-2">
          Manage your no-dues clearance from all 7 departments: Library, Lab, TP, Sports, Accounts, Hostel, and Department/HOD.
        </p>
      </div>

      {/* No request yet */}
      {!noDuesData && !hasSubmitted && (
        <Card>
          <CardHeader>
            <CardTitle>Start Your No-Dues Clearance Process</CardTitle>
            <CardDescription>
              Submit a no-dues request to begin the clearance process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Click the button below to initiate your no-dues clearance request. You will receive 
              updates as different departments review and approve your request.
            </p>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="w-full"
            >
              {createMutation.isPending ? "Submitting..." : "Submit No-Dues Request"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Request submitted but still processing */}
      {(noDuesData || hasSubmitted) && !noDuesData && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            Your no-dues request has been submitted and is being processed.
          </AlertDescription>
        </Alert>
      )}

      {/* Active/Completed No-Dues Request */}
      {noDuesData && (
        <div className="space-y-6">
          {/* Overall Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your No-Dues Status</CardTitle>
                  <CardDescription>
                    Status as of {new Date(noDuesData.updatedAt || new Date()).toLocaleDateString()}
                  </CardDescription>
                </div>
                <StatusBadge status={noDuesData.overallStatus} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                {noDuesData.overallStatus === "PENDING"
                  ? "Your clearance request is being reviewed by different departments."
                  : noDuesData.overallStatus === "APPROVED"
                  ? "Congratulations! All your clearances have been approved. You are eligible for no-dues certificate."
                  : "Your clearance request has been rejected. Please contact the respective departments for more information."}
              </p>

              {/* Fee Status */}
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                <span className="text-sm font-medium text-gray-600">Fee Status:</span>
                <span className={`text-sm font-bold ${
                  noDuesData.feeStatus === "PAID" ? "text-green-600" :
                  noDuesData.feeStatus === "WAIVED" ? "text-blue-600" :
                  "text-red-600"
                }`}>
                  {noDuesData.feeStatus || "UNPAID"}
                </span>
                {noDuesData.feeStatus !== "PAID" && noDuesData.feeStatus !== "WAIVED" && (
                  <span className="text-xs text-gray-500">(Updated by HOD/Super Admin)</span>
                )}
              </div>
              
              {/* Delete Button - Only show for PENDING or REJECTED status */}
              {(noDuesData.overallStatus === "PENDING" || noDuesData.overallStatus === "REJECTED") && (
                <div className="pt-2 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this No-Dues request? This action cannot be undone.")) {
                        deleteMutation.mutate(noDuesData._id || noDuesData.id || "");
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete Request & Submit New"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Delete this request if you want to submit a new No-Dues application.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clearance Status Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: "libraryClearance" as const, label: "Library Clearance" },
              { key: "labClearance" as const, label: "Lab Clearance" },
              { key: "tpClearance" as const, label: "Training & Placement Clearance" },
              { key: "sportsClearance" as const, label: "Sports Clearance" },
              { key: "accountClearance" as const, label: "Accounts Clearance" },
              { key: "hostelClearance" as const, label: "Hostel Clearance" },
              { key: "departmentClearance" as const, label: "Department/HOD Clearance" },
            ].map((dept) => {
              const clearance = noDuesData[dept.key];
              return (
                <Card key={dept.key}>
                  <CardHeader>
                    <CardTitle className="text-lg">{dept.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ClearanceBadge
                      status={clearance?.status || "PENDING"}
                      label="Status"
                    />
                    {clearance?.remarks && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Remarks</p>
                        <p className="text-sm text-gray-700 mt-1">
                          {clearance.remarks}
                        </p>
                      </div>
                    )}
                    {clearance?.updatedAt && (
                      <p className="text-xs text-gray-500">
                        Updated: {new Date(clearance.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Approved Message + Download */}
          {noDuesData.overallStatus === "APPROVED" && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">✓</span>
                  <div>
                    <p className="font-semibold text-green-900">Congratulations!</p>
                    <p className="text-sm text-green-800 mt-1">
                      All your clearances have been approved. You can now download your no-dues certificate.
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("auth_token");
                      const res = await fetch(`${API_BASE_URL}/api/v1/certificate/my-certificates`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      const json = await res.json();
                      const certs = json.data || json || [];
                      if (certs.length > 0) {
                        const certId = certs[0].certificateId;
                        const downloadRes = await fetch(
                          `${API_BASE_URL}/api/v1/certificate/${certId}/download`,
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        if (downloadRes.ok) {
                          const blob = await downloadRes.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${certId}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        } else {
                          toast({
                            title: "Certificate not ready",
                            description: "Your certificate hasn't been generated by admin yet. Please check back later.",
                          });
                        }
                      } else {
                        toast({
                          title: "Certificate not ready",
                          description: "Your certificate hasn't been generated by admin yet. Please check back later.",
                        });
                      }
                    } catch {
                      toast({
                        title: "Download failed",
                        description: "Unable to download certificate. Please try again later.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download No-Dues Certificate
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
