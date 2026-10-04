import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { test } from 'node:test';
import { createRequestHandler } from '../server.mjs';
import { validateSignupFields } from '../form-validation.js';
import { submitWaitlistSignup } from '../supabase-signup.js';

function response(status, payload) {
  return { ok: status >= 200 && status < 300, status, async json() { return payload; } };
}

async function handlerRequest(options, method, url) {
  const incoming = Readable.from([]);
  incoming.method = method;
  incoming.url = url;
  const output = { status: 0, headers: {}, body: '' };
  const outgoing = {
    setHeader(name, value) { output.headers[name.toLowerCase()] = value; },
    writeHead(status, headers = {}) {
      output.status = status;
      for (const [name, value] of Object.entries(headers)) output.headers[name.toLowerCase()] = value;
    },
    end(body = '') { output.body = Buffer.isBuffer(body) ? body.toString('utf8') : String(body); },
  };
  await createRequestHandler(options)(incoming, outgoing);
  return output;
}

const validSignup = { first_name: '  Ada  ', last_name: ' Obi ', gender: '', email: ' ADA.OBI@Example.com ' };

test('form validation requires names and a valid email while gender stays optional', () => {
  const valid = validateSignupFields(new MapFormData(validSignup));
  assert.equal(valid.valid, true);
  assert.equal(valid.values.first_name, 'Ada');
  assert.equal(valid.values.last_name, 'Obi');
  assert.equal(valid.values.gender, '');

  const missing = validateSignupFields(new MapFormData({ first_name: ' ', last_name: '', email: '' }));
  assert.equal(missing.valid, false);
  assert.ok(missing.errors.first_name);
  assert.ok(missing.errors.last_name);
  assert.ok(missing.errors.email);

  const invalidEmail = validateSignupFields(new MapFormData({ ...validSignup, email: 'not-an-email' }));
  assert.match(invalidEmail.errors.email, /doesn’t look/i);
});

class MapFormData {
  constructor(values) { this.values = values; }
  get(key) { return this.values[key] ?? null; }
}

test('Supabase request inserts normalized form data using only the publishable key', async () => {
  let insertUrl;
  let insertOptions;
  const result = await submitWaitlistSignup(validSignup, {
    fetchImpl: async (url, options) => {
      if (url === '/api/config') return response(200, { url: 'https://ctlhtxdaewgpcqvykmhz.supabase.co', publishableKey: 'sb_publishable_test_value', development: true });
      insertUrl = url;
      insertOptions = options;
      return response(201, null);
    },
  });

  assert.deepEqual(result, { status: 'success' });
  assert.equal(insertUrl, 'https://ctlhtxdaewgpcqvykmhz.supabase.co/rest/v1/waitlist_signups');
  assert.equal(insertOptions.method, 'POST');
  assert.equal(insertOptions.headers.apikey, 'sb_publishable_test_value');
  assert.equal(insertOptions.headers.Authorization, undefined);
  assert.equal(insertOptions.headers.Prefer, 'return=minimal');
  assert.doesNotMatch(insertUrl, /select/i);
  assert.deepEqual(JSON.parse(insertOptions.body), {
    first_name: 'Ada', last_name: 'Obi', gender: null, email: 'ada.obi@example.com', source: 'landing_page', status: 'waitlist',
  });
});

test('duplicate SQLSTATE is converted to a friendly duplicate result', async () => {
  for (const supabaseResponse of [response(409, { code: '23505', message: 'duplicate key value violates unique constraint' }), response(409, {})]) {
    let fetchCount = 0;
    const result = await submitWaitlistSignup(validSignup, {
      fetchImpl: async (url) => {
        fetchCount++;
        return url === '/api/config'
          ? response(200, { url: 'https://ctlhtxdaewgpcqvykmhz.supabase.co', publishableKey: 'sb_publishable_test_value' })
          : supabaseResponse;
      },
    });
    assert.equal(fetchCount, 2);
    assert.deepEqual(result, { status: 'duplicate' });
  }
});

test('network, project configuration, and Supabase errors are safe for the form', async () => {
  const configMissing = await submitWaitlistSignup(validSignup, { fetchImpl: async () => response(200, { url: 'https://ctlhtxdaewgpcqvykmhz.supabase.co', publishableKey: null }) });
  assert.deepEqual(configMissing, { status: 'not_configured' });

  const networkFailure = await submitWaitlistSignup(validSignup, {
    fetchImpl: async (url) => {
      if (url === '/api/config') return response(200, { url: 'https://ctlhtxdaewgpcqvykmhz.supabase.co', publishableKey: 'sb_publishable_test_value' });
      throw new TypeError('network failed');
    },
  });
  assert.deepEqual(networkFailure, { status: 'network_error' });

  let diagnostics;
  const apiFailure = await submitWaitlistSignup(validSignup, {
    fetchImpl: async (url) => url === '/api/config'
      ? response(200, { url: 'https://ctlhtxdaewgpcqvykmhz.supabase.co', publishableKey: 'sb_publishable_test_value', development: true })
      : response(500, { code: 'XX000', message: 'private database detail' }),
    logError: (value) => { diagnostics = value; },
  });
  assert.deepEqual(apiFailure, { status: 'supabase_error' });
  assert.deepEqual(diagnostics, { stage: 'supabase', type: 'http', status: 500, code: 'XX000', development: true });
  assert.doesNotMatch(JSON.stringify(diagnostics), /private database detail|publishable|service_role/i);
});

test('runtime config exposes only public values and static serving cannot expose environment or migration files', async () => {
  const config = await handlerRequest({ config: { url: 'https://ctlhtxdaewgpcqvykmhz.supabase.co', publishableKey: 'sb_publishable_example', development: true } }, 'GET', '/api/config');
  assert.equal(config.status, 200);
  assert.deepEqual(JSON.parse(config.body), { url: 'https://ctlhtxdaewgpcqvykmhz.supabase.co', publishableKey: 'sb_publishable_example', development: true });

  assert.equal((await handlerRequest({}, 'GET', '/')).status, 200);
  for (const privatePath of ['/.env', '/.env.local', '/server.mjs', '/supabase/migrations/20261004194000_create_waitlist_signups.sql']) {
    assert.equal((await handlerRequest({}, 'GET', privatePath)).status, 404, `${privatePath} must not be publicly served`);
  }
});

test('migration enables insert-only anon access, uniqueness, and no public read/write policy', async () => {
  const migration = await readFile(new URL('../supabase/migrations/20261004194000_create_waitlist_signups.sql', import.meta.url), 'utf8');
  assert.match(migration, /create table if not exists public\.waitlist_signups/i);
  assert.match(migration, /constraint waitlist_signups_email_unique unique \(email\)/i);
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /grant insert \(first_name, last_name, gender, email, source, status\)[\s\S]+?to anon/i);
  assert.match(migration, /for insert\s+to anon/i);
  assert.match(migration, /revoke all privileges on table public\.waitlist_signups from public, anon, authenticated/i);
  assert.match(migration, /grant insert \(first_name, last_name, gender, email, source, status\)[\s\S]+?to anon/i);
  assert.doesNotMatch(migration, /create policy[^;]+\bfor\s+(select|update|delete)\b/i);
});
