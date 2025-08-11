import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";

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
  const { student, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const { data: clearances, isLoading } = useQuery<ClearanceWithDepartment[]>({
    queryKey: ["/api/clearances"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const clearedCount = clearances?.filter(c => c.status === "cleared").length || 0;
  const pendingCount = clearances?.filter(c => c.status === "pending").length || 0;
  const rejectedCount = clearances?.filter(c => c.status === "rejected").length || 0;
  const totalCount = clearances?.length || 0;
  const progressPercentage = totalCount > 0 ? Math.round((clearedCount / totalCount) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "cleared":
        return "from-green-500 to-green-600";
      case "pending":
        return "from-yellow-500 to-yellow-600";
      case "rejected":
        return "from-red-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "cleared":
        return "fa-check";
      case "pending":
        return "fa-clock";
      case "rejected":
        return "fa-times";
      default:
        return "fa-question";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl text-white p-8 mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {student?.fullName?.split(' ')[0]}!
            </h1>
            <p className="text-primary-100">Track your no-dues clearance progress</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center glass-morphism">
              <div className="text-2xl font-bold">{progressPercentage}%</div>
              <div className="text-sm text-primary-100">Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 card-hover animate-slide-up">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <i className="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cleared</p>
              <p className="text-2xl font-bold text-gray-900">{clearedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 card-hover animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <i className="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Issues</p>
              <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 card-hover animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <i className="fas fa-percentage text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Progress</p>
              <p className="text-2xl font-bold text-gray-900">{progressPercentage}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Department Clearances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {clearances?.map((clearance, index) => (
          <Card 
            key={clearance.id} 
            className="overflow-hidden card-hover animate-slide-up" 
            style={{ animationDelay: `${0.4 + index * 0.1}s` }}
          >
            <div 
              className={`bg-gradient-to-r ${getStatusColor(clearance.status)} px-6 py-4`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">{clearance.department.name}</h3>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                  <i className={`fas ${getStatusIcon(clearance.status)} mr-1`}></i>
                  {clearance.status.charAt(0).toUpperCase() + clearance.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-4">
                {clearance.requirements.map((requirement, reqIndex) => (
                  <div key={reqIndex} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{requirement}</span>
                    {clearance.completedRequirements.includes(requirement) ? (
                      <i className="fas fa-check text-green-500"></i>
                    ) : (
                      <i className="fas fa-times text-red-500"></i>
                    )}
                  </div>
                ))}
              </div>
              
              {clearance.clearedAt && (
                <div className="text-xs text-gray-500 mb-4">
                  Cleared on: {new Date(clearance.clearedAt).toLocaleDateString()}
                </div>
              )}
              
              {clearance.remarks && (
                <div className="text-xs text-gray-600 mb-4 p-2 bg-gray-50 rounded">
                  <strong>Remarks:</strong> {clearance.remarks}
                </div>
              )}

              <Button
                className={`w-full ${
                  clearance.status === "cleared"
                    ? "bg-green-50 text-green-600 hover:bg-green-100"
                    : clearance.status === "pending"
                    ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                    : "bg-red-50 text-red-600 hover:bg-red-100"
                } py-2 rounded-lg text-sm font-medium`}
                variant="outline"
              >
                {clearance.status === "cleared" ? (
                  <>
                    <i className="fas fa-download mr-2"></i> Download Certificate
                  </>
                ) : clearance.status === "pending" ? (
                  <>
                    <i className="fas fa-clock mr-2"></i> In Progress
                  </>
                ) : (
                  <>
                    <i className="fas fa-exclamation-triangle mr-2"></i> Action Required
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6 animate-slide-up" style={{ animationDelay: '1s' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {clearances
            ?.filter(c => c.status === "cleared")
            .slice(-3)
            .map((clearance) => (
              <div key={clearance.id} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-check text-green-600"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {clearance.department.name} cleared your request
                  </p>
                  <p className="text-xs text-gray-500">
                    {clearance.clearedAt
                      ? new Date(clearance.clearedAt).toLocaleDateString()
                      : "Recently"}
                  </p>
                </div>
              </div>
            ))}
          
          {(!clearances || clearances.filter(c => c.status === "cleared").length === 0) && (
            <div className="text-center text-gray-500 py-4">
              <i className="fas fa-history text-2xl mb-2"></i>
              <p>No recent activity to show</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
