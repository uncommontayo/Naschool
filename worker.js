const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; connect-src 'self' https://*.supabase.co; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/config') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        const headers = new Headers(securityHeaders);
        headers.set('Allow', 'GET, HEAD');
        headers.set('Cache-Control', 'no-store');
        return Response.json(
          { message: 'Method not allowed.' },
          { status: 405, headers },
        );
      }

      const headers = new Headers(securityHeaders);
      headers.set('Content-Type', 'application/json; charset=utf-8');
      headers.set('Cache-Control', 'no-store');
      return new Response(request.method === 'HEAD' ? null : JSON.stringify({
        url: env.SUPABASE_URL ?? null,
        publishableKey: env.SUPABASE_PUBLISHABLE_KEY ?? null,
        development: false,
      }), {
        headers,
      });
    }

    return env.ASSETS.fetch(request);
  },
};
