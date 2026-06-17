'use client';

import EmployeeSupportPanel from '@/components/support/EmployeeSupportPanel';

export default function AdminSupportTicketsPage() {
  return (
    <EmployeeSupportPanel
      apiBase="/admin/support"
      title="Employee Support & Requests"
    />
  );
}
