import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function NoDues() {
  const { student } = useAuth();
  const { toast } = useToast();

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch("/api/nodues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      toast({
        title: "Submitted",
        description: "Verification email sent successfully",
      });

      reset();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-center">
          No-Dues Application Form
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-4">
          <Input defaultValue={student?.fullName} {...register("fullName")} placeholder="Full Name" />
          <Input defaultValue={student?.enrollmentNo} {...register("enrollmentNo")} placeholder="Enrollment" />
          <Input defaultValue={student?.email} {...register("email")} placeholder="Email" />
          <Input {...register("phone")} placeholder="Phone" />
          <Input {...register("program")} placeholder="Program" />
          <Input {...register("department")} placeholder="Department" />
          <Input {...register("batch")} placeholder="Batch" />
          <Input {...register("semester")} placeholder="Semester" />

          <textarea
            {...register("reason")}
            placeholder="Reason for No-Dues"
            className="col-span-full border rounded p-2"
          />

          <Button type="submit" className="col-span-full">
            Submit Application
          </Button>
        </form>
      </Card>
    </div>
  );
}
