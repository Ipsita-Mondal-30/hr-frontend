'use client';

import CreatePayrollForm from '@/components/payroll/CreatePayrollForm';

export default function AdminCreatePayrollPage() {
  return (
    <CreatePayrollForm
      payrollApiPath="/admin/payroll"
      employeesApiPath="/admin/employees"
      redirectPath="/admin/payroll"
    />
  );
}
