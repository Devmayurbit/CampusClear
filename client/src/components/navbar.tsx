import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import clsx from "clsx";
import { LogOut, Home, LayoutDashboard, User, LogIn } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, logout, student } = useAuth();
  const [location, setLocation] = useLocation();

  // Hide navbar only on auth pages
  if (["/login", "/register"].includes(location)) return null;

  const navItem = (path: string, active: boolean) =>
    clsx(
      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
      active
        ? "bg-primary-600 text-white shadow-md scale-[1.02]"
        : "text-gray-700 hover:bg-primary-50 hover:text-primary-700"
    );

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-5">
        <div className="h-16 flex items-center justify-between">

          {/* Brand */}
          <div
            onClick={() => setLocation("/")}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold shadow">
              CDGI
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="font-bold text-gray-900">No-Dues Portal</p>
              <p className="text-xs text-gray-500">Chameli Devi Group</p>
            </div>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setLocation("/")}
              className={navItem("/", location === "/")}
            >
              <Home size={16} /> Home
            </button>

            {isAuthenticated && (
              <>
                <button
                  onClick={() => setLocation("/dashboard")}
                  className={navItem("/dashboard", location === "/dashboard")}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </button>

                <button
                  onClick={() => setLocation("/profile")}
                  className={navItem("/profile", location === "/profile")}
                >
                  <User size={16} /> Profile
                </button>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => setLocation("/login")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-gray-50 transition"
                >
                  <LogIn size={16} />
                  Login
                </button>

                <button
                  onClick={() => setLocation("/register")}
                  className="px-5 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition shadow"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  {student?.profilePhoto ? (
                    <img
                      src={student.profilePhoto}
                      className="h-9 w-9 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary-200 flex items-center justify-center font-semibold">
                      {student?.fullName?.[0] || "U"}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {student?.fullName}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600 transition shadow"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
