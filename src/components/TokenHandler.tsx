'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@/lib/cookies';

export default function TokenHandler() {
  const router = useRouter();

  useEffect(() => {
    // Check if there's a token in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      console.log('Token found in URL, setting in cookies:', token);
      setAuthToken(token);
      
      // Remove token from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Refresh the page to trigger AuthContext
      window.location.reload();
    }
  }, [router]);

  return null; // This component doesn't render anything
}