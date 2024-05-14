// config.js
import * as dotenv from "dotenv";

const result = dotenv.config();

if (result.error) {
  throw result.error;
}

const { parsed: envs } = result;

export default {
  PORT: envs?.PORT,
  CLIENT_ORIGIN_URL: envs?.CLIENT_ORIGIN_URL,
  AUTH0_AUDIENCE: envs?.AUTH0_AUDIENCE,
  AUTH0_DOMAIN: envs?.AUTH0_DOMAIN,
};
