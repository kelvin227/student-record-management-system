'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';

export interface Semester {
  id: string;
  name: string;
  sessionId: string;
  sessionName?: string;
}

interface Session {
  id: string;
  name: string;
  isActive: boolean;
}

export default function SemestersComp() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sessionId: '',
  });


  useEffect(() => {
      // Initialize data on mount
  if (semesters.length === 0 && sessions.length === 0) {
    Promise.all([fetchSemesters(), fetchSessions()]);
  }
  })

  // Fetch semesters
  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/semesters');
      if (!response.ok) throw new Error('Failed to fetch semesters');
      const data = await response.json();
      setSemesters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching semesters');
    } finally {
      setLoading(false);
    }
  };

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/admin/sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching sessions');
    }
  };



  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/admin/semesters?id=${editingId}` : '/api/admin/semesters';

      const updatedFormData = {
        ...formData,
        id: editingId,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFormData),
      });

      if (!response.ok) throw new Error('Failed to save semester');

      await fetchSemesters();
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', sessionId: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving semester');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (semester: Semester) => {
    setEditingId(semester.id);
    setFormData({ name: semester.name, sessionId: semester.sessionId });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this semester?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/semesters?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete semester');
      await fetchSemesters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting semester');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', sessionId: '' });
  };

  const getSessionName = (sessionId: string) => {
    return sessions.find((s) => s.id === sessionId)?.name || 'Unknown';
  };

  return (
    <div className="p-6 w-full rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Semesters</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Add Semester
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className=" border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Semester Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Session
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && semesters.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : semesters.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-center">
                  No semesters found. Add one to get started.
                </td>
              </tr>
            ) : (
              semesters.map((semester) => (
                <tr key={semester.id} className="border-b hover:text-black hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{semester.name}</td>
                  <td className="px-4 py-3 ">{getSessionName(semester.sessionId)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(semester)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(semester.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <Dialog open={showModal} defaultOpen={false}>
          <DialogContent className="rounded-lg shadow-lg max-w-md w-full p-6">
            <DialogTitle className="text-xl font-bold mb-4">
              {editingId ? 'Edit Semester' : 'Add Semester'}
            </DialogTitle>


            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Semester Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Semester Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., First Semester"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Session */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Session
                </label>
                <select
                  value={formData.sessionId}
                  onChange={(e) =>
                    setFormData({ ...formData, sessionId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-popover"
                  required
                >
                  <option value="">Select a session</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg transition"
                >
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}