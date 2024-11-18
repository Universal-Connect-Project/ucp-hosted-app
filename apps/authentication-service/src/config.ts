import "dotenv/config";

export const init = ({
  authM2mAudience,
  auth0Domain,
  auth0ClientId,
  auth0ClientSecret,
}: {
  authM2mAudience: string | undefined;
  auth0Domain: string | undefined;
  auth0ClientId: string | undefined;
  auth0ClientSecret: string | undefined;
}) => {
  if (!(authM2mAudience && auth0Domain && auth0ClientId && auth0ClientSecret)) {
    throw new Error(
      "Missing required environment variables. Check README.md and `../.env.example` for more info.",
    );
  }

  return {
    ENV: process.env?.NODE_ENV,
    AUTH0_M2M_AUDIENCE: authM2mAudience,
    AUTH0_DOMAIN: auth0Domain,
    AUTH0_CLIENT_ID: auth0ClientId,
    AUTH0_CLIENT_SECRET: auth0ClientSecret,
  };
};

export default init({
  authM2mAudience: process.env?.AUTH0_M2M_AUDIENCE,
  auth0Domain: process.env?.AUTH0_DOMAIN,
  auth0ClientId: process.env?.AUTH0_CLIENT_ID,
  auth0ClientSecret: process.env?.AUTH0_CLIENT_SECRET,
});
