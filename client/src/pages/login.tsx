import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, GraduationCap, Mail, Phone } from "lucide-react";
import type { LoginData } from "@shared/schema";

export default function Login() {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    await login(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="p-8 bg-white/95 backdrop-blur-sm shadow-2xl">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">CDGI No-Dues System</h1>
            <p className="text-gray-600">Student Clearance Portal</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="enrollmentNo" className="text-sm font-medium text-gray-700">
                Enrollment Number
              </Label>
              <Input
                id="enrollmentNo"
                type="text"
                placeholder="Enter your enrollment number"
                className="mt-2 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-purple-500 focus:ring-purple-500"
                {...register("enrollmentNo")}
              />
              {errors.enrollmentNo && (
                <p className="mt-1 text-sm text-red-600">{errors.enrollmentNo.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-12 pr-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-purple-500 focus:ring-purple-500"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium text-lg"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-4">
              Don't have an account?{" "}
              <Link href="/register" className="text-purple-600 hover:text-purple-700 font-medium">
                Create Account
              </Link>
            </p>
            
            {/* Contact Info */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Need help? Contact us:</p>
              <div className="flex justify-center space-x-4 text-xs text-gray-600">
                <div className="flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  admissions@cdgi.edu.in
                </div>
                <div className="flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  +91-XXXX-XXXXXX
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/80 text-sm">
            © 2023 Chameli Devi Group of Institutions. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
