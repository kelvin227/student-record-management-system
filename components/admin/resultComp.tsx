"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CloudUpload,
  Download,
  Edit,
  Eye,
  FileText,
  Inbox,
  Layers,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Department } from "./departmentComp";
import { Student } from "./studentComp";
import { Course } from "./courseManagementComp";
import { Program } from "./programComp";
import { Session } from "./sessionComp";
import { Semester } from "./semestersComp";
import { Lecturer } from "./lecturerComp";

interface Result {
  id: string;
  studentId: string | null;
  courseId: string | null;
  sessionId: string | null;
  semesterId: string | null;
  caScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  gradePoint: number;
  status: "DRAFT" | "PUBLISHED";
  student?: Student;
  lecturer?: Lecturer;
}

export interface Option {
  id: string;
  name: string;
}

export const levels: Option[] = [
  { id: "100", name: "100 Level" },
  { id: "200", name: "200 Level" },
  { id: "300", name: "300 Level" },
  { id: "400", name: "400 Level" },
];

const gradeRules = [
  { min: 70, grade: "A", point: 5 },
  { min: 60, grade: "B", point: 4 },
  { min: 50, grade: "C", point: 3 },
  { min: 45, grade: "D", point: 2 },
  { min: 40, grade: "E", point: 1 },
  { min: 0, grade: "F", point: 0 },
];

const calculateGrade = (score: number) => {
  const rule =
    gradeRules.find((item) => score >= item.min) ??
    gradeRules[gradeRules.length - 1];
  return { grade: rule.grade, gradePoint: rule.point };
};

const getBadgeVariant = (status: Result["status"]) => {
  if (status === "PUBLISHED") {
    return "default" as const;
  }
  if (status === "DRAFT") {
    return "secondary" as const;
  }
  return "default" as const;
};

export default function ResultComp({ userId }: { userId: string }) {
  const [results, setResults] = useState<Result[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showGrade, setShowGrade] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState("166");
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionFilter, setSessionFilter] = useState<string | null>(null);
  const [semesterFilter, setSemesterFilter] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [programFilter, setProgramFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewResult, setPreviewResult] = useState<Result | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formState, setFormState] = useState<Result>({
    id: "",
    studentId: null,
    courseId: null,
    sessionId: null,
    semesterId: null,
    caScore: 0,
    examScore: 0,
    totalScore: 0,
    grade: "F",
    gradePoint: 0,
    status: "DRAFT",
  });

  useEffect(() => {
    const totalScore = Math.min(
      100,
      Math.max(0, formState.caScore + formState.examScore),
    );
    const { grade, gradePoint } = calculateGrade(totalScore);
    fetchCourses();
    fetchStudents();
    fetchData();
    fetchSessions();
    fetchSemesters();
    setFormState((prev) => ({ ...prev, totalScore, grade, gradePoint }));
  }, [formState.caScore, formState.examScore]);

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
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/courses");
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [programsRes, departmentsRes, resultRes] = await Promise.all([
        fetch("/api/admin/programs"),
        fetch("/api/admin/departments"),
        fetch("/api/admin/result"),
      ]);

      if (programsRes.ok) {
        const data = await programsRes.json();
        setPrograms(data);
      }

      if (departmentsRes.ok) {
        const data = await departmentsRes.json();
        setDepartments(data);
      }
      if (resultRes.ok) {
        const data = await resultRes.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Error", {
        description: "Failed to fetch data",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/sessions");
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  // Fetch semesters
  const fetchSemesters = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/semesters");
      if (!response.ok) throw new Error("Failed to fetch semesters");
      const data = await response.json();
      setSemesters(data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const student = students.find((item) => item.id === result.studentId);
      const course = courses.find((item) => item.id === result.courseId);

      // 1. Search Logic
      const studentName =
        `${student?.firstName ?? ""} ${student?.lastName ?? ""}`.toLowerCase();
      const matric = student?.matricNo.toLowerCase() ?? "";
      const courseCode = course?.code.toLowerCase() ?? "";
      const searchMatch =
        searchQuery === "" ||
        studentName.includes(searchQuery.toLowerCase()) ||
        matric.includes(searchQuery.toLowerCase()) ||
        courseCode.includes(searchQuery.toLowerCase());

      // 2. Exact Filters
      const sessionMatch = sessionFilter
        ? result.sessionId === sessionFilter
        : true;
      const semesterMatch = semesterFilter
        ? result.semesterId === semesterFilter
        : true;
      const courseMatch = courseFilter
        ? result.courseId === courseFilter
        : true;

      // 3. Relational Filters (Level & Program)
      // We safely compare the student's level (number) with the filter (string)
      const levelMatch = levelFilter
        ? result?.student?.level.toString() === levelFilter
        : true;

      const programMatch = programFilter
        ? student?.programId === programFilter
        : true;

      // 4. Department Filter (Assumes course code prefix logic)
      const departmentMatch = departmentFilter
        ? departmentFilter === "computer-science"
          ? course?.code.startsWith("CSC")
          : departmentFilter === "business"
            ? course?.code.startsWith("BUS")
            : departmentFilter === "engineering"
              ? course?.code.startsWith("ENG")
              : true
        : true;

      return (
        searchMatch &&
        sessionMatch &&
        semesterMatch &&
        departmentMatch &&
        programMatch &&
        levelMatch &&
        courseMatch
      );
    });
  }, [
    results,
    searchQuery,
    sessionFilter,
    semesterFilter,
    departmentFilter,
    programFilter,
    levelFilter,
    courseFilter,
    students,
    courses, // Added dependencies
  ]);

  const totalResults = results.length;
  const publishedResults = results.filter(
    (result) => result.status === "PUBLISHED",
  ).length;
  const pendingResults = results.filter(
    (result) => result.status === "DRAFT",
  ).length;
  const coursesWithResults = new Set(results.map((result) => result.courseId))
    .size;

  const handleNewResult = async () => {
    setFormState({
      id: "",
      studentId: null,
      courseId: null,
      sessionId: null,
      semesterId: null,
      caScore: 0,
      examScore: 0,
      totalScore: 0,
      grade: "F",
      gradePoint: 0,
      status: "DRAFT",
    });
    setIsEditing(false);
    setIsAddOpen(true);
  };

  const handleSaveResult = async () => {
    if (
      !formState.studentId ||
      !formState.courseId ||
      !formState.sessionId ||
      !formState.semesterId
    ) {
      return;
    }

    const updatedFormData = {
      ...formState,
      id: editingId,
      enteredById: userId,
    };

    console.log("updated form:", updatedFormData);

    const method = isEditing ? "PATCH" : "POST";

    const response = await fetch("/api/admin/result", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFormData),
    });

    if (!response.ok) throw new Error("Failed to save semester");

    setIsAddOpen(false);
  };

  const handleEditResult = (result: Result) => {
    setFormState(result);
    setIsEditing(true);
    setIsAddOpen(true);
  };

  const handleDeleteResult = (id: string) => {
    setResults((current) => current.filter((item) => item.id !== id));
  };

  const handlePublishResult = (id: string) => {
    setResults((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "PUBLISHED" } : item,
      ),
    );
  };

  const handlePreview = (result: Result) => {
    setPreviewResult(result);
    console.log("preview");
    setIsPreviewOpen(true);
  };

  const simulateUpload = () => {
    setUploadProgress(10);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 15;
      });
    }, 400);
  };

  const dialogCourseFilter = courses.filter((course) => {
    const student = students.find(
      (s) => s.id === formState.studentId,
    )?.departmentId;
    const dialogCourseFilter = course.department.id.includes(student as string);

    return dialogCourseFilter;
  });

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            Result Management
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Manage student results, publish grades, and review academic records
            across sessions and semesters.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={handleNewResult}
            className="inline-flex items-center gap-2"
          >
            <Plus size={16} /> Add Result
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm">Total Results</CardTitle>
              <CardDescription className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                {totalResults}
              </CardDescription>
            </div>
            <div className="rounded-full bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <FileText size={20} />
            </div>
          </CardHeader>
          <CardFooter>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Complete academic records across the system.
            </p>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm">Published Results</CardTitle>
              <CardDescription className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                {publishedResults}
              </CardDescription>
            </div>
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-100">
              <CheckCircle2 size={20} />
            </div>
          </CardHeader>
          <CardFooter>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Allocated results ready for student review.
            </p>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm">Pending Results</CardTitle>
              <CardDescription className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                {pendingResults}
              </CardDescription>
            </div>
            <div className="rounded-full bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <Inbox size={20} />
            </div>
          </CardHeader>
          <CardFooter>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Draft results awaiting final approval.
            </p>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm">Courses With Results</CardTitle>
              <CardDescription className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                {coursesWithResults}
              </CardDescription>
            </div>
            <div className="rounded-full bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <Layers size={20} />
            </div>
          </CardHeader>
          <CardFooter>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Unique course entries published in the system.
            </p>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Refine the result list by session, semester, department, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <Select
              value={sessionFilter}
              onValueChange={(value) => setSessionFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Academic Session">
                  {sessionFilter
                    ? sessions.find((s) => s.id === sessionFilter)?.name
                    : "Academic Session"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sessions.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={semesterFilter}
              onValueChange={(value) => setSemesterFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semester">
                  {semesterFilter
                    ? semesters.find((s) => s.id === semesterFilter)?.name
                    : "Semester"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {semesters.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={departmentFilter}
              onValueChange={(value) => setDepartmentFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Department">
                  {departmentFilter
                    ? departments.find((d) => d.id === departmentFilter)?.name
                    : "Department"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {departments.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Select
              value={programFilter}
              onValueChange={(value) => setProgramFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Program">
                  {programFilter
                    ? programs.find((p) => p.id === programFilter)?.name
                    : "Program"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {programs.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={levelFilter}
              onValueChange={(value) => setLevelFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={courseFilter}
              onValueChange={(value) => setCourseFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Course">
                  {courseFilter
                    ? courses.find((c) => c.id === courseFilter)?.title
                    : "Course"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {courses.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.code} - {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by student name, matric number, or course code"
                className="min-w-0"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSessionFilter(null);
                setSemesterFilter(null);
                setDepartmentFilter(null);
                setProgramFilter(null);
                setLevelFilter(null);
                setCourseFilter(null);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                Manage result records across students and courses.
              </CardDescription>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <ArrowUpDown size={16} /> Sorted by latest
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Matric Number</TableHead>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Credit Unit</TableHead>
                  <TableHead>CA Score</TableHead>
                  <TableHead>Exam Score</TableHead>
                  <TableHead>Total Score</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Point</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => {
                  const student = students.find(
                    (item) => item.id === result.studentId,
                  );
                  const course = courses.find(
                    (item) => item.id === result.courseId,
                  );
                  return (
                    <TableRow key={result.id}>
                      <TableCell>
                        {student
                          ? `${student.firstName} ${student.lastName}`
                          : "Unknown Student"}
                      </TableCell>
                      <TableCell>{student?.matricNo}</TableCell>
                      <TableCell>{course?.code}</TableCell>
                      <TableCell>{course?.title}</TableCell>
                      <TableCell>{course?.creditUnit}</TableCell>
                      <TableCell>{result.caScore}</TableCell>
                      <TableCell>{result.examScore}</TableCell>
                      <TableCell>{result.totalScore}</TableCell>
                      <TableCell>{result.grade}</TableCell>
                      <TableCell>{result.gradePoint}</TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(result.status)}>
                          {result.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className={"rounded-full"}>
                            <ChevronDown size={16} />={" "}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handlePreview(result)}
                              >
                                <Eye size={16} className="mr-2" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditResult(result)}
                              >
                                <Edit size={16} className="mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteResult(result.id)}
                              >
                                <Trash2 size={16} className="mr-2" /> Delete
                              </DropdownMenuItem>
                              {result.status === "DRAFT" ? (
                                <DropdownMenuItem
                                  onSelect={() =>
                                    handlePublishResult(result.id)
                                  }
                                >
                                  <CheckCircle2 size={16} className="mr-2" />{" "}
                                  Publish Result
                                </DropdownMenuItem>
                              ) : null}
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Result Upload</CardTitle>
            <CardDescription>
              Upload result spreadsheets and use a template for standard
              formatting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Button
                variant="secondary"
                className="w-full gap-2 md:w-auto"
                onClick={simulateUpload}
              >
                <CloudUpload size={16} /> Upload Excel
              </Button>
              <Button variant="outline" className="w-full gap-2 md:w-auto">
                <Download size={16} /> Download Template
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Upload progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all duration-300 dark:bg-slate-100"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Result" : "Add New Result"}
            </DialogTitle>
            <DialogDescription>
              Enter student result details and review the computed grade in real
              time.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <Select
              value={formState.studentId}
              onValueChange={(value) =>
                setFormState((prev) => ({ ...prev, studentId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Student">
                  {formState.studentId
                    ? `${formState.student?.firstName} ${formState.student?.lastName}`
                    : "Student"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem
                    key={student.id}
                    value={student.id}
                    onClick={() =>
                      setFormState((prev) => ({ ...prev, student: student }))
                    }
                  >
                    {student.firstName} {student.lastName} — {student.matricNo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={formState.courseId}
              onValueChange={(value) => {
                setFormState((prev) => ({ ...prev, courseId: value }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Course">
                  {formState.courseId
                    ? (courses.find((c) => c.id === formState.courseId)
                        ?.title as string)
                    : "Course"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {dialogCourseFilter.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} — {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={formState.sessionId}
              onValueChange={(value) =>
                setFormState((prev) => ({ ...prev, sessionId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Session">
                  {formState.sessionId
                    ? (sessions.find((s) => s.id === formState.sessionId)
                        ?.name as string)
                    : "Sessions"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={formState.semesterId}
              onValueChange={(value) =>
                setFormState((prev) => ({ ...prev, semesterId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semester">
                  {formState.semesterId
                    ? (semesters.find((s) => s.id === formState.semesterId)
                        ?.name as string)
                    : "Semester"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester.id} value={semester.id}>
                    {semester.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={formState.caScore}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  caScore: Number(event.target.value),
                }))
              }
              placeholder="CA Score"
            />
            <Input
              type="number"
              value={formState.examScore}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  examScore: Number(event.target.value),
                }))
              }
              placeholder="Exam Score"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="bg-slate-50 dark:bg-slate-900">
              <CardContent>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Score
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {formState.totalScore}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 dark:bg-slate-900">
              <CardContent>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Grade
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {formState.grade}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 dark:bg-slate-900">
              <CardContent>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Grade Point
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {formState.gradePoint}
                </p>
              </CardContent>
            </Card>
          </div>
          <Card className="mt-4 border border-dashed border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
            <CardHeader className="" onClick={() => setShowGrade(!showGrade)}>
              <CardTitle className="text-sm">Grading System</CardTitle>
            </CardHeader>
            <CardContent
              className={
                showGrade
                  ? "grid gap-2 text-sm text-slate-600 dark:text-slate-400"
                  : "hidden"
              }
            >
              <div className="grid grid-cols-[1fr_1fr_1fr] gap-3 font-semibold text-slate-900 dark:text-slate-100">
                <span>Score</span>
                <span>Grade</span>
                <span>Point</span>
              </div>
              {gradeRules.map((rule) => (
                <div
                  key={rule.grade}
                  className="grid grid-cols-[1fr_1fr_1fr] gap-3"
                >
                  <span>{rule.min}+</span>
                  <span>{rule.grade}</span>
                  <span>{rule.point}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveResult}>
              {isEditing ? "Update Result" : "Save Result"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Result Preview</DialogTitle>
            <DialogDescription>
              Review the selected student result before taking action.
            </DialogDescription>
          </DialogHeader>
          {previewResult ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border p-4">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Student Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {
                        students.find(
                          (item) => item.id === previewResult.studentId,
                        )?.firstName
                      }{" "}
                      {
                        students.find(
                          (item) => item.id === previewResult.studentId,
                        )?.lastName
                      }
                    </p>
                    <p>
                      {
                        students.find(
                          (item) => item.id === previewResult.studentId,
                        )?.matricNo
                      }
                    </p>
                    <p>
                      {
                        sessions.find(
                          (item) => item.id === previewResult.sessionId,
                        )?.name
                      }
                    </p>
                    <p>
                      {
                        semesters.find(
                          (item) => item.id === previewResult.semesterId,
                        )?.name
                      }
                    </p>
                  </CardContent>
                </Card>
                <Card className="border p-4">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Course Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {
                        courses.find(
                          (item) => item.id === previewResult.courseId,
                        )?.code
                      }
                    </p>
                    <p>
                      {
                        courses.find(
                          (item) => item.id === previewResult.courseId,
                        )?.title
                      }
                    </p>
                    <p>
                      Credit Unit:{" "}
                      {
                        courses.find(
                          (item) => item.id === previewResult.courseId,
                        )?.creditUnit
                      }
                    </p>
                    <p>
                      Status:{" "}
                      <Badge variant={getBadgeVariant(previewResult.status)}>
                        {previewResult.status}
                      </Badge>
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border p-4">
                  <CardHeader>
                    <CardTitle className="text-sm">CA Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {previewResult.caScore}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border p-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Exam Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {previewResult.examScore}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border p-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Total Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {previewResult.totalScore}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border p-4">
                  <CardContent>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Grade
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {previewResult.grade}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border p-4">
                  <CardContent>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Grade Point
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {previewResult.gradePoint}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border p-4">
                  <CardContent>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Course Status
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {previewResult.status}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No result selected.
            </p>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
