export async function submitWaitlistSignup(signup, { fetchImpl = fetch, logError = () => {} } = {}) {
  let configResponse;
  try {
    configResponse = await fetchImpl('/api/config', { headers: { Accept: 'application/json' } });
  } catch {
    logError({ stage: 'config', type: 'network' });
    return { status: 'network_error' };
  }

  if (!configResponse.ok) {
    logError({ stage: 'config', type: 'http', status: configResponse.status });
    return { status: 'config_error' };
  }

  let config;
  try {
    config = await configResponse.json();
  } catch {
    logError({ stage: 'config', type: 'invalid_json' });
    return { status: 'config_error' };
  }
  if (!config?.url || !config?.publishableKey) return { status: 'not_configured' };

  let endpoint;
  try {
    const projectUrl = new URL(config.url);
    if (projectUrl.protocol !== 'https:') return { status: 'config_error' };
    endpoint = new URL('/rest/v1/waitlist_signups', projectUrl).toString();
  } catch {
    return { status: 'config_error' };
  }

  let response;
  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        apikey: config.publishableKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        first_name: signup.first_name.trim(),
        last_name: signup.last_name.trim(),
        gender: signup.gender || null,
        email: signup.email.trim().toLowerCase(),
        source: 'landing_page',
        status: 'waitlist',
      }),
    });
  } catch {
    logError({ stage: 'supabase', type: 'network' });
    return { status: 'network_error' };
  }

  if (response.status === 409) return { status: 'duplicate' };
  if (!response.ok) {
    let code;
    try { code = (await response.json())?.code; } catch { /* body is not needed for the UI */ }
    if (code === '23505') return { status: 'duplicate' };
    logError({ stage: 'supabase', type: 'http', status: response.status, code: typeof code === 'string' ? code : undefined, development: Boolean(config.development) });
    return { status: 'supabase_error' };
  }
  return { status: 'success' };
}
