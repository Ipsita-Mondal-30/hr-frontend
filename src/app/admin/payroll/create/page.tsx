'use client';

import { Suspense } from 'react';
import CreatePayrollForm from '@/components/payroll/CreatePayrollForm';

export default function AdminCreatePayrollPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading payroll form...</div>}>
      <CreatePayrollForm
        payrollApiPath="/admin/payroll"
        employeesApiPath="/admin/employees"
        redirectPath="/admin/payroll"
      />
    </Suspense>
  );
}
