import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PRODUCTION_CLIENT_ID =
  '287757605983-4injpbdvq2p8477bth9ef4t8djbmbjpn.apps.googleusercontent.com';

function apiRoot() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080')
    .trim()
    .replace(/\/api\/?$/i, '')
    .replace(/\/$/, '');
}

function googleClientId() {
  return (
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    PRODUCTION_CLIENT_ID
  );
}

/**
 * The backend must exchange the Google code with the same redirect_uri that was
 * sent to Google. Only backends that read the X-OAuth-Redirect-Uri header can
 * complete a code that was returned to this Vercel origin.
 */
async function backendSupportsProxiedCallback(backend: string, origin: string) {
  try {
    const res = await fetch(`${backend}/api/auth/me`, {
      method: 'OPTIONS',
      cache: 'no-store',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'x-oauth-redirect-uri',
      },
      signal: AbortSignal.timeout(8000),
    });
    const allowed = (res.headers.get('access-control-allow-headers') || '').toLowerCase();
    return allowed.includes('x-oauth-redirect-uri');
  } catch {
    return false;
  }
}

/**
 * Start Google OAuth from the Vercel origin.
 * Chrome Safe Browsing flags top-level navigations to
 * onrender.com/api/auth/google?frontend=https://... as phishing.
 * The browser goes: this app → accounts.google.com → callback.
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const backend = apiRoot();
  const clientId = googleClientId();

  if (!clientId) {
    const login = new URL('/login', origin);
    login.searchParams.set('error', 'oauth_failed');
    login.searchParams.set('message', 'Google sign-in is not configured.');
    return NextResponse.redirect(login);
  }

  const isLocal = /localhost|127\.0\.0\.1/.test(origin);
  // Vercel callback needs https://hr-frontend-54b2.vercel.app/api/auth/google/callback
  // in Google Cloud Console; the backend callback URI is already registered.
  const useProxiedCallback =
    !isLocal && (await backendSupportsProxiedCallback(backend, origin));
  const redirectUri = useProxiedCallback
    ? `${origin}/api/auth/google/callback`
    : `${backend}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'profile email',
    access_type: 'online',
    prompt: 'select_account',
    state: origin,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    302
  );
}
