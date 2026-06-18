export type RoleDepartmentRef = string | { _id: string; name: string } | null | undefined;

export function getRoleDepartmentId(departmentId: RoleDepartmentRef): string {
  if (!departmentId) return '';
  if (typeof departmentId === 'string') return departmentId;
  return departmentId._id || '';
}

export function getRoleDepartmentName(departmentId: RoleDepartmentRef): string {
  if (!departmentId) return '';
  if (typeof departmentId === 'string') return '';
  return departmentId.name || '';
}
