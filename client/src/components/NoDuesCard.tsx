import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, ClearanceBadge } from "./StatusBadge";
import type { NoDuesRequest } from "@/types";

interface NoDuesCardProps {
  request: NoDuesRequest;
  onApprove?: (requestId: string, clearanceType: string) => void;
  onReject?: (requestId: string, clearanceType: string) => void;
  isLoading?: boolean;
}

export function NoDuesCard({
  request,
  onApprove,
  onReject,
  isLoading = false,
}: NoDuesCardProps) {
  const requestId = request._id || request.id;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {request.studentInfo?.fullName || "Student"}
            </CardTitle>
            <CardDescription>
              {request.studentInfo?.enrollmentNo || "No Enrollment"}
            </CardDescription>
          </div>
          <StatusBadge status={request.overallStatus} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Library Clearance */}
        <div className="space-y-2">
          <ClearanceBadge 
            status={request.libraryClearance.status} 
            label="Library Clearance"
          />
          {request.libraryClearance.remarks && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Remarks:</span> {request.libraryClearance.remarks}
            </p>
          )}
        </div>

        {/* Account Clearance */}
        <div className="space-y-2">
          <ClearanceBadge 
            status={request.accountClearance.status} 
            label="Account Clearance"
          />
          {request.accountClearance.remarks && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Remarks:</span> {request.accountClearance.remarks}
            </p>
          )}
        </div>

        {/* Hostel Clearance */}
        <div className="space-y-2">
          <ClearanceBadge 
            status={request.hostelClearance.status} 
            label="Hostel Clearance"
          />
          {request.hostelClearance.remarks && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Remarks:</span> {request.hostelClearance.remarks}
            </p>
          )}
        </div>

        {/* Department Clearance */}
        <div className="space-y-2">
          <ClearanceBadge 
            status={request.departmentClearance.status} 
            label="Department Clearance"
          />
          {request.departmentClearance.remarks && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Remarks:</span> {request.departmentClearance.remarks}
            </p>
          )}
        </div>

        {/* Action buttons for faculty/admin */}
        {(onApprove || onReject) && request.overallStatus === "PENDING" && (
          <div className="flex gap-2 pt-4">
            {onApprove && (
              <button
                onClick={() => requestId && onApprove(requestId, "all")}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                Approve
              </button>
            )}
            {onReject && (
              <button
                onClick={() => requestId && onReject(requestId, "all")}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                Reject
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
