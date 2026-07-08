"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Eye, FileDown, Printer, Search, User } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Department } from "@/components/admin/departmentComp";
import { Session } from "@/components/admin/sessionComp";
import { Semester } from '@/components/admin/semestersComp';
import { levels, Option } from "./resultComp";

export default function ReportComp() {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [message, setMessage] = useState({
    message: "",
    isError: false,
  });
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [departmentsRes, sessionsRes] = await Promise.all([
        fetch("/api/admin/departments"),
        fetch("/api/admin/sessions"),
      ]);

      if (!departmentsRes.ok || !sessionsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const departmentsData = await departmentsRes.json();
      const sessionData = await sessionsRes.json();

      setSessions(sessionData);
      setDepartments(departmentsData);
      setMessage({ message: "Data loaded successfully", isError: false });
    } catch (err) {
      setMessage({
        message: "Failed to load data. Please try again.",
        isError: true,
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <div className="w-full flex justify-center items-center">
          Report Generation
        </div>
        <div>Generate, Print and Export academic reports</div>
      </div>

      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}

        {/* Result Slip Card */}
        <SemesterResultSlipCard />

        {/* Department Broadsheet Card */}
        <DepartmentBroadsheetCard
          departments={departments}
          sessions={sessions}
          semester={sessions.flatMap((session) => session.semesters || [])}
        />

        {/* GPA Summary Card */}

        <GPASummaryCard
          departments={departments}
          sessions={sessions}
          semester={sessions.flatMap((session) => session.semesters || [])}
        />


        {/* CGPA Summary Card */}
        <CGPASummaryCard
            departments={departments}
            sessions={sessions}
            />
      </div>
    </div>
  );
}

export function SemesterResultSlipCard() {
  const [student, setStudent] = useState("");
  const [session, setSession] = useState("");
  const [semester, setSemester] = useState("");
  const [status, setStatus] = useState("published");

  const canGenerate = student !== "" && session !== "" && semester !== "";

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Semester Result Slip</CardTitle>

        <CardDescription>
          Generate and print an individual student's semester examination
          result.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Student */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Student</label>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />

            <Input
              className="pl-10"
              placeholder="Search by Name or Matric Number"
              value={student}
              onChange={(e) => setStudent(e.target.value)}
            />
          </div>
        </div>

        {/* Session */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Session</label>

          <Select
            value={session}
            onValueChange={(value) => setSession(value ?? "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Session" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="2023/2024">2023/2024</SelectItem>

              <SelectItem value="2024/2025">2024/2025</SelectItem>

              <SelectItem value="2025/2026">2025/2026</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Semester */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Semester</label>

          <Select
            value={semester}
            onValueChange={(value) => setSemester(value ?? "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="First">First Semester</SelectItem>

              <SelectItem value="Second">Second Semester</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Result Status */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Result Status</label>

          <Select
            value={status}
            onValueChange={(value) => setStatus(value ?? "published")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="published">Published Only</SelectItem>

              <SelectItem value="draft">Include Draft Results</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Student Preview */}

        {student && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <User size={18} />

              <span className="font-semibold">Student Information</span>
            </div>

            <div className="text-sm text-muted-foreground">
              Student details will appear here after selecting a student from
              your database.
            </div>

            {/* Example */}

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <strong>Name:</strong>
              </div>

              <div>John Doe</div>

              <div>
                <strong>Matric No:</strong>
              </div>

              <div>CSC/22/001</div>

              <div>
                <strong>Department:</strong>
              </div>

              <div>Computer Science</div>

              <div>
                <strong>Level:</strong>
              </div>

              <div>300 Level</div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-3 justify-end">
        <Button variant="outline" disabled={!canGenerate}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>

        <Button variant="outline" disabled={!canGenerate}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>

        <Button disabled={!canGenerate}>
          <FileDown className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </CardFooter>
    </Card>
  );
}

export function DepartmentBroadsheetCard({
  departments,
  sessions,
  semester,
}: {
  departments: Department[];
  sessions: Session[];
  semester: Semester[];
}) {
  const [student, setStudent] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [status, setStatus] = useState("published");
  const [search, setSearch] = useState("");

  const canGenerate =
    student !== "" && selectedSession !== null && selectedSemester !== null;

  const filteredDepartments = departments.filter((department) =>
    department.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Department BroadSheet Slip</CardTitle>

        <CardDescription>
          Generate and print a department's broadsheet for a specific semester.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Department */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Department</label>

          <div className="relative">
            <Select
              value={selectedDepartment}
              onValueChange={(value) => setSelectedDepartment(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department">
                  {selectedDepartment
                    ? selectedDepartment.name
                    : "Select a Department"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {filteredDepartments.map((department) => (
                  <SelectItem key={department.id} value={department}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Session */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Session</label>

          <Select
            value={selectedSession}
            onValueChange={(value) => setSelectedSession(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Session">{selectedSession ? selectedSession.name : "Select a Session"}</SelectValue>
            </SelectTrigger>

            <SelectContent>
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session}>
                  {session.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Semester */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Semester</label>

          <Select
            value={selectedSemester}
            onValueChange={(value) => setSelectedSemester(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Semester">{selectedSemester ? selectedSemester.name : "Select a Semester"}</SelectValue>
            </SelectTrigger>

            <SelectContent>
              {semester.map((sem) => (
                <SelectItem key={sem.id} value={sem}>
                  {sem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Result Status */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Result Status</label>

          <Select
            value={status}
            onValueChange={(value) => setStatus(value ?? "published")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="published">Published Only</SelectItem>

              <SelectItem value="draft">Include Draft Results</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3 justify-end">
        <Button variant="outline" disabled={!canGenerate}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>

        <Button variant="outline" disabled={!canGenerate}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>

        <Button disabled={!canGenerate}>
          <FileDown className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </CardFooter>
    </Card>
  );
}

export function GPASummaryCard({
  departments,
  sessions,
  semester,
}: {
  departments: Department[];
  sessions: Session[];
  semester: Semester[];
}) {
  const [student, setStudent] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Option | null>(null);
  const [search, setSearch] = useState("");

  const canGenerate =
    student !== "" && selectedSession !== null && selectedSemester !== null && selectedLevel !== null;

  const filteredDepartments = departments.filter((department) =>
    department.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">GPA Summary</CardTitle>

        <CardDescription>
          View GPA statistics for students within a department
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Department */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Department</label>

          <div className="relative">
            <Select
              value={selectedDepartment}
              onValueChange={(value) => setSelectedDepartment(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department">
                  {selectedDepartment
                    ? selectedDepartment.name
                    : "Select a Department"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {filteredDepartments.map((department) => (
                  <SelectItem key={department.id} value={department}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Level */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Level</label>

          <Select
            value={selectedLevel}
            onValueChange={(value) => setSelectedLevel(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Level">{selectedLevel ? selectedLevel.name : "Select a Level"}</SelectValue>
            </SelectTrigger>

            <SelectContent>
              {levels.map((lvl) => (
                <SelectItem key={lvl.id} value={lvl}>
                  {lvl.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Session */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Session</label>

          <Select
            value={selectedSession}
            onValueChange={(value) => setSelectedSession(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Session">{selectedSession ? selectedSession.name : "Select a Session"}</SelectValue>
            </SelectTrigger>

            <SelectContent>
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session}>
                  {session.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Semester */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Semester</label>

          <Select
            value={selectedSemester}
            onValueChange={(value) => setSelectedSemester(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Semester">{selectedSemester ? selectedSemester.name : "Select a Semester"}</SelectValue>
            </SelectTrigger>

            <SelectContent>
              {semester.map((sem) => (
                <SelectItem key={sem.id} value={sem}>
                  {sem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3 justify-end">
        <Button variant="outline" disabled={!canGenerate}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>

        <Button variant="outline" disabled={!canGenerate}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>

        <Button disabled={!canGenerate}>
          <FileDown className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </CardFooter>
    </Card>
  );
}


export function CGPASummaryCard({
  departments,
  sessions,
}: {
  departments: Department[];
  sessions: Session[];
}) {
  const [student, setStudent] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Option | null>(null);
  const [status, setStatus] = useState("published");
  const [search, setSearch] = useState("");

  const canGenerate =
    student !== "" && selectedSession !== null && selectedLevel !== null;

  const filteredDepartments = departments.filter((department) =>
    department.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">GPA Summary</CardTitle>

        <CardDescription>
          View GPA statistics for students within a department
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Department */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Department</label>

          <div className="relative">
            <Select
              value={selectedDepartment}
              onValueChange={(value) => setSelectedDepartment(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department">
                  {selectedDepartment
                    ? selectedDepartment.name
                    : "Select a Department"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {filteredDepartments.map((department) => (
                  <SelectItem key={department.id} value={department}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Level */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Level</label>

          <Select
            value={selectedLevel}
            onValueChange={(value) => setSelectedLevel(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Level">{selectedLevel ? selectedLevel.name : "Select a Level"}</SelectValue>
            </SelectTrigger>

            <SelectContent>
              {levels.map((lvl) => (
                <SelectItem key={lvl.id} value={lvl}>
                  {lvl.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Session */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Session</label>

          <Select
            value={selectedSession}
            onValueChange={(value) => setSelectedSession(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Session">{selectedSession ? selectedSession.name : "Select a Session"}</SelectValue>
            </SelectTrigger>

            <SelectContent>
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session}>
                  {session.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3 justify-end">
        <Button variant="outline" disabled={!canGenerate}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>

        <Button variant="outline" disabled={!canGenerate}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>

        <Button disabled={!canGenerate}>
          <FileDown className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </CardFooter>
    </Card>
  );
}