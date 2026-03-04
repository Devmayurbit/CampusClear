import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import SuperAdminShell from "@/components/SuperAdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type DepartmentItem = { _id: string; name: string; description?: string };

export default function SuperAdminDepartments() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!user || user.role !== "SUPER_ADMIN") {
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
      toast({ title: "Department created", description: "New department added" });
      setName("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/departments"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed", description: error.message || "Unable to create department", variant: "destructive" });
    },
  });

  const departments = data?.data || [];

  return (
    <SuperAdminShell
      title="Super Admin (HOD) Departments"
      subtitle="Manage all clearance departments used by faculty and admins"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold mb-4">Add Department</h3>
          <div className="space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Department name" className="bg-slate-700/50 border-slate-600" />
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="bg-slate-700/50 border-slate-600" />
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!name || createMutation.isPending}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 p-6 lg:col-span-2">
          {isLoading ? (
            <div className="text-slate-400">Loading departments...</div>
          ) : departments.length === 0 ? (
            <div className="text-slate-400">No departments found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map((d) => (
                <div key={d._id} className="rounded-lg border border-slate-600/60 bg-slate-700/30 p-4">
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-sm text-slate-300 mt-1">{d.description || "No description"}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </SuperAdminShell>
  );
}
