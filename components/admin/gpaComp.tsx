"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calculator, TrendingUp, Award, StopCircle, XCircle } from "lucide-react";
import { Student } from "./studentComp";
import { Input } from "@/components/ui/input";
import { Search, User, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Session } from "./sessionComp";
import { Semester } from "./semestersComp";
import { calculateCGPA, calculateGPA, generateBatchCGPARecord, generateBatchGPARecord, generateGPARecord } from "@/lib/function/gpa";
import { toast } from "sonner";
import { Department } from "./departmentComp";
import { levels, Option } from "./resultComp";

// Dummy Data
const MOCK_RECORDS = [
  { id: "1", session: "2024/2025", semester: "First", gpa: 3.85, cgpa: 3.85 },
  { id: "2", session: "2024/2025", semester: "Second", gpa: 3.6, cgpa: 3.72 },
  { id: "3", session: "2025/2026", semester: "First", gpa: 3.9, cgpa: 3.78 },
];

export function StudentSelector({
  onSelect,
}: {
  onSelect: (student: Student) => void;
}) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([])


    useEffect(() => {

      fetchStudents();

    }, []);


      const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.firstName.toLowerCase().includes(query.toLowerCase()) ||
      s.id.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Select Student</h2>
        <p className="text-slate-500">
          Search by student name or ID to manage academic records.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <Input
          className="pl-10 h-12"
          placeholder="Search students (e.g. Adebayo)..."
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Results List */}
      <div className="space-y-2">
        {filtered.map((student) => (
          <Card
            key={student.id}
            className="hover:border-indigo-500 transition-colors group"
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-2 rounded-full">
                  <User size={20} className="text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold">{student.firstName}</p>
                  <p className="text-xs text-slate-500">
                    {student.id} • {student.department?.name}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onSelect(student)}
              >
                View <ChevronRight size={16} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function GPAManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [semester, setSemester] = useState<Semester[]>([]);
  const [department, setDepartment] = useState<Department[]>([]);
  const [successfulGenerated, setSuccessfulGenerated] = useState<[]>([]);
  const [failedGenerated, setFailedGenerated] = useState([]);
  const [showGpa, setShowGpa] = useState(false);
  const [showCgpa, setShowCgpa] = useState(false);
  const [sgpa, setsgpa] = useState(false);
  const [fgpa, setfgpa] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [GPA, setGPA] = useState(0);
  const [CGPA, setCGPA] = useState(0);
  // const [selectedStudent, setSelectedStudent] = useState<Student>(student);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedDeparment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Option | null>(null);
  const [records, setRecords] = useState(MOCK_RECORDS);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleAutoCalculate = async () => {
    setIsCalculating(true);

    let changedValue = selectedLevel?.name.replace("Level", "").trim();

    const calculate = await generateBatchGPARecord(Number(changedValue), selectedDeparment?.id as string, selectedSession?.id as string, selectedSemester?.id as string);

    if(!calculate.success){
      setIsCalculating(false);
      toast.error(calculate.message);
      setError(calculate.message);
      return;
    }
    toast.success(calculate.message);
    setGPA(Number(calculate.data?.gpa));
    setIsCalculating(false);
  };
  const handleCGPACalculate = async () => {
    setIsCalculating(true);

    let changedValue = selectedLevel?.name.replace("Level", "").trim();

    const calculate = await generateBatchCGPARecord(Number(changedValue), selectedDeparment?.id as string, selectedSession?.id as string);

    if(!calculate.success){
      setIsCalculating(false);
      toast.error(calculate.message);
      setError(calculate.message);
      return;
    }
    toast.success(calculate.message);
    setSuccessfulGenerated(calculate.successfulStudents as any);
    setFailedGenerated(calculate.failedStudents as any)
    setIsCalculating(false);
  }

  const handleUiShow= async (clicked: string) => {
    if(clicked === "gpa" ){
      setShowGpa(!showGpa);
      setShowCgpa(false);
    }else if(clicked === "cgpa"){
      setShowCgpa(!showCgpa);
      setShowGpa(false);
    }else if(clicked==="sgpa"){
      setShowGpa(false);
      setShowCgpa(false);
      setsgpa(!sgpa)
      setfgpa(false);
    }else if(clicked === "fgpa"){
      setShowGpa(false);
      setShowCgpa(false);
      setsgpa(false)
      setfgpa(!fgpa);
    }
  }


    useEffect(() => {
      fetchData();

    }, []);

    const fetchData = async () => {
    try {
      setIsLoading(true);
      const [sessionsRes, semesterRes, departmentRes] = await Promise.all([
        fetch("/api/admin/sessions"),
        fetch("/api/admin/semesters"),
        fetch("/api/admin/departments")
      ]);

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(data);
      }

      if (semesterRes.ok) {
        const data = await semesterRes.json();
        setSemester(data);
      }

      if(departmentRes.ok){
        const data = await departmentRes.json();
        setDepartment(data);
      }
    } catch (error) {
      console.error("Error", {
        description: "Failed to fetch data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Academic Performance
          </h2>
          <p className="text-slate-500">
            {/* Auto-computed metrics for Student ID: {student.id} */}
          </p>
        </div>
      </div>

      {/* <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedStudent.firstName} {selectedStudent.lastName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedStudent.matricNo}
            </p>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p>{selectedStudent.department?.name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p>{selectedStudent.level.toString()}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Current GPA</p>
                <p>{selectedStudent.gpa.gpa ?? "N/A"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Current CGPA</p>
                <p>{selectedStudent.gpa.cgpa ?? "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}





        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center items-center w-full">
        <Card onClick={()=> handleUiShow("gpa")} className={showGpa ? "bg-gradient-to-br light:from-indigo-50 light:to-white from-indigo-900 to-black transition border border-indigo-900" : "bg-gradient-to-br light:from-indigo-50 light:to-white from-indigo-900 to-black transition"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium"> GPA</CardTitle>
            <TrendingUp size={16} className="text-indigo-600" />
          </CardHeader>
        </Card>

        <Card onClick={()=> handleUiShow("cgpa")} className={showCgpa ? "bg-gradient-to-br from-emerald-900 to-black light:from-emerald-50 light:to-white border border-emerald-900 transition" :"bg-gradient-to-br from-emerald-900 to-black light:from-emerald-50 light:to-white transition"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              CGPA
            </CardTitle>
            <Award size={16} className="text-emerald-600" />
          </CardHeader>
        </Card>
      </div>


        <div className="flex md:flex-cols-3 gap-4 justify-center items-center w-full">
        <Card onClick={()=> handleUiShow("sgpa")} className={sgpa ? "bg-gradient-to-br light:from-emerald-50 light:to-white from-emerald-900 to-black transition border border-emerald-900 w-full" : "bg-gradient-to-br light:from-indigo-50 light:to-white from-indigo-900 to-black transition w-full"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">successful generated GPA/CGPA</CardTitle>
            <TrendingUp size={16} className="text-indigo-600" />
          </CardHeader>
          <CardContent>
            {successfulGenerated.length}
          </CardContent>
        </Card>

        <Card onClick={()=> handleUiShow("fgpa")} className={fgpa ? "bg-gradient-to-br from-red-900 to-black light:from-red-50 light:to-white border border-red-900 transition w-full" :"bg-gradient-to-br from-red-900 to-black light:from-red-50 light:to-white transition w-full" }>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              failed generated GPA/CGPA
            </CardTitle>
            <XCircle size={16} className="text-red-600" />
          </CardHeader>
          <CardContent>
            {failedGenerated.length}
          </CardContent>
        </Card>
      </div>

      <div className={showGpa ? "" : "hidden"}>
        <Card>
          <CardHeader>
            <CardTitle>Calculate/Recalculate GPA</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-1 gap-4">
                            <div>
                <p className="text-sm text-muted-foreground">level</p>
                <Select
                  value={selectedLevel}
                  onValueChange={(value) => setSelectedLevel(value)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {" "}
                      {selectedLevel ? selectedLevel.name : "select a level"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {levels.map((lvl) => (
                      <SelectItem key={lvl.id} value={lvl}>{lvl.name}</SelectItem>
                    ))}
   
                  </SelectContent>
                </Select>
              </div>
                            <div>
                <p className="text-sm text-muted-foreground">department</p>
                <Select
                  value={selectedDeparment}
                  onValueChange={(value) => setSelectedDepartment(value)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {" "}
                      {selectedDeparment ? selectedDeparment.name : "select a department"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {department.map((d) => (
                      <SelectItem key={d.id} value={d}>{d.name}</SelectItem>
                    ))}
   
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Session</p>
                <Select
                  value={selectedSession}
                  onValueChange={(value) => setSelectedSession(value)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {" "}
                      {selectedSession ? selectedSession.name : "select a session"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session}>{session.name}</SelectItem>
                    ))}
   
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Semester</p>
                <Select
                  value={selectedSemester}
                  onValueChange={(value) =>
                    setSelectedSemester(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue>
                      {selectedSemester ? selectedSemester.name : "select a session"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {semester.map((semester) =>  (
                      <SelectItem key={semester.id} value={semester}>{semester.name}</SelectItem>

                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAutoCalculate}
                disabled={isCalculating}
                className="gap-2"
              >
                {isCalculating ? (
                  "Calculating..."
                ) : (
                  <>
                    <Calculator size={16} /> Compute from Results
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

            <div className={showCgpa ? "" : "hidden"}>
        <Card>
          <CardHeader>
            <CardTitle>Calculate/Recalculate CGPA</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-1 gap-4">
                            <div>
                <p className="text-sm text-muted-foreground">level</p>
                <Select
                  value={selectedLevel}
                  onValueChange={(value) => setSelectedLevel(value)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {" "}
                      {selectedLevel ? selectedLevel.name : "select a level"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {levels.map((lvl) => (
                      <SelectItem key={lvl.id} value={lvl}>{lvl.name}</SelectItem>
                    ))}
   
                  </SelectContent>
                </Select>
              </div>
                            <div>
                <p className="text-sm text-muted-foreground">department</p>
                <Select
                  value={selectedDeparment}
                  onValueChange={(value) => setSelectedDepartment(value)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {" "}
                      {selectedDeparment ? selectedDeparment.name : "select a department"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {department.map((d) => (
                      <SelectItem key={d.id} value={d}>{d.name}</SelectItem>
                    ))}
   
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Session</p>
                <Select
                  value={selectedSession}
                  onValueChange={(value) => setSelectedSession(value)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {" "}
                      {selectedSession ? selectedSession.name : "select a session"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session}>{session.name}</SelectItem>
                    ))}
   
                  </SelectContent>
                </Select>
              </div>


              <Button
                onClick={handleCGPACalculate}
                disabled={isCalculating}
                className="gap-2"
              >
                {isCalculating ? (
                  "Calculating..."
                ) : (
                  <>
                    <Calculator size={16} /> Compute from Results
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* <div className="border rounded-xl shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-600/10">
              <TableHead>Session</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead className="text-right">GPA</TableHead>
              <TableHead className="text-right">CGPA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.session}</TableCell>
                <TableCell>{record.semester}</TableCell>
                <TableCell className="text-right font-mono">
                  {record.gpa.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {record.cgpa.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div> */}
    </div>
  ) 
}
