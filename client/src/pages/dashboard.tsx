import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import {
  Home,
  RefreshCw,
  Download,
  Calendar,
  Clock,
  ArrowRightCircle,
} from "lucide-react";
import gsap from "gsap";

interface ClearanceWithDepartment {
  id: string;
  status: "pending" | "cleared" | "rejected";
  requirements: string[];
  completedRequirements: string[];
  remarks?: string;
  department: {
    id: string;
    name: string;
    description: string;
    color: string;
  };
}

export default function Dashboard() {
  const { student, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const containerRef = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const { data: clearances, isLoading, refetch } =
    useQuery<ClearanceWithDepartment[]>({
      queryKey: ["/api/clearances"],
    });

  // ================= GSAP ANIMATIONS =================
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".fade-up", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });

      gsap.from(heroCardRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: "elastic.out(1,0.4)",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const clearedCount =
    clearances?.filter((c) => c.status === "cleared").length || 0;
  const pendingCount =
    clearances?.filter((c) => c.status === "pending").length || 0;
  const rejectedCount =
    clearances?.filter((c) => c.status === "rejected").length || 0;
  const totalCount = clearances?.length || 0;
  const progressPercentage = totalCount
    ? Math.round((clearedCount / totalCount) * 100)
    : 0;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ================= HEADER ================= */}
        <div className="mb-10 fade-up">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome, {student?.fullName}
          </h2>
          <p className="text-gray-600 mt-1">
            Track your department clearances and submit No-Dues request
          </p>
        </div>

        {/* ================= APPLY CARD ================= */}
        <div
          ref={heroCardRef}
          onClick={() => setLocation("/nodues")}
          className="fade-up mb-10 cursor-pointer rounded-2xl border-2 border-dashed border-indigo-400 
                     bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100
                     hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
        >
          <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-indigo-700">
                🎓 Apply for No-Dues Certificate
              </h3>
              <p className="text-gray-700 mt-2 max-w-xl">
                Submit your clearance request digitally and track approval from
                all departments in real-time. Fast, secure and paperless.
              </p>
            </div>

            <Button className="flex items-center gap-2 text-lg px-8 py-6 bg-indigo-600 hover:bg-indigo-700">
              Apply Now
              <ArrowRightCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* ================= GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ================= LEFT PANEL ================= */}
          <div className="space-y-6 fade-up">

            {/* PROFILE CARD */}
            <Card className="p-6 hover:shadow-xl transition">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 shadow-inner">
                  {student?.profilePhoto ? (
                    <img
                      src={student.profilePhoto}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                      {student?.fullName?.charAt(0)}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-lg">{student?.fullName}</h3>
                  <p className="text-sm text-gray-600">{student?.program}</p>
                  <p className="text-sm text-gray-500">
                    Enrollment: {student?.enrollmentNo}
                  </p>
                </div>
              </div>
            </Card>

            {/* PROGRESS CARD */}
            <Card className="p-6 hover:shadow-xl transition">
              <h3 className="font-semibold mb-3">Overall Clearance</h3>

              <div className="flex justify-between text-sm mb-1">
                <span>{clearedCount} / {totalCount} cleared</span>
                <span>{progressPercentage}%</span>
              </div>

              <Progress value={progressPercentage} />

              <div className="grid grid-cols-3 text-center mt-4">
                <div>
                  <p className="text-xl font-bold text-green-600">
                    {clearedCount}
                  </p>
                  <p className="text-xs text-gray-500">Cleared</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-yellow-600">
                    {pendingCount}
                  </p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-red-600">
                    {rejectedCount}
                  </p>
                  <p className="text-xs text-gray-500">Issues</p>
                </div>
              </div>
            </Card>

            {/* INFO CARD */}
            <Card className="p-6 hover:shadow-xl transition">
              <h3 className="font-semibold mb-4">Important Info</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Last Submission: 15 June
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  Processing Time: 3-5 Days
                </div>

                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-green-600" />
                  Certificate available after approval
                </div>
              </div>
            </Card>
          </div>

          {/* ================= RIGHT PANEL ================= */}
          <div className="lg:col-span-2 fade-up">

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Department Clearances</h3>

              <Button
                onClick={() => refetch()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {clearances?.map((item) => {
                const progress =
                  (item.completedRequirements.length /
                    item.requirements.length) *
                  100;

                const statusColor =
                  item.status === "cleared"
                    ? "bg-green-500"
                    : item.status === "rejected"
                    ? "bg-red-500"
                    : "bg-yellow-500";

                return (
                  <Card
                    key={item.id}
                    className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div
                      className="px-4 py-3 flex justify-between items-center text-white"
                      style={{
                        backgroundColor:
                          item.department.color || "#6366f1",
                      }}
                    >
                      <h4 className="font-semibold">
                        {item.department.name}
                      </h4>
                      <Badge className={`${statusColor} text-white capitalize`}>
                        {item.status}
                      </Badge>
                    </div>

                    <div className="p-4 space-y-2">
                      {item.requirements.map((req, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span>{req}</span>
                          {item.completedRequirements.includes(req) ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-gray-400">⏳</span>
                          )}
                        </div>
                      ))}

                      <Progress value={progress} className="h-2 mt-3" />

                      {item.remarks && (
                        <p className="text-xs text-gray-500 mt-2">
                          {item.remarks}
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
