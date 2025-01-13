import "dotenv/config";

export const init = ({
  auth0Domain,
  auth0ClientId,
  auth0ClientSecret,
}: {
  auth0Domain: string | undefined;
  auth0ClientId: string | undefined;
  auth0ClientSecret: string | undefined;
}) => {
  if (!(auth0Domain && auth0ClientId && auth0ClientSecret)) {
    throw new Error(
      "Missing required environment variables. Check README.md and `../.env.example` for more info.",
    );
  }

  return {
    ENV: process.env?.NODE_ENV,
    AUTH0_DOMAIN: auth0Domain,
    AUTH0_CLIENT_ID: auth0ClientId,
    AUTH0_CLIENT_SECRET: auth0ClientSecret,
  };
};

export default init({
  auth0Domain: process.env?.AUTH0_DOMAIN,
  auth0ClientId: process.env?.AUTH0_CLIENT_ID,
  auth0ClientSecret: process.env?.AUTH0_CLIENT_SECRET,
});
