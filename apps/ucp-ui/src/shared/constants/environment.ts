export const LAUNCH_DARKLY_CLIENT_ID: string = process.env
  .LAUNCH_DARKLY_CLIENT_ID as string;

export const IS_STAGING: boolean = process.env.IS_STAGING === "true";

export const AUTH0_DOMAIN: string = process.env.AUTH0_DOMAIN as string;
export const AUTH0_CLIENT_ID: string = process.env.AUTH0_CLIENT_ID as string;

export const INSTITUTION_SERVICE_BASE_URL: string = process.env.REVIEW_APP
  ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/institution-service`
  : process.env.INSTITUTION_SERVICE_BASE_URL || "http://localhost:8088";

export const AUTHENTICATION_SERVICE_BASE_URL: string = process.env.REVIEW_APP
  ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/authentication-service`
  : process.env.AUTHENTICATION_SERVICE_BASE_URL || "http://localhost:8089";

export const WIDGET_DEMO_BASE_URL: string = process.env
  .WIDGET_DEMO_BASE_URL as string;
