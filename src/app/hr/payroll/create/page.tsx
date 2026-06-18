'use client';

import { Suspense } from 'react';
import CreatePayrollForm from '@/components/payroll/CreatePayrollForm';

export default function HRCreatePayrollPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading payroll form...</div>}>
      <CreatePayrollForm
        payrollApiPath="/hr/payroll"
        employeesApiPath="/hr/employees"
        redirectPath="/hr/payroll"
      />
    </Suspense>
  );
}
