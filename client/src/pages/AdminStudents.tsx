import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import gsap from "gsap";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users } from "lucide-react";

interface StudentItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentNo?: string;
  program?: string;
  batch?: string;
  role: string;
  isVerified: boolean;
}

export default function AdminStudents() {
  const { isAuthenticated } = useAuth();
  const isAdmin = useIsAdmin();
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [facultyFirstName, setFacultyFirstName] = useState("");
  const [facultyLastName, setFacultyLastName] = useState("");
  const [facultyEmail, setFacultyEmail] = useState("");
  const [facultyPassword, setFacultyPassword] = useState("");
  const [facultyConfirmPassword, setFacultyConfirmPassword] = useState("");
  const [facultyDepartmentId, setFacultyDepartmentId] = useState("");
  const [facultyDesignation, setFacultyDesignation] = useState("");
  const [facultyId, setFacultyId] = useState("");

  if (!isAuthenticated || !isAdmin) {
    setLocation("/login");
    return null;
  }

  const { data, isLoading } = useQuery<{ data: StudentItem[] }>({
    queryKey: ["/api/v1/admin/students"],
    queryFn: () => apiRequest("GET", "/api/v1/admin/students"),
  });

  const createFacultyMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/v1/auth/register", {
        firstName: facultyFirstName,
        lastName: facultyLastName,
        email: facultyEmail,
        password: facultyPassword,
        confirmPassword: facultyConfirmPassword,
        role: "faculty",
        departmentId: facultyDepartmentId || undefined,
        designation: facultyDesignation || undefined,
        facultyId: facultyId || undefined,
      }),
    onSuccess: () => {
      toast({
        title: "Faculty created",
        description: "Faculty account created. Please verify email.",
      });
      setFacultyFirstName("");
      setFacultyLastName("");
      setFacultyEmail("");
      setFacultyPassword("");
      setFacultyConfirmPassword("");
      setFacultyDepartmentId("");
      setFacultyDesignation("");
      setFacultyId("");
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/students"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Create faculty failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".fade-up", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const items = data?.data || [];

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 fade-up">
          <h1 className="text-3xl font-bold text-gray-900">Student Directory</h1>
          <p className="text-gray-600 mt-1">Manage student profiles and accounts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 fade-up">
            <h3 className="font-semibold text-gray-900 mb-4">Create Faculty</h3>
            <div className="space-y-3">
              <Input placeholder="First name" value={facultyFirstName} onChange={(e) => setFacultyFirstName(e.target.value)} />
              <Input placeholder="Last name" value={facultyLastName} onChange={(e) => setFacultyLastName(e.target.value)} />
              <Input placeholder="Email" type="email" value={facultyEmail} onChange={(e) => setFacultyEmail(e.target.value)} />
              <Input placeholder="Password" type="password" value={facultyPassword} onChange={(e) => setFacultyPassword(e.target.value)} />
              <Input placeholder="Confirm password" type="password" value={facultyConfirmPassword} onChange={(e) => setFacultyConfirmPassword(e.target.value)} />
              <Input placeholder="Department ID (optional)" value={facultyDepartmentId} onChange={(e) => setFacultyDepartmentId(e.target.value)} />
              <Input placeholder="Designation (optional)" value={facultyDesignation} onChange={(e) => setFacultyDesignation(e.target.value)} />
              <Input placeholder="Faculty ID (optional)" value={facultyId} onChange={(e) => setFacultyId(e.target.value)} />
              <Button
                className="w-full"
                onClick={() => createFacultyMutation.mutate()}
                disabled={!facultyFirstName || !facultyLastName || !facultyEmail || !facultyPassword || !facultyConfirmPassword || createFacultyMutation.isPending}
              >
                {createFacultyMutation.isPending ? "Creating..." : "Create Faculty"}
              </Button>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2 fade-up">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Users className="w-10 h-10 mx-auto mb-3 text-indigo-400" />
              No students found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((s) => (
                <div key={s._id} className="p-4 rounded-xl border bg-white/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{s.firstName} {s.lastName}</p>
                      <p className="text-sm text-gray-600">{s.email}</p>
                    </div>
                    <Badge variant={s.isVerified ? "default" : "secondary"}>
                      {s.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {s.enrollmentNo || "N/A"} • {s.program || ""} {s.batch ? `• ${s.batch}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
          </Card>
        </div>
      </div>
    </div>
  );
}
