import "./dotEnv";

export const init = () => {
  const requiredVariables = [
    "AUTH0_DOMAIN",
    "AUTH0_CLIENT_ID",
    "AUTH0_CLIENT_SECRET",
    "AUTH0_TOKEN_DOMAIN",
  ];

  if (requiredVariables.some((key) => !process.env[key])) {
    throw new Error(
      "Missing required environment variables. Check README.md and your env files for more info.",
    );
  }

  return {
    AUTH0_DOMAIN: process.env?.AUTH0_DOMAIN as string,
    AUTH0_CLIENT_ID: process.env?.AUTH0_CLIENT_ID as string,
    AUTH0_CLIENT_SECRET: process.env?.AUTH0_CLIENT_SECRET as string,
    AUTH0_TOKEN_DOMAIN: process.env?.AUTH0_TOKEN_DOMAIN as string,
  };
};

export default init();
