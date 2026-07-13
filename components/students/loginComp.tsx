"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Login } from "@/lib/function/authactions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function StudentLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    matricnumber: "",
    password: "",
  });
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic client-side validation
    if (!formData) {
      toast.error("Please enter both matric number and password.");

      return;
    }

    try {
      const res = await Login(
        formData.matricnumber,
        formData.password,
        "STUDENT",
      );

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      if (res.success) {
        // Simulate a successful login
        setTimeout(() => {
          setFormData({
            matricnumber: "",
            password: "",
          });
        }, 3000); // Hide message after 3 seconds
        router.push("/students");
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to log the user in");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* LEFT: Student Branding Panel */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 bg-gradient-to-br from-sky-950 via-background to-background overflow-hidden border-r border-border">
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium">
            Student Academic Portal
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground leading-tight">
            Track Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
              Academic Journey
            </span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Access your registration records, monitor your GPA progression, and
            stay updated with your semester results.
          </p>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] space-y-10">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Student Login
            </h2>
            <p className="text-muted-foreground mt-2">
              Enter your matriculation details to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Matriculation Number
              </Label>
              <Input value={formData.matricnumber} onChange={(e) => setFormData((prev) => ({...prev, matricnumber: e.target.value}))} className="h-12" placeholder="e.g. CSC/2023/001" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Input value={formData.password} onChange={(e) => setFormData((prev) => ({...prev, password: e.target.value}))} type="password" placeholder="••••••••" className="h-12" />
            </div>

            <Button type="submit" className="w-full h-12 bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-lg transition-transform active:scale-[0.98]">
              View Dashboard
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Forgot your password? Contact the Departmental IT Officer.
          </p>
        </div>
      </div>
    </div>
  );
}
