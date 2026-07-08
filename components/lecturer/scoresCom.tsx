"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

// Matches your Prisma Score model requirements
type ScoreEntry = {
  id: string; // registrationId
  student: { matricNo: string; firstName: string; lastName: string };
  ca: number;
  exam: number;
  total: number;
  grade: string;
  gradePoint: number;
};

// Logic to match standard Academic Grading
const calculateAcademicResult = (ca: number, exam: number) => {
  const total = ca + exam;
  let grade = "F";
  let gradePoint = 0;

  if (total >= 70) { grade = "A"; gradePoint = 5.0; }
  else if (total >= 60) { grade = "B"; gradePoint = 4.0; }
  else if (total >= 50) { grade = "C"; gradePoint = 3.0; }
  else if (total >= 45) { grade = "D"; gradePoint = 2.0; }
  else if (total >= 40) { grade = "E"; gradePoint = 1.0; }

  return { total, grade, gradePoint };
};

const DUMMY_SCORES: ScoreEntry[] = [
  { id: "reg1", student: { matricNo: "CSC/2023/001", firstName: "Adebayo", lastName: "Tunde" }, ca: 25, exam: 50, total: 75, grade: "A", gradePoint: 5.0 },
  { id: "reg2", student: { matricNo: "CSC/2023/002", firstName: "Chidi", lastName: "Okafor" }, ca: 20, exam: 35, total: 55, grade: "C", gradePoint: 3.0 },
];

export default function ScoreEntryPanel() {
  const [data, setData] = useState<ScoreEntry[]>(DUMMY_SCORES);

  const handleChange = (id: string, field: "ca" | "exam", val: string) => {
    const numVal = Math.max(0, Number(val));
    setData(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      const newCa = field === "ca" ? numVal : item.ca;
      const newExam = field === "exam" ? numVal : item.exam;
      const { total, grade, gradePoint } = calculateAcademicResult(newCa, newExam);
      
      return { ...item, ca: newCa, exam: newExam, total, grade, gradePoint };
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Score Entry</h2>
          <p className="text-zinc-500">Input Continuous Assessment and Exam scores</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Save size={16} className="mr-2" /> Save Drafts
        </Button>
      </div>

      <div className="border rounded-xl shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead>Matric No</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="text-center w-24">CA (40)</TableHead>
              <TableHead className="text-center w-24">Exam (60)</TableHead>
              <TableHead className="text-center font-bold">Total</TableHead>
              <TableHead className="text-center">Grade</TableHead>
              <TableHead className="text-center">GP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.student.matricNo}</TableCell>
                <TableCell className="font-medium">{row.student.lastName} {row.student.firstName}</TableCell>
                <TableCell>
                  <Input type="number" value={row.ca} onChange={(e) => handleChange(row.id, "ca", e.target.value)} className="text-center" />
                </TableCell>
                <TableCell>
                  <Input type="number" value={row.exam} onChange={(e) => handleChange(row.id, "exam", e.target.value)} className="text-center" />
                </TableCell>
                <TableCell className="text-center font-bold">{row.total}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={row.grade === "F" ? "destructive" : "secondary"}>{row.grade}</Badge>
                </TableCell>
                <TableCell className="text-center font-mono">{row.gradePoint.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}