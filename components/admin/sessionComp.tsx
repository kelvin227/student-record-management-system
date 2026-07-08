'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Check, X } from 'lucide-react';
import { Semester } from './semestersComp'

export interface Session {
  id: string;
  name: string;
  isActive: boolean;
  semesters?: Semester[];
}

export default function SessionComponent({userId} : {userId: string}) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', isActive: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/sessions');
      const data = await response.json();
      setSessions(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch sessions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Session name is required');
      return;
    }

    try {
        const updatedform = {
            ...formData,
            id: editingId,
            userId, 
        }
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/admin/sessions` : '/api/admin/sessions';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedform),
      });

      if (!response.ok) throw new Error('Failed to save session');
      
      setSuccess(editingId ? 'Session updated successfully' : 'Session created successfully');
      setFormData({ name: '', isActive: false });
      setEditingId(null);
      setShowForm(false);
      fetchSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (session: Session) => {
    setFormData({ name: session.name, isActive: session.isActive });
    setEditingId(session.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const response = await fetch(`/api/admin/sessions?id=${id}`, { method: 'DELETE', body: JSON.stringify({userId}) });
      if (!response.ok) throw new Error('Failed to delete session');
      
      setSuccess('Session deleted successfully');
      fetchSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', isActive: false });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Session Management</h1>
          <p className="mt-1">Manage academic sessions for the institution</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          New Session
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Form Section */}
      {showForm && (
        <div className="mb-8 p-6 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Session' : 'Create New Session'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Session Name
              </label>
              <input
                type="text"
                placeholder="e.g., 2025/2026"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className="text-xs mt-1">Format: YYYY/YYYY (e.g., 2025/2026)</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
              />
              <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                Set as Active Session
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sessions Table */}
      <div className=" border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center">
            No sessions found. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Session Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b hover:bg-gray-50 hover:text-black transition">
                    <td className="px-6 py-4 font-medium">{session.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {session.isActive ? (
                          <>
                            <Check size={18} className="text-green-600" />
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Active
                            </span>
                          </>
                        ) : (
                          <>
                            <X size={18} />
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                              Inactive
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(session)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit session"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete session"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <p>
          <strong>Note:</strong> Only one session can be active at a time. Sessions are associated with semesters and course registrations.
        </p>
      </div>
    </div>
  );
}
