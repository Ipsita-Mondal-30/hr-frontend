'use client';

import EmployeeSupportPanel from '@/components/support/EmployeeSupportPanel';

export default function HRSupportPage() {
  return <EmployeeSupportPanel apiBase="/hr/support" title="Employee Support" />;
}
