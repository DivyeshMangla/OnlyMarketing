// config.ts — Central configuration module; validates and exports all environment variables.
/**
 * Central configuration module.
 *
 * All environment variables are validated at startup. If a required variable
 * is missing the process exits immediately — this prevents the server from
 * booting in a silently broken state.
 *
 * Import `config` from this file everywhere. Never read process.env directly.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  port: parseInt(getEnv('PORT', '5000'), 10),
  mongoUri: requireEnv('MONGO_URI'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: getEnv('JWT_EXPIRES_IN', '7d'),
  nodeEnv: getEnv('NODE_ENV', 'development'),
} as const;

export type Config = typeof config;
