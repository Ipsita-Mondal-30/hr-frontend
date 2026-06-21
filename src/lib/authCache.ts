const USER_CACHE_KEY = 'userCache';

type CachedUser = {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'candidate' | 'employee';
  isVerified?: boolean;
  phone?: string;
  position?: string;
  company?: string;
  industry?: string;
  companySize?: string;
  [key: string]: unknown;
};

export function getCachedUser(): CachedUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedUser;
  } catch {
    return null;
  }
}

export function setCachedUser(user: CachedUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } catch {
    // ignore quota errors
  }
}

export function clearCachedUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_CACHE_KEY);
}
