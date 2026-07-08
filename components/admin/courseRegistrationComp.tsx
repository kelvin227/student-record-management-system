"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { Input } from "../ui/input";
import { Field } from "../ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

interface Course {
  id: string;
  code: string;
  title: string;
  creditUnit: number;
  level: number;
  departmentId: string;
  semester: Semester;
}

interface Student {
  id: string;
  matricNo: string;
  email: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  level: number;
}

export interface CourseRegistration {
  id: string;
  studentId: string;
  courseId: string;
  sessionId: string;
  semesterId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  student?: Student;
  course?: Course;
  session: Session;
  semester: Semester;
}

interface Session {
  id: string;
  name: string;
  isActive: boolean;
}

interface Semester {
  id: string;
  name: string;
  sessionId: string;
}

export default function CourseRegistrationComp() {
  const [registrations, setRegistrations] = useState<CourseRegistration[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [popOverOpen, setPopOverOpen] = useState(false);

  // Form state
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedStudentInfo, setSelectedStudentInfo] = useState<Student>();
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regRes, stuRes, couRes, sesRes, semRes] = await Promise.all([
        fetch("/api/admin/registrations"),
        fetch("/api/admin/students"),
        fetch("/api/admin/courses"),
        fetch("/api/admin/sessions"),
        fetch("/api/admin/semesters"),
      ]);

      if (regRes.ok) setRegistrations(await regRes.json());
      if (stuRes.ok) setStudents(await stuRes.json());
      if (couRes.ok) setCourses(await couRes.json());
      if (sesRes.ok) setSessions(await sesRes.json());
      if (semRes.ok) setSemesters(await semRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCourse = async () => {
    if (
      !selectedStudent ||
      selectedCourses.length === 0 ||
      !selectedSession ||
      !selectedSemester
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent,
          courseIds: selectedCourses,
          sessionId: selectedSession,
          semesterId: selectedSemester,
          status: "PENDING",
        }),
      });

      if (response.ok) {
        alert("Course registration submitted successfully");
        const newRegistrations = await response.json();
        setRegistrations((prev) => [...newRegistrations, ...prev]);
        setIsDialogOpen(false);
        setSelectedStudent("");
        setSelectedCourses([]);
        setSelectedSession("");
        setSelectedSemester("");
        fetchData();
      } else {
        alert("Failed to register course");
      }
    } catch (error) {
      console.error("Error registering course:", error);
      alert("Error registering course");
    }
  };

  const handleApproveRegistration = async (registrationId: string) => {
    try {
      const response = await fetch(
        `/api/admin/registrations?id=${registrationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "APPROVED" }),
        },
      );

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error approving registration:", error);
    }
  };

  const handleRejectRegistration = async (registrationId: string) => {
    try {
      const response = await fetch(
        `/api/course-registrations?id=${registrationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "REJECTED" }),
        },
      );

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error rejecting registration:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return null;
    }
  };

  const filteredRegistrations = registrations.filter(
    (reg) => filterStatus === "ALL" || reg.status === filterStatus, //||
    // reg.
  );
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.matricNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });
  const filtercourses = courses.filter((course) => {
    const matchesSearch =
      course.level
        .toString()
        .includes(selectedStudentInfo?.level.toString() as string) &&
      course.departmentId
        .toLowerCase()
        .includes(selectedStudentInfo?.departmentId as string) &&
        course.semester.id.toLowerCase().includes(selectedSemester as string)


    return matchesSearch;
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Course Registration Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="gap-2">
            <Plus className="w-4 h-4" />
            New Registration
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Register Student for Course</DialogTitle>
              <DialogDescription>
                Fill in the details to register a student for a course
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="w-full">
                <label className="text-sm font-medium">Student</label>
                <Popover open={popOverOpen} onOpenChange={setPopOverOpen}>
                  <PopoverTrigger
                    className={
                      "w-full justify-between border border-grey-500 rounded-lg p-1 bg-input/50"
                    }
                  >
                    {selectedStudent
                      ? `${selectedStudentInfo?.firstName} ${selectedStudentInfo?.lastName}`
                      : "Select student..."}
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command className="w-full">
                      <CommandInput
                        placeholder="Search student..."
                        onValueChange={setSearchTerm}
                      />
                      <CommandList className="w-full">
                        <CommandEmpty>No student found.</CommandEmpty>
                        <CommandGroup className="w-full">
                          {filteredStudents.map((student) => (
                            <CommandItem
                              key={student.id}
                              onSelect={() => {
                                setSelectedStudent(student.id);
                                setSelectedStudentInfo(student);
                                setPopOverOpen(false);
                              }}
                              className="w-full"
                            >
                              {student.matricNo} - {student.firstName}{" "}
                              {student.lastName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium">Session</label>
                <Select
                  value={selectedSession}
                  onValueChange={(value) => setSelectedSession(value || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session">
                      {selectedSession
                        ? sessions.find((s) => s.id === selectedSession)?.name
                        : "Select session"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.name} {session.isActive ? "(Active)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Semester</label>
                <Select
                  value={selectedSemester}
                  onValueChange={(value) => setSelectedSemester(value || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester">
                      {selectedSemester
                        ? semesters.find((s) => s.id === selectedSemester)?.name
                        : "Select semester"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {semesters
                      .filter((sem) => sem.sessionId === selectedSession)
                      .map((semester) => (
                        <SelectItem key={semester.id} value={semester.id}>
                          {semester.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Courses</label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                  {filtercourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={course.id}
                        checked={selectedCourses.includes(course.id)}
                        onCheckedChange={(checked: any) => {
                          setSelectedCourses((prev) =>
                            checked
                              ? [...prev, course.id]
                              : prev.filter((id) => id !== course.id),
                          );
                        }}
                      />
                      <label
                        htmlFor={course.id}
                        className="text-sm cursor-pointer"
                      >
                        {course.code} - {course.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleRegisterCourse} disabled={!selectedSemester || !selectedSession || !selectedStudent || selectedCourses.length === 0} className="w-full">
                Register Course
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrations Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <Field orientation="horizontal">
            <Input
              type="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
            />
            <Button>Search</Button>
          </Field>
          <Select
            value={filterStatus}
            onValueChange={(value: any) => setFilterStatus(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Course Registrations ({filteredRegistrations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">
              Loading registrations...
            </p>
          ) : filteredRegistrations.length === 0 ? (
            <p className="text-center text-gray-500">No registrations found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Matric No</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">
                        {registration.student?.firstName}{" "}
                        {registration.student?.lastName}
                      </TableCell>
                      <TableCell>{registration.student?.matricNo}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {registration.course?.code}
                          </p>
                          <p className="text-sm text-gray-600">
                            {registration.course?.title}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{registration.session?.name}</TableCell>
                      <TableCell>{registration.semester?.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(registration.status)}
                          {getStatusBadge(registration.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {registration.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() =>
                                handleApproveRegistration(registration.id)
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() =>
                                handleRejectRegistration(registration.id)
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {registration.status !== "PENDING" && (
                          <span className="text-sm text-gray-500">
                            No actions
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
