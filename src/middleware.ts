import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';
import { Ratelimit } from '@upstash/ratelimit';

// Rate Limiter Global (100 reqs / min por IP)
const globalRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
});

// Rate Limiter por Tenant para llamadas a IA (20 reqs / min por Tenant)
const aiTenantRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
});

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0] : '127.0.0.1';

  // 1. Rate Limiting Global
  try {
    const { success, limit, reset, remaining } = await globalRatelimit.limit(`global_${ip}`);
    if (!success) {
      return new NextResponse(
        `<html>
          <body style="font-family: system-ui, sans-serif; background: #F9FAFB; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="background: white; padding: 2rem; border-radius: 1rem; border: 1px solid #E2E8F0; text-align: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <h1 style="color: #1E293B; margin-bottom: 0.5rem;">429 - Too Many Requests</h1>
              <p style="color: #64748B;">Has excedido el límite de peticiones. Por favor, intenta más tarde.</p>
            </div>
          </body>
        </html>`,
        {
          status: 429,
          headers: {
            'Content-Type': 'text/html',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }
  } catch (err) {
    console.warn("Ratelimit falló (¿Falta de env vars?), ignorando...", err);
  }

  const currentHost =
    process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'
      ? hostname.replace(`.tu-dominio.com`, '')
      : hostname.replace(`.localhost:3000`, '');

  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static') ||
    url.pathname.startsWith('/super') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Si hay un subdominio válido
  if (currentHost && currentHost !== 'localhost:3000' && currentHost !== 'tu-dominio.com' && currentHost !== 'www') {
    
    // 2. Edge Middleware Authentication: Verificar is_active en KV
    try {
      const isOrgActive = await kv.get<boolean>(`org_active:${currentHost}`);
      if (isOrgActive === false) {
        url.pathname = '/suspendido';
        return NextResponse.rewrite(url);
      }
    } catch (error) {
      console.warn("KV Edge Check falló, permitiendo petición...", error);
    }

    // 3. Rate Limiting Específico para IA en Tenant
    if (url.pathname.includes('/actions/ai') || url.pathname.includes('/pacientes/')) {
      try {
        const aiLimit = await aiTenantRatelimit.limit(`ai_tenant_${currentHost}`);
        if (!aiLimit.success) {
          return NextResponse.json(
            { error: "Has excedido el límite de consultas de IA por minuto para tu clínica." },
            { status: 429 }
          );
        }
      } catch (err) {
        // Fallback
      }
    }

    // 4. Protección de Endpoints y RBAC (Middleware)
    // En producción aquí validaríamos la JWT de la cookie
    const mockToken = request.cookies.get('auth_token')?.value;
    const isApiOrTenantRoute = url.pathname.startsWith('/api') || url.pathname !== '/';
    
    if (isApiOrTenantRoute && !mockToken && process.env.NODE_ENV === 'production') {
      // url.pathname = '/login';
      // return NextResponse.rewrite(url);
    }

    // Reescribir la URL para el tenant routing
    url.pathname = `/${currentHost}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
