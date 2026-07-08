"use client";
import { Login } from "@/lib/function/authactions";
import * as z from "zod";
import { useRouter } from "next/navigation";
import React, {useState } from "react";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

const LecturerLoginComp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);



  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setShowSuccessMessage(false);

    // Basic client-side validation
    if (!email || !password) {
      setError("Please enter both email and password.");

      return;
    }

        try {

      const res = await Login(email, password, "LECTURER");

      if (!res.success) {
        setShowSuccessMessage(false);
        setError(res.message);
      }

      if (res.success) {
              // Simulate a successful login
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      setEmail("");
      setPassword("");
    }, 3000); // Hide message after 3 seconds
    router.push("/lecturer");
    } else {
        setError(res.message);
      }
      } catch (err: any) {
      setError(err.message || "Failed to log the user in");
    } finally {
          setIsLoading(false);
    }

    
  };


return (
    <div className="flex min-h-screen w-full bg-[#050505]">
      {/* LEFT: Faculty Branding Panel */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 bg-gradient-to-br from-emerald-950 via-black to-black overflow-hidden">
        {/* Subtle decorative grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Faculty Portal
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white leading-tight">
            Lecturer Assessment <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Gateway</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Manage course allocations, input student grades, and monitor class performance with precision.
          </p>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] space-y-10">
          <div>
            <h2 className="text-2xl font-semibold">Lecturer Access</h2>
            <p className="text-slate-500 mt-2">Sign in using your official staff credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Staff Email</label>
              <Input
              type="email" 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="name@university.edu.ng" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
              </div>
              <Input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="••••••••" />
            </div>

            <Button
            type="submit"
            disabled={isLoading}
             className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3.5 rounded-lg shadow-lg shadow-emerald-200 hover:shadow-md transition-transform active:scale-[0.98]">
              Enter Gradebook
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400">
            For support regarding grade submission, contact the academic registry.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LecturerLoginComp;