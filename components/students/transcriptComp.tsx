"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export default function TranscriptView({ student, records = [], scores = [] }: { student: any, records?: any[], scores?: any[] }) {
  const transcriptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: transcriptRef, documentTitle: "Academic Transcript" });

  // 1. Safe data processing
  const publishedScores = scores.filter((s) => s.status === "PUBLISHED");
  const finalCGPA = records.length > 0 ? records[records.length - 1].cgpa : 0;
  const totalCredits = publishedScores.reduce((acc, s) => acc + (s.course?.creditUnit || 0), 0);

  // 2. Group by Session -> Semester
  const groupedData = publishedScores.reduce((acc: any, score) => {
    const session = score.session?.name || "Unknown Session";
    const semester = score.semester?.name || "Unknown Semester";
    if (!acc[session]) acc[session] = {};
    if (!acc[session][semester]) acc[session][semester] = [];
    acc[session][semester].push(score);
    return acc;
  }, {});

  const getClassification = (cgpa: number) => {
    if (cgpa >= 4.5) return "First Class";
    if (cgpa >= 3.5) return "Second Class Upper";
    if (cgpa >= 2.5) return "Second Class Lower";
    return "Third Class";
  };

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto min-h-screen">
      <div ref={transcriptRef} className="p-8 md:p-12 shadow-sm border rounded-sm print:shadow-none">
        
        <div className="text-center border-b pb-8 mb-8">
          <h1 className="text-3xl font-serif font-bold uppercase tracking-widest">Academic Transcript</h1>
        </div>

        {/* Student Info */}
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-10">
          {[
            { label: "Full Name", value: `${student?.firstName || ''} ${student?.lastName || ''}` },
            { label: "Matric Number", value: student?.matricNo || "N/A" },
            { label: "Department", value: student?.department?.name || "N/A" },
            { label: "Program", value: student?.program?.name || "N/A" },
          ].map((item) => (
            <div key={item.label} className="border-b border-dashed pb-2">
              <span className="text-xs font-bold text-muted-foreground block uppercase">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Academic Records */}
        <div className="space-y-8">
          {Object.keys(groupedData).length > 0 ? (
            Object.entries(groupedData).map(([session, semesters]: [string, any]) => (
              <section key={session}>
                <h3 className="text-xl font-bold font-serif mb-4 text-sky-800">{session}</h3>
                {Object.entries(semesters).map(([semester, semesterScores]: [string, any]) => (
                  <div key={semester} className="mb-6">
                    <h4 className="font-bold border-l-4 border-sky-500 pl-3 mb-3">{semester}</h4>
                    <table className="w-full text-sm">
                      <thead className="text-muted-foreground uppercase text-xs text-left">
                        <tr>
                          <th className="py-2">Course Code</th>
                          <th className="py-2">Course Title</th>
                          <th className="py-2 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {semesterScores.map((s: any) => (
                          <tr key={s.id}>
                            <td className="py-3 font-semibold">{s.course?.code || "N/A"}</td>
                            <td className="py-3 text-muted-foreground">{s.course?.title || "N/A"}</td>
                            <td className="py-3 text-center font-bold">{s.grade || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </section>
            ))
          ) : (
            <p className="text-center py-10 text-muted-foreground italic">No academic records found.</p>
          )}
        </div>

        {/* Footer Summary */}
        <div className="mt-12 p-6 bg-slate-900 text-white rounded-md grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs uppercase text-slate-400">Overall CGPA</p>
            <p className="text-2xl font-black">{finalCGPA.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Total Credits</p>
            <p className="text-2xl font-black">{totalCredits}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Classification</p>
            <p className="text-xl font-bold text-sky-400">{getClassification(finalCGPA)}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center print:hidden">
        <Button size="lg" className="bg-sky-700" onClick={handlePrint}>
          <Printer className="mr-2" size={18} /> Download Transcript (PDF)
        </Button>
      </div>
    </div>
  );
}