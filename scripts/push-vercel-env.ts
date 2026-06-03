/**
 * Push variables from .env.local to the linked Vercel project.
 * Usage: npx tsx scripts/push-vercel-env.ts
 */
import { execFileSync } from 'node:child_process';
import { config } from 'dotenv';

config({ path: '.env.local' });

const PRODUCTION_URL =
  process.env.VERCEL_PRODUCTION_URL || 'https://scw-villaments-portal.vercel.app';

const sensitive = new Set([
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
  'GOOGLE_PRIVATE_KEY',
]);

function addEnv(name: string, value: string, target: 'production' | 'preview' | 'development') {
  if (!value) {
    console.log(`skip ${name} (${target}): empty`);
    return;
  }

  const args = ['env', 'add', name, target, '--force'];
  if (sensitive.has(name)) {
    args.push('--sensitive');
  }

  execFileSync('vercel', args, {
    input: value,
    stdio: ['pipe', 'inherit', 'inherit'],
    cwd: process.cwd(),
  });
  console.log(`set ${name} (${target})`);
}

const shared = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? '',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? '',
  GOOGLE_SHEETS_ID: process.env.GOOGLE_SHEETS_ID ?? '',
  TEST_GOOGLE_SHEETS_ID: process.env.TEST_GOOGLE_SHEETS_ID ?? '',
  GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '',
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ?? '',
};

for (const target of ['production', 'preview'] as const) {
  console.log(`\n--- ${target} ---`);
  for (const [name, value] of Object.entries(shared)) {
    addEnv(name, value, target);
  }
  addEnv('NEXTAUTH_URL', PRODUCTION_URL, target);
}

// Development env on Vercel cannot use --sensitive vars; use local .env.local for `npm run dev`.

console.log('\nDone. Redeploy with: vercel --prod');
