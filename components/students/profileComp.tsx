"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, BookOpen, GraduationCap, CalendarDays } from "lucide-react";

// Assuming 'student' is the object passed as a prop
export default function StudentProfileView({ student }: { student: any }) {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
          <AvatarImage src={student.passportUrl} />
          <AvatarFallback className="bg-sky-100 text-sky-700 text-4xl font-bold">
            {student.firstName[0]}{student.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight">{student.firstName} {student.lastName}</h1>
          <p className="text-muted-foreground font-medium">{student.matricNo}</p>
          <Badge variant="secondary" className="mt-2 bg-sky-100 text-sky-700 hover:bg-sky-200">
            {student.level} Level
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Card>
          <CardHeader><CardTitle className="text-sm font-bold uppercase text-muted-foreground">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InfoItem icon={Mail} label="Email Address" value={student.user.email} />
            <InfoItem icon={Phone} label="Phone Number" value={student.phone || "Not provided"} />
          </CardContent>
        </Card>

        {/* Academic Details */}
        <Card>
          <CardHeader><CardTitle className="text-sm font-bold uppercase text-muted-foreground">Academic Profile</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <InfoItem icon={BookOpen} label="Department" value={student.department.name} />
            <InfoItem icon={GraduationCap} label="Program" value={student.program.name} />
            <InfoItem icon={CalendarDays} label="Admission Year" value={student.admissionYear} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper component for clean list items
function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2 bg-sky-50 rounded-lg text-sky-600">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}