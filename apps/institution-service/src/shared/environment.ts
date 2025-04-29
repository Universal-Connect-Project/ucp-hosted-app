export const PERFORMANCE_SERVICE_URL = process.env.REVIEW_APP
  ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`
  : process.env.PERFORMANCE_SERVICE_URL || "http://localhost:8090";
