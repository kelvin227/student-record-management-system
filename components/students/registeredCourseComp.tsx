"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Clock, XCircle } from "lucide-react";
import { RegistrationStatus } from "@prisma/client";
import { CourseRegistration } from "../admin/courseRegistrationComp";


export default function RegisteredCoursesView({ registrations }: { registrations: CourseRegistration[] }) {
  
  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case "APPROVED":
        return { label: "Approved", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 };
      case "PENDING":
        return { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock };
      case "REJECTED":
        return { label: "Rejected", color: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle };
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Registered Courses</h2>
        <p className="text-muted-foreground mt-1">Review the approval status of your current semester registration.</p>
      </div>

      <div className="grid gap-4">
        {registrations.length > 0 ? (
          registrations.map((reg) => {
            const { label, color, icon: Icon } = getStatusBadge(reg.status);
            return (
              <Card key={reg.id} className="hover:border-sky-200 transition-colors">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-sky-50 rounded-lg text-sky-600">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{reg.course?.code}</h3>
                      <p className="text-sm text-muted-foreground">{reg.course?.title}</p>
                      <p className="text-xs font-medium text-sky-600 mt-0.5">{reg.course?.creditUnit} Units</p>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className={`${color} px-3 py-1 flex items-center gap-1.5`}>
                    <Icon size={14} />
                    {label}
                  </Badge>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground">
            No course registrations found for this session.
          </div>
        )}
      </div>
    </div>
  );
}