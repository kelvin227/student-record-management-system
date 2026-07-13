"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap, ClipboardList, UserCog, History, FileText } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Student } from "../admin/studentComp";
import { Session } from "../admin/sessionComp";
import { Semester } from "../admin/semestersComp";

export default function StudentDashboard() {
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState<Student | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [registeredCourseCount, setRegisteredCourseCount] = useState(0);
    const [totalCreditUnit, setTotalCreditUnit] = useState(0);
    const [semester, setSemester] = useState<Semester | null>(null);
    const [gpa, setGpa] = useState(0);
    const [cgpa, setcgpa] = useState(0);

      useEffect(() =>{
      fetchData();
      }, []);
    
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await fetch("/api/student/dashboard");
          if (!response.ok) toast.error("Failed to fetch scores");
    
          const data = await response.json();
    
          setStudent(data.student);
          setSession(data.Asession);
          setRegisteredCourseCount(data.registeredCourseCount);
          setTotalCreditUnit(data.totalCreditUnit);
          setSemester(data.Asemester);
          setGpa(data.gpa);
          setcgpa(data.cgpa);
    
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setLoading(false);
        }
      };
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {student?.firstName} 👋</h1>
        <p className="text-muted-foreground mt-1">Here is your academic overview for the current session.</p>
      </div>

      {/* Quick Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Session", value: session?.name },
          { label: "Semester", value: semester?.name },
          { label: "Level", value: student?.level },
          { label: "Department", value: student?.department?.name },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase font-bold">{item.label}</p>
              <p className="text-lg font-semibold mt-1">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* KPI Section */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Registered Courses", value: registeredCourseCount, icon: BookOpen },
          { label: "Total Units", value: totalCreditUnit, icon: GraduationCap },
          { label: "Current GPA", value: gpa ?? "no gpa record", icon: FileText },
          { label: "CGPA", value: cgpa ?? "no cgpa record", icon: ClipboardList },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-sky-100 bg-sky-50/50 dark:bg-sky-950/10">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                <kpi.icon className="text-sky-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-24 flex-col gap-2">
            <BookOpen size={24} /> Register Courses
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2">
            <FileText size={24} /> View Results
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2">
            <History size={24} /> Academic History
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2">
            <UserCog size={24} /> Update Profile
          </Button>
        </div>
      </div>
    </div>
  );
}