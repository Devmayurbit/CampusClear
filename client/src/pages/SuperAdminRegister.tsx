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
import { Eye, EyeOff, Crown, AlertCircle } from "lucide-react";
import gsap from "gsap";

const superAdminRegisterSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  employeeId: z.string().min(1, "Employee ID required"),
  email: z.string().email("Valid email required"),
  department: z.string().min(1, "Department required"),
  designation: z.string().min(1, "Designation required"),
  masterKey: z.string().min(1, "System Master Key required"),
  password: z.string().min(8, "Password must be 8+ characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SuperAdminRegisterData = z.infer<typeof superAdminRegisterSchema>;

export default function SuperAdminRegister() {
  const { register: registerUser } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showMasterKey, setShowMasterKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SuperAdminRegisterData>({
    resolver: zodResolver(superAdminRegisterSchema),
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

  const onSubmit = async (data: SuperAdminRegisterData) => {
    setIsLoading(true);
    try {
      await authApi.auth.registerStaff({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: "SUPER_ADMIN",
        department: data.department.trim().toUpperCase(),
        employeeId: data.employeeId,
        designation: data.designation,
        adminKey: data.masterKey,
      });
      alert("Registration successful! You can now login.");
      setLocation("/login");
    } catch (error: any) {
      alert(error.message || "Registration failed. Please check your master key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <Card
          ref={cardRef}
          className="w-full max-w-md backdrop-blur-2xl bg-white/10 border-white/20 shadow-2xl"
        >
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">CDGI No-Dues</h1>
              <p className="text-white/70">Super Admin (HOD/Director) Registration</p>
            </div>

            {/* Alert */}
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-200">
                Super Admin accounts have complete system access. Only authorized HOD/Director personnel with System Master Key can register.
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
                    placeholder="Dr. Amit Singh"
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
                    placeholder="HOD-2024-001"
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
                  placeholder="hod@cdgi.edu.in"
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
                    placeholder="HOD / Director"
                    className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    {...register("designation")}
                  />
                  {errors.designation && (
                    <p className="text-red-400 text-xs mt-1">{errors.designation.message}</p>
                  )}
                </div>
              </div>

              {/* Master Key */}
              <div>
                <Label htmlFor="masterKey" className="text-white/90 font-medium text-xs mb-1 block">
                  System Master Key
                </Label>
                <div className="relative">
                  <Input
                    id="masterKey"
                    type={showMasterKey ? "text" : "password"}
                    placeholder="••••••••••••••••"
                    className="h-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    {...register("masterKey")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowMasterKey(!showMasterKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showMasterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.masterKey && (
                  <p className="text-red-400 text-xs mt-1">{errors.masterKey.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-white/90 font-medium text-xs mb-1 block">
                  Login Password
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
                className="w-full h-10 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-lg hover:shadow-xl"
              >
                {isLoading ? "Registering..." : "Register as Super Admin"}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center text-white/70 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold">
                Login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
