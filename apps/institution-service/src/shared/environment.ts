export const PERFORMANCE_SERVICE_URL = process.env.REVIEW_APP
  ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/performance-service`
  : process.env.PERFORMANCE_SERVICE_URL || "http://localhost:8090";
