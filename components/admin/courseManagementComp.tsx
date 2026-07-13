'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Lecturer } from './lecturerComp';

export interface Course {
  id: string;
  code: string;
  title: string;
  creditUnit: number;
  level: number;
  department?: {
    name: string;
    id: string;
  };
  semester?: {
    name: string;
    id: string;
  };
  allocations?: {
    lecturer: Lecturer
  };
}

interface Department {
  id: string;
  name: string;
}

interface Semester {
  id: string;
  name: string;
}

export default function CourseManagementComp() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    creditUnit: '',
    level: '',
    departmentId: '',
    semesterId: '',
  });

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    fetchSemesters();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/courses');
      const data = await response.json();
      console.log(data);
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/admin/departments');
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await fetch('/api/admin/semesters');
      const data = await response.json();
      setSemesters(data);
    } catch (error) {
      console.error('Failed to fetch semesters:', error);
    }
  };

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        code: course.code,
        title: course.title,
        creditUnit: course.creditUnit.toString(),
        level: course.level.toString(),
        departmentId: course.department?.id as string,
        semesterId: course.semester?.id as string,
      });
    } else {
      setEditingCourse(null);
      setFormData({
        code: '',
        title: '',
        creditUnit: '',
        level: '',
        departmentId: '',
        semesterId: '',
      });
    }
    setOpenDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string | null) => {
    if (value) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      code: formData.code,
      title: formData.title,
      creditUnit: parseInt(formData.creditUnit),
      level: parseInt(formData.level),
      departmentId: formData.departmentId,
      semesterId: formData.semesterId,
    };

    try {
      if (editingCourse) {
        console.log(formData.code);
        const updatedPayload = {
            ...formData,
            id: editingCourse.id
        }
        const response = await fetch(`/api/admin/courses`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPayload),
        });
        if (response.ok) {
          fetchCourses();
          setOpenDialog(false);
        }
      } else {
        const response = await fetch('/api/admin/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          fetchCourses();
          setOpenDialog(false);
        }
      }
    } catch (error) {
      console.error('Failed to save course:', error);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`/api/admin/courses?id=${courseId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchCourses();
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full p-5">
      <Card>
        <CardHeader>
          <CardTitle>Course Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by course code or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger
                                onClick={() => handleOpenDialog()}
                  className="gap-2"
                  >

                  <Plus className="w-4 h-4" />
                  Add Course
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCourse
                      ? 'Update the course details'
                      : 'Enter the course details below'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Course Code</Label>
                    <Input
                      id="code"
                      name="code"
                      placeholder="e.g., CSC101"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Introduction to Computing"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="creditUnit">Credit Units</Label>
                      <Input
                        id="creditUnit"
                        name="creditUnit"
                        type="number"
                        min="1"
                        placeholder="e.g., 3"
                        value={formData.creditUnit}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level">Course Level</Label>
                      <Input
                        id="level"
                        name="level"
                        type="number"
                        min="1"
                        placeholder="e.g., 100"
                        value={formData.level}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departmentId">Department</Label>
                    <Select
                      value={formData.departmentId}
                      onValueChange={(value) =>
                        handleSelectChange('departmentId', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department">{formData.departmentId ? departments.find((d) => d.id === formData.departmentId)?.name : "Select Department"}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semesterId">Semester</Label>
                    <Select
                      value={formData.semesterId}
                      onValueChange={(value) =>
                        handleSelectChange('semesterId', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester">{formData.semesterId ? semesters.find((s) => s.id === formData.semesterId)?.name : "select semester"}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map((sem) => (
                          <SelectItem key={sem.id} value={sem.id}>
                            {sem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpenDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCourse ? 'Update' : 'Create'} Course
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading courses...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Credit Units</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.code}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>{course.creditUnit}</TableCell>
                        <TableCell>{course.level}</TableCell>
                        <TableCell>{course.department?.name}</TableCell>
                        <TableCell>{course.semester?.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(course)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(course.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No courses found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
