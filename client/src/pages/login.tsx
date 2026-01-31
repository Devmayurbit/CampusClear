import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, GraduationCap, Shield, Users } from "lucide-react";
import type { LoginData } from "@shared/schema";
import gsap from "gsap";

export default function Login() {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "faculty" | "admin">("student");
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // GSAP animations on mount
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
    }, "-=0.3")
    .from(formRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.5,
    }, "-=0.2");
  }, []);

  const onSubmit = async (data: LoginData) => {
    await login(data);
  };

  const roles = [
    { 
      id: "student" as const, 
      label: "Student", 
      icon: GraduationCap,
      color: "from-blue-500 to-cyan-500",
      description: "Access your clearance portal"
    },
    { 
      id: "faculty" as const, 
      label: "Faculty", 
      icon: Users,
      color: "from-purple-500 to-pink-500",
      description: "Review student applications"
    },
    { 
      id: "admin" as const, 
      label: "Admin", 
      icon: Shield,
      color: "from-orange-500 to-red-500",
      description: "Manage system operations"
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute w-96 h-96 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <Card 
          ref={cardRef}
          className="w-full max-w-md backdrop-blur-2xl bg-white/10 border-white/20 shadow-2xl"
        >
          <div className="p-8">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50 transform hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h1 ref={titleRef} className="text-3xl font-bold text-white mb-2">
                CDGI Portal
              </h1>
              <p className="text-white/70">Sign in to continue</p>
            </div>

            {/* Role Selection Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-white/5 rounded-xl backdrop-blur-sm">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`relative py-3 px-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedRole === role.id
                      ? "text-white shadow-lg"
                      : "text-white/60 hover:text-white/80"
                  }`}
                >
                  {selectedRole === role.id && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${role.color} rounded-lg -z-10`} />
                  )}
                  <role.icon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs">{role.label}</div>
                </button>
              ))}
            </div>

            {/* Role Description */}
            <div className="mb-6 p-3 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
              <p className="text-white/80 text-sm text-center">
                {roles.find(r => r.id === selectedRole)?.description}
              </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-white/90 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@cdgi.edu.in"
                  className="mt-2 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-purple-400 backdrop-blur-sm"
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
                    placeholder="Enter your password"
                    className="h-12 pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-purple-400 backdrop-blur-sm"
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

              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full h-12 bg-gradient-to-r ${
                  roles.find(r => r.id === selectedRole)?.color
                } text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing In...
                  </div>
                ) : (
                  `Sign In as ${roles.find(r => r.id === selectedRole)?.label}`
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/70 text-sm">
                Don't have an account?{" "}
                <Link href="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                  Create Account
                </Link>
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-white/50 text-center">
                Need help? Contact{" "}
                <a href="mailto:admissions@cdgi.edu.in" className="text-purple-400 hover:text-purple-300">
                  admissions@cdgi.edu.in
                </a>
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
