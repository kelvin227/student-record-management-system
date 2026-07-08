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
import { Input } from "@/components/ui/input";
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
import { Plus, Edit2, Trash2, Search } from "lucide-react";

export interface Student {
  id: string;
  matricNo: string;
  firstName: string;
  lastName: string;
  email: string;

  departmentId: string;
  programId: string;

  department?: {
    name: string;
  };

  program?: {
    name: string;
  };

  level: number;

  phone?: string | null;
  createdAt: string;

  gpa: {
    gpa: number;
    cgpa: number;
  }
}

interface Department {
  id: string;
  name: string;
}

interface Program {
  id: string;
  name: string;
  departmentId: string;
}

export default function StudentComp() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    matricNo: "",
    firstname: "",
    lastname: "",
    email: "",
    departmentId: "",
    programId: "",
    level: "100",
    phone: "",
  });

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/admin/departments");

      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPrograms = async (departmentId: string) => {
    try {
      const response = await fetch(
        `/api/admin/programs?departmentId=${departmentId}`,
      );

      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error(error);
    }
  };
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingStudent
        ? `/api/admin/students?id=${editingStudent.id}`
        : "/api/admin/students";

      const method = editingStudent ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchStudents();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save student:", error);
    }
  };

const handleEdit = async (student: Student) => {
  setEditingStudent(student);

  await fetchPrograms(student.departmentId);

  setFormData({
    matricNo: student.matricNo,
    firstname: student.firstName,
    lastname: student.lastName,
    email: student.email,
    departmentId: student.departmentId,
    programId: student.programId,
    level: student.level.toString(),
    phone: student.phone ?? "",
  });

  setIsDialogOpen(true);
};

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        const response = await fetch(`/api/admin/students?id=${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchStudents();
        }
      } catch (error) {
        console.error("Failed to delete student:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      matricNo: "",
      firstname: "",
      lastname: "",
      email: "",
      departmentId: "",
      programId: "",
      level: "100",
      phone: "",
    });
    setEditingStudent(null);
    setPrograms([]);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.matricNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = filterLevel === "all" || student.level.toString() === filterLevel;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="w-full space-y-6 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Student Management
          </h1>
          <p className="text-foreground mt-1">
            Manage student records and information
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger
            className="gap-2"
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Student
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? "Edit Student" : "Add New Student"}
              </DialogTitle>
              <DialogDescription>
                {editingStudent
                  ? "Update student information"
                  : "Create a new student record"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Matric Number *
                  </label>
                  <Input
                    name="matricNo"
                    value={formData.matricNo}
                    onChange={handleInputChange}
                    placeholder="e.g., CSC/2021/001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Level *
                  </label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, level: value ?? "100" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                      <SelectItem value="300">300</SelectItem>
                      <SelectItem value="400">400</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name *
                  </label>
                  <Input
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name *
                  </label>
                  <Input
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="student@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Department *
                  </label>

                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        departmentId: value ?? "",
                        programId: "",
                      }));

                      if (value) {
    fetchPrograms(value);
  } else {
    setPrograms([]);
  }

                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>

                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Program *
                  </label>

                  <Select
                    value={formData.programId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        programId: value ?? "",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>

                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingStudent ? "Update" : "Create"} Student
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by matric no., name, or email..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filterLevel}
          onValueChange={(value) => setFilterLevel(value ?? "all")}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="200">200</SelectItem>
            <SelectItem value="300">300</SelectItem>
            <SelectItem value="400">400</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matric Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading students...
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.matricNo}
                  </TableCell>
                  <TableCell>
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                      Level {student.level}
                    </span>
                  </TableCell>
                  <TableCell>{student.department?.name}</TableCell>

                  <TableCell>{student.program?.name}</TableCell>
                  <TableCell>{student.phone ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(student)}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(student.id)}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>
          Showing {filteredStudents.length} of {students.length} students
        </p>
      </div>
    </div>
  );
}
