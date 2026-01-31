import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, GraduationCap, Shield, Users } from "lucide-react";
import type { RegisterData } from "@shared/schema";
import gsap from "gsap";

export default function Register() {
  const { register: registerUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "faculty" | "admin">("student");
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "student",
    },
  });

  useEffect(() => {
    // GSAP animation
    if (cardRef.current) {
      gsap.from(cardRef.current, {
        scale: 0.95,
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power3.out",
      });
    }
  }, []);

  useEffect(() => {
    setValue("role", selectedRole);
  }, [selectedRole, setValue]);

  const onSubmit = async (data: RegisterData) => {
    await registerUser(data);
  };

  const roles = [
    { id: "student" as const, label: "Student", icon: GraduationCap, color: "from-blue-500 to-cyan-500" },
    { id: "faculty" as const, label: "Faculty", icon: Users, color: "from-purple-500 to-pink-500" },
    { id: "admin" as const, label: "Admin", icon: Shield, color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -right-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute w-96 h-96 top-1/2 -left-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute w-96 h-96 -bottom-48 right-1/3 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Left Side - Form */}
      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <Card 
          ref={cardRef}
          className="w-full max-w-2xl backdrop-blur-2xl bg-white/10 border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-8">
            {/* Logo and Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-white/70">Join CDGI Portal</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-3 mb-6 p-1 bg-white/5 rounded-xl">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`relative py-4 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedRole === role.id ? "text-white shadow-lg scale-105" : "text-white/60 hover:text-white/80"
                  }`}
                >
                  {selectedRole === role.id && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${role.color} rounded-lg -z-10`} />
                  )}
                  <role.icon className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm">{role.label}</div>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-white">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name..."
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-white">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name..."
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@student.cdgi.edu.in"
                  className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Student-specific fields */}
              {selectedRole === "student" && (
                <>
                  <div>
                    <Label htmlFor="enrollmentNo" className="text-sm font-medium text-white">
                      Enrollment Number
                    </Label>
                    <Input
                      id="enrollmentNo"
                      type="text"
                      placeholder="Enter your enrollment number..."
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      {...register("enrollmentNo")}
                    />
                    {errors.enrollmentNo && (
                      <p className="mt-1 text-sm text-red-400">{errors.enrollmentNo.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="program" className="text-sm font-medium text-white">
                      Program
                    </Label>
                    <Input
                      id="program"
                      type="text"
                      placeholder="e.g., B.Tech Computer Science"
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      {...register("program")}
                    />
                    {errors.program && (
                      <p className="mt-1 text-sm text-red-400">{errors.program.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="batch" className="text-sm font-medium text-white">
                      Batch
                    </Label>
                    <Input
                      id="batch"
                      type="text"
                      placeholder="e.g., 2020-2024"
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      {...register("batch")}
                    />
                    {errors.batch && (
                      <p className="mt-1 text-sm text-red-400">{errors.batch.message}</p>
                    )}
                  </div>
                </>
              )}

              {/* Faculty-specific fields */}
              {selectedRole === "faculty" && (
                <>
                  <div>
                    <Label htmlFor="departmentId" className="text-sm font-medium text-white">
                      Department ID
                    </Label>
                    <Input
                      id="departmentId"
                      type="text"
                      placeholder="Enter department ID..."
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      {...register("departmentId")}
                    />
                    {errors.departmentId && (
                      <p className="mt-1 text-sm text-red-400">{errors.departmentId.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="designation" className="text-sm font-medium text-white">
                      Designation
                    </Label>
                    <Input
                      id="designation"
                      type="text"
                      placeholder="e.g., Assistant Professor"
                      className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      {...register("designation")}
                    />
                    {errors.designation && (
                      <p className="mt-1 text-sm text-red-400">{errors.designation.message}</p>
                    )}
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-white">
                  Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    className="pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                  Confirm Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    className="pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r ${
                  selectedRole === "student" ? "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600" :
                  selectedRole === "faculty" ? "from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" :
                  "from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                }`}
              >
                {isLoading ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : null}
                Sign up as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-white/70">
              Already have an account?{" "}
              <Link href="/login" className="text-white hover:text-white/90 font-medium underline">
                Log in
              </Link>
            </p>
          </div>
        </Card>
      </div>

      {/* Right Side Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 relative overflow-hidden">
        <div className="absolute top-8 right-8">
          <Button className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm hover:bg-white/30">
            Contact Us
          </Button>
        </div>

        <div className="flex items-center justify-center w-full relative">
          <div className="relative animate-float">
            <div className="absolute -top-12 -left-8 bg-pink-400 rounded-full p-3 shadow-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="absolute -top-8 left-8 bg-primary-300 rounded-full p-3 shadow-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              </div>
            </div>

            <div className="w-64 h-64 bg-gradient-to-br from-red-400 to-red-500 rounded-full relative shadow-2xl">
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-20 bg-gradient-to-b from-green-400 to-green-500 rounded-t-full relative">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-yellow-600 rounded-full">
                    <div className="absolute -top-2 left-0 w-full h-6 bg-blue-900 rounded-full"></div>
                  </div>
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-gray-700 rounded shadow-md">
                    <div className="w-full h-3 bg-gray-800 rounded-t"></div>
                  </div>
                </div>
                <div className="flex justify-center space-x-2 mt-2">
                  <div className="w-3 h-12 bg-blue-400 rounded-full"></div>
                  <div className="w-3 h-12 bg-blue-400 rounded-full"></div>
                </div>
              </div>

              <div className="absolute -right-8 top-24 w-12 h-16 bg-yellow-600 rounded-lg">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-red-500 rounded"></div>
              </div>

              <div className="absolute -left-12 top-32 w-8 h-24 bg-purple-300 rounded-lg">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-green-600 rounded">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-green-800"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
