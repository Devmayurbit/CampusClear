import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import gsap from "gsap";
import type { RegisterRequest } from "@/types";

const registerSchema = z
  .object({
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    enrollmentNo: z.string().min(5, "Invalid enrollment number"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const { register: registerUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    // GSAP animation
    const tl = gsap.timeline();
    
    tl.from(cardRef.current, {
      scale: 0.9,
      opacity: 0,
      duration: 0.6,
      ease: "back.out(1.7)",
    })
    .from(titleRef.current, {
      y: -30,
      opacity: 0,
      duration: 0.5,
    }, "-=0.3");
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    const registrationData: RegisterRequest = {
      fullName: data.fullName,
      enrollmentNo: data.enrollmentNo,
      email: data.email,
      password: data.password,
    };
    await registerUser(registrationData);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -right-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute w-96 h-96 top-1/2 -left-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute w-96 h-96 -bottom-48 right-1/3 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <Card 
          ref={cardRef}
          className="w-full max-w-md backdrop-blur-2xl bg-white/10 border-white/20 shadow-2xl"
        >
          <div className="p-8">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50 transform hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h1 ref={titleRef} className="text-3xl font-bold text-white mb-2">
                Create Account
              </h1>
              <p className="text-white/70">Student Registration</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="fullName" className="text-white/90 font-medium">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="mt-2 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-blue-400 backdrop-blur-sm"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="mt-1.5 text-sm text-red-400">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="enrollmentNo" className="text-white/90 font-medium">
                  Enrollment Number
                </Label>
                <Input
                  id="enrollmentNo"
                  type="text"
                  placeholder="2021001"
                  className="mt-2 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-blue-400 backdrop-blur-sm"
                  {...register("enrollmentNo")}
                />
                {errors.enrollmentNo && (
                  <p className="mt-1.5 text-sm text-red-400">{errors.enrollmentNo.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-white/90 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="mt-2 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-blue-400 backdrop-blur-sm"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-white/90 font-medium">
                  Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-blue-400 backdrop-blur-sm"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-white/90 font-medium">
                  Confirm Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-blue-400 backdrop-blur-sm"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center">
              <p className="text-white/70 text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Sign In
                </Link>
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-white/50 text-center">
                Only students can register. Faculty and Admin accounts are created by the administrator.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
