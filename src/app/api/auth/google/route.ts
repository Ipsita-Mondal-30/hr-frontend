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
 * Start Google OAuth from the Vercel origin.
 * Chrome Safe Browsing flags top-level navigations to
 * onrender.com/api/auth/google?frontend=https://... as phishing.
 * The browser goes: this app → accounts.google.com → this app callback.
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

  // Wake a sleeping Render instance so the callback is less likely to 502.
  void fetch(`${backend}/health`, { cache: 'no-store' }).catch(() => undefined);

  const isLocal = /localhost|127\.0\.0\.1/.test(origin);
  // Production: Google returns here so Chrome never opens the flagged onrender.com host.
  // Add this URI in Google Cloud Console → Authorized redirect URIs:
  //   https://hr-frontend-54b2.vercel.app/api/auth/google/callback
  // Local: keep the existing localhost:8080 callback already registered.
  const redirectUri = isLocal
    ? `${backend}/api/auth/google/callback`
    : `${origin}/api/auth/google/callback`;
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
