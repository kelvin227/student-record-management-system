"use client";
import { Login } from "@/lib/function/authactions";
import * as z from "zod";
import { useRouter } from "next/navigation";
import React, {useState } from "react";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

const DevLoginForm = () => {
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

      const res = await Login(email, password, "ADMIN");

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
    router.push("/admin");
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
<div className="flex min-h-screen w-full">
      {/* LEFT: Immersive Branding Panel */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 bg-gradient-to-br from-indigo-950 via-black to-black overflow-hidden">
        {/* Subtle decorative grid/glow */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            System Operational
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white leading-tight">
            Student Records <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">Command Center</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Secure, audited, and high-performance administration for academic management.
          </p>
        </div>
      </div>

      {/* RIGHT: High-Precision Login Form */}
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-full max-w-[400px] space-y-10 bg-gray-700/20 p-8 rounded-lg">
          <div>
            <h2 className="text-2xl font-semibold light:text-slate-900">Administrative Login</h2>
            <p className="light:text-slate-500 mt-2">Enter your institutional credentials to continue</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider light:text-slate-400">Institutional ID</Label>
              <Input onChange={(e) => setEmail(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="admin@university.edu.ng" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold uppercase tracking-wider light:text-slate-400">Security Key</Label>
                <Button className="text-xs text-indigo-600 hover:underline">Forgot?</Button>
              </div>
              <Input onChange={(e) => setPassword(e.target.value)} type="password" className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="••••••••" />
            </div>

            <Button size="lg" onClick={handleSubmit} disabled={isLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-lg shadow-lg shadow-slate-200 hover:shadow-md hover:shadow-gray-700 transition-transform active:scale-[0.98]">
              {isLoading ? "Initizalizing Session" :"Initialize Session"}
            </Button>
          </div>

          <p className="text-center text-xs text-slate-400">
            Protected by enterprise-grade encryption. Unauthorized access is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevLoginForm;