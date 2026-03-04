import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, GraduationCap, BookOpen, Shield, Crown, Info } from "lucide-react";
import gsap from "gsap";
import { useToast } from "@/hooks/use-toast";

type RoleTab = "STUDENT" | "FACULTY" | "ADMIN" | "HOD";

const DEPARTMENTS = ["LIBRARY", "ACCOUNTS", "HOSTEL", "LAB", "TP", "SPORTS", "CSE", "IT", "ECE", "ME", "CE"];

const ROLE_CONFIG: Record<RoleTab, { label: string; gradient: string; description: string; icon: React.ReactNode }> = {
  STUDENT:  { label: "Student",  gradient: "from-blue-500 to-cyan-500",    description: "Register with your enrollment number", icon: <GraduationCap className="w-4 h-4" /> },
  FACULTY:  { label: "Faculty",  gradient: "from-green-500 to-emerald-500", description: "Faculty / Professor registration",       icon: <BookOpen className="w-4 h-4" /> },
  ADMIN:    { label: "Admin",    gradient: "from-orange-500 to-amber-500",  description: "Administrative staff registration",      icon: <Shield className="w-4 h-4" /> },
  HOD:      { label: "HOD",      gradient: "from-purple-500 to-pink-500",  description: "Head of Department registration",        icon: <Crown className="w-4 h-4" /> },
};

export default function Register() {
  const { register: registerUser, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<RoleTab>("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);

  // Student form state
  const [studentData, setStudentData] = useState({ fullName: "", enrollmentNo: "", email: "", password: "", confirmPassword: "" });

  // Staff form state (Faculty / Admin / HOD)
  const [staffData, setStaffData] = useState({
    fullName: "", email: "", department: "", employeeId: "", designation: "", password: "", confirmPassword: "", adminKey: "",
  });

  useEffect(() => {
    gsap.from(cardRef.current, { scale: 0.9, opacity: 0, duration: 0.6, ease: "back.out(1.7)" });
  }, []);

  const cfg = ROLE_CONFIG[activeTab];

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (studentData.password !== studentData.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    if (studentData.password.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" }); return;
    }
    await registerUser({ fullName: studentData.fullName, enrollmentNo: studentData.enrollmentNo, email: studentData.email, password: studentData.password });
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (staffData.password !== staffData.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    if (staffData.password.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" }); return;
    }
    if (!staffData.adminKey) {
      toast({ title: "Admin setup key is required", variant: "destructive" }); return;
    }
    if (activeTab === "FACULTY" && !staffData.department) {
      toast({ title: "Department is required for faculty", variant: "destructive" }); return;
    }
    setStaffLoading(true);
    try {
      const role = activeTab === "HOD" ? "SUPER_ADMIN" : activeTab;
      await authApi.auth.registerStaff({
        fullName: staffData.fullName, email: staffData.email,
        role: role as "FACULTY" | "ADMIN" | "SUPER_ADMIN",
        department: staffData.department || undefined,
        employeeId: staffData.employeeId || undefined,
        designation: staffData.designation || undefined,
        password: staffData.password, adminKey: staffData.adminKey,
      });
      toast({ title: `${cfg.label} account created!`, description: "You can now login with your credentials." });
      setLocation("/login");
    } catch (err: any) {
      const msg = err?.message || err?.error?.message || "Registration failed. Check your admin key.";
      toast({ title: "Registration failed", description: msg, variant: "destructive" });
    } finally {
      setStaffLoading(false);
    }
  };

  const isStaff = activeTab !== "STUDENT";
  const loading = isStaff ? staffLoading : isLoading;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -right-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute w-96 h-96 top-1/2 -left-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute w-96 h-96 -bottom-48 right-1/3 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <Card ref={cardRef} className="w-full max-w-lg backdrop-blur-2xl bg-white/10 border-white/20 shadow-2xl">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${cfg.gradient} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg transform hover:scale-110 transition-transform duration-300`}>
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
              <p className="text-white/60 text-sm">{cfg.description}</p>
            </div>

            {/* Role Tabs */}
            <div className="grid grid-cols-4 gap-1 mb-6 p-1 bg-white/5 rounded-xl border border-white/10">
              {(Object.keys(ROLE_CONFIG) as RoleTab[]).map((tab) => {
                const tc = ROLE_CONFIG[tab];
                const isActive = activeTab === tab;
                return (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      isActive ? `bg-gradient-to-br ${tc.gradient} text-white shadow-md` : "text-white/50 hover:text-white/80 hover:bg-white/10"
                    }`}>
                    {tc.icon}
                    <span>{tc.label}</span>
                  </button>
                );
              })}
            </div>

            {/* STUDENT FORM */}
            {activeTab === "STUDENT" && (
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <Field label="Full Name">
                  <Input type="text" placeholder="John Doe" value={studentData.fullName}
                    onChange={(e) => setStudentData({ ...studentData, fullName: e.target.value })}
                    className="mt-1.5 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400" required />
                </Field>
                <Field label="Enrollment Number">
                  <Input type="text" placeholder="0832CS211001" value={studentData.enrollmentNo}
                    onChange={(e) => setStudentData({ ...studentData, enrollmentNo: e.target.value })}
                    className="mt-1.5 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400" required />
                </Field>
                <Field label="Email Address">
                  <Input type="email" placeholder="you@cdgi.edu.in" value={studentData.email}
                    onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                    className="mt-1.5 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400" required />
                </Field>
                <PasswordField label="Password" show={showPassword} toggle={() => setShowPassword(!showPassword)}
                  value={studentData.password} onChange={(v) => setStudentData({ ...studentData, password: v })} focusColor="blue" />
                <PasswordField label="Confirm Password" show={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  value={studentData.confirmPassword} onChange={(v) => setStudentData({ ...studentData, confirmPassword: v })} focusColor="blue" />
                <SubmitBtn loading={loading} gradient={cfg.gradient} label="Create Student Account" />
              </form>
            )}

            {/* STAFF FORMS */}
            {isStaff && (
              <form onSubmit={handleStaffSubmit} className="space-y-4">
                <div className="flex gap-2 p-3 bg-amber-500/15 border border-amber-400/30 rounded-lg">
                  <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">
                    Staff registration requires an <span className="font-semibold">Admin Setup Key</span>.{" "}
                    <span className="text-amber-400/70">(Demo key: <code>CDGI@2025</code>)</span>
                  </p>
                </div>
                <Field label="Full Name">
                  <Input type="text" placeholder="Dr. Jane Smith" value={staffData.fullName}
                    onChange={(e) => setStaffData({ ...staffData, fullName: e.target.value })}
                    className="mt-1.5 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400" required />
                </Field>
                <Field label="Email Address">
                  <Input type="email" placeholder="staff@cdgi.edu.in" value={staffData.email}
                    onChange={(e) => setStaffData({ ...staffData, email: e.target.value })}
                    className="mt-1.5 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400" required />
                </Field>
                {(activeTab === "FACULTY" || activeTab === "HOD") && (
                  <Field label="Employee ID">
                    <Input type="text" placeholder="EMP001" value={staffData.employeeId}
                      onChange={(e) => setStaffData({ ...staffData, employeeId: e.target.value })}
                      className="mt-1.5 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400" />
                  </Field>
                )}
                {(activeTab === "FACULTY" || activeTab === "HOD") && (
                  <div>
                    <Label className="text-white/90 font-medium">Department {activeTab === "FACULTY" && <span className="text-red-400">*</span>}</Label>
                    <select aria-label="Department" value={staffData.department} onChange={(e) => setStaffData({ ...staffData, department: e.target.value })}
                      className="mt-1.5 h-11 w-full rounded-md px-3 bg-white/10 border border-white/20 text-white focus:border-purple-400 focus:outline-none"
                      required={activeTab === "FACULTY"}>
                      <option value="" className="bg-slate-800">Select Department</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d} className="bg-slate-800">{d}</option>)}
                    </select>
                  </div>
                )}
                {activeTab === "HOD" && (
                  <Field label="Designation">
                    <Input type="text" placeholder="Head of Department" value={staffData.designation}
                      onChange={(e) => setStaffData({ ...staffData, designation: e.target.value })}
                      className="mt-1.5 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400" />
                  </Field>
                )}
                <PasswordField label="Password" show={showPassword} toggle={() => setShowPassword(!showPassword)}
                  value={staffData.password} onChange={(v) => setStaffData({ ...staffData, password: v })} focusColor="purple" />
                <PasswordField label="Confirm Password" show={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  value={staffData.confirmPassword} onChange={(v) => setStaffData({ ...staffData, confirmPassword: v })} focusColor="purple" />
                <Field label={<>Admin Setup Key <span className="text-red-400">*</span></>}>
                  <Input type="password" placeholder="Enter setup key from administrator" value={staffData.adminKey}
                    onChange={(e) => setStaffData({ ...staffData, adminKey: e.target.value })}
                    className="mt-1.5 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400" required />
                </Field>
                <SubmitBtn loading={loading} gradient={cfg.gradient} label={`Create ${cfg.label} Account`} />
              </form>
            )}

            <div className="mt-5 text-center">
              <p className="text-white/60 text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">Sign In</Link>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 25%{transform:translate(20px,-50px) scale(1.1)} 50%{transform:translate(-20px,20px) scale(0.9)} 75%{transform:translate(50px,50px) scale(1.05)} }
        .animate-blob{animation:blob 7s infinite}
        .animation-delay-2000{animation-delay:2s}
        .animation-delay-4000{animation-delay:4s}
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-white/90 font-medium">{label}</Label>
      {children}
    </div>
  );
}

function PasswordField({ label, show, toggle, value, onChange, focusColor }: {
  label: string; show: boolean; toggle: () => void; value: string; onChange: (v: string) => void; focusColor: string;
}) {
  return (
    <Field label={label}>
      <div className="relative mt-1.5">
        <Input type={show ? "text" : "password"} placeholder="••••••••" value={value} onChange={(e) => onChange(e.target.value)}
          className={`h-11 pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-${focusColor}-400`} required />
        <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </Field>
  );
}

function SubmitBtn({ loading, gradient, label }: { loading: boolean; gradient: string; label: string }) {
  return (
    <Button type="submit" disabled={loading}
      className={`w-full h-11 bg-gradient-to-r ${gradient} text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all`}>
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Creating Account...
        </div>
      ) : label}
    </Button>
  );
}

