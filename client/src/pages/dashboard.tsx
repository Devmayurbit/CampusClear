import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { Home, HelpCircle, LogOut, RefreshCw, Download, Calendar, Clock } from "lucide-react";

interface ClearanceWithDepartment {
  id: string;
  studentId: string;
  departmentId: string;
  status: "pending" | "cleared" | "rejected";
  requirements: string[];
  completedRequirements: string[];
  remarks?: string;
  clearedAt?: string;
  createdAt: string;
  updatedAt: string;
  department: {
    id: string;
    name: string;
    description: string;
    color: string;
    createdAt: string;
  };
}

export default function Dashboard() {
  const { student, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const { data: clearances, isLoading, refetch } = useQuery<ClearanceWithDepartment[]>({
    queryKey: ["/api/clearances"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const clearedCount = clearances?.filter(c => c.status === "cleared").length || 5;
  const pendingCount = clearances?.filter(c => c.status === "pending").length || 2;
  const rejectedCount = clearances?.filter(c => c.status === "rejected").length || 1;
  const totalCount = 8; // Total departments
  const progressPercentage = Math.round((clearedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">CDGI No-Dues System</h1>
                <p className="text-purple-100 text-sm">Student Clearance Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Student Profile & Status */}
          <div className="space-y-6">
            {/* Student Profile */}
            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  {student?.profilePhoto ? (
                    <img 
                      src={student.profilePhoto} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-2xl font-bold">
                      {student?.fullName?.charAt(0) || 'R'}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{student?.fullName || 'Rajesh Sharma'}</h3>
                  <p className="text-sm text-gray-600">B.Tech CSE - 2018-22</p>
                  <p className="text-sm text-gray-600">Roll No: {student?.rollNumber || 'CS182034'}</p>
                </div>
              </div>
            </Card>

            {/* Clearance Status */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Clearance Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">{clearedCount} of {totalCount} departments cleared</span>
                    <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-lg font-bold text-gray-900">{clearedCount}</span>
                    </div>
                    <span className="text-xs text-gray-600">Clear</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-lg font-bold text-gray-900">{pendingCount}</span>
                    </div>
                    <span className="text-xs text-gray-600">Pending</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-lg font-bold text-gray-900">{rejectedCount}</span>
                    </div>
                    <span className="text-xs text-gray-600">Issue</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Important Dates */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Important Dates</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last date for submission: Jun 15, 2023</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Estimated processing: 3-5 working days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Download className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Download clearance certificate</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Department Clearances */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Department Clearances</h3>
              <Button 
                onClick={() => refetch()} 
                variant="outline"
                className="bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
            </div>

            {/* Department Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Library Department */}
              <Card className="overflow-hidden">
                <div className="bg-green-500 px-4 py-3 flex items-center justify-between">
                  <h4 className="text-white font-semibold">Library</h4>
                  <Badge className="bg-green-600 text-white">
                    Cleared
                  </Badge>
                </div>
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Book Returns</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Dues Paid</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Processed on May 12, 2023
                  </div>
                  <Button size="sm" className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100">
                    <Download className="w-4 h-4 mr-1" />
                    Receipt
                  </Button>
                </div>
              </Card>

              {/* Accounts Office */}
              <Card className="overflow-hidden">
                <div className="bg-yellow-500 px-4 py-3 flex items-center justify-between">
                  <h4 className="text-white font-semibold">Accounts Office</h4>
                  <Badge className="bg-yellow-600 text-white">
                    Pending
                  </Badge>
                </div>
                <div className="p-4">
                  <div className="text-sm text-gray-600 mb-3">
                    Complete fee payment to get clearance from accounts department.
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tuition Fees</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Late Fine</span>
                      <span className="text-red-600">✗</span>
                    </div>
                    <div className="text-right text-sm font-medium">
                      Amount Due: ₹2,500
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100">
                    ₹ Pay Now
                  </Button>
                </div>
              </Card>

              {/* Hostel */}
              <Card className="overflow-hidden">
                <div className="bg-green-500 px-4 py-3 flex items-center justify-between">
                  <h4 className="text-white font-semibold">Hostel</h4>
                  <Badge className="bg-green-600 text-white">
                    Cleared
                  </Badge>
                </div>
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Room Inspection</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Dues Cleared</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Processed on May 18, 2023
                  </div>
                  <Button size="sm" className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100">
                    <Download className="w-4 h-4 mr-1" />
                    Receipt
                  </Button>
                </div>
              </Card>

              {/* CSE Department */}
              <Card className="overflow-hidden">
                <div className="bg-yellow-500 px-4 py-3 flex items-center justify-between">
                  <h4 className="text-white font-semibold">CSE Department</h4>
                  <Badge className="bg-yellow-600 text-white">
                    Pending
                  </Badge>
                </div>
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Project Submission</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Lab Equipment</span>
                      <span className="text-yellow-600">⏳</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100">
                    <Clock className="w-4 h-4 mr-1" />
                    In Review
                  </Button>
                </div>
              </Card>

              {/* Sports Department */}
              <Card className="overflow-hidden">
                <div className="bg-green-500 px-4 py-3 flex items-center justify-between">
                  <h4 className="text-white font-semibold">Sports Department</h4>
                  <Badge className="bg-green-600 text-white">
                    Cleared
                  </Badge>
                </div>
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Equipment Return</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100">
                    <Download className="w-4 h-4 mr-1" />
                    Receipt
                  </Button>
                </div>
              </Card>

              {/* Parking */}
              <Card className="overflow-hidden">
                <div className="bg-red-500 px-4 py-3 flex items-center justify-between">
                  <h4 className="text-white font-semibold">Parking</h4>
                  <Badge className="bg-red-600 text-white">
                    Issue
                  </Badge>
                </div>
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Vehicle Registration</span>
                      <span className="text-red-600">✗</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-red-50 text-red-600 hover:bg-red-100">
                    Action Required
                  </Button>
                </div>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}