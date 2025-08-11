import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { isAuthenticated, logout, student } = useAuth();
  const [location, setLocation] = useLocation();

  // Don't show navbar on login/register pages
  if (location === "/login" || location === "/register" || location === "/") {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg border-b border-primary-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                CDGI
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">No-Dues System</h1>
                <p className="text-xs text-gray-500">Chameli Devi Group of Institutions</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              className="text-gray-700 hover:text-primary-600"
            >
              <i className="fas fa-home mr-1"></i> Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => setLocation("/profile")}
              className="text-gray-700 hover:text-primary-600"
            >
              <i className="fas fa-user mr-1"></i> Profile
            </Button>
            <div className="flex items-center space-x-2">
              {student?.profilePhoto && (
                <img
                  src={student.profilePhoto}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-primary-200"
                />
              )}
              <span className="text-sm font-medium text-gray-700">{student?.fullName}</span>
            </div>
            <Button
              onClick={logout}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <i className="fas fa-sign-out-alt mr-1"></i> Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
