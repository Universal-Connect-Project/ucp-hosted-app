import * as dotenv from "dotenv";

const result: dotenv.DotenvConfigOutput = dotenv.config();

if (result.error) {
  throw result.error;
}

const { parsed: envs } = result;

if (
  !(
    envs?.PORT &&
    envs?.ENV &&
    envs?.CLIENT_ORIGIN_URL &&
    envs?.AUTH0_AUDIENCE &&
    envs?.AUTH0_DOMAIN &&
    envs?.AUTH0_CLIENT_ID &&
    envs?.AUTH0_CLIENT_SECRET
  )
) {
  throw new Error(
    "Missing required environment variables. Check README.md and `../.env.example` for more info.",
  );
}

export default {
  PORT: envs?.PORT,
  ENV: envs?.ENV,
  CLIENT_ORIGIN_URL: envs?.CLIENT_ORIGIN_URL,
  AUTH0_AUDIENCE: envs?.AUTH0_AUDIENCE,
  AUTH0_DOMAIN: envs?.AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: envs?.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: envs?.AUTH0_CLIENT_SECRET,
  E2E_USERNAME: envs?.E2E_USERNAME,
  E2E_PASSWORD: envs?.E2E_PASSWORD,
  E2E_CLIENT_ID: envs?.E2E_CLIENT_ID,
  E2E_CLIENT_SECRET: envs?.E2E_CLIENT_SECRET,
};
