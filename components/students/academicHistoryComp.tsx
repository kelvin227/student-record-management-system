"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, TrendingUp, CalendarDays } from "lucide-react";

type GPARecord = {
  session: { name: string };
  semester: { name: string };
  gpa: number;
  cgpa: number;
};

export default function AcademicHistoryView({ records }: { records: GPARecord[] }) {
  // Grouping records by session
  const groupedRecords = records.reduce((acc: any, record) => {
    const session = record.session.name;
    if (!acc[session]) acc[session] = [];
    acc[session].push(record);
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academic History</h1>
        <p className="text-muted-foreground mt-1">A comprehensive view of your semester performances.</p>
      </div>

      <div className="space-y-8">
        {Object.keys(groupedRecords).sort().reverse().map((sessionName) => (
          <div key={sessionName} className="space-y-4">
            <h2 className="flex items-center gap-2 font-bold text-xl text-sky-700">
              <CalendarDays size={20} /> {sessionName}
            </h2>
            
            <div className="grid gap-4">
              {groupedRecords[sessionName].map((record: GPARecord, i: number) => (
                <Card key={i} className="border-l-4 border-l-sky-500">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-24 font-semibold text-muted-foreground">
                        {record.semester.name}
                      </div>
                      <div className="flex gap-8">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">GPA</p>
                          <p className="text-xl font-bold">{record.gpa.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">CGPA</p>
                          <p className="text-xl font-bold">{record.cgpa.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                      <TrendingUp size={12} /> Progressing
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}