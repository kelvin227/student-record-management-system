"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, Users, ShieldCheck, LayoutGrid } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-border">
        <div className="flex items-center gap-2 font-bold text-xl">
          <GraduationCap className="text-primary" />
          <span>EduGrade</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="https://app-codfel.vercel.app/sigin" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
          <Button variant="default" size="sm">Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-semibold border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Academic Integrity First
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Precision Grading, <br />
              <span className="text-primary">Seamless Records</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
              A comprehensive portal designed to streamline student registration, lecturer assessments, and GPA computation for higher institutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="w-full sm:w-auto">
                Explore Portal <ArrowRight className="ml-2" size={18} />
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">Learn More</Button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Users, title: "Lecturer Panel", desc: "Streamlined score entry" },
              { icon: ShieldCheck, title: "Secure Data", desc: "Audit-ready records" },
              { icon: LayoutGrid, title: "GPA Engine", desc: "Automated calculations" },
              { icon: GraduationCap, title: "Admin Tools", desc: "Full system control" }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all">
                <item.icon className="text-primary mb-3" size={24} />
                <p className="font-bold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}