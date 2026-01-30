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
import type { Student } from "@shared/schema";

export default function Profile() {
  const { student, isAuthenticated } = useAuth();
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

  // Keep form synced when student changes
  useEffect(() => {
    if (student) {
      reset({
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
        address: student.address,
        cgpa: student.cgpa,
        credits: student.credits,
        semester: student.semester,
        expectedGraduation: student.expectedGraduation,
        emergencyContactName: student.emergencyContactName,
        emergencyContactRelation: student.emergencyContactRelation,
        emergencyContactPhone: student.emergencyContactPhone,
        emergencyContactEmail: student.emergencyContactEmail,
      });

      setPreviewImage(student.profilePhoto || null);
    }
  }, [student, reset]);

  // ===========================
  // MUTATIONS (UNCHANGED)
  // ===========================
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
  const onSubmit = async (data: Partial<Student>) => {
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* ================= HEADER CARD ================= */}
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-8 py-8">
            <h1 className="text-3xl font-bold text-white tracking-wide">
              🎓 Student Profile
            </h1>
            <p className="text-white/80 mt-1">
              Manage your personal information and profile photo
            </p>
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
                {student?.fullName}
              </h3>
              <p className="text-gray-500">{student?.program}</p>
              <p className="text-sm text-gray-400">
                Enrollment: {student?.enrollmentNo}
              </p>

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
                    <Label>Full Name</Label>
                    <Input className="mt-1" {...register("fullName")} />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Enrollment Number</Label>
                    <Input
                      value={student?.enrollmentNo}
                      readOnly
                      className="mt-1 bg-gray-100"
                    />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input className="mt-1" {...register("email")} />
                  </div>

                  <div>
                    <Label>Phone</Label>
                    <Input className="mt-1" {...register("phone")} />
                  </div>

                  <div>
                    <Label>Program</Label>
                    <Input
                      value={student?.program}
                      readOnly
                      className="mt-1 bg-gray-100"
                    />
                  </div>

                  <div>
                    <Label>Batch</Label>
                    <Input
                      value={student?.batch}
                      readOnly
                      className="mt-1 bg-gray-100"
                    />
                  </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Academic Info */}
          <Card className="p-6 shadow-md hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-4">📘 Academic Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>CGPA</span>
                <span className="font-medium">{student?.cgpa || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Credits</span>
                <span className="font-medium">{student?.credits || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Semester</span>
                <span className="font-medium">{student?.semester || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Graduation</span>
                <span className="font-medium">
                  {student?.expectedGraduation || "N/A"}
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
                  {student?.emergencyContactName || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Relation</span>
                <span className="font-medium">
                  {student?.emergencyContactRelation || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Phone</span>
                <span className="font-medium">
                  {student?.emergencyContactPhone || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Email</span>
                <span className="font-medium">
                  {student?.emergencyContactEmail || "N/A"}
                </span>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
