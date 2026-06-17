import api from './api';

export async function downloadPayslip(payrollId: string, options?: { stamped?: boolean }) {
  const stamped = options?.stamped ?? false;
  const params = stamped ? '?stamped=true' : '';

  const response = await api.get(`/employees/me/payroll/${payrollId}/download${params}`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const disposition = response.headers['content-disposition'] as string | undefined;
  const filenameMatch = disposition?.match(/filename="(.+)"/);
  link.download = filenameMatch?.[1] || `payslip-${payrollId}${stamped ? '-official' : ''}.pdf`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
