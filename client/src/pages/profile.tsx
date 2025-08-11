import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Student } from "@shared/schema";

export default function Profile() {
  const { student, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<Partial<Student>>({
    defaultValues: {
      fullName: student?.fullName || "",
      email: student?.email || "",
      phone: student?.phone || "",
      address: student?.address || "",
      cgpa: student?.cgpa || "",
      credits: student?.credits || "",
      semester: student?.semester || "",
      expectedGraduation: student?.expectedGraduation || "",
      emergencyContactName: student?.emergencyContactName || "",
      emergencyContactRelation: student?.emergencyContactRelation || "",
      emergencyContactPhone: student?.emergencyContactPhone || "",
      emergencyContactEmail: student?.emergencyContactEmail || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/profile"], data.student);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: authApi.uploadPhoto,
    onSuccess: (data) => {
      const updatedStudent = { ...student, profilePhoto: data.photoPath };
      queryClient.setQueryData(["/api/profile"], updatedStudent);
      toast({
        title: "Photo uploaded",
        description: "Your profile photo has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: Partial<Student>) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const handlePhotoUpload = async (file: File) => {
    await uploadPhotoMutation.mutateAsync(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Student Profile</h1>
          <p className="text-primary-100">Manage your personal information</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Photo Section */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  {student?.profilePhoto ? (
                    <img
                      src={student.profilePhoto}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-primary-200 object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-primary-200 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <i className="fas fa-user text-4xl text-primary-600"></i>
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition">
                    <i className="fas fa-camera text-sm"></i>
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{student?.fullName}</h3>
                <p className="text-gray-600">{student?.program}</p>
                <p className="text-sm text-gray-500">Enrollment: {student?.enrollmentNo}</p>
              </div>

              {/* Photo Upload Area */}
              <div className="mt-6">
                <FileUpload
                  onFileSelect={handlePhotoUpload}
                  accept="image/*"
                  maxSize={2 * 1024 * 1024} // 2MB
                  isUploading={uploadPhotoMutation.isPending}
                />
              </div>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      className="mt-2"
                      {...register("fullName")}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Enrollment Number
                    </Label>
                    <Input
                      value={student?.enrollmentNo}
                      readOnly
                      className="mt-2 bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      className="mt-2"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      className="mt-2"
                      {...register("phone")}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Program
                    </Label>
                    <Input
                      value={student?.program}
                      readOnly
                      className="mt-2 bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Batch
                    </Label>
                    <Input
                      value={student?.batch}
                      readOnly
                      className="mt-2 bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    rows={3}
                    placeholder="Enter your current address"
                    className="mt-2"
                    {...register("address")}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!isDirty}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending || !isDirty}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    {updateProfileMutation.isPending ? (
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                    ) : null}
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Card>

      {/* Additional Information */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">CGPA</span>
              <span className="font-medium">{student?.cgpa || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Credits Completed</span>
              <span className="font-medium">{student?.credits || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Semester</span>
              <span className="font-medium">{student?.semester || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expected Graduation</span>
              <span className="font-medium">{student?.expectedGraduation || "N/A"}</span>
            </div>
          </div>
        </Card>

        {/* Emergency Contact Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name</span>
              <span className="font-medium">{student?.emergencyContactName || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Relation</span>
              <span className="font-medium">{student?.emergencyContactRelation || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium">{student?.emergencyContactPhone || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{student?.emergencyContactEmail || "N/A"}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
