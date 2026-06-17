'use client';

import CreatePayrollForm from '@/components/payroll/CreatePayrollForm';

export default function HRCreatePayrollPage() {
  return (
    <CreatePayrollForm
      payrollApiPath="/hr/payroll"
      employeesApiPath="/hr/employees"
      redirectPath="/hr/payroll"
    />
  );
}
