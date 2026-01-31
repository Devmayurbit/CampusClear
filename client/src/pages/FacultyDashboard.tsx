import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth, useIsFaculty } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LogOut, CheckCircle, XCircle } from "lucide-react";

async function apiRequest(method: string, path: string, body?: any) {
  const response = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error((await response.json()).message);
  }

  return response;
}

export default function FacultyDashboard() {
  const { isAuthenticated, userRole, logout, user } = useAuth();
  const [, setLocation] = useLocation();
  const isFaculty = useIsFaculty();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [requirements, setRequirements] = useState("");

  if (!isAuthenticated || !isFaculty) {
    setLocation("/login");
    return null;
  }

  const { data: noDuesList, isLoading, refetch } = useQuery({
    queryKey: ["/api/v1/faculty/nodues"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/v1/faculty/nodues");
      return res.json();
    },
  });

  const handleApprove = async (noDuesId: string) => {
    try {
      await apiRequest("PUT", `/api/v1/faculty/nodues/${noDuesId}/approve`, {
        remarks,
        completedRequirements: requirements ? requirements.split(",").map(r => r.trim()) : [],
      });

      refetch();
      setSelectedId(null);
      setRemarks("");
      setRequirements("");
    } catch (error: any) {
      console.error("Approval failed:", error);
    }
  };

  const handleReject = async (noDuesId: string) => {
    try {
      await apiRequest("PUT", `/api/v1/faculty/nodues/${noDuesId}/reject`, {
        rejectionReason: remarks,
      });

      refetch();
      setSelectedId(null);
      setRemarks("");
    } catch (error: any) {
      console.error("Rejection failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const data = noDuesList?.data || {};
  const applications = data.applications || [];
  const department = data.department || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Faculty Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Department: <span className="font-semibold">{department.name}</span>
            </p>
          </div>
          <Button onClick={logout} variant="outline" className="gap-2">
            <LogOut size={16} /> Logout
          </Button>
        </div>

        {/* Applications List */}
        <div className="grid gap-4">
          {applications.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No applications pending review</p>
            </Card>
          ) : (
            applications.map((app: any) => (
              <Card key={app._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{app.studentName}</h3>
                    <p className="text-gray-600">
                      Enrollment: {app.enrollmentNo} | {app.program}
                    </p>
                  </div>
                  <Badge className={
                    app.departmentData?.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : app.departmentData?.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }>
                    {app.departmentData?.status || "pending"}
                  </Badge>
                </div>

                {selectedId === app._id ? (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">
                        Remarks
                      </label>
                      <Input
                        placeholder="Add remarks for this clearance"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">
                        Completed Requirements (comma-separated)
                      </label>
                      <Input
                        placeholder="E.g., Books returned, Fees cleared"
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(app._id)}
                      >
                        <CheckCircle size={16} /> Approve
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 gap-2"
                        onClick={() => handleReject(app._id)}
                      >
                        <XCircle size={16} /> Reject
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedId(null);
                          setRemarks("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {!app.departmentData?.status || app.departmentData?.status === "pending" ? (
                      <Button
                        className="gap-2 bg-green-600 hover:bg-green-700"
                        onClick={() => setSelectedId(app._id)}
                      >
                        <CheckCircle size={16} /> Review
                      </Button>
                    ) : null}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
