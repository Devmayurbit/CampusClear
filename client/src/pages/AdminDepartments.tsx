import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import gsap from "gsap";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { Building2 } from "lucide-react";

interface DepartmentItem {
  _id: string;
  name: string;
  description?: string;
}

export default function AdminDepartments() {
  const { isAuthenticated } = useAuth();
  const isAdmin = useIsAdmin();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!isAuthenticated || !isAdmin) {
    setLocation("/login");
    return null;
  }

  const { data, isLoading } = useQuery<{ data: DepartmentItem[] }>({
    queryKey: ["/api/v1/admin/departments"],
    queryFn: () => apiRequest("GET", "/api/v1/admin/departments"),
  });

  const createMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/v1/admin/departments", { name, description }),
    onSuccess: () => {
      setName("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/departments"] });
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
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage departments and clearance requirements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 fade-up">
            <h3 className="font-semibold text-gray-900 mb-4">Add Department</h3>
            <div className="space-y-3">
              <Input placeholder="Department name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Button className="w-full" onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending}>
                Create
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
                <Building2 className="w-10 h-10 mx-auto mb-3 text-indigo-400" />
                No departments found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((d) => (
                  <div key={d._id} className="p-4 rounded-xl border bg-white/80">
                    <p className="font-semibold text-gray-900">{d.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{d.description || "No description"}</p>
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
