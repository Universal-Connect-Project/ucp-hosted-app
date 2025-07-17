export const INSTITUTION_SERVICE_URL = process.env.REVIEW_APP
  ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/institution-service`
  : process.env.INSTITUTION_SERVICE_URL || "http://localhost:8088";
