import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/auth";
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
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  DollarSign,
} from "lucide-react";
import gsap from "gsap";
import type { NoDuesRequest } from "@/types";

const API_BASE_URL = (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Fetch real No-Dues data
  const { data: noDuesData, isLoading } = useQuery<NoDuesRequest | null>({
    queryKey: ["nodues-me"],
    queryFn: async () => {
      return (await authApi.nodues.getMe()) as NoDuesRequest | null;
    },
    enabled: !!user && user.role === "STUDENT",
  });

  // Calculate real progress from clearance data
  const clearances = noDuesData
    ? [
        { key: "library", label: "Library", status: noDuesData.libraryClearance?.status || "PENDING" },
        { key: "lab", label: "Lab", status: noDuesData.labClearance?.status || "PENDING" },
        { key: "tp", label: "Training & Placement", status: noDuesData.tpClearance?.status || "PENDING" },
        { key: "sports", label: "Sports", status: noDuesData.sportsClearance?.status || "PENDING" },
        { key: "accounts", label: "Accounts", status: noDuesData.accountClearance?.status || "PENDING" },
        { key: "hostel", label: "Hostel", status: noDuesData.hostelClearance?.status || "PENDING" },
        { key: "department", label: "Department/HOD", status: noDuesData.departmentClearance?.status || "PENDING" },
      ]
    : [];

  const approvedCount = clearances.filter((c) => c.status === "APPROVED").length;
  const rejectedCount = clearances.filter((c) => c.status === "REJECTED").length;
  const totalClearances = clearances.length || 7;
  const progressPercent = noDuesData ? Math.round((approvedCount / totalClearances) * 100) : 0;
  const overallStatus = noDuesData?.overallStatus || "NONE";
  const feeStatus = noDuesData?.feeStatus || "UNPAID";

  const getStatusIcon = (status: string) => {
    if (status === "APPROVED") return CheckCircle2;
    if (status === "REJECTED") return XCircle;
    return Clock;
  };

  const getStatusColor = (status: string) => {
    if (status === "APPROVED") return "text-green-500";
    if (status === "REJECTED") return "text-red-500";
    return "text-yellow-500";
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === "APPROVED") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (status === "REJECTED") return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  };

  const statCards = [
    {
      title: noDuesData ? overallStatus : "No Request",
      value: noDuesData ? "No-Dues Status" : "Submit Request",
      icon: FileText,
      color: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: noDuesData ? `${approvedCount} / ${totalClearances}` : "0 / 7",
      value: "Departments Cleared",
      icon: CheckCircle2,
      color: "bg-green-500/10 border-green-500/20",
    },
    {
      title: `${noDuesData ? totalClearances - approvedCount - rejectedCount : 0}`,
      value: "Pending Actions",
      icon: Clock,
      color: "bg-yellow-500/10 border-yellow-500/20",
    },
    {
      title: `${rejectedCount}`,
      value: "Rejected",
      icon: XCircle,
      color: "bg-red-500/10 border-red-500/20",
    },
    {
      title: noDuesData ? feeStatus : "N/A",
      value: "Fee Status",
      icon: DollarSign,
      color: feeStatus === "PAID" ? "bg-green-500/10 border-green-500/20" : "bg-orange-500/10 border-orange-500/20",
    },
  ];

  const handleDownloadCertificate = async () => {
    if (!noDuesData || overallStatus !== "APPROVED") return;
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/api/v1/certificate/my-certificates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const certs = json.data || json || [];
      if (certs.length > 0) {
        const certId = certs[0].certificateId;
        const downloadRes = await fetch(`${API_BASE_URL}/api/v1/certificate/${certId}/download`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (downloadRes.ok) {
          const blob = await downloadRes.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${certId}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
    } catch {
      // Certificate may not be generated yet
    }
  };

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
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="fade-in-up mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.fullName || "Student"}</h2>
          <p className="text-slate-400">
            {user?.enrollmentNo || ""} {user?.department ? `• ${user.department}` : ""}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
            {/* Student Nav Card */}
            <Card className="fade-in-up bg-slate-800/50 border-slate-700/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold mb-4">Student Panel</h3>
              <nav className="space-y-3">
                {[
                  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", active: true },
                  { icon: FileText, label: "No-Dues Form", path: "/nodues", active: false },
                  { icon: Bell, label: "Notice Form", path: "/notice-form", active: false },
                  { icon: Settings, label: "CDGI Sahayak", path: "/cdgi-sahayak", active: false },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setLocation(item.path)}
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
                  <p className="text-white font-medium">{user?.fullName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Enrollment No.</p>
                  <p className="text-white font-medium">{user?.enrollmentNo || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Department</p>
                  <p className="text-white font-medium">{user?.department || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Email</p>
                  <p className="text-white font-medium text-xs">{user?.email || "N/A"}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* No-Dues Progress */}
            <Card className="fade-in-up bg-slate-800/50 border-slate-700/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold mb-6">No-Dues Approval Progress</h3>

              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
                  <p className="text-slate-400 mt-2 text-sm">Loading...</p>
                </div>
              ) : !noDuesData ? (
                <div className="text-center py-6">
                  <p className="text-slate-400 mb-4">You haven't submitted a No-Dues request yet.</p>
                  <Button
                    onClick={() => setLocation("/nodues")}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  >
                    Submit No-Dues Request
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-slate-400">Overall Progress</p>
                      <p className="text-sm font-bold text-yellow-400">{progressPercent}%</p>
                    </div>
                    <Progress value={progressPercent} className="h-2 bg-slate-700" />
                  </div>

                  {/* Clearance Items */}
                  <div className="space-y-3">
                    {clearances.map((c) => {
                      const Icon = getStatusIcon(c.status);
                      return (
                        <div
                          key={c.key}
                          className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600/50"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${getStatusColor(c.status)}`} />
                            <span className="font-medium">{c.label}</span>
                          </div>
                          <Badge className={getStatusBadgeClass(c.status)}>{c.status}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="fade-in-up bg-slate-800/50 border-slate-700/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setLocation("/nodues")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 h-auto rounded-lg transition-all hover:scale-105"
                >
                  {noDuesData ? "View No-Dues Status" : "Create No-Dues Request"}
                </Button>
                <Button
                  onClick={() => setLocation("/nodues")}
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-700/50"
                >
                  View History
                </Button>
                {overallStatus === "APPROVED" && (
                  <Button
                    onClick={handleDownloadCertificate}
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700/50 col-span-2"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Certificate
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
