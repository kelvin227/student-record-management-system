"use client";
import React from "react";

interface CourseRecord {
  code: String;
  title: string;
  creditUnit: number;
  ca?: number;
  exam?: number;
  total?: number;
  grade?: string;
  gradePoint?: number;
}

interface StudentInfo {
  firstname: string;
  lastname: string;
  matricNo: string;
  department?: string;
  program?: string;
  level?: string;
}

interface Props {
  student: StudentInfo;
  session: string;
  semester: string;
  records: CourseRecord[];
  gpa?: number;
  cgpa?: number;
}

export default function TransComp({
  student,
  session,
  semester,
  records,
  gpa,
  cgpa,
}: Props) {
  const totalUnits = records.reduce((s, r) => s + (r.creditUnit || 0), 0);
  const totalPoints = records.reduce(
    (s, r) => s + (r.gradePoint || 0) * (r.creditUnit || 0),
    0,
  );

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const exportCSV = () => {
    const header = [
      "Code",
      "Title",
      "CreditUnit",
      "CA",
      "Exam",
      "Total",
      "Grade",
      "GradePoint",
    ];
    const rows = records.map((r) => [
      r.code,
      r.title,
      String(r.creditUnit),
      String(r.ca ?? ""),
      String(r.exam ?? ""),
      String(r.total ?? ""),
      r.grade ?? "",
      String(r.gradePoint ?? ""),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${student.matricNo || "transcript"}-${session}-${semester}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-900 m-auto p-20">
      <header className="flex justify-between items-center mb-20">
        <div>
          <h2 className="m-0">YABA COLLEGE OF TECHNOLOGY</h2>
          <div className="text-gray-500">Official Transcript</div>
        </div>
        <div className="text-right">
          <div>Session: {session}</div>
          <div>Semester: {semester}</div>
        </div>
      </header>

      <section className="flex justify-between mb-16">
        <div>
          <div>
            <strong>Name:</strong> {student.firstname} {student.lastname}
          </div>
          <div>
            <strong>Matric No:</strong> {student.matricNo}
          </div>
          <div>
            <strong>Department:</strong> {student.department || "—"}
          </div>
        </div>
        <div className="text-right">
          <div>
            <strong>Program:</strong> {student.program || "—"}
          </div>
          <div>
            <strong>Level:</strong> {student.level || "—"}
          </div>
        </div>
      </section>

      <table className="hidden w-full border border-collapse mb-12">
        <thead>
          <tr>
            <th className="border border-gray-500 text-left p-8">Code</th>
            <th className="border border-gray-500 text-left p-8">Title</th>
            <th className="border border-gray-500 text-left p-8">Unit</th>
            <th className="border border-gray-500 text-left p-8">CA</th>
            <th className="border border-gray-500 text-left p-8">Exam</th>
            <th className="border border-gray-500 text-left p-8">Total</th>
            <th className="border border-gray-500 text-left p-8">Grade</th>
            <th className="border border-gray-500 text-left p-8">GP</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i}>
              <td className="p-8 border-b-1">{r.code}</td>
              <td className="p-8 border-b-1">{r.title}</td>
              <td className="p-8 text-right border-b-1">{r.creditUnit}</td>
              <td className="p-8 text-right border-b-1">{r.ca ?? "—"}</td>
              <td className="p-8 text-right border-b-1">{r.exam ?? "—"}</td>
              <td className="p-8 text-right border-b-1">{r.total ?? "—"}</td>
              <td className="p-8 text-center border-b-1">{r.grade ?? "—"}</td>
              <td className="p-8 text-right border-b-1">
                {r.gradePoint ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className="p-8 text-2xl">
              Totals
            </td>
            <td className="p-8 text-2xl">{totalUnits}</td>
            <td colSpan={4} />
            <td className="p-8 text-2xl">{totalPoints.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <table className="border border-collapse w-full">
        <thead>
          <tr>
            <th colSpan={3} className="px-5">
              course code
            </th>
            <th>
              com <br />
              123
            </th>
            <th>
              com <br />
              123
            </th>
            <th>
              com <br />
              123
            </th>
            <th>
              com <br />
              123
            </th>
            <th>
              com <br />
              123
            </th>
            <th>
              com <br />
              123
            </th>
            <th>
              com <br />
              123
            </th>
            <th>
              com <br />
              123
            </th>
            <th>
              com <br />
              123
            </th>
            <th>
              com <br />
              123
            </th>
            <th colSpan={3} className="px-5"></th>
            <th colSpan={4} className="px-5"></th>
            <th colSpan={7} rowSpan={2} className="px-5">
              {" "}
            </th>
          </tr>
          <tr>
            <th colSpan={3}>Course Unit</th>
            <th>2</th>
            <th>3</th>
            <th>2</th>
            <th>3</th>
            <th>2</th>
            <th>3</th>
            <th>4</th>
            <th>3</th>
            <th>4</th>
            <th>3</th>
            <th colSpan={3} className="px-5">
              Present
            </th>
            <th colSpan={4} className="px-5">
              Cummulative
            </th>
          </tr>
          <tr>
            <th colSpan={1} className="px-3">
              S/N
            </th>
            <th colSpan={2} className="px-3">
              MATRIC NO
            </th>
            <th colSpan={10}>Scores</th>
            <th colSpan={1} className="px-2">TU</th>
            <th colSpan={1} className="px-2">WGP</th>
            <th colSpan={1} className="px-2">GPA</th>
            <th className="px-2">CTU</th>
            <th className="px-2">CTUP</th>
            <th className="px-2">CWGP</th>
            <th className="px-2">CGPA</th>
            <th className="px-2" colSpan={7}>REMARK</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3}>sign</td>
            <td>sign</td>
            <td>sign</td>
            <td>sign</td>
            <td>sign</td>
            <td>sign</td>
            <td>sign</td>
            <td>sign</td>
            <td>sign</td>
            <td>sign</td>
            <td>sign</td>
            <td>sign</td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end gap-24 mb-20">
        <div>
          <strong>GPA:</strong> {gpa?.toFixed(2) ?? "—"}
        </div>
        <div>
          <strong>CGPA:</strong> {cgpa?.toFixed(2) ?? "—"}
        </div>
      </div>

      <div className="flex gap-8">
        <button onClick={handlePrint} className="px-8 py-12 cursor-pointer">
          Print
        </button>
        <button onClick={exportCSV} className="px-8 py-12 cursor-pointer">
          Export CSV
        </button>
      </div>
    </div>
  );
}
