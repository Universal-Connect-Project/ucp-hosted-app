export interface Config {
  FINICITY_APP_KEY?: string;
  FINICITY_PARTNER_ID?: string;
  FINICITY_SECRET?: string;
}

export const getConfig = (): Config => {
  return {
    FINICITY_APP_KEY: process.env.FINICITY_APP_KEY,
    FINICITY_PARTNER_ID: process.env.FINICITY_PARTNER_ID,
    FINICITY_SECRET: process.env.FINICITY_SECRET,
  };
};
