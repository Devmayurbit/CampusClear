import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/auth";
import SuperAdminShell from "@/components/SuperAdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type UserItem = {
  _id: string;
  fullName: string;
  email: string;
  role: "STUDENT" | "FACULTY" | "ADMIN" | "SUPER_ADMIN";
  department?: string | null;
  isActive: boolean;
  verified?: boolean;
  createdAt?: string;
};

export default function SuperAdminUsers() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"FACULTY" | "ADMIN" | "SUPER_ADMIN">("FACULTY");
  const [department, setDepartment] = useState("");

  if (!user || user.role !== "SUPER_ADMIN") {
    setLocation("/login");
    return null;
  }

  const { data, isLoading } = useQuery<any>({
    queryKey: ["/api/v1/admin/users"],
    queryFn: () => authApi.admin.getUsers(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      authApi.admin.createUser({
        fullName,
        email,
        password,
        role,
        department: role === "FACULTY" || role === "SUPER_ADMIN" ? department || undefined : undefined,
      }),
    onSuccess: () => {
      toast({ title: "User created", description: "User created successfully" });
      setFullName("");
      setEmail("");
      setPassword("");
      setDepartment("");
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/users"] });
    },
    onError: (error: any) => {
      toast({ title: "Create failed", description: error.message || "Unable to create user", variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ role, userId, isActive }: { role: string; userId: string; isActive: boolean }) =>
      authApi.admin.toggleUserStatus(role, userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/users"] });
    },
  });

  const users: UserItem[] = data?.data || [];

  const filtered = useMemo(() => {
    return users.filter((item) => {
      const matchesRole = roleFilter === "ALL" || item.role === roleFilter;
      const text = `${item.fullName} ${item.email} ${item.department || ""}`.toLowerCase();
      const matchesSearch = !search || text.includes(search.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, search]);

  return (
    <SuperAdminShell
      title="Super Admin (HOD) Manage Users"
      subtitle="Create and control faculty, admin, and super admin accounts dynamically"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold mb-4">Create User</h3>
          <div className="space-y-3">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="bg-slate-700/50 border-slate-600" />
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="bg-slate-700/50 border-slate-600" />
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="bg-slate-700/50 border-slate-600" />
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FACULTY">FACULTY</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
              </SelectContent>
            </Select>
            {(role === "FACULTY" || role === "SUPER_ADMIN") && (
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department (e.g. CSE)" className="bg-slate-700/50 border-slate-600" />
            )}
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!fullName || !email || !password || createMutation.isPending}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {createMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 p-6 lg:col-span-2">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users" className="bg-slate-700/50 border-slate-600" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 md:w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ALL ROLES</SelectItem>
                <SelectItem value="STUDENT">STUDENT</SelectItem>
                <SelectItem value="FACULTY">FACULTY</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-slate-400">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="text-slate-400">No users found.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div key={item._id} className="rounded-lg border border-slate-600/60 bg-slate-700/30 p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.fullName}</p>
                      <p className="text-sm text-slate-300">{item.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-blue-500/20 text-blue-300">{item.role}</Badge>
                        {item.department && <Badge className="bg-slate-600/80 text-slate-100">{item.department}</Badge>}
                        {item.verified !== undefined && (
                          <Badge className={item.verified ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}>
                            {item.verified ? "VERIFIED" : "UNVERIFIED"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={item.isActive ? "outline" : "default"}
                      className={item.isActive ? "border-red-500/50 text-red-300 hover:bg-red-500/20" : "bg-green-600 hover:bg-green-700"}
                      onClick={() => toggleMutation.mutate({ role: item.role, userId: item._id, isActive: !item.isActive })}
                      disabled={toggleMutation.isPending}
                    >
                      {item.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </SuperAdminShell>
  );
}
