export interface Config {
  E2E_LIMIT_SYNC_REQUESTS?: boolean;
  FINICITY_APP_KEY?: string;
  FINICITY_PARTNER_ID?: string;
  FINICITY_SECRET?: string;
  MX_CLIENT_ID?: string;
  MX_API_SECRET?: string;
  PROXY_URL?: string;
}

export const getConfig = (): Config => {
  return {
    E2E_LIMIT_SYNC_REQUESTS: process.env.E2E_LIMIT_SYNC_REQUESTS === "true",
    FINICITY_APP_KEY: process.env.FINICITY_APP_KEY,
    FINICITY_PARTNER_ID: process.env.FINICITY_PARTNER_ID,
    FINICITY_SECRET: process.env.FINICITY_SECRET,
    MX_CLIENT_ID: process.env.MX_CLIENT_ID,
    MX_API_SECRET: process.env.MX_API_SECRET,
    PROXY_URL: process.env.PROXY_URL,
  };
};
