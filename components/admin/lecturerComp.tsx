'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

export interface Lecturer {
  id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  department: {
    id: string;
    name: string;
  };
  user: {
    email: string;
    active: boolean;
  };
}

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function LecturerComp() {
    const [loadingLecturers, setLoadingLecturers] = useState(true);
const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    staffId: '',
    firstName: '',
    lastName: '',
    email: '',
    departmentId: '',
    password: '',
  });
  const isLoading = loadingLecturers || loadingDepartments;


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

        try {
      const url = editingId
        ? `/api/admin/lecturers?id=${editingId}`
        : "/api/admin/lecturers";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchLecturers();
        setShowForm(false);
      }
    } catch (error) {
      console.error("Failed to save student:", error);
    }
    
    setFormData({
      staffId: '',
      firstName: '',
      lastName: '',
      email: '',
      departmentId: '',
      password: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

    useEffect(() => {
      fetchLecturers();
      fetchDepartments();
    }, []);


    
const fetchDepartments = async () => {
  setLoadingDepartments(true);

  try {
    const response = await fetch("/api/admin/departments");

    if (!response.ok) {
      throw new Error("Failed to fetch departments");
    }

    const data = await response.json();
    setDepartments(data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoadingDepartments(false);
  }
};

const fetchLecturers = async () => {
  setLoadingLecturers(true);

  try {
    const response = await fetch("/api/admin/lecturers");

    if (!response.ok) {
      throw new Error("Failed to fetch lecturers");
    }

    const data = await response.json();
    setLecturers(data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoadingLecturers(false);
  }
};


  const handleEdit = (lecturer: Lecturer) => {
    setFormData({
      staffId: lecturer.staffId,
      firstName: lecturer.firstName,
      lastName: lecturer.lastName,
      email: lecturer.user.email,
      departmentId: lecturer.department.id,
      password: '',
    });
    setEditingId(lecturer.id);
    setShowForm(true);
  };

const handleDelete = async (id: string) => {
  if (!confirm("Are you sure you want to delete this lecturer?")) {
    return;
  }

  try {
    const response = await fetch(
      `/api/admin/lecturers?id=${id}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      await fetchLecturers();
    }
  } catch (error) {
    console.error(error);
  }
};

  const filteredLecturers = lecturers.filter(lecturer =>
    `${lecturer.firstName} ${lecturer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8 w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Lecturer Management</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                staffId: '',
                firstName: '',
                lastName: '',
                email: '',
                departmentId: '',
                password: '',
              });
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Plus size={20} />
            Add Lecturer
          </button>
        </div>

        {/* Form Modal */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
           <DialogTrigger className="text-2xl font-bold  mb-4">
              {editingId ? 'Edit Lecturer' : 'Add New Lecturer'}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit Lecturer' : 'Add New Lecturer'}</DialogTitle>
                </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Staff ID</label>
                  <input
                    type="text"
                    name="staffId"
                    value={formData.staffId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., STF001"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 bg-background py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </DialogContent>

        </Dialog>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3" size={20} />
            <input
              type="text"
              placeholder="Search by name, staff ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className=" rounded-lg shadow p-8 text-center">
            <div className="flex justify-center items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="mt-4 text-gray-600">Loading lecturers...</p>
          </div>
        ) : (
        //   {/* Table */}
          <div className="rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold ">Staff ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold ">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold ">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold ">Department</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold ">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold ">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLecturers.length > 0 ? (
                  filteredLecturers.map(lecturer => (
                    <tr key={lecturer.id} className="hover:bg-gray-50/30 hover:text-black transition">
                      <td className="px-6 py-4 text-sm  font-medium">{lecturer.staffId}</td>
                      <td className="px-6 py-4 text-sm ">{lecturer.firstName} {lecturer.lastName}</td>
                      <td className="px-6 py-4 text-sm ">{lecturer.user.email}</td>
                      <td className="px-6 py-4 text-sm ">{lecturer.department.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          lecturer.user.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {lecturer.user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(lecturer)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(lecturer.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      {searchTerm ? 'No lecturers found matching your search.' : 'No lecturers found. Create one to get started.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}