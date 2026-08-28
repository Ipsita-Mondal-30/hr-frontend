'use client';

import { useEffect } from 'react';
import TokenHandler from '@/components/TokenHandler';
import { runAuthResetIfNeeded } from '@/lib/cookies';

export default function AuthBootstrap() {
  useEffect(() => {
    runAuthResetIfNeeded();
  }, []);

  return <TokenHandler />;
}
