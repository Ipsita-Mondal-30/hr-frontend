import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function apiRoot() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080')
    .trim()
    .replace(/\/api\/?$/i, '')
    .replace(/\/$/, '');
}

/**
 * Google redirects here on the Vercel origin. We complete the code exchange
 * on the backend server-side so the browser never visits onrender.com.
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const fail = (message: string) => {
    const login = new URL('/login', origin);
    login.searchParams.set('error', 'oauth_failed');
    login.searchParams.set('message', message);
    return NextResponse.redirect(login);
  };

  const oauthError = req.nextUrl.searchParams.get('error');
  if (oauthError) {
    return fail(req.nextUrl.searchParams.get('error_description') || oauthError);
  }

  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return fail('Google did not return an authorization code.');
  }

  const target = new URL(`${apiRoot()}/api/auth/google/callback`);
  req.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  try {
    const res = await fetch(target.toString(), {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-store',
      headers: {
        Origin: origin,
        Referer: `${origin}/login`,
        'X-Frontend-URL': origin,
        'X-OAuth-Redirect-Uri': `${origin}/api/auth/google/callback`,
      },
    });

    const location = res.headers.get('location');
    if (location) {
      return NextResponse.redirect(new URL(location, origin));
    }

    return fail('Sign-in completed but the server did not return a session.');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Backend sign-in failed';
    return fail(message);
  }
}
