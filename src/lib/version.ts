import packageJson from '../../package.json';

export const VERSION = packageJson.version;

export const BUILD_INFO = {
  version: VERSION,
  buildTime: process.env.BUILD_TIME || new Date().toISOString(),
  gitCommit: process.env.GIT_COMMIT || 'unknown',
  env: process.env.NODE_ENV || 'development',
} as const;

export type BuildInfo = typeof BUILD_INFO;
