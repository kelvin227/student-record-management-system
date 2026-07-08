"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Department {
  id: string;
  name: string;
  code: string;

  _count?: {
    programs: number;
    students: number;
    lecturers: number;
  };

  createdAt: string;
}

export default function DepartmentComp() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [currentData, setCurrentData] = useState<Department[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );

  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
    });

    setEditingDepartment(null);
  };

  useEffect(() => {
    fetchDepartments();
  }, [page]);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/admin/departments");

      if (response.ok) {
        const data = await response.json();

        setDepartments(data);
        setTotalPages(Math.ceil(data.length / pageSize));
        setCurrentData(data.slice((page - 1) * pageSize, page * pageSize));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingDepartment
        ? `/api/admin/departments/${editingDepartment.id}`
        : "/api/admin/departments";

      const method = editingDepartment ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchDepartments();

        setIsDialogOpen(false);

        resetForm();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);

    setFormData({
      name: department.name,
      code: department.code,
    });

    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      const response = await fetch(`/api/admin/departments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchDepartments();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredDepartments = currentData.filter((department: Department) => {
    return (
      department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="w-full space-y-6 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger onClick={() => resetForm()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? "Edit Department" : "Add New Department"}
              </DialogTitle>
              <DialogDescription>
                {editingDepartment
                  ? "Update department information"
                  : "Create a new department"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Department Name
                </label>
                <Input
                  id="name"
                  placeholder="Enter department name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  Department Code
                </label>
                <Input
                  id="code"
                  placeholder="Enter department code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDepartment ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Programs</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Lecturers</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading departments...
                </TableCell>
              </TableRow>
            ) : filteredDepartments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No departments found
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((department: any) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">
                    {department.name}
                  </TableCell>
                  <TableCell>{department.code}</TableCell>
                  <TableCell>{department._count?.programs || 0}</TableCell>
                  <TableCell>{department._count?.students || 0}</TableCell>
                  <TableCell>{department._count?.lecturers || 0}</TableCell>
                  <TableCell>
                    {new Date(department.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(department)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(department.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>

          <span>
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
