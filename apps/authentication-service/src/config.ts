import * as dotenv from "dotenv";

export const init = (path = ".env") => {
  const result: dotenv.DotenvConfigOutput = dotenv.config({
    path,
  });

  if (result.error) {
    throw result.error;
  }

  const { parsed: envs } = result;

  if (
    !(
      envs?.ENV &&
      envs?.CLIENT_ORIGIN_URL &&
      envs?.AUTH0_M2M_AUDIENCE &&
      envs?.AUTH0_DOMAIN &&
      envs?.AUTH0_CLIENT_ID &&
      envs?.AUTH0_CLIENT_SECRET
    )
  ) {
    throw new Error(
      "Missing required environment variables. Check README.md and `../.env.example` for more info.",
    );
  }

  return {
    ENV: envs?.ENV,
    CLIENT_ORIGIN_URL: envs?.CLIENT_ORIGIN_URL,
    AUTH0_M2M_AUDIENCE: envs?.AUTH0_M2M_AUDIENCE,
    AUTH0_DOMAIN: envs?.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: envs?.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: envs?.AUTH0_CLIENT_SECRET,
  };
};

export default init();
