import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type { RegisterData } from "@shared/schema";

export default function Register() {
  const { register: registerUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    await registerUser(data);
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center mb-8">
            <div className="h-12 w-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
              CDGI
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-gray-900">No Dues</h1>
              <p className="text-sm text-gray-600">Student Portal</p>
            </div>
          </div>

          <Card className="p-8 animate-fade-in">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h2>
              <p className="text-gray-600">Let's get started!</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="enrollmentNo" className="text-sm font-medium text-gray-700">
                  Enrollment No.
                </Label>
                <Input
                  id="enrollmentNo"
                  type="text"
                  placeholder="Enter Enrollment No..."
                  className="mt-2"
                  {...register("enrollmentNo")}
                />
                {errors.enrollmentNo && (
                  <p className="mt-1 text-sm text-red-600">{errors.enrollmentNo.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name..."
                  className="mt-2"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@student.cdgi.edu.in"
                  className="mt-2"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="program" className="text-sm font-medium text-gray-700">
                  Program
                </Label>
                <Input
                  id="program"
                  type="text"
                  placeholder="e.g., B.Tech Computer Science"
                  className="mt-2"
                  {...register("program")}
                />
                {errors.program && (
                  <p className="mt-1 text-sm text-red-600">{errors.program.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="batch" className="text-sm font-medium text-gray-700">
                  Batch
                </Label>
                <Input
                  id="batch"
                  type="text"
                  placeholder="e.g., 2020-2024"
                  className="mt-2"
                  {...register("batch")}
                />
                {errors.batch && (
                  <p className="mt-1 text-sm text-red-600">{errors.batch.message}</p>
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
                    placeholder="••••••••••"
                    className="pr-12"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    className="pr-12"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 rounded-xl font-medium"
              >
                {isLoading ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : null}
                Sign up
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Log in
              </Link>
            </p>
          </Card>
        </div>
      </div>

      {/* Right Side Illustration - Same as login */}
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
