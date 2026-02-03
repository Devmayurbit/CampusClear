import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import type { NoDuesRequest } from "@/types";

interface RequestTableProps {
  requests: NoDuesRequest[];
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  isLoading?: boolean;
  showActions?: boolean;
}

export function RequestTable({
  requests,
  onApprove,
  onReject,
  isLoading = false,
  showActions = true,
}: RequestTableProps) {
  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No requests found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Student Name</TableHead>
            <TableHead>Enrollment No.</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Library</TableHead>
            <TableHead>Accounts</TableHead>
            <TableHead>Hostel</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Overall Status</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => {
            const requestId = request._id || request.id;
            return (
              <TableRow key={requestId} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  {request.studentInfo?.fullName || "N/A"}
                </TableCell>
                <TableCell>{request.studentInfo?.enrollmentNo || "N/A"}</TableCell>
                <TableCell className="text-sm">{request.studentInfo?.email || "N/A"}</TableCell>
                <TableCell>
                  <StatusBadge status={request.libraryClearance.status} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={request.accountClearance.status} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={request.hostelClearance.status} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={request.departmentClearance.status} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={request.overallStatus} />
                </TableCell>
                {showActions && (
                  <TableCell>
                    {request.overallStatus === "PENDING" && (
                      <div className="flex gap-2">
                        {onApprove && (
                          <Button
                            onClick={() => requestId && onApprove(requestId)}
                            disabled={isLoading}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            Approve
                          </Button>
                        )}
                        {onReject && (
                          <Button
                            onClick={() => requestId && onReject(requestId)}
                            disabled={isLoading}
                            size="sm"
                            variant="outline"
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
