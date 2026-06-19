'use client';

import { notify } from '@/lib/notify';
import { useState } from 'react';
import api from '@/lib/api';

interface Employee {
  _id: string;
  user?: { name?: string };
}

interface AdminMilestonePanelProps {
  projectId: string;
  employees: Employee[];
  onCreated?: () => void;
}

export default function AdminMilestonePanel({
  projectId,
  employees,
  onCreated,
}: AdminMilestonePanelProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleAssignee = (id: string) => {
    setAssignedTo((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submit = async () => {
    if (!title.trim() || !dueDate) {
      notify('Title and due date are required');
      return;
    }
    setLoading(true);
    try {
      await api.post(
        `/projects/${projectId}/milestones`,
        { title, description, dueDate, assignedTo },
        { skipAuthRedirect: true }
      );
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssignedTo([]);
      onCreated?.();
    } catch (e) {
      console.error(e);
      notify('Failed to create milestone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
      <h4 className="font-semibold text-gray-900">Assign milestone</h4>
      <input
        type="text"
        placeholder="Milestone title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 border rounded-md text-sm"
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border rounded-md text-sm"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full px-3 py-2 border rounded-md text-sm"
      />
      {employees.length > 0 && (
        <div>
          <p className="text-xs text-gray-600 mb-2">Assign to employees:</p>
          <div className="flex flex-wrap gap-2">
            {employees.map((emp) => (
              <label key={emp._id} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={assignedTo.includes(emp._id)}
                  onChange={() => toggleAssignee(emp._id)}
                />
                {emp.user?.name || emp._id}
              </label>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating…' : 'Create milestone'}
      </button>
    </div>
  );
}
