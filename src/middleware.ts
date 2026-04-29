import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';
import { Ratelimit } from '@upstash/ratelimit';
import { jwtVerify } from 'jose';

// Rate Limiter Global
const globalRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
});

// Rate Limiter por Tenant
const aiTenantRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
});

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-change-in-prod');

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0] : '127.0.0.1';

  // 1. Rate Limiting Global
  try {
    const { success } = await globalRatelimit.limit(`global_${ip}`);
    if (!success) return new NextResponse('Too Many Requests', { status: 429 });
  } catch (err) {
    console.warn("Ratelimit falló, ignorando...", err);
  }

  const currentHost =
    process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'
      ? hostname.replace(`.tu-dominio.com`, '')
      : hostname.replace(`.localhost:3000`, '');

  if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/static') || url.pathname.includes('.')) {
    return NextResponse.next();
  }

  if (currentHost && currentHost !== 'localhost:3000' && currentHost !== 'tu-dominio.com' && currentHost !== 'www') {
    
    // 2. Auth: Validar JWT real
    const token = request.cookies.get('auth_token')?.value;
    
    if (url.pathname.startsWith('/api') || url.pathname !== '/') {
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      try {
        await jwtVerify(token, JWT_SECRET);
      } catch (err) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    // 3. Rate Limiting IA
    if (url.pathname.includes('/actions/ai')) {
      const { success } = await aiTenantRatelimit.limit(`ai_tenant_${currentHost}`);
      if (!success) return NextResponse.json({ error: "Límite IA excedido" }, { status: 429 });
    }

    url.pathname = `/${currentHost}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
