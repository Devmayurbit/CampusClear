import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, GraduationCap, AlertCircle } from "lucide-react";
import gsap from "gsap";

const facultyRegisterSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  employeeId: z.string().min(1, "Employee ID required"),
  email: z.string().email("Valid email required"),
  department: z.string().min(1, "Department required"),
  designation: z.string().min(1, "Designation required"),
  inviteCode: z.string().min(1, "Invite code required"),
  password: z.string().min(8, "Password must be 8+ characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FacultyRegisterData = z.infer<typeof facultyRegisterSchema>;

export default function FacultyRegister() {
  const { register: registerUser } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FacultyRegisterData>({
    resolver: zodResolver(facultyRegisterSchema),
  });

  useEffect(() => {
    const tl = gsap.timeline();
    tl.from(cardRef.current, {
      scale: 0.9,
      opacity: 0,
      duration: 0.6,
      ease: "back.out(1.7)",
    });
  }, []);

  const onSubmit = async (data: FacultyRegisterData) => {
    setIsLoading(true);
    try {
      await authApi.auth.registerStaff({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: "FACULTY",
        department: data.department.trim().toUpperCase(),
        employeeId: data.employeeId,
        designation: data.designation,
        adminKey: data.inviteCode,
      });
      alert("Registration successful! You can now login.");
      setLocation("/login");
    } catch (error: any) {
      alert(error.message || "Registration failed. Please check your invite code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <Card
          ref={cardRef}
          className="w-full max-w-md backdrop-blur-2xl bg-white/10 border-white/20 shadow-2xl"
        >
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">CDGI No-Dues</h1>
              <p className="text-white/70">Faculty Registration</p>
            </div>

            {/* Alert */}
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-6 flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <p className="text-sm text-yellow-200">
                Faculty accounts must be approved by the HOD. You need a valid invite code to register.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name & Employee ID */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fullName" className="text-white/90 font-medium text-xs mb-1 block">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Dr. Priya Verma"
                    className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="employeeId" className="text-white/90 font-medium text-xs mb-1 block">
                    Employee ID
                  </Label>
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="FAC-2024-001"
                    className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    {...register("employeeId")}
                  />
                  {errors.employeeId && (
                    <p className="text-red-400 text-xs mt-1">{errors.employeeId.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-white/90 font-medium text-xs mb-1 block">
                  Official Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@cdgi.edu.in"
                  className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Department & Designation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="department" className="text-white/90 font-medium text-xs mb-1 block">
                    Department
                  </Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="Computer Science"
                    className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    {...register("department")}
                  />
                  {errors.department && (
                    <p className="text-red-400 text-xs mt-1">{errors.department.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="designation" className="text-white/90 font-medium text-xs mb-1 block">
                    Designation
                  </Label>
                  <Input
                    id="designation"
                    type="text"
                    placeholder="Asst. Professor"
                    className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    {...register("designation")}
                  />
                  {errors.designation && (
                    <p className="text-red-400 text-xs mt-1">{errors.designation.message}</p>
                  )}
                </div>
              </div>

              {/* Invite Code */}
              <div>
                <Label htmlFor="inviteCode" className="text-white/90 font-medium text-xs mb-1 block">
                  Invite Code (from HOD)
                </Label>
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="CDGI-FAC-XXXX"
                  className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  {...register("inviteCode")}
                />
                {errors.inviteCode && (
                  <p className="text-red-400 text-xs mt-1">{errors.inviteCode.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-white/90 font-medium text-xs mb-1 block">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword" className="text-white/90 font-medium text-xs mb-1 block">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl"
              >
                {isLoading ? "Registering..." : "Register as Faculty"}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center text-white/70 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                Login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
