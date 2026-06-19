'use client';

import { notify } from '@/lib/notify';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Employee {
  _id: string;
  user?: { name?: string; email?: string };
  position?: string;
}

interface Department {
  _id: string;
  name: string;
}

interface TeamMemberRow {
  employeeId: string;
  employeeName: string;
  role: string;
  contributionPercentage: number;
  hoursWorked: number;
}

interface ProjectForm {
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  estimatedHours: string;
  actualHours: string;
  completionPercentage: string;
  budget: string;
  actualCost: string;
  client: string;
  department: string;
  projectManager: string;
}

const STATUS_OPTIONS = ['planning', 'active', 'on-hold', 'completed', 'cancelled'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'];
const ROLE_OPTIONS = ['team-member', 'developer', 'designer', 'tester', 'lead'];

function toDateInput(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function employeeLabel(emp: Employee): string {
  const name = emp.user?.name || 'Unknown';
  return emp.position ? `${name} — ${emp.position}` : name;
}

function extractEmployeeId(emp: Employee | string | null | undefined): string {
  if (!emp) return '';
  return typeof emp === 'string' ? emp : emp._id || '';
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberRow[]>([]);
  const [addEmployeeId, setAddEmployeeId] = useState('');

  const [form, setForm] = useState<ProjectForm>({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    estimatedHours: '0',
    actualHours: '0',
    completionPercentage: '0',
    budget: '0',
    actualCost: '0',
    client: '',
    department: '',
    projectManager: '',
  });

  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectRes, employeesRes, departmentsRes] = await Promise.all([
        api.get(`/projects/${projectId}`, { skipAuthRedirect: true }),
        api.get('/employees?limit=200', { skipAuthRedirect: true }),
        api.get('/departments', { skipAuthRedirect: true }).catch(() => ({ data: [] })),
      ]);

      const project = projectRes.data?.project ?? projectRes.data;
      if (!project?._id) {
        setError('Project not found');
        return;
      }

      const deptList = Array.isArray(departmentsRes.data)
        ? departmentsRes.data
        : departmentsRes.data?.departments || [];
      setDepartments(deptList);

      const empList = employeesRes.data?.employees || [];
      setEmployees(empList);

      setForm({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'planning',
        priority: project.priority || 'medium',
        startDate: toDateInput(project.startDate),
        endDate: toDateInput(project.endDate),
        estimatedHours: String(project.estimatedHours ?? 0),
        actualHours: String(project.actualHours ?? 0),
        completionPercentage: String(project.completionPercentage ?? 0),
        budget: String(project.budget ?? 0),
        actualCost: String(project.actualCost ?? 0),
        client: project.client || '',
        department: extractEmployeeId(project.department),
        projectManager: extractEmployeeId(project.projectManager),
      });

      setTeamMembers(
        (project.teamMembers ?? []).map(
          (member: {
            employee?: Employee | string;
            role?: string;
            contributionPercentage?: number;
            hoursWorked?: number;
          }) => {
            const emp = member.employee;
            const employeeId = extractEmployeeId(emp);
            const employeeName =
              emp && typeof emp === 'object'
                ? emp.user?.name || 'Unknown'
                : empList.find((e: Employee) => e._id === employeeId)?.user?.name || 'Unknown';

            return {
              employeeId,
              employeeName,
              role: member.role || 'team-member',
              contributionPercentage: member.contributionPercentage ?? 0,
              hoursWorked: member.hoursWorked ?? 0,
            };
          }
        )
      );
    } catch (err) {
      console.error('Failed to load project:', err);
      setError('Could not load project. Check that you are logged in and the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) loadProject();
  }, [projectId, loadProject]);

  const updateField = (field: keyof ProjectForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addTeamMember = () => {
    if (!addEmployeeId) return;
    if (teamMembers.some((m) => m.employeeId === addEmployeeId)) {
      notify('Employee is already on the team');
      return;
    }
    const emp = employees.find((e) => e._id === addEmployeeId);
    if (!emp) return;

    setTeamMembers((prev) => [
      ...prev,
      {
        employeeId: emp._id,
        employeeName: emp.user?.name || 'Unknown',
        role: 'team-member',
        contributionPercentage: 0,
        hoursWorked: 0,
      },
    ]);
    setAddEmployeeId('');
  };

  const removeTeamMember = (employeeId: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.employeeId !== employeeId));
  };

  const updateTeamMember = (
    employeeId: string,
    field: keyof Omit<TeamMemberRow, 'employeeId' | 'employeeName'>,
    value: string | number
  ) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.employeeId === employeeId ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      notify('Project name is required');
      return;
    }
    if (!form.description.trim()) {
      notify('Description is required');
      return;
    }
    if (!form.startDate) {
      notify('Start date is required');
      return;
    }
    if (!form.projectManager) {
      notify('Project manager is required');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        startDate: form.startDate,
        estimatedHours: Number(form.estimatedHours) || 0,
        actualHours: Number(form.actualHours) || 0,
        completionPercentage: Math.min(100, Math.max(0, Number(form.completionPercentage) || 0)),
        budget: Number(form.budget) || 0,
        actualCost: Number(form.actualCost) || 0,
        projectManager: form.projectManager,
        teamMembers: teamMembers.map((m) => ({
          employee: m.employeeId,
          role: m.role,
          contributionPercentage: Number(m.contributionPercentage) || 0,
          hoursWorked: Number(m.hoursWorked) || 0,
        })),
      };

      if (form.endDate) payload.endDate = form.endDate;
      if (form.client.trim()) payload.client = form.client.trim();
      if (form.department) payload.department = form.department;

      await api.put(`/projects/${projectId}`, payload, { skipAuthRedirect: true });
      router.push('/admin/projects');
    } catch (err) {
      console.error('Failed to save project:', err);
      notify('Failed to save project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const availableEmployees = employees.filter(
    (e) => !teamMembers.some((m) => m.employeeId === e._id)
  );

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">{error}</div>
        <Link href="/admin/projects" className="text-blue-600 hover:underline">
          ← Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/admin/projects" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← Back to projects
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
          <p className="text-gray-600">Update project details, team, and timeline</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 divide-y divide-gray-200">
        <section className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => updateField('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <input
              type="text"
              value={form.client}
              onChange={(e) => updateField('client', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional client name"
            />
          </div>

          {departments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={form.department}
                onChange={(e) => updateField('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        <section className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Timeline & progress</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start date *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => updateField('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated hours</label>
              <input
                type="number"
                min={0}
                value={form.estimatedHours}
                onChange={(e) => updateField('estimatedHours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual hours</label>
              <input
                type="number"
                min={0}
                value={form.actualHours}
                onChange={(e) => updateField('actualHours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Completion %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.completionPercentage}
                onChange={(e) => updateField('completionPercentage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <section className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Budget</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
              <input
                type="number"
                min={0}
                value={form.budget}
                onChange={(e) => updateField('budget', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual cost ($)</label>
              <input
                type="number"
                min={0}
                value={form.actualCost}
                onChange={(e) => updateField('actualCost', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <section className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Team</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project manager *</label>
            <select
              value={form.projectManager}
              onChange={(e) => updateField('projectManager', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select project manager</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {employeeLabel(emp)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team members</label>

            {teamMembers.length === 0 ? (
              <p className="text-sm text-gray-500 mb-3">No team members assigned yet.</p>
            ) : (
              <div className="space-y-3 mb-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.employeeId}
                    className="flex flex-wrap items-end gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1 min-w-[140px]">
                      <span className="text-xs text-gray-500">Member</span>
                      <p className="font-medium text-gray-900">{member.employeeName}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Role</label>
                      <select
                        value={member.role}
                        onChange={(e) => updateTeamMember(member.employeeId, 'role', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Contribution %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={member.contributionPercentage}
                        onChange={(e) =>
                          updateTeamMember(member.employeeId, 'contributionPercentage', Number(e.target.value))
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Hours</label>
                      <input
                        type="number"
                        min={0}
                        value={member.hoursWorked}
                        onChange={(e) =>
                          updateTeamMember(member.employeeId, 'hoursWorked', Number(e.target.value))
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTeamMember(member.employeeId)}
                      className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <select
                value={addEmployeeId}
                onChange={(e) => setAddEmployeeId(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Add team member…</option>
                {availableEmployees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {employeeLabel(emp)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addTeamMember}
                disabled={!addEmployeeId}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 disabled:opacity-50 text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </section>

        <div className="p-6 flex flex-wrap gap-3 justify-end bg-gray-50 rounded-b-lg">
          <Link
            href="/admin/projects"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
