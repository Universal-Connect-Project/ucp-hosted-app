import dotenv from "dotenv";
import path from "path";

if (process.env.NODE_ENV === "production") {
  dotenv.config({
    path: path.join(__dirname, "../env/production.env"),
  });
} else {
  dotenv.config({
    path: path.join(__dirname, "../env/staging.env"),
  });
}
