import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NoDuesCard } from "@/components/NoDuesCard";
import { ClearanceBadge, StatusBadge } from "@/components/StatusBadge";
import type { NoDuesRequest } from "@/types";

export default function NoDuesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Fetch student's No-Dues request
  const { data: noDuesData, isLoading: isLoadingNoDues, refetch } = useQuery({
    queryKey: ["nodues-me"],
    queryFn: async () => {
      const response = await authApi.nodues.getMe();
      return response?.data as NoDuesRequest;
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
          Manage your no-dues clearance from library, accounts, hostel, and your department.
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
            </CardContent>
          </Card>

          {/* Clearance Status Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Library */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Library Clearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ClearanceBadge
                  status={noDuesData.libraryClearance.status}
                  label="Status"
                />
                {noDuesData.libraryClearance.remarks && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Remarks</p>
                    <p className="text-sm text-gray-700 mt-1">
                      {noDuesData.libraryClearance.remarks}
                    </p>
                  </div>
                )}
                {noDuesData.libraryClearance.updatedAt && (
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(noDuesData.libraryClearance.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Accounts Clearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ClearanceBadge
                  status={noDuesData.accountClearance.status}
                  label="Status"
                />
                {noDuesData.accountClearance.remarks && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Remarks</p>
                    <p className="text-sm text-gray-700 mt-1">
                      {noDuesData.accountClearance.remarks}
                    </p>
                  </div>
                )}
                {noDuesData.accountClearance.updatedAt && (
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(noDuesData.accountClearance.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Hostel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hostel Clearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ClearanceBadge
                  status={noDuesData.hostelClearance.status}
                  label="Status"
                />
                {noDuesData.hostelClearance.remarks && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Remarks</p>
                    <p className="text-sm text-gray-700 mt-1">
                      {noDuesData.hostelClearance.remarks}
                    </p>
                  </div>
                )}
                {noDuesData.hostelClearance.updatedAt && (
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(noDuesData.hostelClearance.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Department */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Department Clearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ClearanceBadge
                  status={noDuesData.departmentClearance.status}
                  label="Status"
                />
                {noDuesData.departmentClearance.remarks && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Remarks</p>
                    <p className="text-sm text-gray-700 mt-1">
                      {noDuesData.departmentClearance.remarks}
                    </p>
                  </div>
                )}
                {noDuesData.departmentClearance.updatedAt && (
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(noDuesData.departmentClearance.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Approved Message */}
          {noDuesData.overallStatus === "APPROVED" && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">✓</span>
                  <div>
                    <p className="font-semibold text-green-900">Congratulations!</p>
                    <p className="text-sm text-green-800 mt-1">
                      All your clearances have been approved. You can now download your no-dues certificate.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
