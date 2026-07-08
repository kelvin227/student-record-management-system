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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export interface Program {
  id: string;
  name: string;
  departmentId: string;
  departmentName?: string;
  duration: number;
}

interface Department {
  id: string;
  name: string;
}

export function ProgramComponent() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    departmentId: '',
    duration: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [programsRes, departmentsRes] = await Promise.all([
          fetch('/api/admin/programs'),
          fetch('/api/admin/departments'),
        ]);

        if (programsRes.ok) {
          const data = await programsRes.json();
          setPrograms(data);
        }

        if (departmentsRes.ok) {
          const data = await departmentsRes.json();
          setDepartments(data);
        }
      } catch (error) {
        toast.error( 'Error',
{
          description: 'Failed to fetch data',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.departmentId || !formData.duration) {
      toast.error('Validation Error',{
        description: 'Please fill all fields',
      });
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch("/api/admin/programs", {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: editingId ,
          name: formData.name,
          departmentId: formData.departmentId,
          duration: parseInt(formData.duration),
        }),
      });

      if (response.ok) {
        const result = await response.json();

        if (editingId) {
          setPrograms(
            programs.map((p) =>
              p.id === editingId
                ? {
                    ...result,
                    departmentName: departments.find(
                      (d) => d.id === result.departmentId
                    )?.name,
                  }
                : p
            )
          );
          toast('Success',{
            description: 'Program updated successfully',
          });
        } else {
          const departmentName = departments.find(
            (d) => d.id === result.departmentId
          )?.name;
          setPrograms([...programs, { ...result, departmentName }]);
          toast.success('Success',{
            description: 'Program created successfully',
          });
        }

        resetForm();
        setIsOpen(false);
      } else {
        const error = await response.json();
        toast.error('Error',{
          description: error.message || 'Failed to save program',
        });
      }
    } catch (error) {
      toast.error('Error',{
        description: 'An error occurred while saving',
      });
    }
  };

  const handleEdit = (program: Program) => {
    setEditingId(program.id);
    setFormData({
      name: program.name,
      departmentId: program.departmentId,
      duration: program.duration.toString(),
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;

    try {
      const response = await fetch(`/api/programs?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPrograms(programs.filter((p) => p.id !== id));
        toast('Success',{
          description: 'Program deleted successfully',
        });
      } else {
        toast.error('Error',{
          description: 'Failed to delete program',
        });
      }
    } catch (error) {
      toast.error('Error',{
        description: 'An error occurred while deleting',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      departmentId: '',
      duration: '',
    });
    setEditingId(null);
  };

  const filteredPrograms = programs.filter(
    (program) =>
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full p-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Program Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger  
          className="gap-2"
          onClick={() => {
                resetForm();
                setIsOpen(true);
              }}>

              <Plus className="h-4 w-4" />
              New Program
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Program' : 'Create New Program'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Program Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Bachelor of Science"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id} className='bg-background'>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Duration (Years)</label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="e.g., 4"
                  min="1"
                  max="10"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <DialogClose>
                  Cancel
                </DialogClose>
                <Button type="submit">
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 p-4 rounded-lg border">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search programs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0"
        />
      </div>

      <div className=" rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filteredPrograms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No programs found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Duration (Years)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrograms.map((program) => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell>{program.departmentName || '-'}</TableCell>
                  <TableCell>{program.duration}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(program)}
                        className="gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(program.id)}
                        className="gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
