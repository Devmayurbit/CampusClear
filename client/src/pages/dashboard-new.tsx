import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard,
  FileText,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import gsap from "gsap";

export default function StudentDashboard() {
  const { student, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  // Get clearance progress from dummy data
  const clearanceData = {
    library: { status: "Approved", icon: CheckCircle2, color: "text-green-500" },
    accounts: { status: "Approved", icon: CheckCircle2, color: "text-green-500" },
    hostel: { status: "Pending", icon: Clock, color: "text-yellow-500" },
    lab: { status: "Pending", icon: Clock, color: "text-yellow-500" },
  };

  const statCards = [
    {
      title: "In Progress",
      value: "No-Dues Status",
      description: "Clearance in progress",
      icon: FileText,
      color: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "3",
      value: "Notices Submitted",
      icon: CheckCircle2,
      color: "bg-green-500/10 border-green-500/20",
    },
    {
      title: "2 / 5",
      value: "Departments Cleared",
      icon: CheckCircle2,
      color: "bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "2",
      value: "Pending Actions",
      icon: Clock,
      color: "bg-yellow-500/10 border-yellow-500/20",
    },
  ];

  useEffect(() => {
    if (containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".fade-in-up", {
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        });
      }, containerRef);

      return () => ctx.revert();
    }
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CDGI No-Dues</h1>
              <p className="text-xs text-slate-400">Management System</p>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              Dashboard
            </Button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{student?.name || "Student"}</span>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-red-400 hover:text-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="fade-in-up mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {student?.name || "Rahul"}</h2>
          <p className="text-slate-400">
            {student?.enrollmentNo || "0827CS211234"} • {student?.department || "Computer Science"}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, index) => (
            <Card
              key={index}
              className={`fade-in-up ${card.color} border backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{card.title}</p>
                  <p className="text-xl font-bold text-white">{card.value}</p>
                </div>
                <card.icon className="w-5 h-5 text-slate-400" />
              </div>
            </Card>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Student Info Card */}
            <Card className="fade-in-up bg-slate-800/50 border-slate-700/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold mb-4">Student Panel</h3>
              <nav className="space-y-3">
                {[
                  { icon: LayoutDashboard, label: "Dashboard", active: true },
                  { icon: FileText, label: "No-Dues Form", active: false },
                  { icon: Bell, label: "Notice Form", active: false },
                  { icon: Settings, label: "CDGI Sahayak", active: false },
                ].map((item, i) => (
                  <button
                    key={i}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      item.active
                        ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400"
                        : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                    {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </nav>
            </Card>

            {/* Profile Card */}
            <Card className="fade-in-up bg-slate-800/50 border-slate-700/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold mb-4">Profile</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-400 mb-1">Name</p>
                  <p className="text-white font-medium">{student?.name || "Rahul Sharma"}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Enrollment No.</p>
                  <p className="text-white font-medium">{student?.enrollmentNo || "0827CS211234"}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Department</p>
                  <p className="text-white font-medium">{student?.department || "Computer Science"}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Email</p>
                  <p className="text-white font-medium text-xs">{student?.email || "mayur.0832cs211119@cdgi.edu.in"}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* No-Dues Progress */}
            <Card className="fade-in-up bg-slate-800/50 border-slate-700/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold mb-6">No-Dues Approval Progress</h3>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-400">Overall Progress</p>
                  <p className="text-sm font-bold text-yellow-400">40%</p>
                </div>
                <Progress value={40} className="h-2 bg-slate-700" />
              </div>

              {/* Clearance Items */}
              <div className="space-y-3">
                {Object.entries(clearanceData).map(([key, data]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600/50">
                    <div className="flex items-center gap-3">
                      <data.icon className={`w-5 h-5 ${data.color}`} />
                      <span className="capitalize font-medium">{key}</span>
                    </div>
                    <Badge
                      className={
                        data.status === "Approved"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }
                    >
                      {data.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="fade-in-up bg-slate-800/50 border-slate-700/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 h-auto rounded-lg transition-all hover:scale-105">
                  Create No-Dues Request
                </Button>
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700/50">
                  View History
                </Button>
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700/50 col-span-2">
                  Download Certificate
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
