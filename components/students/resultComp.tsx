"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Session } from "../admin/sessionComp";
import { Semester } from "../admin/semestersComp";

// Example of the expected data structure
type ResultItem = {
  course: { code: string; title: string; creditUnit: number };
  ca: number;
  exam: number;
  total: number;
  grade: string;
  gradePoint: number;
  status: "PUBLISHED" | "SUBMITTED" | "DRAFT";
};

export default function StudentResultView({
  results,
  session,
  semesters,
}: {
  results: ResultItem[];
  session: Session[];
  semesters: Semester[];
}) {
    const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
    const [selectedSession, setSelectedSession]= useState<Session | null>(null);
  // Filter logic: Only allow PUBLISHED results to reach the UI
  const publishedResults = results.filter((r) => r.status === "PUBLISHED");

  // Calculate Semester GPA
  const totalGP = publishedResults.reduce(
    (acc, curr) => acc + curr.gradePoint * curr.course.creditUnit,
    0,
  );
  const totalUnits = publishedResults.reduce(
    (acc, curr) => acc + curr.course.creditUnit,
    0,
  );
  const semesterGPA =
    totalUnits > 0 ? (totalGP / totalUnits).toFixed(2) : "0.00";

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold">Academic Results</h2>
        <div className="flex gap-4">
          <Select value={selectedSession} onValueChange={(value) => setSelectedSession(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Session">{selectedSession ? selectedSession.name : "session"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {session.map((s) => (
                <SelectItem key={s.id} value={s}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSemester} onValueChange={(value) => setSelectedSemester(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue  placeholder="Semester">{selectedSemester ? selectedSemester.name : "Semester"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {semesters.map((s) => (
                <SelectItem key={s.id} value={s}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead className="text-center">CA</TableHead>
              <TableHead className="text-center">Exam</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Grade</TableHead>
              <TableHead className="text-center">Unit</TableHead>
              <TableHead className="text-center">GP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publishedResults.length > 0 ? (
              publishedResults.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="font-semibold">{r.course.code}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.course.title}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{r.ca}</TableCell>
                  <TableCell className="text-center">{r.exam}</TableCell>
                  <TableCell className="text-center font-bold">
                    {r.total}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{r.grade}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {r.course.creditUnit}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {r.gradePoint.toFixed(1)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-muted-foreground"
                >
                  No published results available for this session.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Footer GPA Summary */}
        <div className="p-6 border-t flex justify-end items-center gap-4">
          <span className="font-semibold text-muted-foreground">
            Semester GPA:
          </span>
          <span className="text-2xl font-bold text-sky-700">{semesterGPA}</span>
        </div>
      </Card>
    </div>
  );
}
