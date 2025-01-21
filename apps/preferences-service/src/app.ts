import cors from "cors";
import express, { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import logger from "morgan";
import { PORT } from "./shared/consts/port";

const app = express();

if (process.env.DISABLE_RATE_LIMITING !== "true") {
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      limit: 100, // Limit to 100 requests per windowMs
      handler: (_req, res, _next, _options) =>
        res.status(429).json({ message: "Too many requests" }),
    }),
  );
}

app.use(logger("dev"));
app.use(express.json());
app.use(
  cors({
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],

    allowedHeaders: [
      "Access-Control-Allow-Origin",
      "Authorization",
      "Content-Type",
    ],
    maxAge: 86400,
  }),
);

app.get("/ping", (_req: Request, res: Response) => {
  res.send(
    JSON.stringify({
      message: "pong",
    }),
  );
});

console.log("PORT is ", process.env.PORT || PORT);
app.listen(process.env.PORT || PORT, () => {
  console.info(`App listening on port ${process.env.PORT || PORT}`);
});
