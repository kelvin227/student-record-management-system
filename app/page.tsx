"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, Users, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-2 font-bold text-xl">
          <GraduationCap className="text-emerald-600" />
          <span>EduGrade System</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-emerald-600 transition-colors">Login</Link>
          <Button variant="outline" size="sm">Request Access</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-10 pt-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Academic Integrity First
            </div>
            <h1 className="text-6xl font-extrabold tracking-tight text-zinc-900 leading-tight">
              Precision Grading, <br />
              <span className="text-emerald-600">Seamless Records</span>
            </h1>
            <p className="text-xl text-zinc-500 leading-relaxed max-w-lg">
              A comprehensive portal designed to streamline student registration, lecturer assessments, and GPA computation for higher institutions.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-zinc-900 hover:bg-zinc-800">
                Explore Portal <ArrowRight className="ml-2" size={18} />
              </Button>
              <Button size="lg" variant="ghost">Learn More</Button>
            </div>
          </div>

          {/* Decorative Visual/Illustration */}
          <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100 shadow-inner">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-2">
                <Users className="text-emerald-500" />
                <p className="font-bold">Lecturer Panel</p>
                <p className="text-xs text-zinc-400">Streamlined score entry.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-2">
                <ShieldCheck className="text-emerald-500" />
                <p className="font-bold">Secure Data</p>
                <p className="text-xs text-zinc-400">Audit-ready records.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}