'use client';

import TokenHandler from '@/components/TokenHandler';
import { runAuthResetIfNeeded } from '@/lib/cookies';

if (typeof window !== 'undefined') {
  runAuthResetIfNeeded();
}

export default function AuthBootstrap() {
  return <TokenHandler />;
}
