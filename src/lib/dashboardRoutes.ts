export type AppRole = 'admin' | 'hr' | 'candidate' | 'employee';

export function getDashboardPath(role?: string | null): string | null {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'hr':
      return '/hr/dashboard';
    case 'candidate':
      return '/candidate/dashboard';
    case 'employee':
      return '/employee/dashboard';
    default:
      return null;
  }
}

export function getRoleDescription(role?: string | null): string {
  switch (role) {
    case 'admin':
      return 'Manage the entire HR system, approve jobs, and oversee all operations.';
    case 'hr':
      return 'Post jobs, review applications, and manage the hiring process.';
    case 'candidate':
      return 'Browse jobs, submit applications, and track your progress.';
    case 'employee':
      return 'View your projects, performance, payroll, and team feedback.';
    default:
      return 'Choose your role to access your dashboard and features.';
  }
}
