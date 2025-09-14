'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@/lib/cookies';

export default function TokenHandler() {
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 TokenHandler - checking URL for token');
    console.log('🔍 TokenHandler - current URL:', window.location.href);
    
    // Check if there's a token in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    console.log('🔍 TokenHandler - token from URL:', token ? 'Found' : 'Not found');
    
    if (token) {
      console.log('✅ Token found in URL, setting in cookies:', token.substring(0, 20) + '...');
      setAuthToken(token);
      
      // Remove token from URL
      const newUrl = window.location.pathname;
      console.log('🔄 Removing token from URL, new URL:', newUrl);
      window.history.replaceState({}, '', newUrl);
      
      // Refresh the page to trigger AuthContext
      console.log('🔄 Reloading page to trigger AuthContext');
      window.location.reload();
    } else {
      console.log('ℹ️ No token in URL, continuing normally');
    }
  }, [router]);

  return null; // This component doesn't render anything
}