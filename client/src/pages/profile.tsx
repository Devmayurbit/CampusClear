import { useState, useEffect, useRef } from "react";
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
import type { User } from "@shared/schema";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ===========================
  // UI STATES (NEW)
  // ===========================
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // ===========================
  // FORM SETUP (UNCHANGED)
  // ===========================
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<Partial<User>>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      cgpa: user?.cgpa || "",
      credits: user?.credits || "",
      semester: user?.semester || "",
      expectedGraduation: user?.expectedGraduation || "",
      emergencyContactName: user?.emergencyContactName || "",
      emergencyContactRelation: user?.emergencyContactRelation || "",
      emergencyContactPhone: user?.emergencyContactPhone || "",
      emergencyContactEmail: user?.emergencyContactEmail || "",
    },
  });

  // Keep form synced when student changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        cgpa: user.cgpa,
        credits: user.credits,
        semester: user.semester,
        expectedGraduation: user.expectedGraduation,
        emergencyContactName: user.emergencyContactName,
        emergencyContactRelation: user.emergencyContactRelation,
        emergencyContactPhone: user.emergencyContactPhone,
        emergencyContactEmail: user.emergencyContactEmail,
      });

      setPreviewImage(user.profilePhoto || null);
    }
  }, [user, reset]);

  // ===========================
  // MUTATIONS (UNCHANGED)
  // ===========================
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/v1/profile"], data.student || data.user || data);
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
      const updatedUser = { ...user, profilePhoto: data.photoPath };
      queryClient.setQueryData(["/api/v1/profile"], updatedUser);
      toast({
        title: "Photo uploaded",
        description: "Your profile photo has been updated.",
      });
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ===========================
  // HANDLERS
  // ===========================
  const onSubmit = async (data: Partial<User>) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const handlePhotoUpload = async (file: File) => {
    await uploadPhotoMutation.mutateAsync(file);
  };

  // NEW — Preview Image Logic
  const handlePhotoSelect = (file: File) => {
    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const confirmUpload = async () => {
    if (!selectedFile) return;
    await handlePhotoUpload(selectedFile);
  };

  // ===========================
  // UI
  // ===========================
  const roleTitle = user?.role === "admin" ? "Admin Profile" : user?.role === "faculty" ? "Faculty Profile" : "Student Profile";
  const roleSubtitle = user?.role === "admin"
    ? "Manage your admin account and preferences"
    : user?.role === "faculty"
    ? "Manage your faculty account details"
    : "Manage your personal information and profile photo";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* ================= HEADER CARD ================= */}
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-8 py-8">
            <h1 className="text-3xl font-bold text-white tracking-wide">
              🎓 {roleTitle}
            </h1>
            <p className="text-white/80 mt-1">{roleSubtitle}</p>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ================= LEFT PROFILE PANEL ================= */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="relative group">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-44 h-44 rounded-full object-cover border-4 border-indigo-500 shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-44 h-44 rounded-full border-4 border-indigo-300 bg-gradient-to-br from-indigo-100 to-purple-200 flex items-center justify-center shadow-lg">
                    <i className="fas fa-user text-6xl text-indigo-600"></i>
                  </div>
                )}

                {/* Camera Button */}
                <button
                  onClick={openFilePicker}
                  className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg transition transform hover:scale-110"
                >
                  <i className="fas fa-camera"></i>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoSelect(file);
                  }}
                />
              </div>

              <h3 className="text-xl font-semibold text-gray-800">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-gray-500 capitalize">{user?.role}</p>
              {user?.role === "student" && (
                <p className="text-sm text-gray-400">
                  Enrollment: {user?.enrollmentNo}
                </p>
              )}

              {/* Upload Button */}
              {selectedFile && (
                <Button
                  onClick={confirmUpload}
                  disabled={uploadPhotoMutation.isPending}
                  className="mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md hover:opacity-90"
                >
                  {uploadPhotoMutation.isPending ? "Uploading..." : "Upload Photo"}
                </Button>
              )}

              {/* Optional Drag Upload */}
              <div className="w-full mt-6">
                <FileUpload
                  onFileSelect={handlePhotoSelect}
                  accept="image/*"
                  maxSize={2 * 1024 * 1024}
                  isUploading={uploadPhotoMutation.isPending}
                />
              </div>
            </div>

            {/* ================= RIGHT FORM PANEL ================= */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                {/* BASIC INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>First Name</Label>
                    <Input className="mt-1" {...register("firstName")} />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Last Name</Label>
                    <Input className="mt-1" {...register("lastName")} />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input className="mt-1" {...register("email")} />
                  </div>

                  <div>
                    <Label>Phone</Label>
                    <Input className="mt-1" {...register("phone")} />
                  </div>

                  {user?.role === "student" && (
                    <>
                      <div>
                        <Label>Enrollment Number</Label>
                        <Input
                          value={user?.enrollmentNo}
                          readOnly
                          className="mt-1 bg-gray-100"
                        />
                      </div>
                      <div>
                        <Label>Program</Label>
                        <Input
                          value={user?.program}
                          readOnly
                          className="mt-1 bg-gray-100"
                        />
                      </div>
                      <div>
                        <Label>Batch</Label>
                        <Input
                          value={user?.batch}
                          readOnly
                          className="mt-1 bg-gray-100"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* ADDRESS */}
                <div>
                  <Label>Address</Label>
                  <Textarea
                    rows={3}
                    placeholder="Enter your current address"
                    className="mt-1"
                    {...register("address")}
                  />
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex justify-end gap-4">
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
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md hover:opacity-90"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Card>

        {/* ================= EXTRA INFO CARDS ================= */}
        {user?.role === "student" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Academic Info */}
          <Card className="p-6 shadow-md hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-4">📘 Academic Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>CGPA</span>
                <span className="font-medium">{user?.cgpa || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Credits</span>
                <span className="font-medium">{user?.credits || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Semester</span>
                <span className="font-medium">{user?.semester || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Graduation</span>
                <span className="font-medium">
                  {user?.expectedGraduation || "N/A"}
                </span>
              </div>
            </div>
          </Card>

          {/* Emergency Info */}
          <Card className="p-6 shadow-md hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-4">🚨 Emergency Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Name</span>
                <span className="font-medium">
                  {user?.emergencyContactName || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Relation</span>
                <span className="font-medium">
                  {user?.emergencyContactRelation || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Phone</span>
                <span className="font-medium">
                  {user?.emergencyContactPhone || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Email</span>
                <span className="font-medium">
                  {user?.emergencyContactEmail || "N/A"}
                </span>
              </div>
            </div>
          </Card>

          </div>
        )}
      </div>
    </div>
  );
}
