"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";

type ResultSheet = {
  id: string;
  courseCode: string;
  courseTitle: string;
  studentCount: number;
  submittedAt: string | null;
  status: "DRAFT" | "AWAITING" | "PUBLISHED";
};

const MOCK_DATA: ResultSheet[] = [
  { id: "1", courseCode: "CSC201", courseTitle: "Data Structures", studentCount: 45, submittedAt: "2026-07-01 10:00", status: "PUBLISHED" },
  { id: "2", courseCode: "MTH202", courseTitle: "Linear Algebra", studentCount: 32, submittedAt: "2026-07-02 14:30", status: "AWAITING" },
  { id: "3", courseCode: "PHY201", courseTitle: "Mechanics", studentCount: 28, submittedAt: null, status: "DRAFT" },
];

export default function SubmittedResultsView() {
  const [results] = useState<ResultSheet[]>(MOCK_DATA);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PUBLISHED": return { label: "Published", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 };
      case "AWAITING": return { label: "Awaiting Approval", color: "bg-amber-100 text-amber-700", icon: Clock };
      default: return { label: "Draft", color: "bg-zinc-100 text-zinc-600", icon: AlertCircle };
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Result Submissions</h2>
        <p className="text-zinc-500">Track the approval status of your course result batches.</p>
      </div>

      <Card className="overflow-hidden border-zinc-200">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((r) => {
              const { label, color, icon: Icon } = getStatusConfig(r.status);
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-semibold">{r.courseCode}</div>
                    <div className="text-xs text-zinc-500">{r.courseTitle}</div>
                  </TableCell>
                  <TableCell>{r.studentCount} Students</TableCell>
                  <TableCell className="text-zinc-600">
                    {r.submittedAt || <span className="italic text-zinc-400">Not submitted</span>}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${color} flex w-fit items-center gap-1.5 px-3 py-1`}>
                      <Icon size={14} /> {label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}