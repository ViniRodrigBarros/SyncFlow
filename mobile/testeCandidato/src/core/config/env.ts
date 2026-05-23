export const env = {
  apiBaseUrl: 'https://api.saojoaoconnect.local',
  apiTimeoutMs: 15_000,
} as const;

export type Env = typeof env;
