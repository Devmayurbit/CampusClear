import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

export default function Navbar() {
  const { isAuthenticated, logout, student } = useAuth();
  const [location, setLocation] = useLocation();

  // Hide navbar on public pages
  if (["/login", "/register", "/"].includes(location)) {
    return null;
  }

  if (!isAuthenticated) return null;

  const navBtn = (path: string) =>
    clsx(
      "relative px-4 py-2 rounded-md font-medium transition-all duration-300",
      "hover:text-primary-600 hover:bg-primary-50",
      "after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-primary-500 after:transition-all after:duration-300 hover:after:w-full",
      location === path &&
        "text-primary-700 bg-primary-100 shadow-md after:w-full"
    );

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">

          {/* LEFT BRAND */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
            <div className="h-10 w-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
              CDGI
            </div>
            <div>
              <h1 className="text-lg font-bold">No-Dues System</h1>
              <p className="text-xs text-gray-500">Chameli Devi Group</p>
            </div>
          </div>

          {/* CENTER NAV */}
          <div className="flex gap-3">
            <button onClick={() => setLocation("/")} className={navBtn("/")}>
              🏠 Home
            </button>

            <button onClick={() => setLocation("/dashboard")} className={navBtn("/dashboard")}>
              📊 Dashboard
            </button>

            <button onClick={() => setLocation("/profile")} className={navBtn("/profile")}>
              👤 Profile
            </button>
          </div>

          {/* RIGHT PROFILE */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {student?.profilePhoto ? (
                <img
                  src={student.profilePhoto}
                  className="w-9 h-9 rounded-full border border-primary-300"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary-200 flex items-center justify-center font-bold">
                  {student?.fullName?.[0]}
                </div>
              )}
              <span className="text-sm font-semibold text-gray-700">
                {student?.fullName}
              </span>
            </div>

            <Button
              onClick={logout}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:brightness-110 transition"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
