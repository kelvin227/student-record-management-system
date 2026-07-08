'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Plus, Trash2, Loader } from 'lucide-react';
import { CourseRegistration } from './courseRegistrationComp';
import { Semester } from './semestersComp';

interface Lecturer {
  id: string;
  firstName: string;
  lastName: string;
  staffId: string;
  departmentId: string;
}

interface Course {
  id: string;
  code: string;
  title: string;
  creditUnit: number;
  level: number;
  departmentId: string;
  semester?: Semester;
  registrations?: CourseRegistration[];

}

export interface CourseAllocation {
  id: string;
  lecturerId: string;
  courseId: string;
  lecturer?: Lecturer;
  course?: Course;
  createdAt: string;
}

export default function CourseAllocationComp() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allocations, setAllocations] = useState<CourseAllocation[]>([]);
  
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lecturersRes, coursesRes, allocationsRes] = await Promise.all([
        fetch('/api/admin/lecturers'),
        fetch('/api/admin/courses'),
        fetch('/api/admin/courseallocations')
      ]);

      if (!lecturersRes.ok || !coursesRes.ok || !allocationsRes.ok) {
        console.log(lecturersRes.ok)
        console.log(coursesRes.ok)
        console.log(allocationsRes.ok)
        throw new Error('Failed to fetch data');
      }

      const lecturersData = await lecturersRes.json();
      const coursesData = await coursesRes.json();
      const allocationsData = await allocationsRes.json();

      setLecturers(lecturersData);
      setCourses(coursesData);
      setAllocations(allocationsData);
      setError('');
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLecturer || !selectedCourse) {
      setError('Please select both a lecturer and a course');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/admin/courseallocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lecturerId: selectedLecturer,
          courseId: selectedCourse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to allocate course');
      }

      setAllocations([...allocations, data]);
      setSuccess('Course allocated successfully!');
      setSelectedLecturer('');
      setSelectedCourse('');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to allocate course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllocation = async (allocationId: string) => {
    if (!confirm('Are you sure you want to remove this allocation?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courseallocations?id=${allocationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete allocation');
      }

      setAllocations(allocations.filter(a => a.id !== allocationId));
      setSuccess('Course allocation removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete allocation');
    } finally {
      setLoading(false);
    }
  };

  // Filter courses by lecturer's department
  const filteredCourses = selectedLecturer
    ? courses.filter(course => {
        const lecturer = lecturers.find(l => l.id === selectedLecturer);
        return course.departmentId === lecturer?.departmentId;
      })
    : courses;

  const getLecturerName = (lecturerId: string) => {
    const lecturer = lecturers.find(l => l.id === lecturerId);
    return lecturer ? `${lecturer.firstName} ${lecturer.lastName}` : 'Unknown';
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.title}` : 'Unknown';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="rounded-lg shadow">
        {/* Header */}
        <div className="border-b border-gray-500 p-6">
          <h1 className="text-3xl font-bold">Course Allocation</h1>
          <p className="mt-1">Assign courses to lecturers</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-3 bg-red-950 light:bg-red-50 border border-red-800 light:border-red-200 text-red-300 light:text-red-700 px-4 py-3 rounded-lg">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 bg-green-950 light:bg-green-50 border border-green-800 light:border-green-200 text-green-300 light:text-green-700 px-4 py-3 rounded-lg">
              <Plus size={20} />
              <span>{success}</span>
            </div>
          )}

          {/* Allocation Form */}
          <form onSubmit={handleAllocate} className="p-6 rounded-lg border border-gray-800 light:border-gray-200">
            <h2 className="text-lg font-semibold mb-4">New Allocation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Lecturer Select */}
              <div>
                <label htmlFor="lecturer" className="block text-sm font-medium  mb-2">
                  Lecturer *
                </label>
                <select
                  id="lecturer"
                  value={selectedLecturer}
                  onChange={(e) => setSelectedLecturer(e.target.value)}
                  className="w-full px-3 py-2 border bg-background border-gray-700 light:border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">Select a lecturer</option>
                  {lecturers.map(lecturer => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.firstName} {lecturer.lastName} ({lecturer.staffId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Select */}
              <div>
                <label htmlFor="course" className="block text-sm font-medium mb-2">
                  Course *
                </label>
                <select
                  id="course"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border bg-background border-gray-700 light:border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading || !selectedLecturer}
                >
                  <option value="">
                    {selectedLecturer ? 'Select a course' : 'Select lecturer first'}
                  </option>
                  {filteredCourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.title} ({course.creditUnit} units)
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !selectedLecturer || !selectedCourse}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Allocating...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Allocate
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Allocations Table */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Current Allocations</h2>
            
            {allocations.length === 0 ? (
              <div className="text-center py-8">
                <p>No allocations yet. Create one using the form above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-950 light:bg-gray-50">
                      <th className="text-left px-4 py-3 font-semibold light:text-gray-900 text-sm">Lecturer</th>
                      <th className="text-left px-4 py-3 font-semibold light:text-gray-900 text-sm">Staff ID</th>
                      <th className="text-left px-4 py-3 font-semibold light:text-gray-900 text-sm">Course</th>
                      <th className="text-left px-4 py-3 font-semibold light:text-gray-900 text-sm">Course Code</th>
                      <th className="text-left px-4 py-3 font-semibold light:text-gray-900 text-sm">Credit Units</th>
                      <th className="text-left px-4 py-3 font-semibold light:text-gray-900 text-sm">Level</th>
                      <th className="text-left px-4 py-3 font-semibold light:text-gray-900 text-sm">Allocated On</th>
                      <th className="text-center px-4 py-3 font-semibold light:text-gray-900 text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map(allocation => {
                      const lecturer = lecturers.find(l => l.id === allocation.lecturerId);
                      const course = courses.find(c => c.id === allocation.courseId);

                      return (
                        <tr key={allocation.id} className="border-b border-gray-200 hover:bg-gray-950 hover:light:bg-foreground hover:light:text-background">
                          <td className="px-4 py-3 text-sm light:text-gray-900">
                            {lecturer ? `${lecturer.firstName} ${lecturer.lastName}` : 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-sm light:text-gray-600">
                            {lecturer?.staffId || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm light:text-gray-900">
                            {course?.title || 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-sm light:text-gray-600">
                            {course?.code || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm light:text-gray-600">
                            {course?.creditUnit || '-'} units
                          </td>
                          <td className="px-4 py-3 text-sm light:text-gray-600">
                            {course?.level ? `Level ${course.level}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm light:text-gray-600">
                            {new Date(allocation.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDeleteAllocation(allocation.id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-900 disabled:text-gray-400 transition"
                              title="Delete allocation"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}